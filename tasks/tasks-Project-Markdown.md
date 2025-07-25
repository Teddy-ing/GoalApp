## Relevant Files

- `src/main.tsx` - React app entry point with ReactDOM.createRoot
- `src/App.tsx` - Main app component with layout and sections
- `src/components/` - React components directory
- `src/contexts/` - React context providers directory  
- `src/db/` - Database interface layer directory
- `src/db/db.ts` - TypeScript wrapper for Tauri database commands with interfaces and classes
- `src/hooks/` - Custom React hooks directory
- `src/utils/` - Utility functions directory
- `src/utils/databaseInit.ts` - Database initialization utility with health checks and verification
- `src/utils/resetDailyGoals.ts` - Utility for daily goal reset logic
- `src/components/GoalCard.tsx` - Component for displaying individual goals with progress bar, increment button, and edit/delete menu
- `src/components/GoalCard.test.tsx` - Unit tests for GoalCard
- `src/components/GoalSection.tsx` - Wrapper component for goal type sections with drag-drop
- `src/components/GoalSection.test.tsx` - Unit tests for GoalSection  
- `src/components/NotesArea.tsx` - Textarea component with debounced save
- `src/components/NotesArea.test.tsx` - Unit tests for NotesArea
- `src/components/ConfirmDialog.tsx` - Reusable modal dialog component
- `src/components/ConfirmDialog.test.tsx` - Unit tests for ConfirmDialog
- `src/contexts/GoalContext.tsx` - Context provider for goal CRUD operations via Tauri
- `src/contexts/LayoutContext.tsx` - Context provider for grid layout state
- `src/hooks/useGoals.ts` - Custom hook for goal operations
- `src/hooks/useInterval.ts` - Custom hook for interval-based updates
- `src-tauri/src/main.rs` - Tauri main entry with command registration
- `src-tauri/src/lib.rs` - Tauri app configuration with SQL plugin and database migrations
- `src-tauri/src/commands.rs` - Rust command handlers for database operations (goals, checklists, layout, notes)
- `src-tauri/Cargo.toml` - Rust dependencies including tauri-plugin-sql and sqlx with sqlite features
- `src-tauri/tauri.conf.json` - Tauri configuration for portable Windows builds
- `tailwind.config.js` - Tailwind CSS configuration with typography plugin
- `postcss.config.js` - PostCSS configuration for Tailwind and autoprefixer
- `package.json` - Project configuration with dev/build/dist scripts and @tauri-apps/api dependency
- `vite.config.ts` - Vite bundler configuration

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Set up project foundation and development environment
  - [x] 1.1 Initialize Tauri + Vite + React project with TypeScript
  - [x] 1.2 Install and configure Tailwind CSS with @tailwindcss/typography
  - [x] 1.3 Set up package.json scripts (dev, build, dist) as specified
  - [x] 1.4 Configure Tauri for portable build target in tauri.conf.json
  - [x] 1.5 Create initial folder structure (src/components, contexts, db, hooks, utils)
  - [x] 1.6 Install required npm packages (react-beautiful-dnd, react-grid-layout, immer)

- [x] 2.0 Implement database layer with Tauri SQLite plugin
  - [x] 2.1 Add tauri-plugin-sqlite to Rust dependencies in Cargo.toml
  - [x] 2.2 Create database schema with goals, checklist_items, layout, and notes tables
  - [x] 2.3 Implement Rust command handlers in commands.rs (add_goal, increment_goal, query_layout, etc.)
  - [x] 2.4 Register commands and SQLite plugin in lib.rs (all 14 command handlers registered)
  - [x] 2.5 Create db.ts wrapper for Tauri invoke commands
  - [x] 2.6 Implement database initialization on first run (automatic migrations + verification utilities)

- [ ] 3.0 Create React components and UI structure
  - [x] 3.1 Build GoalCard component with title, progress bar, increment button, and edit/delete menu
  - [ ] 3.2 Create GoalSection component with collapsible header and drag-drop list wrapper
  - [ ] 3.3 Implement NotesArea component with textarea and debounced save functionality
  - [ ] 3.4 Build ConfirmDialog component using Tailwind and Headless UI
  - [ ] 3.5 Create App.tsx with main layout structure for all goal sections
  - [ ] 3.6 Style components with Tailwind utility classes

- [ ] 4.0 Implement state management with Context providers
  - [ ] 4.1 Create GoalContext with CRUD operations (addGoal, increment, resetDaily, deleteGoal)
  - [ ] 4.2 Implement LayoutContext for grid layout state and persistence
  - [ ] 4.3 Create useGoals hook for goal operations
  - [ ] 4.4 Implement useInterval hook for periodic updates
  - [ ] 4.5 Build resetDailyGoals utility function with timestamp checking
  - [ ] 4.6 Integrate immer for immutable state updates

- [ ] 5.0 Add drag-and-drop and resize functionality
  - [ ] 5.1 Integrate react-beautiful-dnd for dragging goals between sections
  - [ ] 5.2 Implement react-grid-layout for card positioning and resizing
  - [ ] 5.3 Save layout changes (x, y, w, h) to database via Tauri commands
  - [ ] 5.4 Load and apply saved layouts on app startup
  - [ ] 5.5 Handle layout persistence across goal operations (add, delete, reorder) 