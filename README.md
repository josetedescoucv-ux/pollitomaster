# Pollito Master

Pollito Master is being evolved into a desktop-first productivity app with a React + TypeScript frontend and a Tauri-native desktop foundation.

## New dependencies
- @tauri-apps/cli
- @tauri-apps/plugin-sql

## Files created
- src/services/databaseService.ts
- src/services/logService.ts
- src/features/settings/DeveloperSection.tsx

## Migration steps
1. Install Tauri CLI and initialize the desktop shell.
2. Keep the existing React UI and routing intact.
3. Use the new persistence service as the single access point for app data.
4. Build the desktop app with Tauri once the native shell is configured.

## Current limitations
- The SQLite layer is prepared for a Tauri desktop runtime and falls back gracefully to local storage in the browser.
- Desktop notifications and background scheduling are still future work.
- The backup flow uses a portable JSON snapshot for now.

## How to create a desktop installer
1. Install Rust and Tauri prerequisites.
2. Run `npm install`.
3. Run `cargo install tauri-cli` or use the Tauri CLI package.
4. Initialize the Tauri app and add the desktop shell.
5. Build with `npm run build` and then package with Tauri.

## Development
- Web: `npm run dev`
- Build: `npm run build`
