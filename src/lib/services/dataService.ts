import { db } from '../db';

/**
 * Helper to revive ISO date strings into Date objects
 */
function reviveDates(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(reviveDates);
  
  const dateFields = new Set([
    'createdAt',
    'updatedAt',
    'date',
    'periodStart',
    'periodEnd',
    'deadline',
    'dueDate',
    'nextOccurrenceDate'
  ]);

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (dateFields.has(key) && typeof value === 'string') {
      const parsed = Date.parse(value);
      result[key] = !isNaN(parsed) ? new Date(parsed) : value;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = reviveDates(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Fallback JSON importer if dexie-export-import fails or for standard JSON backup formats
 */
async function importJsonFallback(file: File): Promise<void> {
  const text = await file.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error("File bukan merupakan format JSON yang valid.");
  }

  const tableNames = db.tables.map(t => t.name);
  const tablesToImport: { name: string; rows: any[] }[] = [];

  // Format A: Dexie export structure { formatName: "dexie", data: { data: [{ tableName, rows }] } }
  if (json.formatName === 'dexie' && json.data) {
    if (Array.isArray(json.data.data)) {
      for (const item of json.data.data) {
        if (item.tableName && Array.isArray(item.rows) && tableNames.includes(item.tableName)) {
          tablesToImport.push({
            name: item.tableName,
            rows: reviveDates(item.rows)
          });
        }
      }
    }
  }

  // Format B: Flat object or nested under .data e.g. { wallets: [...], transactions: [...] }
  if (tablesToImport.length === 0) {
    const dataSource = (json.data && typeof json.data === 'object' && !Array.isArray(json.data)) 
      ? json.data 
      : json;

    for (const name of tableNames) {
      if (Array.isArray(dataSource[name])) {
        tablesToImport.push({
          name,
          rows: reviveDates(dataSource[name])
        });
      }
    }
  }

  if (tablesToImport.length === 0) {
    throw new Error("Tidak ditemukan data tabel keuangan yang valid dalam file JSON ini.");
  }

  // Import into database atomically
  await db.transaction('rw', db.tables, async () => {
    for (const item of tablesToImport) {
      const table = db.table(item.name);
      await table.clear();
      if (item.rows.length > 0) {
        await table.bulkPut(item.rows);
      }
    }
  });
}

export const dataService = {
  /**
   * Export all data as JSON Blob
   */
  async exportData(): Promise<Blob> {
    try {
      if (typeof window !== 'undefined') {
        await import('dexie-export-import');
      }
      const blob = await db.export({ prettyJson: true });
      return blob;
    } catch (error) {
      console.error("Export failed:", error);
      throw new Error("Gagal melakukan export data.");
    }
  },

  /**
   * Import data from JSON File/Blob
   */
  async importData(file: File): Promise<void> {
    if (typeof window !== 'undefined') {
      await import('dexie-export-import');
    }

    // Attempt 1: Native dexie-export-import (without wrapping in an outer transaction)
    try {
      await db.import(file, {
        clearTablesBeforeImport: true,
        overwriteValues: true,
        acceptVersionDiff: true,
        acceptMissingTables: true,
        acceptNameDiff: true,
        acceptChangedPrimaryKey: true,
      });
      return;
    } catch (primaryError) {
      console.warn("Native dexie import failed, trying fallback JSON import:", primaryError);
      
      // Attempt 2: Fallback manual parser for standard JSON or non-native format
      try {
        await importJsonFallback(file);
        return;
      } catch (fallbackError: any) {
        console.error("Fallback import also failed:", fallbackError);
        const detail = fallbackError?.message || (primaryError instanceof Error ? primaryError.message : "Format file tidak sesuai");
        throw new Error(detail);
      }
    }
  }
};
