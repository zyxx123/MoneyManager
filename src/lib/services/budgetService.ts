import { db, type Budget } from '../db';
import { startOfMonth, endOfMonth, differenceInDays, isSameDay, startOfDay, endOfDay } from 'date-fns';

export const budgetService = {
  async getActiveBudget() {
    const now = new Date();
    const budgets = await db.budgets.toArray();
    // Kembalikan budget aktif selama belum kadaluarsa (bisa jadi sedang berjalan atau akan datang)
    return budgets.find(b => b.isActive && endOfDay(b.periodEnd) >= now);
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

    // Ambil semua dompet aktif
    const allActiveWallets = await db.wallets.filter(w => !w.isArchived).toArray();
    
    // Tentukan dompet yang dipilih
    let targetWallets = allActiveWallets;
    if (budget.walletIds && budget.walletIds.length > 0) {
      targetWallets = allActiveWallets.filter(w => budget.walletIds!.includes(w.id));
    } else if (budget.walletId) {
      targetWallets = allActiveWallets.filter(w => w.id === budget.walletId);
    } else {
      // Semua dompet (tidak termasuk tabungan khusus)
      targetWallets = allActiveWallets.filter(w => w.type !== 'savings');
    }

    const targetWalletIds = targetWallets.map(w => w.id);
    const currentWalletBalance = targetWallets.reduce((sum, w) => sum + w.cachedBalance, 0);

    // Ambil seluruh pengeluaran dalam rentang periode budget untuk dompet yang dipilih
    let expensesQuery = db.transactions
      .where('date')
      .between(budget.periodStart, budget.periodEnd, true, true)
      .filter(t => t.type === 'expense');

    if (budget.walletIds && budget.walletIds.length > 0) {
      expensesQuery = expensesQuery.filter(t => t.type === 'expense' && budget.walletIds!.includes(t.walletId));
    } else if (budget.walletId) {
      expensesQuery = expensesQuery.filter(t => t.type === 'expense' && t.walletId === budget.walletId);
    } else {
      expensesQuery = expensesQuery.filter(t => t.type === 'expense' && targetWalletIds.includes(t.walletId));
    }

    const expenses = await expensesQuery.toArray();

    // Total expenses for the period so far
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

    // Expenses made exactly today
    const todayExpenses = expenses
      .filter(t => isSameDay(t.date, now))
      .reduce((sum, t) => sum + t.amount, 0);

    // Saldo real-time dompet adalah sisa budget saat ini
    const remainingBudget = currentWalletBalance;

    // Dana yang tersedia sebelum pengeluaran hari ini dilakukan
    // (karena pengeluaran hari ini sudah memotong cachedBalance dompet secara realtime)
    const remainingBudgetBeforeToday = Math.max(0, currentWalletBalance + todayExpenses);

    // Total alokasi budget untuk periode ini (sisa saldo dompet + total pengeluaran periode ini)
    const budgetAmount = Math.max(0, currentWalletBalance + totalExpenses);

    // Jika budget belum mulai, hitung hari dari periodStart, bukan dari hari ini
    const effectiveStart = today < startOfDay(budget.periodStart) ? startOfDay(budget.periodStart) : today;
    const daysRemaining = Math.max(1, differenceInDays(budget.periodEnd, effectiveStart) + 1); // including today/start day

    const dailyLimit = remainingBudgetBeforeToday > 0 && daysRemaining > 0
      ? remainingBudgetBeforeToday / daysRemaining
      : 0;

    const percentageUsed = dailyLimit > 0 ? (todayExpenses / dailyLimit) * 100 : (todayExpenses > 0 ? 100 : 0);
    
    let status: 'safe' | 'warning' | 'danger' | 'upcoming' = 'safe';
    
    if (today < startOfDay(budget.periodStart)) {
      status = 'upcoming';
    } else if (percentageUsed >= 100 || (remainingBudget <= 0 && todayExpenses > 0)) {
      status = 'danger';
    } else if (percentageUsed >= 70) {
      status = 'warning';
    }

    const remainingDailyBudget = Math.max(0, dailyLimit - todayExpenses);

    return {
      id: budget.id,
      budgetAmount,
      walletIds: budget.walletIds || (budget.walletId ? [budget.walletId] : []),
      periodStart: budget.periodStart,
      periodEnd: budget.periodEnd,
      totalExpenses,
      todayExpenses,
      dailyLimit,
      remainingDailyBudget,
      remainingBudget,
      currentWalletBalance,
      percentageUsed,
      status
    };
  }
};
