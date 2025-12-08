/**
 * Assignment log and undo functionality for FIFA 2026 World Cup Draw Simulator
 */

import { CONFIG, drawState, isRunningFullDraw, GROUP_LETTERS } from './state.js';
import { updateGroupsDisplay } from './ui-groups.js';
import { updatePotStatus } from './ui-pots.js';
import { clearHighlights } from './ui-highlights.js';
import { updateCurrentPot, updateDrawStatus } from './draw.js';
import { getFlag, getDisplayName } from './flags.js';

// ===== Assignment Log Functions =====
// Renders the entire log from drawState.history (single source of truth)
export function renderAssignmentLog() {
    const logContent = document.getElementById('assignment-log-content');
    logContent.innerHTML = '';

    const overrides = CONFIG?.display_overrides || {};

    for (const entry of drawState.history) {
        const teamName = entry.team;
        const groupLetter = GROUP_LETTERS[entry.group - 1];
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

export function addToHistory(teamName, group, isHost = false) {
    drawState.history.push({ team: teamName, group: group, isHost: isHost });
    renderAssignmentLog();
}

export function clearHistory() {
    drawState.history = [];
    renderAssignmentLog();
}

// ===== Undo Function =====
export function undoLastAssignment() {
    // Don't undo if full draw is running
    if (isRunningFullDraw) {
        return;
    }

    // Find the last non-host entry
    if (drawState.history.length === 0) {
        return;
    }

    const lastEntry = drawState.history[drawState.history.length - 1];

    // Don't undo hosts
    if (lastEntry.isHost) {
        updateDrawStatus("Cannot undo host assignments.");
        return;
    }

    // Remove from history
    drawState.history.pop();

    // Remove from assignments
    delete drawState.assignments[lastEntry.team];

    // Update UI
    renderAssignmentLog();
    updateGroupsDisplay();
    updateCurrentPot();
    updatePotStatus();
    clearHighlights();

    updateDrawStatus(`Undid ${lastEntry.team} assignment.`);
}

export function canUndo() {
    if (drawState.history.length === 0) return false;
    const lastEntry = drawState.history[drawState.history.length - 1];
    return !lastEntry.isHost;
}
