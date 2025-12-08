/**
 * Draw logic for FIFA 2026 World Cup Draw Simulator
 */

import { CONFIG, drawState, actionQueue, setIsRunningFullDraw } from './state.js';
import { getCurrentPot, getValidGroupForTeam } from './api.js';
import { assignTeamToGroup } from './ui-highlights.js';

// ===== Helper Functions =====
export function updateCurrentPot() {
    drawState.currentPot = getCurrentPot();
}

export function updateDrawStatus(message) {
    document.getElementById('draw-status').textContent = message;
}

// ===== Draw One Random Team =====
export function drawOneTeam() {
    actionQueue.enqueue(() => processDrawOneTeam());
}

export async function processDrawOneTeam() {
    const currentPot = getCurrentPot();
    if (currentPot === 0) {
        updateDrawStatus("Draw complete!");
        return;
    }

    updateDrawStatus("Drawing one team...");

    try {
        const potTeams = CONFIG.pots[currentPot];
        const unassigned = potTeams.filter(t => !(t in drawState.assignments));

        if (unassigned.length === 0) {
            updateCurrentPot();
            return;
        }

        const teamName = unassigned[Math.floor(Math.random() * unassigned.length)];
        const validGroup = await getValidGroupForTeam(teamName);

        if (validGroup === null) {
            updateDrawStatus(`ERROR: No valid group for ${teamName}`);
            return;
        }

        assignTeamToGroup(teamName, validGroup);

    } catch (error) {
        console.error("Error drawing team:", error);
        updateDrawStatus("Error during draw");
    }
}

// ===== Run Full Draw =====
export function runFullDraw(isRunning) {
    if (isRunning) {
        // Stop requested
        actionQueue.cancel();
    } else {
        // Start the draw
        actionQueue.enqueue(() => processFullDraw());
    }
}

export function setFullDrawButtonState(running) {
    setIsRunningFullDraw(running);
    const btn = document.getElementById('run-all-btn');
    if (running) {
        btn.textContent = 'Stop Draw';
        btn.classList.add('stop-mode');
    } else {
        btn.textContent = 'Run Full Draw';
        btn.classList.remove('stop-mode');
    }
}

async function processFullDraw() {
    setFullDrawButtonState(true);
    updateDrawStatus("Running full draw...");

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {
        let iterations = 0;
        const maxIterations = 100;

        while (getCurrentPot() > 0 && iterations < maxIterations) {
            // Check for cancellation before each team
            if (actionQueue.shouldStop()) {
                updateDrawStatus("Draw stopped by user.");
                break;
            }

            await processDrawOneTeam();
            await delay(200);
            iterations++;
        }

        if (!actionQueue.shouldStop()) {
            if (iterations >= maxIterations) {
                updateDrawStatus("Draw stopped - safety limit reached");
            } else {
                updateDrawStatus("Draw complete! All teams assigned.");
            }
        }
    } catch (error) {
        console.error("Error in full draw:", error);
        updateDrawStatus("Error during full draw: " + error.message);
    } finally {
        setFullDrawButtonState(false);
    }
}
