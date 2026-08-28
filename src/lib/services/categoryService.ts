import { db, type Category } from '../db';

export const categoryService = {
  async getAllActive() {
    return db.categories.filter(c => c.isArchived === false).sortBy('sortOrder');
  },

  async getAllByType(type: 'expense' | 'income') {
    return db.categories
      .where('type')
      .equals(type)
      .filter(cat => !cat.isArchived)
      .sortBy('sortOrder');
  },

  async getById(id: string) {
    return db.categories.get(id);
  },

  async create(category: Omit<Category, 'id' | 'isDefault' | 'isArchived'>) {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
      isDefault: false,
      isArchived: false,
    };
    await db.categories.add(newCategory);
    return newCategory;
  },

  async update(id: string, updates: Partial<Category>) {
    await db.categories.update(id, updates);
  },

  async archive(id: string) {
    await db.categories.update(id, { isArchived: true });
  },

  async delete(id: string) {
    const hasTransactions = await db.transactions.where('categoryId').equals(id).count() > 0;
    if (hasTransactions) {
      throw new Error('Category is in use. Please archive it or reassign its transactions.');
    }
    await db.categories.delete(id);
  }
};
