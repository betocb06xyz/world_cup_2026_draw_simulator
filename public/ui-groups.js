/**
 * Group display and slot rendering for FIFA 2026 World Cup Draw Simulator
 */

import { DISPLAY_ORDERS, SLOT_TO_POT, getDisplayOrderForGroup } from './config.js';
import { CONFIG, drawState } from './state.js';
import { getFlag, getDisplayName } from './flags.js';

/**
 * Get pot number for a team (1-4)
 */
function getTeamPot(teamName) {
    if (!CONFIG) return null;
    for (let pot = 1; pot <= 4; pot++) {
        if (CONFIG.pots[pot].includes(teamName)) {
            return pot;
        }
    }
    return null;
}

/**
 * Check if team is a host
 */
function isHost(teamName) {
    if (!CONFIG) return false;
    return teamName in CONFIG.hosts;
}

export function updateGroupsDisplay() {
    if (!CONFIG) return;

    const overrides = CONFIG.display_overrides || {};

    for (let group = 1; group <= 12; group++) {
        const groupElement = document.getElementById(`group-${group}`);
        const slots = groupElement.querySelectorAll('.team-slot');

        const orderKey = getDisplayOrderForGroup(group);
        const slotToPot = SLOT_TO_POT[orderKey];
        const potToSlot = DISPLAY_ORDERS[orderKey];

        // Clear slots and show pot numbers for empty ones
        slots.forEach((slot, index) => {
            slot.innerHTML = '';
            slot.classList.remove('filled', 'host');

            // Add pot number placeholder
            const potNum = slotToPot[index];
            const placeholder = document.createElement('span');
            placeholder.className = 'slot-pot-number';
            placeholder.textContent = potNum;
            slot.appendChild(placeholder);
        });

        // Fill in assigned teams (overwrites pot number)
        for (const [teamName, assignedGroup] of Object.entries(drawState.assignments)) {
            if (assignedGroup === group) {
                const pot = getTeamPot(teamName);
                if (!pot) continue;

                const slotIndex = potToSlot[pot];
                const slot = slots[slotIndex];

                // Clear the pot number placeholder
                slot.innerHTML = '';

                const flagCode = getFlag(teamName, overrides);
                const displayName = getDisplayName(teamName, overrides);

                const content = document.createElement('div');
                content.className = 'team-slot-content';

                const flag = document.createElement('img');
                flag.className = 'team-slot-flag';
                flag.src = `flags/${flagCode}.svg`;
                flag.alt = teamName;
                flag.onerror = () => { flag.src = 'flags/placeholder.svg'; };

                const confederation = CONFIG.team_confederations?.[teamName] || '';

                const name = document.createElement('span');
                name.className = 'team-slot-name';
                // Show "Team - Confederation" format, or display_name for playoffs
                if (overrides[teamName]?.display_name) {
                    name.textContent = displayName;
                } else {
                    name.textContent = `${teamName} - ${confederation}`;
                }

                content.appendChild(flag);
                content.appendChild(name);
                slot.appendChild(content);
                slot.classList.add('filled');

                if (isHost(teamName)) {
                    slot.classList.add('host');
                }
            }
        }
    }
}
