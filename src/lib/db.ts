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
  walletId?: string;
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

// Define comprehensive default categories
const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  // Pengeluaran
  { name: 'Makanan & Minuman', type: 'expense', icon: 'utensils', color: '#f87171', isDefault: true, isArchived: false, sortOrder: 1 },
  { name: 'Transportasi', type: 'expense', icon: 'car', color: '#60a5fa', isDefault: true, isArchived: false, sortOrder: 2 },
  { name: 'Tagihan & Utilitas', type: 'expense', icon: 'zap', color: '#fbbf24', isDefault: true, isArchived: false, sortOrder: 3 },
  { name: 'Belanja', type: 'expense', icon: 'shopping-bag', color: '#ec4899', isDefault: true, isArchived: false, sortOrder: 4 },
  { name: 'Hiburan', type: 'expense', icon: 'film', color: '#a78bfa', isDefault: true, isArchived: false, sortOrder: 5 },
  { name: 'Kesehatan', type: 'expense', icon: 'activity', color: '#10b981', isDefault: true, isArchived: false, sortOrder: 6 },
  { name: 'Edukasi', type: 'expense', icon: 'book', color: '#6366f1', isDefault: true, isArchived: false, sortOrder: 7 },
  { name: 'Donasi & Amal', type: 'expense', icon: 'heart', color: '#f43f5e', isDefault: true, isArchived: false, sortOrder: 8 },
  { name: 'Lainnya (Pengeluaran)', type: 'expense', icon: 'more-horizontal', color: '#9ca3af', isDefault: true, isArchived: false, sortOrder: 9 },

  // Pemasukan
  { name: 'Gaji', type: 'income', icon: 'briefcase', color: '#4ade80', isDefault: true, isArchived: false, sortOrder: 10 },
  { name: 'Bonus', type: 'income', icon: 'award', color: '#2dd4bf', isDefault: true, isArchived: false, sortOrder: 11 },
  { name: 'Hasil Investasi', type: 'income', icon: 'trending-up', color: '#818cf8', isDefault: true, isArchived: false, sortOrder: 12 },
  { name: 'Hadiah', type: 'income', icon: 'gift', color: '#f472b6', isDefault: true, isArchived: false, sortOrder: 13 },
  { name: 'Lainnya (Pemasukan)', type: 'income', icon: 'plus-circle', color: '#9ca3af', isDefault: true, isArchived: false, sortOrder: 14 },
];

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

  const categoriesToAdd = DEFAULT_CATEGORIES.map(c => ({
    id: crypto.randomUUID(),
    ...c
  } as Category));
  
  await db.categories.bulkAdd(categoriesToAdd);
});

// Run on every database load to ensure existing users get the new categories
db.on('ready', async () => {
  const allCategories = await db.categories.toArray();
  const hasNewDefaults = allCategories.some(c => c.name === 'Makanan & Minuman');
  
  if (!hasNewDefaults) {
    const categoriesToAdd = DEFAULT_CATEGORIES.map(c => ({
      id: crypto.randomUUID(),
      ...c
    } as Category));
    
    await db.categories.bulkAdd(categoriesToAdd);
    
    // Archive the old english default categories to hide them
    const oldCategories = allCategories.filter(c => ['Food', 'Transport', 'Salary'].includes(c.name));
    for (const old of oldCategories) {
      await db.categories.update(old.id, { isArchived: true });
    }
  }
});
