/**
 * Pot rendering and team items for FIFA 2026 World Cup Draw Simulator
 */

import { CONFIG, drawState } from './state.js';
import { getCurrentPot } from './api.js';
import { getFlag, getDisplayName } from './flags.js';
import { handleTeamClick } from './ui-highlights.js';

export function populatePots() {
    if (!CONFIG) return;

    const overrides = CONFIG.display_overrides || {};

    for (let pot = 1; pot <= 4; pot++) {
        const teams = CONFIG.pots[pot];
        const container = document.getElementById(`pot-${pot}-teams`);
        container.innerHTML = '';

        teams.forEach(teamName => {
            const teamItem = createTeamItem(teamName, pot, overrides);
            container.appendChild(teamItem);
        });
    }
}

function createTeamItem(teamName, pot, overrides) {
    const div = document.createElement('div');
    div.className = 'team-item';
    div.dataset.team = teamName;
    div.dataset.pot = pot;

    const flagCode = getFlag(teamName, overrides);
    const displayName = getDisplayName(teamName, overrides);
    const category = CONFIG.team_categories?.[teamName] || '';

    const flag = document.createElement('img');
    flag.className = 'team-flag';
    flag.src = `flags/${flagCode}.svg`;
    flag.alt = teamName;
    flag.onerror = () => { flag.src = 'flags/placeholder.svg'; };

    const textContainer = document.createElement('div');
    textContainer.className = 'team-text';

    const name = document.createElement('span');
    name.className = 'team-name';
    name.textContent = teamName;

    const subtitle = document.createElement('span');
    subtitle.className = 'team-category';
    // For playoff teams with display_name, show the teams list instead of category
    if (overrides[teamName]?.display_name) {
        const parts = displayName.split(': ');
        subtitle.textContent = parts.length > 1 ? parts[1] : category;
    } else {
        subtitle.textContent = category;
    }

    textContainer.appendChild(name);
    textContainer.appendChild(subtitle);

    div.appendChild(flag);
    div.appendChild(textContainer);

    div.addEventListener('click', (e) => {
        e.stopPropagation();
        handleTeamClick(teamName);
    });

    return div;
}

export function updatePotStatus() {
    if (!CONFIG) return;

    const overrides = CONFIG.display_overrides || {};

    for (let pot = 1; pot <= 4; pot++) {
        const teams = CONFIG.pots[pot];
        const assigned = teams.filter(t => t in drawState.assignments).length;
        const total = teams.length;

        document.getElementById(`pot-${pot}-status`).textContent = `${assigned}/${total}`;

        const potElement = document.getElementById(`pot-${pot}`);
        potElement.classList.toggle('active', pot === drawState.currentPot);

        teams.forEach(teamName => {
            const teamItem = document.querySelector(`.team-item[data-team="${teamName}"]`);
            if (teamItem) {
                const isAssigned = teamName in drawState.assignments;
                teamItem.classList.toggle('assigned', isAssigned);
                teamItem.classList.toggle('disabled', pot !== drawState.currentPot);
                teamItem.classList.toggle('clickable', pot === drawState.currentPot && !isAssigned);
            }
        });
    }

    const currentPot = getCurrentPot();
    if (currentPot === 0) {
        document.getElementById('current-pot-text').textContent = 'Complete!';
    } else {
        document.getElementById('current-pot-text').textContent = `Pot ${currentPot}`;
    }
}
