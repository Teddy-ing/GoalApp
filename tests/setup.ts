// Test setup file for Vitest
import '@tauri-apps/plugin-sql';

// Global test setup
beforeEach(() => {
  // Any global setup before each test
  console.log('Setting up test environment...');
});

afterEach(() => {
  // Any global cleanup after each test
  console.log('Cleaning up test environment...');
}); 