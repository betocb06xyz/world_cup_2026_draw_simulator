/**
 * FIFA 2026 World Cup Draw Simulator
 * Main application entry point
 */

import { CONFIG, drawState, actionQueue, isRunningFullDraw } from './state.js';
import { getInitialState } from './api.js';
import { populatePots, updatePotStatus } from './ui-pots.js';
import { updateGroupsDisplay } from './ui-groups.js';
import { clearHighlights, handleGroupClick } from './ui-highlights.js';
import { addToHistory, clearHistory, undoLastAssignment } from './history.js';
import { drawOneTeam, runFullDraw, updateDrawStatus } from './draw.js';

// ===== Initialization =====
async function init() {
    console.log("Initializing FIFA 2026 Draw Simulator...");

    try {
        await initializeDraw();

        // Hide loading screen
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';

        // Setup event listeners
        setupEventListeners();

        console.log("FIFA 2026 Draw Simulator initialized successfully");
    } catch (error) {
        console.error("Initialization error:", error);
        document.querySelector('.loading-detail').textContent =
            'Error: Failed to connect to solver. Please refresh the page.';
    }
}

// ===== Draw Initialization =====
async function initializeDraw() {
    updateLoadingMessage('Connecting to solver...');

    // Get initial state from API (this also loads CONFIG)
    drawState.assignments = await getInitialState();
    drawState.currentPot = 1;
    drawState.selectedTeam = null;

    updateLoadingMessage('Loading interface...');

    // Populate UI
    populatePots();
    updateGroupsDisplay();
    updatePotStatus();

    // Clear history and add hosts
    clearHistory();
    for (const [teamName, group] of Object.entries(CONFIG.hosts)) {
        addToHistory(teamName, group, true);
    }

    updateDrawStatus("Ready to begin drawing. Hosts pre-assigned to Groups A, B, and D.");
}

function updateLoadingMessage(message) {
    const detailElement = document.querySelector('.loading-detail');
    if (detailElement) {
        detailElement.textContent = message;
    }
}

// ===== Reset =====
function resetDraw() {
    if (confirm("Start over? This will reset the entire draw.")) {
        actionQueue.enqueue(() => initializeDraw());
    }
}

// ===== Event Listeners =====
function setupEventListeners() {
    document.getElementById('reset-btn').addEventListener('click', resetDraw);
    document.getElementById('draw-one-btn').addEventListener('click', drawOneTeam);
    document.getElementById('undo-btn').addEventListener('click', undoLastAssignment);
    document.getElementById('run-all-btn').addEventListener('click', () => runFullDraw(isRunningFullDraw));

    // Add click listeners to groups for two-click confirmation
    const numGroups = CONFIG.pots[1]?.length || 12;
    for (let group = 1; group <= numGroups; group++) {
        const groupElement = document.getElementById(`group-${group}`);
        groupElement.addEventListener('click', (e) => handleGroupClick(group, e));
    }

    // Cancel selection when clicking outside
    document.addEventListener('click', (e) => {
        if (drawState.selectedTeam &&
            !e.target.closest('.team-item') &&
            !e.target.closest('.group')) {
            clearHighlights();
            updateDrawStatus('Selection cancelled.');
        }
    });

    // Ctrl+Z for undo
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undoLastAssignment();
        }
    });
}

// ===== Start Application =====
window.addEventListener('DOMContentLoaded', init);
