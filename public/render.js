/**
 * Central render function for FIFA World Cup Draw Simulator
 *
 * This module exists to avoid circular dependencies.
 * All UI modules can import renderAll from here.
 */

import { renderPots, renderPotStatus } from './ui-pots.js';
import { renderGroups } from './ui-groups.js';
import { renderHistory } from './history.js';
import { renderHighlights } from './ui-highlights.js';

/**
 * Re-render all UI components based on current state
 */
export function renderAll() {
    renderPots();
    renderGroups();
    renderPotStatus();
    renderHistory();
    renderHighlights();
}
