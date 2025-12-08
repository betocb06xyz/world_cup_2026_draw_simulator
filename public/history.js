/**
 * History rendering and undo handling for FIFA World Cup Draw Simulator
 *
 * Pure rendering - reads from state, no direct mutations.
 */

import { CONFIG, isRunningFullDraw, getGroupLetter } from './state.js';
import { getHistory, undoLastAssignment } from './actions.js';
import { getFlag } from './flags.js';
import { renderAll } from './render.js';
import { updateDrawStatus } from './draw.js';

/**
 * Render the assignment history log
 */
export function renderHistory() {
    const logContent = document.getElementById('assignment-log-content');
    logContent.innerHTML = '';

    const overrides = CONFIG?.display_overrides || {};
    const history = getHistory();

    for (const entry of history) {
        const teamName = entry.team;
        const groupLetter = getGroupLetter(entry.group);
        const flagCode = getFlag(teamName, overrides);

        const entryDiv = document.createElement('div');
        entryDiv.className = 'assignment-log-entry' + (entry.isHost ? ' host' : '');

        const flag = document.createElement('img');
        flag.className = 'assignment-log-flag';
        flag.src = `flags/${flagCode}.svg`;
        flag.alt = teamName;
        flag.onerror = () => { flag.src = 'flags/placeholder.svg'; };

        const teamNameSpan = document.createElement('span');
        teamNameSpan.textContent = teamName;

        const arrow = document.createElement('span');
        arrow.className = 'assignment-log-arrow';
        arrow.textContent = '→';

        const groupName = document.createElement('span');
        groupName.className = 'assignment-log-group';
        groupName.textContent = `Group ${groupLetter}`;

        entryDiv.appendChild(flag);
        entryDiv.appendChild(teamNameSpan);
        entryDiv.appendChild(arrow);
        entryDiv.appendChild(groupName);

        logContent.appendChild(entryDiv);
    }

    // Auto-scroll to bottom
    logContent.scrollTop = logContent.scrollHeight;
}

/**
 * Handle undo button click
 */
export function handleUndo() {
    // Don't undo if full draw is running
    if (isRunningFullDraw) {
        return;
    }

    const result = undoLastAssignment();

    if (result.success) {
        updateDrawStatus(result.message);
        renderAll();
    } else {
        updateDrawStatus(result.message);
    }
}
