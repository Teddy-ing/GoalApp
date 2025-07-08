Goal Tracker – Tauri + Vite + React (TS)
Personal, offline-only SPA to track Daily, Monthly, Long-term and Persistent goals.

1 · Tech Stack
Layer	Choice	Notes
UI	React 18 + TypeScript	SPA rendered inside Tauri’s Edge WebView2 window
Styling	Tailwind CSS + @tailwindcss/typography	Utility classes for rapid layout
Drag / Resize	react-beautiful-dnd (lists) + react-grid-layout (card position + size)	Saves x, y, w, h per card
DB	tauri-plugin-sqlite (Rust side) exposed via invoke()	Single file goals.db created under AppData\Roaming\goal-tracker\
State	React Context (LayoutProvider, GoalProvider) + immer	Local in-memory cache ↔︎ Tauri commands
Packaging	tauri build portable target	Produces a small (~5-8 MB) goal-tracker.exe

(Better-sqlite3 is gone because the Node runtime isn’t present in Tauri.)

2 · Folder Tree (Starter)
pgsql
Copy
Edit
goal-tracker/
├─ src/                 # React renderer
│  ├─ components/       # GoalCard, GoalSection, NotesArea, ConfirmDialog …
│  ├─ contexts/         # GoalContext (calls invoke), LayoutContext
│  ├─ db/               # db.ts -> thin wrapper around window.__TAURI__.invoke
│  ├─ hooks/            # useGoals, useInterval
│  ├─ utils/            # resetDailyGoals.ts
│  ├─ App.tsx
│  └─ main.tsx          # ReactDOM.createRoot
├─ src-tauri/           # Rust side
│  ├─ src/
│  │  ├─ main.rs        # registers commands + plugin
│  │  └─ commands.rs    # add_goal, increment_goal, query_layout …
│  ├─ tauri.conf.json
│  └─ Cargo.toml
├─ package.json
└─ PROJECT.md
3 · npm Scripts
Script	What it does
dev	concurrently "vite" "tauri dev"
build	vite build (renderer only)
dist	tauri build (bundles Rust + renderer)

(No electron-builder; no preload files.)

4 · Database Schema (SQL)
4 · Database Schema (SQL)
sql
Copy
Edit
-- table: goals
CREATE TABLE IF NOT EXISTS goals (
  id            INTEGER PRIMARY KEY,
  title         TEXT    NOT NULL,
  type          TEXT    NOT NULL,            -- DAILY | MONTHLY | LONGTERM | PERSISTENT_STATIC | PERSISTENT_CYCLE
  checklist     INTEGER NOT NULL DEFAULT 0,  -- 1 = has sub-items
  cycle_days    INTEGER,                     -- for PERSISTENT_CYCLE
  last_reset_ts INTEGER,
  progress      INTEGER NOT NULL DEFAULT 0,  -- 0-100
  increment     INTEGER NOT NULL DEFAULT 10, -- preset / custom
  created_ts    INTEGER NOT NULL,
  completed_ts  INTEGER                      -- null until finished
);

-- table: checklist_items
CREATE TABLE IF NOT EXISTS checklist_items (
  id        INTEGER PRIMARY KEY,
  goal_id   INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  label     TEXT    NOT NULL,
  checked   INTEGER NOT NULL DEFAULT 0
);

-- table: layout
CREATE TABLE IF NOT EXISTS layout (
  goal_id INTEGER PRIMARY KEY REFERENCES goals(id) ON DELETE CASCADE,
  x       INTEGER NOT NULL,
  y       INTEGER NOT NULL,
  w       INTEGER NOT NULL,
  h       INTEGER NOT NULL
);

-- table: notes
CREATE TABLE IF NOT EXISTS notes (
  id       INTEGER PRIMARY KEY CHECK(id = 1),
  content  TEXT
);

sql
Copy
Edit
-- goals / checklist_items / layout / notes tables … (same as before)
5 · Key Behaviours
Exactly the same domain logic as before—only the persistence calls now hit Tauri commands:

Feature	JS call	Rust handler
Add goal	invoke("add_goal", { goal: {…} })	Inserts into goals; returns rowid
Increment	invoke("increment_goal", { id })	UPDATE goals SET progress = …
Layout save	invoke("save_layout", { id, x, y, w, h })	Upserts into layout

(Daily reset, cap at 100 %, checklist cycle, notes debounce—all stay identical.)

6 · Installation & First Run
bash
Copy
Edit
# ❶ Rust tool-chain (once)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh   # or rustup-init.exe on Windows

# ❷ Node deps + Tauri CLI
git clone <your-repo>
cd goal-tracker
pnpm install                 # adds @tauri-apps/cli as devDep
pnpm dev                     # opens Tauri window with Vite HMR
7 · Building a Portable EXE
bash
Copy
Edit
pnpm dist          # alias for `tauri build`
# ➜ src-tauri/target/release/bundle/portable/goal-tracker.exe
(Size ± 5 MB, includes embedded goals.db when first run.)

8 · Component Cheat-sheet
File	Purpose
GoalCard	Displays title, progress bar (% + “40/100”), “+” button to increment, edit/delete menu.
GoalSection	Wraps each type, handles react-beautiful-dnd list of cards, collapsible header.
NotesArea	<textarea> with debounced save; loads initial content from DB.
GoalContext	CRUD helpers (addGoal, increment, resetDaily, deleteGoal …) backed by better-sqlite3.
LayoutContext	Provides grid layout state + persistence helpers.
ConfirmDialog	Re-usable modal (Tailwind + Headless UI).

9 · Future Stubs
Undo/Redo context

Import / Export JSON

Theme switcher (Tailwind dark mode)