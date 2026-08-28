import Dexie, { type Table } from 'dexie';

export interface AppSettings {
  id: string; // 'app-settings'
  currency: string;
  theme: 'light' | 'dark' | 'system';
  language: 'id' | 'en';
  startDayOfWeek: number;
  payday?: number;
  dailyLimitThresholds: { warning: number; exceeded: number };
  schemaVersion: number;
  dashboardLayout?: string[];
}

export interface Wallet {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'ewallet' | 'savings' | 'credit_card' | 'other';
  openingBalance: number;
  cachedBalance: number;
  icon: string;
  color: string;
  currency: string;
  isArchived: boolean;
  createdAt: Date;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  isDefault: boolean;
  isArchived: boolean;
  sortOrder: number;
}

export interface Transaction {
  id: string;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  walletId: string;
  toWalletId?: string;
  categoryId?: string;
  date: Date;
  time?: string;
  note?: string;
  tagIds?: string[];
  eventId?: string;
  attachmentBlobId?: string;
  recurringId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  periodStart: Date;
  periodEnd: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface BudgetRule {
  id: string;
  budgetId: string;
  ruleType: 'category' | 'wallet' | 'global';
  targetId?: string; // categoryId or walletId if applicable
  limitAmount: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  isCompleted: boolean;
  createdAt: Date;
}

export interface Debt {
  id: string;
  name: string;
  amount: number;
  remainingAmount: number;
  direction: 'payable' | 'receivable'; // payable = hutang, receivable = piutang
  status: 'unpaid' | 'paid';
  dueDate?: Date;
  createdAt: Date;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  date: Date;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  currentValue: number;
  isArchived: boolean;
  createdAt: Date;
}

export class PundiDB extends Dexie {
  appSettings!: Table<AppSettings, string>;
  wallets!: Table<Wallet, string>;
  categories!: Table<Category, string>;
  transactions!: Table<Transaction, string>;
  budgets!: Table<Budget, string>;
  budgetRules!: Table<BudgetRule, string>;
  savingsGoals!: Table<SavingsGoal, string>;
  debts!: Table<Debt, string>;
  debtPayments!: Table<DebtPayment, string>;
  assets!: Table<Asset, string>;
  
  constructor() {
    super('PundiDatabase');
    this.version(1).stores({
      appSettings: 'id',
      wallets: 'id, isArchived, sortOrder',
      categories: 'id, type, isArchived',
      transactions: 'id, date, walletId, categoryId, eventId, type, [type+date]',
      tags: 'id, name',
      budgets: 'id, isActive, periodEnd',
      budgetRules: 'id, budgetId, ruleType',
      savingsGoals: 'id, isCompleted',
      savingsTransactions: 'id, savingsGoalId, date',
      debts: 'id, direction, status',
      debtPayments: 'id, debtId, date',
      assets: 'id, isArchived',
      assetValueHistory: 'id, assetId, date',
      events: 'id, isArchived',
      recurringTransactions: 'id, isActive, nextOccurrenceDate',
      dailyLimitHistory: 'id, budgetId, date, [budgetId+date]',
      attachments: 'id',
      backupMetadata: 'id',
    });
  }
}

export const db = new PundiDB();

// Initialize default settings if not exists
db.on('populate', async () => {
  await db.appSettings.add({
    id: 'app-settings',
    currency: 'IDR',
    theme: 'system',
    language: 'id',
    startDayOfWeek: 1, // Monday
    dailyLimitThresholds: { warning: 70, exceeded: 100 },
    schemaVersion: 1,
  });

  // Basic default categories
  const defaultCategories: Category[] = [
    { id: crypto.randomUUID(), name: 'Food', type: 'expense', icon: 'utensils', color: '#f87171', isDefault: true, isArchived: false, sortOrder: 1 },
    { id: crypto.randomUUID(), name: 'Transport', type: 'expense', icon: 'car', color: '#60a5fa', isDefault: true, isArchived: false, sortOrder: 2 },
    { id: crypto.randomUUID(), name: 'Salary', type: 'income', icon: 'wallet', color: '#4ade80', isDefault: true, isArchived: false, sortOrder: 3 },
  ];
  await db.categories.bulkAdd(defaultCategories);
});
