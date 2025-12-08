/**
 * FIFA World Cup Draw Simulator
 * Main application entry point
 *
 * This module handles:
 * - Initialization
 * - Event listeners
 * - Coordinating between API, actions, and UI
 */

import { CONFIG, actionQueue, isRunningFullDraw } from './state.js';
import { fetchInitialState } from './api.js';
import { initState, clearSelection, getSelectedTeam } from './actions.js';
import { renderAll } from './render.js';
import { renderHighlights } from './ui-highlights.js';
import { handleTeamClick, handleGroupClick } from './ui-highlights.js';
import { drawOneTeam, runFullDraw, updateDrawStatus } from './draw.js';
import { handleUndo } from './history.js';

// ===== Initialization =====
async function init() {
    console.log("Initializing FIFA World Cup Draw Simulator...");

    try {
        await initializeDraw();

        // Hide loading screen
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';

        // Setup event listeners
        setupEventListeners();

        console.log("FIFA World Cup Draw Simulator initialized successfully");
    } catch (error) {
        console.error("Initialization error:", error);
        document.querySelector('.loading-detail').textContent =
            'Error: Failed to connect to solver. Please refresh the page.';
    }
}

// ===== Draw Initialization =====
async function initializeDraw() {
    updateLoadingMessage('Connecting to solver...');

    // Get initial state from API
    const { assignments, config } = await fetchInitialState();

    // Initialize state layer
    initState(config, assignments);

    updateLoadingMessage('Loading interface...');

    // Render UI
    renderAll();

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
    document.getElementById('draw-one-btn').addEventListener('click', () => drawOneTeam());
    document.getElementById('undo-btn').addEventListener('click', () => handleUndo());
    document.getElementById('run-all-btn').addEventListener('click', () => runFullDraw(isRunningFullDraw));

    // Add click listeners to groups for two-click confirmation
    const numGroups = CONFIG.pots[1]?.length || 12;
    for (let group = 1; group <= numGroups; group++) {
        const groupElement = document.getElementById(`group-${group}`);
        groupElement.addEventListener('click', (e) => handleGroupClick(group, e));
    }

    // Cancel selection when clicking outside
    document.addEventListener('click', (e) => {
        if (getSelectedTeam() &&
            !e.target.closest('.team-item') &&
            !e.target.closest('.group')) {
            clearSelection();
            renderHighlights();
            updateDrawStatus('Selection cancelled.');
        }
    });

    // Ctrl+Z for undo
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            handleUndo();
        }
    });
}

// ===== Start Application =====
window.addEventListener('DOMContentLoaded', init);
