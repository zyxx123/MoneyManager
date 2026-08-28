import { db } from '../db';
import 'dexie-export-import';

export const dataService = {
  /**
   * Export all data as JSON Blob
   */
  async exportData(): Promise<Blob> {
    try {
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
