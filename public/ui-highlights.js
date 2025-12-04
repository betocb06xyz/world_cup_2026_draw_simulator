/**
 * Highlight and selection functions for FIFA 2026 World Cup Draw Simulator
 */

import { DISPLAY_ORDERS, getDisplayOrderForGroup } from './config.js';
import { drawState, actionQueue } from './state.js';
import { getValidGroupForTeam } from './api.js';
import { updateGroupsDisplay } from './ui-groups.js';
import { updatePotStatus } from './ui-pots.js';
import { addToHistory } from './history.js';
import { updateCurrentPot, updateDrawStatus } from './draw.js';

// ===== Team Click Handler =====
export function handleTeamClick(teamCode) {
    actionQueue.enqueue(() => processTeamClick(teamCode));
}

async function processTeamClick(teamCode) {
    const teamData = TEAM_DATA[teamCode];

    // Skip if team already assigned or not in current pot
    if (teamData.pot !== drawState.currentPot || teamCode in drawState.assignments) {
        return;
    }

    // If clicking the same team again while it's selected with a valid group, confirm immediately
    if (drawState.selectedTeam === teamCode && drawState.validGroup !== null) {
        const group = drawState.validGroup;  // Save before clearHighlights resets it
        clearHighlights();
        assignTeamToGroup(teamCode, group);
        return;
    }

    // If a different team is selected, clear previous selection first
    if (drawState.selectedTeam) {
        clearHighlights();
    }

    // Mark this team as selected (validGroup will be set after API call)
    drawState.selectedTeam = teamCode;
    drawState.validGroup = null;

    updateDrawStatus(`Checking valid group for ${teamData.name}...`);
    highlightSelectedTeam(teamCode);

    try {
        const validGroup = await getValidGroupForTeam(teamCode);

        // Check if user switched to a different team while we were fetching
        if (drawState.selectedTeam !== teamCode) {
            return;
        }

        if (validGroup === null) {
            updateDrawStatus(`ERROR: No valid group for ${teamData.name}`);
            clearHighlights();
            return;
        }

        drawState.validGroup = validGroup;

        // Highlight valid group and the specific slot
        highlightValidGroup(validGroup, teamData.pot);

        const groupLetter = GROUP_LETTERS[validGroup - 1];
        updateDrawStatus(`${teamData.name} → Group ${groupLetter}. Click team or group to confirm.`);

    } catch (error) {
        console.error('Error in team click:', error);
        updateDrawStatus('Error checking constraints. Please try again.');
        clearHighlights();
    }
}

// ===== Highlight Functions =====
function highlightSelectedTeam(teamCode) {
    // Remove previous selection
    document.querySelectorAll('.team-item.selected').forEach(el => {
        el.classList.remove('selected');
    });

    // Add selection to current team
    const teamItem = document.querySelector(`.team-item[data-team="${teamCode}"]`);
    if (teamItem) {
        teamItem.classList.add('selected');
    }
}

function highlightValidGroup(group, pot) {
    // Clear previous highlights
    document.querySelectorAll('.group').forEach(g => {
        g.classList.remove('highlight', 'dimmed');
    });
    document.querySelectorAll('.team-slot').forEach(s => {
        s.classList.remove('highlight-slot');
    });

    if (group === null) {
        return;
    }

    // Dim all groups first, then highlight the valid one
    document.querySelectorAll('.group').forEach(g => {
        g.classList.add('dimmed');
    });

    const groupElement = document.getElementById(`group-${group}`);
    if (groupElement) {
        groupElement.classList.remove('dimmed');
        groupElement.classList.add('highlight');

        // Highlight the specific slot based on pot and group display order
        const slots = groupElement.querySelectorAll('.team-slot');
        const orderKey = getDisplayOrderForGroup(group);
        const slotIndex = DISPLAY_ORDERS[orderKey][pot];

        if (slots[slotIndex]) {
            slots[slotIndex].classList.add('highlight-slot');
        }
    }
}

export function clearHighlights() {
    drawState.selectedTeam = null;
    drawState.validGroup = null;

    document.querySelectorAll('.team-item.selected').forEach(el => {
        el.classList.remove('selected');
    });
    document.querySelectorAll('.group').forEach(g => {
        g.classList.remove('highlight', 'dimmed');
    });
    document.querySelectorAll('.team-slot').forEach(s => {
        s.classList.remove('highlight-slot');
    });
}

// ===== Group Click Handler =====
export function handleGroupClick(group, event) {
    event.stopPropagation();  // Prevent document click from cancelling

    // Only act if a team is selected AND this is the valid group
    if (!drawState.selectedTeam || drawState.validGroup !== group) {
        return;
    }

    const teamCode = drawState.selectedTeam;
    actionQueue.enqueue(() => {
        clearHighlights();
        assignTeamToGroup(teamCode, group);
    });
}

// ===== Assign Team to Group =====
export function assignTeamToGroup(teamCode, group) {
    drawState.assignments[teamCode] = group;
    clearHighlights();
    updateGroupsDisplay();
    updateCurrentPot();
    updatePotStatus();

    const teamData = TEAM_DATA[teamCode];
    const groupLetter = GROUP_LETTERS[group - 1];

    // Add to history
    addToHistory(teamCode, group, false);

    updateDrawStatus(`${teamData.name} assigned to Group ${groupLetter}`);
}
