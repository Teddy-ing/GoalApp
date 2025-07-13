import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Database from '@tauri-apps/plugin-sql';

describe('Goals CRUD Operations', () => {
  let db;

  beforeAll(async () => {
    db = await Database.load('sqlite:test-goals.db');
  });

  afterAll(async () => {
    if (db) {
      await db.close();
    }
  });

  beforeEach(async () => {
    // Clean up goals table before each test
    await db.execute('DELETE FROM goals');
  });

  describe('Create Operations', () => {
    it('should insert a new goal with required fields', async () => {
      const result = await db.execute(
        'INSERT INTO goals (title, description, target_value, goal_type) VALUES (?, ?, ?, ?)',
        ['Test Goal', 'Test Description', 10, 'daily']
      );

      expect(result.rowsAffected).toBe(1);
      expect(result.lastInsertId).toBeDefined();
    });

    it('should insert goal with default values', async () => {
      const result = await db.execute(
        'INSERT INTO goals (title, target_value, goal_type) VALUES (?, ?, ?)',
        ['Minimal Goal', 5, 'weekly']
      );

      const goal = await db.select('SELECT * FROM goals WHERE id = ?', [result.lastInsertId]);
      expect(goal[0].current_value).toBe(0);
      expect(goal[0].is_active).toBe(true);
      expect(goal[0].created_at).toBeDefined();
    });

    it('should enforce goal_type constraint', async () => {
      await expect(
        db.execute(
          'INSERT INTO goals (title, target_value, goal_type) VALUES (?, ?, ?)',
          ['Invalid Goal', 5, 'invalid_type']
        )
      ).rejects.toThrow();
    });
  });

  describe('Read Operations', () => {
    beforeEach(async () => {
      // Insert test data
      await db.execute(
        'INSERT INTO goals (title, description, target_value, current_value, goal_type) VALUES (?, ?, ?, ?, ?)',
        ['Active Goal', 'Description 1', 10, 3, 'daily']
      );
      await db.execute(
        'INSERT INTO goals (title, target_value, goal_type, is_active) VALUES (?, ?, ?, ?)',
        ['Inactive Goal', 5, 'weekly', false]
      );
    });

    it('should retrieve all goals', async () => {
      const goals = await db.select('SELECT * FROM goals ORDER BY created_at');
      expect(goals).toHaveLength(2);
    });

    it('should retrieve only active goals', async () => {
      const activeGoals = await db.select('SELECT * FROM goals WHERE is_active = TRUE');
      expect(activeGoals).toHaveLength(1);
      expect(activeGoals[0].title).toBe('Active Goal');
    });

    it('should retrieve goals by type', async () => {
      const dailyGoals = await db.select('SELECT * FROM goals WHERE goal_type = ?', ['daily']);
      expect(dailyGoals).toHaveLength(1);
      expect(dailyGoals[0].goal_type).toBe('daily');
    });
  });

  describe('Update Operations', () => {
    let goalId;

    beforeEach(async () => {
      const result = await db.execute(
        'INSERT INTO goals (title, target_value, goal_type, current_value) VALUES (?, ?, ?, ?)',
        ['Test Goal', 10, 'daily', 3]
      );
      goalId = result.lastInsertId;
    });

    it('should increment goal progress', async () => {
      await db.execute(
        'UPDATE goals SET current_value = current_value + ? WHERE id = ?',
        [2, goalId]
      );

      const goal = await db.select('SELECT current_value FROM goals WHERE id = ?', [goalId]);
      expect(goal[0].current_value).toBe(5);
    });

    it('should update goal details', async () => {
      await db.execute(
        'UPDATE goals SET title = ?, description = ?, target_value = ? WHERE id = ?',
        ['Updated Title', 'Updated Description', 15, goalId]
      );

      const goal = await db.select('SELECT * FROM goals WHERE id = ?', [goalId]);
      expect(goal[0].title).toBe('Updated Title');
      expect(goal[0].description).toBe('Updated Description');
      expect(goal[0].target_value).toBe(15);
    });

    it('should reset daily goals', async () => {
      // Add another daily goal
      await db.execute(
        'INSERT INTO goals (title, target_value, goal_type, current_value) VALUES (?, ?, ?, ?)',
        ['Another Daily', 5, 'daily', 2]
      );

      // Reset all daily goals
      await db.execute(
        'UPDATE goals SET current_value = 0 WHERE goal_type = ?',
        ['daily']
      );

      const dailyGoals = await db.select('SELECT current_value FROM goals WHERE goal_type = ?', ['daily']);
      dailyGoals.forEach(goal => {
        expect(goal.current_value).toBe(0);
      });
    });
  });

  describe('Delete Operations', () => {
    let goalId;

    beforeEach(async () => {
      const result = await db.execute(
        'INSERT INTO goals (title, target_value, goal_type) VALUES (?, ?, ?)',
        ['Test Goal', 10, 'daily']
      );
      goalId = result.lastInsertId;
    });

    it('should soft delete goal by setting is_active to false', async () => {
      await db.execute(
        'UPDATE goals SET is_active = FALSE WHERE id = ?',
        [goalId]
      );

      const goal = await db.select('SELECT is_active FROM goals WHERE id = ?', [goalId]);
      expect(goal[0].is_active).toBe(false);
    });

    it('should hard delete goal', async () => {
      await db.execute('DELETE FROM goals WHERE id = ?', [goalId]);

      const goals = await db.select('SELECT * FROM goals WHERE id = ?', [goalId]);
      expect(goals).toHaveLength(0);
    });
  });

  describe('Data Validation', () => {
    it('should enforce NOT NULL constraints', async () => {
      await expect(
        db.execute('INSERT INTO goals (description) VALUES (?)', ['No title'])
      ).rejects.toThrow();
    });

    it('should handle NULL description', async () => {
      const result = await db.execute(
        'INSERT INTO goals (title, target_value, goal_type) VALUES (?, ?, ?)',
        ['No Description Goal', 5, 'weekly']
      );

      const goal = await db.select('SELECT description FROM goals WHERE id = ?', [result.lastInsertId]);
      expect(goal[0].description).toBeNull();
    });
  });
}); 