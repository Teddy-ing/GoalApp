import SqlDatabase from '@tauri-apps/plugin-sql';

// Detect if running inside Tauri (native shell) vs plain browser (e.g., Playwright MCP)
function isTauriAvailable(): boolean {
  // Tauri v2 exposes __TAURI__ on window
  return typeof window !== 'undefined' && Boolean((window as any).__TAURI__);
}

// Lightweight browser-only storage fallback (used when Tauri is not available)
// This enables UI testing in a regular browser without native plugins.
const STORAGE_KEYS = {
  goals: 'goalapp_goals',
  goalIdCounter: 'goalapp_goal_id_counter',
  notes: 'goalapp_notes',
} as const;

function readGoalsFromStorage(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.goals);
    return raw ? (JSON.parse(raw) as Goal[]) : [];
  } catch {
    return [];
  }
}

function writeGoalsToStorage(goals: Goal[]): void {
  localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
}

function nextGoalId(): number {
  const current = Number(localStorage.getItem(STORAGE_KEYS.goalIdCounter) || '0');
  const next = current + 1;
  localStorage.setItem(STORAGE_KEYS.goalIdCounter, String(next));
  return next;
}

function readNotesFromStorage(): Note | null {
  try {
    const content = localStorage.getItem(STORAGE_KEYS.notes) || '';
    return { id: 1, content, updated_at: new Date().toISOString() } as Note;
  } catch {
    return { id: 1, content: '' } as Note;
  }
}

function writeNotesToStorage(content: string): void {
  localStorage.setItem(STORAGE_KEYS.notes, content);
}

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
    if (isTauriAvailable()) {
      const database = await getDb();
      const result = await database.execute(
        'INSERT INTO goals (title, description, target_value, goal_type, current_value, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, targetValue, goalType, 0, true]
      );
      return result.lastInsertId || 0;
    }
    // Browser fallback
    const nowIso = new Date().toISOString();
    const goals = readGoalsFromStorage();
    const id = nextGoalId();
    const newGoal: Goal = {
      id,
      title,
      description: description || undefined,
      target_value: targetValue,
      current_value: 0,
      goal_type: goalType,
      is_active: true,
      created_at: nowIso,
      updated_at: nowIso,
    };
    writeGoalsToStorage([newGoal, ...goals]);
    return id;
  }

  /**
   * Get all active goals from the database
   */
  static async getGoals(): Promise<Goal[]> {
    if (isTauriAvailable()) {
      const database = await getDb();
      return await database.select<Goal[]>('SELECT * FROM goals WHERE is_active = ? ORDER BY created_at DESC', [true]);
    }
    // Browser fallback
    const goals = readGoalsFromStorage();
    return goals
      .filter(g => g.is_active)
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  }

  /**
   * Increment a goal's current value
   */
  static async incrementGoal(goalId: number, amount: number): Promise<void> {
    if (isTauriAvailable()) {
      const database = await getDb();
      await database.execute(
        'UPDATE goals SET current_value = current_value + ?, updated_at = datetime("now") WHERE id = ?',
        [amount, goalId]
      );
      return;
    }
    // Browser fallback
    const goals = readGoalsFromStorage();
    const idx = goals.findIndex(g => g.id === goalId);
    if (idx >= 0) {
      const updated = { ...goals[idx] } as Goal;
      updated.current_value = (updated.current_value || 0) + amount;
      updated.updated_at = new Date().toISOString();
      goals[idx] = updated;
      writeGoalsToStorage(goals);
    }
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
    if (isTauriAvailable()) {
      const database = await getDb();
      await database.execute(
        'UPDATE goals SET title = ?, description = ?, target_value = ?, updated_at = datetime("now") WHERE id = ?',
        [title, description, targetValue, goalId]
      );
      return;
    }
    // Browser fallback
    const goals = readGoalsFromStorage();
    const idx = goals.findIndex(g => g.id === goalId);
    if (idx >= 0) {
      const updated = { ...goals[idx] } as Goal;
      updated.title = title;
      updated.description = description || undefined;
      updated.target_value = targetValue;
      updated.updated_at = new Date().toISOString();
      goals[idx] = updated;
      writeGoalsToStorage(goals);
    }
  }

  /**
   * Soft delete a goal (mark as inactive)
   */
  static async deleteGoal(goalId: number): Promise<void> {
    console.log('GoalDB.deleteGoal called with goalId:', goalId);
    if (isTauriAvailable()) {
      const database = await getDb();
      const result = await database.execute(
        'UPDATE goals SET is_active = ?, updated_at = datetime("now") WHERE id = ?',
        [false, goalId]
      );
      console.log('Delete query result:', result);
      // Verify the goal was actually updated
      const verifyResult = await database.select<{ count: number }[]>(
        'SELECT COUNT(*) as count FROM goals WHERE id = ? AND is_active = ?',
        [goalId, false]
      );
      console.log('Verification query result:', verifyResult);
      if (verifyResult.length === 0 || verifyResult[0].count === 0) {
        throw new Error('Goal was not successfully marked as inactive');
      }
      return;
    }
    // Browser fallback
    const goals = readGoalsFromStorage();
    const idx = goals.findIndex(g => g.id === goalId);
    if (idx >= 0) {
      const updated = { ...goals[idx] } as Goal;
      updated.is_active = false;
      updated.updated_at = new Date().toISOString();
      goals[idx] = updated;
      writeGoalsToStorage(goals);
    }
  }

  /**
   * Reset all daily goals current_value to 0
   */
  static async resetDailyGoals(): Promise<void> {
    if (isTauriAvailable()) {
      const database = await getDb();
      await database.execute(
        'UPDATE goals SET current_value = 0, updated_at = datetime("now") WHERE goal_type = ? AND is_active = ?',
        ['daily', true]
      );
      return;
    }
    // Browser fallback
    const goals = readGoalsFromStorage().map(g => {
      if (g.goal_type === 'daily' && g.is_active) {
        return { ...g, current_value: 0, updated_at: new Date().toISOString() } as Goal;
      }
      return g;
    });
    writeGoalsToStorage(goals);
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
    if (isTauriAvailable()) {
      const database = await getDb();
      await database.execute(
        'INSERT OR REPLACE INTO notes (id, content, updated_at) VALUES (1, ?, datetime("now"))',
        [content]
      );
      return;
    }
    // Browser fallback
    writeNotesToStorage(content);
  }

  /**
   * Get the current notes content
   */
  static async getNotes(): Promise<Note | null> {
    if (isTauriAvailable()) {
      const database = await getDb();
      const results = await database.select<Note[]>('SELECT * FROM notes WHERE id = 1');
      return results.length > 0 ? results[0] : null;
    }
    // Browser fallback
    return readNotesFromStorage();
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