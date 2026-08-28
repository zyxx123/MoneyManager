import { db, type SavingsGoal } from '../db';

export const savingsService = {
  async getAllActive() {
    return db.savingsGoals.filter(s => !s.isCompleted).toArray();
  },
  
  async getAll() {
    return db.savingsGoals.toArray();
  },

  async create(data: { name: string; targetAmount: number; deadline?: Date }) {
    const newGoal: SavingsGoal = {
      id: crypto.randomUUID(),
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: 0,
      deadline: data.deadline,
      isCompleted: false,
      createdAt: new Date(),
    };
    await db.savingsGoals.add(newGoal);
    return newGoal;
  },

  async addFunds(id: string, amount: number) {
    return db.transaction('rw', db.savingsGoals, async () => {
      const goal = await db.savingsGoals.get(id);
      if (!goal) throw new Error('Savings goal not found');
      
      const newAmount = goal.currentAmount + amount;
      await db.savingsGoals.update(id, {
        currentAmount: newAmount,
        isCompleted: newAmount >= goal.targetAmount
      });
    });
  }
};
