/**
 * Group rendering for FIFA World Cup Draw Simulator
 *
 * Pure rendering - reads from state, no mutations.
 */

import { getDisplayOrders, getSlotToPot, getDisplayOrderForGroup } from './config.js';
import { CONFIG } from './state.js';
import { getAssignments, getTeamPot } from './actions.js';
import { getFlag, getDisplayName } from './flags.js';

/**
 * Check if team is a host
 */
function isHost(teamName) {
    if (!CONFIG) return false;
    return teamName in CONFIG.hosts;
}

/**
 * Render all groups with assigned teams
 */
export function renderGroups() {
    if (!CONFIG) return;

    const overrides = CONFIG.display_overrides || {};
    const numGroups = CONFIG.pots[1]?.length || 12;
    const displayOrders = getDisplayOrders();
    const slotToPotMap = getSlotToPot();
    const assignments = getAssignments();

    for (let group = 1; group <= numGroups; group++) {
        const groupElement = document.getElementById(`group-${group}`);
        const slots = groupElement.querySelectorAll('.team-slot');

        const orderKey = getDisplayOrderForGroup(group);
        const slotToPot = slotToPotMap[orderKey];
        const potToSlot = displayOrders[orderKey];

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
        for (const [teamName, assignedGroup] of Object.entries(assignments)) {
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

                const category = CONFIG.team_categories?.[teamName] || '';

                const name = document.createElement('span');
                name.className = 'team-slot-name';
                // Show "Team - Category" format, or display_name for playoffs
                if (overrides[teamName]?.display_name) {
                    name.textContent = displayName;
                } else {
                    name.textContent = `${teamName} - ${category}`;
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
