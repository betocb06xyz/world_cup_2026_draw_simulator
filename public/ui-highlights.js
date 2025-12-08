/**
 * Highlight and selection functions for FIFA 2026 World Cup Draw Simulator
 */

import { getDisplayOrders, getDisplayOrderForGroup } from './config.js';
import { CONFIG, drawState, actionQueue, getGroupLetter } from './state.js';
import { getValidGroupForTeam } from './api.js';
import { updateGroupsDisplay } from './ui-groups.js';
import { updatePotStatus } from './ui-pots.js';
import { addToHistory } from './history.js';
import { updateCurrentPot, updateDrawStatus } from './draw.js';

/**
 * Get pot number for a team (1-4)
 */
function getTeamPot(teamName) {
    if (!CONFIG) return null;
    const numPots = Object.keys(CONFIG.pots).length;
    for (let pot = 1; pot <= numPots; pot++) {
        if (CONFIG.pots[pot].includes(teamName)) {
            return pot;
        }
    }
    return null;
}

// ===== Team Click Handler =====
export function handleTeamClick(teamName) {
    actionQueue.enqueue(() => processTeamClick(teamName));
}

async function processTeamClick(teamName) {
    const pot = getTeamPot(teamName);

    // Skip if team already assigned or not in current pot
    if (pot !== drawState.currentPot || teamName in drawState.assignments) {
        return;
    }

    // If clicking the same team again while it's selected with a valid group, confirm immediately
    if (drawState.selectedTeam === teamName && drawState.validGroup !== null) {
        const group = drawState.validGroup;  // Save before clearHighlights resets it
        clearHighlights();
        assignTeamToGroup(teamName, group);
        return;
    }

    // If a different team is selected, clear previous selection first
    if (drawState.selectedTeam) {
        clearHighlights();
    }

    // Mark this team as selected (validGroup will be set after API call)
    drawState.selectedTeam = teamName;
    drawState.validGroup = null;

    updateDrawStatus(`Checking valid group for ${teamName}...`);
    highlightSelectedTeam(teamName);

    try {
        const validGroup = await getValidGroupForTeam(teamName);

        // Check if user switched to a different team while we were fetching
        if (drawState.selectedTeam !== teamName) {
            return;
        }

        if (validGroup === null) {
            updateDrawStatus(`ERROR: No valid group for ${teamName}`);
            clearHighlights();
            return;
        }

        drawState.validGroup = validGroup;

        // Highlight valid group and the specific slot
        highlightValidGroup(validGroup, pot);

        const groupLetter = getGroupLetter(validGroup);
        updateDrawStatus(`${teamName} → Group ${groupLetter}. Click team or group to confirm.`);

    } catch (error) {
        console.error('Error in team click:', error);
        updateDrawStatus('Error checking constraints. Please try again.');
        clearHighlights();
    }
}

// ===== Highlight Functions =====
function highlightSelectedTeam(teamName) {
    // Remove previous selection
    document.querySelectorAll('.team-item.selected').forEach(el => {
        el.classList.remove('selected');
    });

    // Add selection to current team
    const teamItem = document.querySelector(`.team-item[data-team="${teamName}"]`);
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
        const displayOrders = getDisplayOrders();
        const slotIndex = displayOrders[orderKey][pot];

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

    const teamName = drawState.selectedTeam;
    actionQueue.enqueue(() => {
        clearHighlights();
        assignTeamToGroup(teamName, group);
    });
}

// ===== Assign Team to Group =====
export function assignTeamToGroup(teamName, group) {
    drawState.assignments[teamName] = group;
    clearHighlights();
    updateGroupsDisplay();
    updateCurrentPot();
    updatePotStatus();

    const groupLetter = getGroupLetter(group);

    // Add to history
    addToHistory(teamName, group, false);

    updateDrawStatus(`${teamName} assigned to Group ${groupLetter}`);
}
