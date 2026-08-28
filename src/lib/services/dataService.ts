import { db } from '../db';

export const dataService = {
  /**
   * Export all data as JSON Blob
   */
  async exportData(): Promise<Blob> {
    try {
      if (typeof window !== 'undefined') {
        await import('dexie-export-import');
      }
      const blob = await db.export();
      return blob;
    } catch (error) {
      console.error("Export failed:", error);
      throw new Error("Gagal melakukan export data.");
    }
  },

  /**
   * Import data from JSON Blob
   */
  async importData(file: File): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        await import('dexie-export-import');
      }
      await db.transaction('rw', db.tables, async () => {
        // Clear all existing data before import to avoid conflicts
        await Promise.all(db.tables.map(table => table.clear()));
        await db.import(file);
      });
    } catch (error) {
      console.error("Import failed:", error);
      throw new Error("Gagal melakukan import data. File mungkin rusak atau format tidak sesuai.");
    }
  }
};
