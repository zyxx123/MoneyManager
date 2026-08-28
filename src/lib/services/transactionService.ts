import { db, type Transaction, type Wallet } from '../db';

export const transactionService = {
  async getAll() {
    return db.transactions.orderBy('date').reverse().toArray();
  },

  async getRecent(limit = 10) {
    return db.transactions.orderBy('date').reverse().limit(limit).toArray();
  },

  async create(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
    return db.transaction('rw', db.transactions, db.wallets, async () => {
      const now = new Date();
      const newTransaction: Transaction = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      // Ensure amount is strictly positive as per PRD
      if (newTransaction.amount <= 0) {
        throw new Error('Transaction amount must be greater than 0');
      }

      await db.transactions.add(newTransaction);

      // Update source wallet
      const wallet = await db.wallets.get(newTransaction.walletId);
      if (wallet) {
        let balanceChange = 0;
        if (newTransaction.type === 'expense' || newTransaction.type === 'transfer') {
          balanceChange = -newTransaction.amount;
        } else if (newTransaction.type === 'income') {
          balanceChange = newTransaction.amount;
        }

        await db.wallets.update(wallet.id, {
          cachedBalance: wallet.cachedBalance + balanceChange
        });
      }

      // Update destination wallet for transfer
      if (newTransaction.type === 'transfer' && newTransaction.toWalletId) {
        const toWallet = await db.wallets.get(newTransaction.toWalletId);
        if (toWallet) {
          await db.wallets.update(toWallet.id, {
            cachedBalance: toWallet.cachedBalance + newTransaction.amount
          });
        }
      }

      return newTransaction;
    });
  },

  async delete(id: string) {
    return db.transaction('rw', db.transactions, db.wallets, async () => {
      const trx = await db.transactions.get(id);
      if (!trx) return;

      // Revert balances
      const wallet = await db.wallets.get(trx.walletId);
      if (wallet) {
        let balanceChange = 0;
        if (trx.type === 'expense' || trx.type === 'transfer') {
          balanceChange = trx.amount; // Add it back
        } else if (trx.type === 'income') {
          balanceChange = -trx.amount; // Remove it back
        }

        await db.wallets.update(wallet.id, {
          cachedBalance: wallet.cachedBalance + balanceChange
        });
      }

      if (trx.type === 'transfer' && trx.toWalletId) {
        const toWallet = await db.wallets.get(trx.toWalletId);
        if (toWallet) {
          await db.wallets.update(toWallet.id, {
            cachedBalance: toWallet.cachedBalance - trx.amount
          });
        }
      }

      await db.transactions.delete(id);
    });
  }
};
