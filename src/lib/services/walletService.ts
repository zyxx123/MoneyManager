import { db, type Wallet } from '../db';

import { transactionService } from './transactionService';

export const walletService = {
  async getAllActive() {
    return db.wallets.filter(w => w.isArchived === false).sortBy('sortOrder');
  },

  async getAll() {
    return db.wallets.orderBy('sortOrder').toArray();
  },

  async getById(id: string) {
    return db.wallets.get(id);
  },

  async create(wallet: Omit<Wallet, 'id' | 'createdAt' | 'cachedBalance'>) {
    return db.transaction('rw', db.wallets, db.transactions, async () => {
      const newWallet: Wallet = {
        ...wallet,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        cachedBalance: 0, // Set to 0 initially, transactionService will add the balance
      };
      
      await db.wallets.add(newWallet);
      
      if (wallet.openingBalance > 0) {
        await transactionService.create({
          type: 'income',
          amount: wallet.openingBalance,
          walletId: newWallet.id,
          date: new Date(),
          note: 'Saldo Awal',
        });
      }
      
      return newWallet;
    });
  },

  async update(id: string, updates: Partial<Wallet>) {
    await db.wallets.update(id, updates);
  },

  async archive(id: string) {
    await db.wallets.update(id, { isArchived: true });
  },

  async delete(id: string) {
    // In later sprints, check if there are transactions before deleting.
    // For MVP, if it has transactions, don't allow hard delete.
    const hasTransactions = await db.transactions.where('walletId').equals(id).count() > 0;
    if (hasTransactions) {
      throw new Error('Wallet has transactions, please archive it instead.');
    }
    await db.wallets.delete(id);
  }
};
