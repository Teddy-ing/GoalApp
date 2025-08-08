# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Browser fallback mode (for Playwright/MCP testing)

When running in a plain browser (without the Tauri runtime), native plugins such as `@tauri-apps/plugin-sql` are unavailable. To enable UI testing in this environment, the app now provides a browser-only storage fallback for goals and notes:

- Goals and notes are stored in `localStorage` under `goalapp_*` keys
- The API surface (`GoalDB`, `NotesDB`) is identical to the Tauri-backed implementation
- Data in browser fallback is separate from the native SQLite DB used by the Tauri app

This allows using tools like Playwright MCP to add/edit/delete goals and save notes in the browser while the native app continues to use SQLite when started with `pnpm dev`.

## UI styling update

- Indigo is now the primary accent. Basic dark mode tokens were added using Tailwind's `dark:` variants across core components (`GoalCard`, `GoalSection`, `NotesArea`, dialogs). This improves spacing, borders, and text hierarchy without changing behavior. Toggle dark mode by applying the `dark` class to the root element.