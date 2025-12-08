# Future Improvements

## UI Actions Refactor
The `actions.js` module was created with pure action functions exposed to `window.drawActions` for console testing, but the UI buttons still call functions directly. Could be cleaner with actions as the single entry point for all state mutations.
