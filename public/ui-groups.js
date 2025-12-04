/**
 * Group display and slot rendering for FIFA 2026 World Cup Draw Simulator
 */

import { DISPLAY_ORDERS, SLOT_TO_POT, getDisplayOrderForGroup } from './config.js';
import { drawState } from './state.js';

export function updateGroupsDisplay() {
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
        for (const [teamCode, assignedGroup] of Object.entries(drawState.assignments)) {
            if (assignedGroup === group) {
                const teamData = TEAM_DATA[teamCode];
                const pot = teamData.pot;
                const slotIndex = potToSlot[pot];
                const slot = slots[slotIndex];

                // Clear the pot number placeholder
                slot.innerHTML = '';

                const content = document.createElement('div');
                content.className = 'team-slot-content';

                const flag = document.createElement('img');
                flag.className = 'team-slot-flag';
                flag.src = `flags/${teamData.flag}.svg`;
                flag.alt = teamData.name;
                flag.onerror = () => { flag.src = 'flags/placeholder.svg'; };

                const name = document.createElement('span');
                name.className = 'team-slot-name';
                // For playoff teams, show abbreviations instead of confederation
                if (teamData.playoff && teamData.displayName) {
                    const parts = teamData.displayName.split(': ');
                    const abbrev = parts.length > 1 ? parts[1] : teamData.confederation;
                    name.textContent = `${teamData.name} - ${abbrev}`;
                } else {
                    name.textContent = `${teamData.name} - ${teamData.confederation}`;
                }

                content.appendChild(flag);
                content.appendChild(name);
                slot.appendChild(content);
                slot.classList.add('filled');

                if (teamData.host) {
                    slot.classList.add('host');
                }
            }
        }
    }
}
