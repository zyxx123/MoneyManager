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

export class PundiDB extends Dexie {
  appSettings!: Table<AppSettings, string>;
  wallets!: Table<Wallet, string>;
  categories!: Table<Category, string>;
  // We will add other tables (Transactions, Budgets, etc) in subsequent sprints,
  // but we can define the schema for them now to avoid version migrations in every sprint.
  
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
