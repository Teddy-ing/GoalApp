import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from '@tauri-apps/plugin-sql';

describe('Database Connection', () => {
  let db;

  beforeAll(async () => {
    // Use a test database
    db = await Database.load('sqlite:test-goals.db');
  });

  afterAll(async () => {
    if (db) {
      await db.close();
    }
  });

  it('should connect to SQLite database', async () => {
    expect(db).toBeDefined();
    expect(db.path).toBe('sqlite:test-goals.db');
  });

  it('should execute basic SQL query', async () => {
    const result = await db.execute('SELECT 1 as test');
    expect(result).toBeDefined();
    expect(result.rowsAffected).toBeGreaterThanOrEqual(0);
  });

  it('should create and verify all required tables exist', async () => {
    // Check goals table
    const goalsTable = await db.select(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='goals'"
    );
    expect(goalsTable).toHaveLength(1);

    // Check checklist_items table  
    const checklistTable = await db.select(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='checklist_items'"
    );
    expect(checklistTable).toHaveLength(1);

    // Check layout table
    const layoutTable = await db.select(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='layout'"
    );
    expect(layoutTable).toHaveLength(1);

    // Check notes table
    const notesTable = await db.select(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='notes'"
    );
    expect(notesTable).toHaveLength(1);
  });
}); 