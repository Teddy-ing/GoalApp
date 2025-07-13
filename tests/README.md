# Database Layer Tests

This directory contains tests for the database layer implementation (Task 2.0).

## Test Structure

- `database/` - Database-specific tests
  - `connection.test.js` - Database connection and initialization tests
  - `migrations.test.js` - Migration execution and schema validation tests
  - `crud/` - CRUD operation tests for each table
    - `goals.test.js` - Goals table operations
    - `checklist-items.test.js` - Checklist items operations  
    - `layout.test.js` - Layout persistence tests
    - `notes.test.js` - Notes functionality tests
  - `integration.test.js` - Cross-table relationship tests

## Running Tests

```bash
# Install test dependencies
pnpm add -D vitest @vitest/ui jsdom

# Run all database tests
pnpm test:db

# Run specific test file
pnpm test tests/database/connection.test.js
```

## Test Database

Tests use a separate test database (`sqlite:test-goals.db`) to avoid interfering with development data. 