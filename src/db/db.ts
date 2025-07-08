import { invoke } from '@tauri-apps/api/core';

// TypeScript interfaces matching Rust structs
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
    return await invoke<number>('add_goal', {
      title,
      description,
      targetValue,
      goalType,
    });
  }

  /**
   * Get all active goals from the database
   */
  static async getGoals(): Promise<Goal[]> {
    return await invoke<Goal[]>('get_goals');
  }

  /**
   * Increment a goal's current value
   */
  static async incrementGoal(goalId: number, amount: number): Promise<void> {
    return await invoke<void>('increment_goal', {
      goalId,
      amount,
    });
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
    return await invoke<void>('update_goal', {
      goalId,
      title,
      description,
      targetValue,
    });
  }

  /**
   * Soft delete a goal (mark as inactive)
   */
  static async deleteGoal(goalId: number): Promise<void> {
    return await invoke<void>('delete_goal', {
      goalId,
    });
  }

  /**
   * Reset all daily goals current_value to 0
   */
  static async resetDailyGoals(): Promise<void> {
    return await invoke<void>('reset_daily_goals');
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
    return await invoke<number>('add_checklist_item', {
      goalId,
      title,
      orderIndex,
    });
  }

  /**
   * Get all checklist items for a specific goal
   */
  static async getChecklistItems(goalId: number): Promise<ChecklistItem[]> {
    return await invoke<ChecklistItem[]>('get_checklist_items', {
      goalId,
    });
  }

  /**
   * Toggle a checklist item's completion status
   */
  static async toggleChecklistItem(
    itemId: number,
    isCompleted: boolean
  ): Promise<void> {
    return await invoke<void>('toggle_checklist_item', {
      itemId,
      isCompleted,
    });
  }

  /**
   * Delete a checklist item
   */
  static async deleteChecklistItem(itemId: number): Promise<void> {
    return await invoke<void>('delete_checklist_item', {
      itemId,
    });
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
    return await invoke<void>('save_layout', {
      goalId,
      xPosition,
      yPosition,
      width,
      height,
      sectionType,
    });
  }

  /**
   * Get all layout configurations
   */
  static async getLayout(): Promise<LayoutItem[]> {
    return await invoke<LayoutItem[]>('get_layout');
  }
}

// Notes database operations
export class NotesDB {
  /**
   * Save notes content (replaces existing notes)
   */
  static async saveNotes(content: string): Promise<void> {
    return await invoke<void>('save_notes', {
      content,
    });
  }

  /**
   * Get the current notes content
   */
  static async getNotes(): Promise<Note | null> {
    return await invoke<Note | null>('get_notes');
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