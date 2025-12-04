/**
 * Pot rendering and team items for FIFA 2026 World Cup Draw Simulator
 */

import { POTS, drawState } from './state.js';
import { getCurrentPot } from './api.js';
import { handleTeamClick } from './ui-highlights.js';

export function populatePots() {
    for (let pot = 1; pot <= 4; pot++) {
        const teams = POTS[pot];
        const container = document.getElementById(`pot-${pot}-teams`);
        container.innerHTML = '';

        teams.forEach(teamCode => {
            const teamData = TEAM_DATA[teamCode];
            const teamItem = createTeamItem(teamCode, teamData);
            container.appendChild(teamItem);
        });
    }
}

function createTeamItem(teamCode, teamData) {
    const div = document.createElement('div');
    div.className = 'team-item';
    div.dataset.team = teamCode;
    div.dataset.pot = teamData.pot;

    const flag = document.createElement('img');
    flag.className = 'team-flag';
    flag.src = `flags/${teamData.flag}.svg`;
    flag.alt = teamData.name;
    flag.onerror = () => { flag.src = 'flags/placeholder.svg'; };

    const textContainer = document.createElement('div');
    textContainer.className = 'team-text';

    const name = document.createElement('span');
    name.className = 'team-name';
    name.textContent = teamData.name;

    const confederation = document.createElement('span');
    confederation.className = 'team-confederation';
    // For playoff teams, show abbreviations (e.g., "ITA/WAL/NIR/BIH") instead of confederation
    if (teamData.playoff && teamData.displayName) {
        const parts = teamData.displayName.split(': ');
        confederation.textContent = parts.length > 1 ? parts[1] : teamData.confederation;
    } else {
        confederation.textContent = teamData.confederation;
    }

    textContainer.appendChild(name);
    textContainer.appendChild(confederation);

    div.appendChild(flag);
    div.appendChild(textContainer);

    div.addEventListener('click', (e) => {
        e.stopPropagation();
        handleTeamClick(teamCode);
    });

    return div;
}

export function updatePotStatus() {
    for (let pot = 1; pot <= 4; pot++) {
        const teams = POTS[pot];
        const assigned = teams.filter(t => t in drawState.assignments).length;
        const total = teams.length;

        document.getElementById(`pot-${pot}-status`).textContent = `${assigned}/${total}`;

        const potElement = document.getElementById(`pot-${pot}`);
        potElement.classList.toggle('active', pot === drawState.currentPot);

        teams.forEach(teamCode => {
            const teamItem = document.querySelector(`.team-item[data-team="${teamCode}"]`);
            if (teamItem) {
                const isAssigned = teamCode in drawState.assignments;
                teamItem.classList.toggle('assigned', isAssigned);
                teamItem.classList.toggle('disabled', pot !== drawState.currentPot);
                teamItem.classList.toggle('clickable', pot === drawState.currentPot && !isAssigned);
            }
        });
    }

    const currentPot = getCurrentPot(drawState.assignments);
    if (currentPot === 0) {
        document.getElementById('current-pot-text').textContent = 'Complete!';
    } else {
        document.getElementById('current-pot-text').textContent = `Pot ${currentPot}`;
    }
}
