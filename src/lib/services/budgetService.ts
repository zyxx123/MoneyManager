import { db, type Budget } from '../db';
import { startOfMonth, endOfMonth, differenceInDays, isSameDay, startOfDay, endOfDay } from 'date-fns';

export const budgetService = {
  async getActiveBudget() {
    const now = new Date();
    // Assuming active budget means period covers today
    const budgets = await db.budgets.toArray();
    return budgets.find(b => b.isActive && startOfDay(b.periodStart) <= now && endOfDay(b.periodEnd) >= now);
  },

  async createBudget(amount: number, startDate: Date, endDate: Date, walletIds?: string[]) {
    const now = new Date();

    const newBudget: Budget = {
      id: crypto.randomUUID(),
      name: `Budget ${startDate.toLocaleString('default', { month: 'short', year: '2-digit' })} - ${endDate.toLocaleString('default', { month: 'short', year: '2-digit' })}`,
      amount,
      walletIds,
      periodStart: startOfDay(startDate),
      periodEnd: endOfDay(endDate),
      isActive: true,
      createdAt: now
    };

    // Deactivate previous active budgets
    const activeBudgets = await db.budgets.filter(b => b.isActive).toArray();
    for (const b of activeBudgets) {
      await db.budgets.update(b.id, { isActive: false });
    }

    await db.budgets.add(newBudget);
    return newBudget;
  },

  async updateBudget(id: string, updates: Partial<Budget>) {
    if (updates.periodStart) updates.periodStart = startOfDay(updates.periodStart);
    if (updates.periodEnd) updates.periodEnd = endOfDay(updates.periodEnd);
    await db.budgets.update(id, updates);
  },

  async deleteBudget(id: string) {
    await db.budgets.delete(id);
  },

  async getDailyLimitStatus() {
    const budget = await this.getActiveBudget();
    if (!budget) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get all expenses in the current budget period
    let expensesQuery = db.transactions
      .where('date')
      .between(budget.periodStart, budget.periodEnd, true, true)
      .filter(t => t.type === 'expense');

    if (budget.walletIds && budget.walletIds.length > 0) {
      expensesQuery = expensesQuery.filter(t => t.type === 'expense' && budget.walletIds!.includes(t.walletId));
    } else if (budget.walletId) {
      expensesQuery = expensesQuery.filter(t => t.type === 'expense' && t.walletId === budget.walletId);
    }

    const expenses = await expensesQuery.toArray();

    // Total expenses for the period so far
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

    // Expenses made exactly today
    const todayExpenses = expenses
      .filter(t => isSameDay(t.date, now))
      .reduce((sum, t) => sum + t.amount, 0);

    // Expenses made before today in this period
    const pastExpenses = totalExpenses - todayExpenses;

    const remainingBudgetBeforeToday = budget.amount - pastExpenses;
    const daysRemaining = differenceInDays(budget.periodEnd, today) + 1; // including today

    const dailyLimit = remainingBudgetBeforeToday > 0 && daysRemaining > 0
      ? remainingBudgetBeforeToday / daysRemaining
      : 0;

    const percentageUsed = dailyLimit > 0 ? (todayExpenses / dailyLimit) * 100 : (todayExpenses > 0 ? 100 : 0);
    
    let status: 'safe' | 'warning' | 'danger' = 'safe';
    // Use app settings thresholds if available, but hardcode 70% and 100% for MVP
    if (percentageUsed >= 100) {
      status = 'danger';
    } else if (percentageUsed >= 70) {
      status = 'warning';
    }

    return {
      id: budget.id,
      budgetAmount: budget.amount,
      walletIds: budget.walletIds || (budget.walletId ? [budget.walletId] : []),
      periodStart: budget.periodStart,
      periodEnd: budget.periodEnd,
      totalExpenses,
      todayExpenses,
      dailyLimit,
      remainingBudget: budget.amount - totalExpenses,
      percentageUsed,
      status
    };
  }
};
