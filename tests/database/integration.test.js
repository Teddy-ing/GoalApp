import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Database from '@tauri-apps/plugin-sql';

describe('Database Integration Tests', () => {
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
    // Clean up all tables
    await db.execute('DELETE FROM checklist_items');
    await db.execute('DELETE FROM layout');
    await db.execute('DELETE FROM goals');
    await db.execute('DELETE FROM notes');
  });

  describe('Goal and Checklist Relationship', () => {
    it('should maintain foreign key integrity', async () => {
      // Create a goal
      const goalResult = await db.execute(
        'INSERT INTO goals (title, target_value, goal_type) VALUES (?, ?, ?)',
        ['Test Goal', 10, 'daily']
      );
      const goalId = goalResult.lastInsertId;

      // Add checklist items to the goal
      await db.execute(
        'INSERT INTO checklist_items (goal_id, title, order_index) VALUES (?, ?, ?)',
        [goalId, 'First task', 0]
      );
      await db.execute(
        'INSERT INTO checklist_items (goal_id, title, order_index) VALUES (?, ?, ?)',
        [goalId, 'Second task', 1]
      );

      // Verify relationship
      const items = await db.select(
        'SELECT * FROM checklist_items WHERE goal_id = ? ORDER BY order_index',
        [goalId]
      );
      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('First task');
      expect(items[1].title).toBe('Second task');
    });

    it('should cascade delete checklist items when goal is deleted', async () => {
      // Create goal and checklist items
      const goalResult = await db.execute(
        'INSERT INTO goals (title, target_value, goal_type) VALUES (?, ?, ?)',
        ['Test Goal', 10, 'daily']
      );
      const goalId = goalResult.lastInsertId;

      await db.execute(
        'INSERT INTO checklist_items (goal_id, title, order_index) VALUES (?, ?, ?)',
        [goalId, 'Task 1', 0]
      );

      // Delete the goal
      await db.execute('DELETE FROM goals WHERE id = ?', [goalId]);

      // Verify checklist items are deleted
      const items = await db.select('SELECT * FROM checklist_items WHERE goal_id = ?', [goalId]);
      expect(items).toHaveLength(0);
    });
  });

  describe('Goal and Layout Relationship', () => {
    it('should save and retrieve layout for goals', async () => {
      // Create goals
      const goal1 = await db.execute(
        'INSERT INTO goals (title, target_value, goal_type) VALUES (?, ?, ?)',
        ['Daily Goal', 5, 'daily']
      );
      const goal2 = await db.execute(
        'INSERT INTO goals (title, target_value, goal_type) VALUES (?, ?, ?)',
        ['Weekly Goal', 3, 'weekly']
      );

      // Save layout positions
      await db.execute(
        'INSERT INTO layout (goal_id, x_position, y_position, width, height, section_type) VALUES (?, ?, ?, ?, ?, ?)',
        [goal1.lastInsertId, 0, 0, 2, 1, 'daily']
      );
      await db.execute(
        'INSERT INTO layout (goal_id, x_position, y_position, width, height, section_type) VALUES (?, ?, ?, ?, ?, ?)',
        [goal2.lastInsertId, 2, 0, 2, 1, 'weekly']
      );

      // Retrieve layout with goal information
      const layout = await db.select(`
        SELECT l.*, g.title, g.goal_type 
        FROM layout l 
        JOIN goals g ON l.goal_id = g.id 
        ORDER BY l.x_position
      `);

      expect(layout).toHaveLength(2);
      expect(layout[0].title).toBe('Daily Goal');
      expect(layout[0].section_type).toBe('daily');
      expect(layout[1].title).toBe('Weekly Goal');
      expect(layout[1].section_type).toBe('weekly');
    });

    it('should update layout positions', async () => {
      const goalResult = await db.execute(
        'INSERT INTO goals (title, target_value, goal_type) VALUES (?, ?, ?)',
        ['Movable Goal', 10, 'monthly']
      );
      const goalId = goalResult.lastInsertId;

      // Initial layout
      await db.execute(
        'INSERT INTO layout (goal_id, x_position, y_position, width, height, section_type) VALUES (?, ?, ?, ?, ?, ?)',
        [goalId, 0, 0, 1, 1, 'monthly']
      );

      // Update layout
      await db.execute(
        'UPDATE layout SET x_position = ?, y_position = ? WHERE goal_id = ?',
        [3, 2, goalId]
      );

      const layout = await db.select('SELECT * FROM layout WHERE goal_id = ?', [goalId]);
      expect(layout[0].x_position).toBe(3);
      expect(layout[0].y_position).toBe(2);
    });
  });

  describe('Cross-Section Data Consistency', () => {
    it('should maintain data consistency across goal types', async () => {
      // Create goals of different types
      const daily = await db.execute(
        'INSERT INTO goals (title, target_value, goal_type, current_value) VALUES (?, ?, ?, ?)',
        ['Daily Task', 5, 'daily', 2]
      );
      const weekly = await db.execute(
        'INSERT INTO goals (title, target_value, goal_type, current_value) VALUES (?, ?, ?, ?)',
        ['Weekly Task', 3, 'weekly', 1]
      );
      const monthly = await db.execute(
        'INSERT INTO goals (title, target_value, goal_type, current_value) VALUES (?, ?, ?, ?)',
        ['Monthly Task', 10, 'monthly', 0]
      );

      // Reset only daily goals
      await db.execute(
        'UPDATE goals SET current_value = 0 WHERE goal_type = ?',
        ['daily']
      );

      // Verify only daily goals were reset
      const dailyGoals = await db.select('SELECT current_value FROM goals WHERE goal_type = ?', ['daily']);
      const weeklyGoals = await db.select('SELECT current_value FROM goals WHERE goal_type = ?', ['weekly']);
      const monthlyGoals = await db.select('SELECT current_value FROM goals WHERE goal_type = ?', ['monthly']);

      expect(dailyGoals[0].current_value).toBe(0);
      expect(weeklyGoals[0].current_value).toBe(1);
      expect(monthlyGoals[0].current_value).toBe(0);
    });
  });

  describe('Notes Functionality', () => {
    it('should save and retrieve notes independently', async () => {
      // Notes are independent of goals
      await db.execute(
        'INSERT INTO notes (content) VALUES (?)',
        ['This is a test note with important information.']
      );

      const notes = await db.select('SELECT * FROM notes ORDER BY created_at DESC LIMIT 1');
      expect(notes).toHaveLength(1);
      expect(notes[0].content).toBe('This is a test note with important information.');
      expect(notes[0].created_at).toBeDefined();
    });

    it('should handle notes replacement pattern', async () => {
      // Insert first note
      await db.execute('INSERT INTO notes (content) VALUES (?)', ['First note']);
      
      // Clear and insert new note (simulating app behavior)
      await db.execute('DELETE FROM notes');
      await db.execute('INSERT INTO notes (content) VALUES (?)', ['Updated note']);

      const notes = await db.select('SELECT * FROM notes');
      expect(notes).toHaveLength(1);
      expect(notes[0].content).toBe('Updated note');
    });
  });
}); 