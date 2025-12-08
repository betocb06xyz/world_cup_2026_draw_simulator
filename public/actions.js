/**
 * State management layer for FIFA World Cup Draw Simulator
 *
 * This is the ONLY module that mutates drawState.
 * UI modules should call these functions and re-render based on state.
 *
 * Core operations:
 * - Initialize state (from API)
 * - Assign team to group
 * - Undo assignment
 * - Selection state (selectedTeam, validGroup)
 */

import { drawState, getGroupLetter } from './state.js';

// Config reference (set during init)
let config = null;

// ===== Initialization =====

/**
 * Initialize state with config and initial assignments
 */
export function initState(drawConfig, initialAssignments) {
    config = drawConfig;

    drawState.assignments = { ...initialAssignments };
    drawState.currentPot = 1;
    drawState.selectedTeam = null;
    drawState.validGroup = null;
    drawState.history = [];

    // Add hosts to history
    const hosts = config.hosts || {};
    for (const [team, group] of Object.entries(hosts)) {
        drawState.history.push({ team, group, isHost: true });
    }
}

// ===== Getters (read-only access to state) =====

export function getAssignments() {
    return drawState.assignments;
}

export function getCurrentPot() {
    if (!config) return 0;
    const numPots = Object.keys(config.pots).length;
    for (let pot = 1; pot <= numPots; pot++) {
        const teams = config.pots[pot];
        const assigned = teams.filter(t => t in drawState.assignments).length;
        if (assigned < teams.length) {
            return pot;
        }
    }
    return 0;
}

export function getSelectedTeam() {
    return drawState.selectedTeam;
}

export function getValidGroup() {
    return drawState.validGroup;
}

export function getHistory() {
    return drawState.history;
}

export function isTeamAssigned(teamName) {
    return teamName in drawState.assignments;
}

export function getTeamGroup(teamName) {
    return drawState.assignments[teamName] || null;
}

export function getTeamPot(teamName) {
    if (!config) return null;
    const numPots = Object.keys(config.pots).length;
    for (let pot = 1; pot <= numPots; pot++) {
        if (config.pots[pot].includes(teamName)) {
            return pot;
        }
    }
    return null;
}

export function getUnassignedTeamsInPot(pot) {
    if (!config) return [];
    const teams = config.pots[pot];
    return teams ? teams.filter(t => !(t in drawState.assignments)) : [];
}

export function canUndo() {
    if (drawState.history.length === 0) return false;
    const lastEntry = drawState.history[drawState.history.length - 1];
    return !lastEntry.isHost;
}

// ===== State Mutations =====

/**
 * Set selection state (team being considered for assignment)
 */
export function setSelection(teamName, validGroup) {
    drawState.selectedTeam = teamName;
    drawState.validGroup = validGroup;
}

/**
 * Clear selection state
 */
export function clearSelection() {
    drawState.selectedTeam = null;
    drawState.validGroup = null;
}

/**
 * Assign a team to a group
 * Returns { success, message, groupLetter }
 */
export function assignTeam(teamName, group) {
    if (!config) {
        return { success: false, message: "Not initialized" };
    }

    const pot = getTeamPot(teamName);
    if (!pot) {
        return { success: false, message: `Unknown team: ${teamName}` };
    }

    if (teamName in drawState.assignments) {
        return { success: false, message: `${teamName} already assigned` };
    }

    // Mutate state
    drawState.assignments[teamName] = group;
    drawState.history.push({ team: teamName, group, isHost: false });
    drawState.currentPot = getCurrentPot();

    const groupLetter = getGroupLetter(group);
    return {
        success: true,
        message: `${teamName} assigned to Group ${groupLetter}`,
        groupLetter
    };
}

/**
 * Undo last non-host assignment
 * Returns { success, message, team?, group? }
 */
export function undoLastAssignment() {
    if (drawState.history.length === 0) {
        return { success: false, message: "Nothing to undo" };
    }

    const lastEntry = drawState.history[drawState.history.length - 1];

    if (lastEntry.isHost) {
        return { success: false, message: "Cannot undo host assignments" };
    }

    // Mutate state
    drawState.history.pop();
    delete drawState.assignments[lastEntry.team];
    drawState.currentPot = getCurrentPot();
    drawState.selectedTeam = null;
    drawState.validGroup = null;

    return {
        success: true,
        message: `Undid ${lastEntry.team} assignment`,
        team: lastEntry.team,
        group: lastEntry.group
    };
}

/**
 * Reset to initial state (requires calling initState again after API call)
 */
export function resetState() {
    drawState.assignments = {};
    drawState.currentPot = 1;
    drawState.selectedTeam = null;
    drawState.validGroup = null;
    drawState.history = [];
}

// ===== Expose to window for console testing =====
if (typeof window !== 'undefined') {
    window.drawActions = {
        // Getters
        getAssignments,
        getCurrentPot,
        getSelectedTeam,
        getValidGroup,
        getHistory,
        isTeamAssigned,
        getTeamGroup,
        getTeamPot,
        getUnassignedTeamsInPot,
        canUndo,
        // Mutations
        setSelection,
        clearSelection,
        assignTeam,
        undoLastAssignment,
        resetState
    };
}
