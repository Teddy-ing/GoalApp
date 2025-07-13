import SqlDatabase from '@tauri-apps/plugin-sql';

// Database instance - will be initialized on first use
let db: SqlDatabase | null = null;

// Initialize database connection
async function getDb(): Promise<SqlDatabase> {
  if (!db) {
    db = await SqlDatabase.load('sqlite:goals.db');
  }
  return db;
}

// TypeScript interfaces matching database schema
export interface Goal {
  id?: number;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  goal_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
}

export interface ChecklistItem {
  id?: number;
  goal_id: number;
  title: string;
  is_completed: boolean;
  order_index: number;
  created_at?: string;
}

export interface LayoutItem {
  id?: number;
  goal_id: number;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  section_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  created_at?: string;
  updated_at?: string;
}

export interface Note {
  id?: number;
  content: string;
  created_at?: string;
  updated_at?: string;
}

// Goal database operations
export class GoalDB {
  /**
   * Add a new goal to the database
   */
  static async addGoal(
    title: string,
    description: string | null,
    targetValue: number,
    goalType: Goal['goal_type']
  ): Promise<number> {
    const database = await getDb();
    const result = await database.execute(
      'INSERT INTO goals (title, description, target_value, goal_type, current_value, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, targetValue, goalType, 0, true]
    );
    return result.lastInsertId || 0;
  }

  /**
   * Get all active goals from the database
   */
  static async getGoals(): Promise<Goal[]> {
    const database = await getDb();
    return await database.select<Goal[]>('SELECT * FROM goals WHERE is_active = ? ORDER BY created_at DESC', [true]);
  }

  /**
   * Increment a goal's current value
   */
  static async incrementGoal(goalId: number, amount: number): Promise<void> {
    const database = await getDb();
    await database.execute(
      'UPDATE goals SET current_value = current_value + ?, updated_at = datetime("now") WHERE id = ?',
      [amount, goalId]
    );
  }

  /**
   * Update a goal's details
   */
  static async updateGoal(
    goalId: number,
    title: string,
    description: string | null,
    targetValue: number
  ): Promise<void> {
    const database = await getDb();
    await database.execute(
      'UPDATE goals SET title = ?, description = ?, target_value = ?, updated_at = datetime("now") WHERE id = ?',
      [title, description, targetValue, goalId]
    );
  }

  /**
   * Soft delete a goal (mark as inactive)
   */
  static async deleteGoal(goalId: number): Promise<void> {
    const database = await getDb();
    await database.execute(
      'UPDATE goals SET is_active = ?, updated_at = datetime("now") WHERE id = ?',
      [false, goalId]
    );
  }

  /**
   * Reset all daily goals current_value to 0
   */
  static async resetDailyGoals(): Promise<void> {
    const database = await getDb();
    await database.execute(
      'UPDATE goals SET current_value = 0, updated_at = datetime("now") WHERE goal_type = ? AND is_active = ?',
      ['daily', true]
    );
  }
}

// Checklist database operations
export class ChecklistDB {
  /**
   * Add a new checklist item to a goal
   */
  static async addChecklistItem(
    goalId: number,
    title: string,
    orderIndex: number
  ): Promise<number> {
    const database = await getDb();
    const result = await database.execute(
      'INSERT INTO checklist_items (goal_id, title, order_index, is_completed) VALUES (?, ?, ?, ?)',
      [goalId, title, orderIndex, false]
    );
    return result.lastInsertId || 0;
  }

  /**
   * Get all checklist items for a specific goal
   */
  static async getChecklistItems(goalId: number): Promise<ChecklistItem[]> {
    const database = await getDb();
    return await database.select<ChecklistItem[]>(
      'SELECT * FROM checklist_items WHERE goal_id = ? ORDER BY order_index',
      [goalId]
    );
  }

  /**
   * Toggle a checklist item's completion status
   */
  static async toggleChecklistItem(
    itemId: number,
    isCompleted: boolean
  ): Promise<void> {
    const database = await getDb();
    await database.execute(
      'UPDATE checklist_items SET is_completed = ? WHERE id = ?',
      [isCompleted, itemId]
    );
  }

  /**
   * Delete a checklist item
   */
  static async deleteChecklistItem(itemId: number): Promise<void> {
    const database = await getDb();
    await database.execute(
      'DELETE FROM checklist_items WHERE id = ?',
      [itemId]
    );
  }
}

// Layout database operations
export class LayoutDB {
  /**
   * Save layout information for a goal
   */
  static async saveLayout(
    goalId: number,
    xPosition: number,
    yPosition: number,
    width: number,
    height: number,
    sectionType: LayoutItem['section_type']
  ): Promise<void> {
    const database = await getDb();
    await database.execute(
      'INSERT OR REPLACE INTO layout (goal_id, x_position, y_position, width, height, section_type, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))',
      [goalId, xPosition, yPosition, width, height, sectionType]
    );
  }

  /**
   * Get all layout configurations
   */
  static async getLayout(): Promise<LayoutItem[]> {
    const database = await getDb();
    return await database.select<LayoutItem[]>('SELECT * FROM layout ORDER BY goal_id');
  }
}

// Notes database operations
export class NotesDB {
  /**
   * Save notes content (replaces existing notes)
   */
  static async saveNotes(content: string): Promise<void> {
    const database = await getDb();
    await database.execute(
      'INSERT OR REPLACE INTO notes (id, content, updated_at) VALUES (1, ?, datetime("now"))',
      [content]
    );
  }

  /**
   * Get the current notes content
   */
  static async getNotes(): Promise<Note | null> {
    const database = await getDb();
    const results = await database.select<Note[]>('SELECT * FROM notes WHERE id = 1');
    return results.length > 0 ? results[0] : null;
  }
}

// Unified database class for convenience
export class Database {
  static goal = GoalDB;
  static checklist = ChecklistDB;
  static layout = LayoutDB;
  static notes = NotesDB;
}

// Default export for convenience
export default Database; 