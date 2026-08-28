import { db, type Debt, type DebtPayment } from '../db';

export const debtService = {
  async getAllActive() {
    return db.debts.filter(d => d.status === 'unpaid').toArray();
  },

  async create(data: Omit<Debt, 'id' | 'remainingAmount' | 'status' | 'createdAt'>) {
    const newDebt: Debt = {
      ...data,
      id: crypto.randomUUID(),
      remainingAmount: data.amount,
      status: 'unpaid',
      createdAt: new Date(),
    };
    await db.debts.add(newDebt);
    return newDebt;
  },

  async addPayment(debtId: string, amount: number, date: Date = new Date()) {
    return db.transaction('rw', db.debts, db.debtPayments, async () => {
      const debt = await db.debts.get(debtId);
      if (!debt) throw new Error('Debt not found');

      const payment: DebtPayment = {
        id: crypto.randomUUID(),
        debtId,
        amount,
        date
      };

      await db.debtPayments.add(payment);

      const newRemaining = debt.remainingAmount - amount;
      await db.debts.update(debtId, {
        remainingAmount: newRemaining > 0 ? newRemaining : 0,
        status: newRemaining <= 0 ? 'paid' : 'unpaid'
      });
    });
  }
};
