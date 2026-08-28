import { db, type Budget } from '../db';
import { startOfMonth, endOfMonth, differenceInDays, isSameDay } from 'date-fns';

export const budgetService = {
  async getActiveBudget() {
    const now = new Date();
    // Assuming active budget means period covers today
    const budgets = await db.budgets.where('isActive').equals('true').toArray(); // using quotes if boolean indexed issue, but we'll use filter to be safe
    return db.budgets.filter(b => b.isActive && b.periodStart <= now && b.periodEnd >= now).first();
  },

  async createMonthlyBudget(amount: number) {
    const now = new Date();
    const periodStart = startOfMonth(now);
    const periodEnd = endOfMonth(now);

    const newBudget: Budget = {
      id: crypto.randomUUID(),
      name: `Budget ${periodStart.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      amount,
      periodStart,
      periodEnd,
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

  async getDailyLimitStatus() {
    const budget = await this.getActiveBudget();
    if (!budget) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get all expenses in the current budget period
    const expenses = await db.transactions
      .where('date')
      .between(budget.periodStart, budget.periodEnd, true, true)
      .filter(t => t.type === 'expense')
      .toArray();

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
      budgetAmount: budget.amount,
      totalExpenses,
      todayExpenses,
      dailyLimit,
      remainingBudget: budget.amount - totalExpenses,
      percentageUsed,
      status
    };
  }
};
