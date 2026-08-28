import { db, type Asset } from '../db';

export const assetService = {
  async getAllActive() {
    return db.assets.filter(a => !a.isArchived).toArray();
  },

  async create(data: Omit<Asset, 'id' | 'isArchived' | 'createdAt'>) {
    const newAsset: Asset = {
      ...data,
      id: crypto.randomUUID(),
      isArchived: false,
      createdAt: new Date(),
    };
    await db.assets.add(newAsset);
    return newAsset;
  },

  async updateValue(id: string, newValue: number) {
    await db.assets.update(id, { currentValue: newValue });
  },

  async archive(id: string) {
    await db.assets.update(id, { isArchived: true });
  }
};
