# Future Improvements

## UI Actions Refactor
The `actions.js` module was created with pure action functions exposed to `window.drawActions` for console testing, but the UI buttons still call functions directly. Could be cleaner with actions as the single entry point for all state mutations.

## Confederations Data Structure
Confederations appear twice in the system:
- In YAML `confederations` for solver constraints
- Derived as `team_confederations` for UI display

Could consider a cleaner structure where this is unified, but current approach works.

## Cleanup Old Files
- `draw_dec05_2025.py` in root - test data now lives in `tests/actual_draw_dec05_2025.yaml`
