/**
 * Highlight and selection handling for FIFA World Cup Draw Simulator
 *
 * Handles team selection, group highlighting, and the two-click confirmation flow.
 */

import { getDisplayOrders, getDisplayOrderForGroup } from './config.js';
import { actionQueue, getGroupLetter } from './state.js';
import {
    getCurrentPot,
    getTeamPot,
    isTeamAssigned,
    getSelectedTeam,
    getValidGroup,
    setSelection,
    clearSelection,
    assignTeam
} from './actions.js';
import { getValidGroupForTeam } from './api.js';
import { renderAll } from './render.js';
import { updateDrawStatus } from './draw.js';

// ===== Team Click Handler =====
export function handleTeamClick(teamName) {
    actionQueue.enqueue(() => processTeamClick(teamName));
}

async function processTeamClick(teamName) {
    const pot = getTeamPot(teamName);
    const currentPot = getCurrentPot();

    // Skip if team already assigned or not in current pot
    if (pot !== currentPot || isTeamAssigned(teamName)) {
        return;
    }

    // If clicking the same team again while it's selected with a valid group, confirm immediately
    if (getSelectedTeam() === teamName && getValidGroup() !== null) {
        const group = getValidGroup();
        clearSelection();
        doAssignTeam(teamName, group);
        return;
    }

    // If a different team is selected, clear previous selection first
    if (getSelectedTeam()) {
        clearSelection();
        renderHighlights();
    }

    // Mark this team as selected (validGroup will be set after API call)
    setSelection(teamName, null);
    renderHighlights();

    updateDrawStatus(`Checking valid group for ${teamName}...`);

    try {
        const validGroup = await getValidGroupForTeam(teamName);

        // Check if user switched to a different team while we were fetching
        if (getSelectedTeam() !== teamName) {
            return;
        }

        if (validGroup === null) {
            updateDrawStatus(`ERROR: No valid group for ${teamName}`);
            clearSelection();
            renderHighlights();
            return;
        }

        setSelection(teamName, validGroup);
        renderHighlights();

        const groupLetter = getGroupLetter(validGroup);
        updateDrawStatus(`${teamName} → Group ${groupLetter}. Click team or group to confirm.`);

    } catch (error) {
        console.error('Error in team click:', error);
        updateDrawStatus('Error checking constraints. Please try again.');
        clearSelection();
        renderHighlights();
    }
}

// ===== Group Click Handler =====
export function handleGroupClick(group, event) {
    event.stopPropagation();

    // Only act if a team is selected AND this is the valid group
    if (!getSelectedTeam() || getValidGroup() !== group) {
        return;
    }

    const teamName = getSelectedTeam();
    actionQueue.enqueue(() => {
        clearSelection();
        doAssignTeam(teamName, group);
    });
}

// ===== Assign Team =====
function doAssignTeam(teamName, group) {
    const result = assignTeam(teamName, group);

    if (result.success) {
        updateDrawStatus(result.message);
    } else {
        updateDrawStatus(`Error: ${result.message}`);
    }

    renderAll();
}

// ===== Render Highlights =====
export function renderHighlights() {
    const selectedTeam = getSelectedTeam();
    const validGroup = getValidGroup();

    // Clear all highlights first
    document.querySelectorAll('.team-item.selected').forEach(el => {
        el.classList.remove('selected');
    });
    document.querySelectorAll('.group').forEach(g => {
        g.classList.remove('highlight', 'dimmed');
    });
    document.querySelectorAll('.team-slot').forEach(s => {
        s.classList.remove('highlight-slot');
    });

    if (!selectedTeam) {
        return;
    }

    // Highlight selected team
    const teamItem = document.querySelector(`.team-item[data-team="${selectedTeam}"]`);
    if (teamItem) {
        teamItem.classList.add('selected');
    }

    // Highlight valid group if we have one
    if (validGroup !== null) {
        // Dim all groups first
        document.querySelectorAll('.group').forEach(g => {
            g.classList.add('dimmed');
        });

        const groupElement = document.getElementById(`group-${validGroup}`);
        if (groupElement) {
            groupElement.classList.remove('dimmed');
            groupElement.classList.add('highlight');

            // Highlight the specific slot based on pot and group display order
            const pot = getTeamPot(selectedTeam);
            const slots = groupElement.querySelectorAll('.team-slot');
            const orderKey = getDisplayOrderForGroup(validGroup);
            const displayOrders = getDisplayOrders();
            const slotIndex = displayOrders[orderKey][pot];

            if (slots[slotIndex]) {
                slots[slotIndex].classList.add('highlight-slot');
            }
        }
    }
}
