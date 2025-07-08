import Database from '../db/db';

/**
 * Database initialization utility for first-run setup and health checks
 */
export class DatabaseInit {
  private static initialized = false;

  /**
   * Initialize and verify the database is working correctly
   * This should be called on app startup
   */
  static async initialize(): Promise<boolean> {
    try {
      console.log('🔧 Initializing database...');

      // Test basic connectivity by attempting to fetch goals
      await Database.goal.getGoals();
      console.log('✅ Database connection successful');

      // Verify all tables are accessible
      await this.verifyTables();
      console.log('✅ All database tables verified');

      // Mark as initialized
      this.initialized = true;
      console.log('🎉 Database initialization complete');

      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      return false;
    }
  }

  /**
   * Verify all database tables are accessible and working
   */
  private static async verifyTables(): Promise<void> {
    try {
      // Test goals table
      await Database.goal.getGoals();
      
      // Test layout table
      await Database.layout.getLayout();
      
      // Test notes table
      await Database.notes.getNotes();
      
      console.log('✅ All tables verified successfully');
    } catch (error) {
      console.error('❌ Table verification failed:', error);
      throw new Error('Database tables verification failed');
    }
  }

  /**
   * Check if the database has been initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Perform a comprehensive health check of the database
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'error';
    details: {
      goals: boolean;
      layout: boolean;
      notes: boolean;
      checklist: boolean;
    };
    errors: string[];
  }> {
    const results = {
      status: 'healthy' as 'healthy' | 'error',
      details: {
        goals: false,
        layout: false,
        notes: false,
        checklist: false,
      },
      errors: [] as string[],
    };

    // Test goals functionality
    try {
      await Database.goal.getGoals();
      results.details.goals = true;
    } catch (error) {
      results.errors.push(`Goals table error: ${error}`);
    }

    // Test layout functionality
    try {
      await Database.layout.getLayout();
      results.details.layout = true;
    } catch (error) {
      results.errors.push(`Layout table error: ${error}`);
    }

    // Test notes functionality
    try {
      await Database.notes.getNotes();
      results.details.notes = true;
    } catch (error) {
      results.errors.push(`Notes table error: ${error}`);
    }

    // Test checklist functionality (with a non-existent goal ID)
    try {
      await Database.checklist.getChecklistItems(-1); // Should return empty array
      results.details.checklist = true;
    } catch (error) {
      results.errors.push(`Checklist table error: ${error}`);
    }

    // Determine overall status
    const allHealthy = Object.values(results.details).every(Boolean);
    results.status = allHealthy ? 'healthy' : 'error';

    return results;
  }

  /**
   * Reset database initialization status (for testing)
   */
  static resetInitialization(): void {
    this.initialized = false;
  }
}

/**
 * Convenience function to initialize the database
 */
export const initializeDatabase = () => DatabaseInit.initialize();

/**
 * Convenience function to check database health
 */
export const checkDatabaseHealth = () => DatabaseInit.healthCheck();

export default DatabaseInit; 