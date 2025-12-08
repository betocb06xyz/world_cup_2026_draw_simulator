/**
 * Pure action functions for FIFA 2026 World Cup Draw Simulator
 * These can be called directly from console for testing
 */

import { drawState, getGroupLetter } from './state.js';
import { getFlag, getDisplayName } from './flags.js';

// Will be set by init
let config = null;
let api = null;

/**
 * Initialize actions module with config and API
 */
export function initActions(drawConfig, apiModule) {
    config = drawConfig;
    api = apiModule;
}

/**
 * Get current draw state (for testing/debugging)
 */
export function getState() {
    return {
        assignments: { ...drawState.assignments },
        currentPot: drawState.currentPot,
        selectedTeam: drawState.selectedTeam,
        validGroup: drawState.validGroup,
        historyLength: drawState.history.length
    };
}

/**
 * Get team display info
 */
export function getTeamInfo(teamName) {
    if (!config) return null;

    const overrides = config.display_overrides || {};
    return {
        name: teamName,
        displayName: getDisplayName(teamName, overrides),
        flag: getFlag(teamName, overrides),
        pot: getTeamPot(teamName),
        isAssigned: teamName in drawState.assignments,
        assignedGroup: drawState.assignments[teamName] || null
    };
}

/**
 * Get which pot a team belongs to
 */
export function getTeamPot(teamName) {
    if (!config) return null;
    for (let i = 0; i < config.pots.length; i++) {
        if (config.pots[i].includes(teamName)) {
            return i + 1;
        }
    }
    return null;
}

/**
 * Get current pot number (or 0 if draw complete)
 */
export function getCurrentPot() {
    if (!config) return 0;
    const numPots = config.pots.length;
    for (let pot = 1; pot <= numPots; pot++) {
        const teams = config.pots[pot - 1];
        const assigned = teams.filter(t => t in drawState.assignments).length;
        if (assigned < teams.length) {
            return pot;
        }
    }
    return 0;
}

/**
 * Get unassigned teams in current pot
 */
export function getUnassignedTeamsInCurrentPot() {
    if (!config) return [];
    const pot = getCurrentPot();
    if (pot === 0) return [];
    return config.pots[pot - 1].filter(t => !(t in drawState.assignments));
}

/**
 * Get valid group for a team (calls API)
 */
export async function getValidGroup(teamName) {
    if (!api) throw new Error("Actions not initialized");
    return await api.getValidGroupForTeam(teamName);
}

/**
 * Assign a team to a group
 * Returns { success, message, groupLetter }
 */
export function assignTeam(teamName, group) {
    if (!config) return { success: false, message: "Not initialized" };

    // Validate team exists
    const pot = getTeamPot(teamName);
    if (!pot) {
        return { success: false, message: `Unknown team: ${teamName}` };
    }

    // Check not already assigned
    if (teamName in drawState.assignments) {
        return { success: false, message: `${teamName} already assigned` };
    }

    // Assign
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
 * Select a team and get its valid group
 * Returns { success, teamName, validGroup, groupLetter, message }
 */
export async function selectTeam(teamName) {
    if (!config || !api) return { success: false, message: "Not initialized" };

    const pot = getTeamPot(teamName);
    if (!pot) {
        return { success: false, message: `Unknown team: ${teamName}` };
    }

    if (pot !== getCurrentPot()) {
        return { success: false, message: `${teamName} is in Pot ${pot}, current pot is ${getCurrentPot()}` };
    }

    if (teamName in drawState.assignments) {
        return { success: false, message: `${teamName} already assigned` };
    }

    const validGroup = await getValidGroup(teamName);

    if (validGroup === null) {
        return { success: false, message: `No valid group for ${teamName}` };
    }

    drawState.selectedTeam = teamName;
    drawState.validGroup = validGroup;

    const groupLetter = getGroupLetter(validGroup);
    return {
        success: true,
        teamName,
        validGroup,
        groupLetter,
        message: `${teamName} → Group ${groupLetter}`
    };
}

/**
 * Confirm current selection (assign selected team to valid group)
 */
export function confirmSelection() {
    if (!drawState.selectedTeam || drawState.validGroup === null) {
        return { success: false, message: "No team selected" };
    }

    const result = assignTeam(drawState.selectedTeam, drawState.validGroup);

    drawState.selectedTeam = null;
    drawState.validGroup = null;

    return result;
}

/**
 * Clear current selection
 */
export function clearSelection() {
    drawState.selectedTeam = null;
    drawState.validGroup = null;
    return { success: true, message: "Selection cleared" };
}

/**
 * Draw one random team from current pot
 * Returns { success, teamName, group, groupLetter, message }
 */
export async function drawOneTeam() {
    const unassigned = getUnassignedTeamsInCurrentPot();

    if (unassigned.length === 0) {
        return { success: false, message: "No teams to draw" };
    }

    const teamName = unassigned[Math.floor(Math.random() * unassigned.length)];
    const selectResult = await selectTeam(teamName);

    if (!selectResult.success) {
        return selectResult;
    }

    return confirmSelection();
}

/**
 * Undo last assignment (not hosts)
 */
export function undo() {
    if (drawState.history.length === 0) {
        return { success: false, message: "Nothing to undo" };
    }

    const lastEntry = drawState.history[drawState.history.length - 1];

    if (lastEntry.isHost) {
        return { success: false, message: "Cannot undo host assignments" };
    }

    drawState.history.pop();
    delete drawState.assignments[lastEntry.team];
    drawState.currentPot = getCurrentPot();
    drawState.selectedTeam = null;
    drawState.validGroup = null;

    return { success: true, message: `Undid ${lastEntry.team} assignment` };
}

/**
 * Reset draw to initial state
 */
export async function reset() {
    if (!api) return { success: false, message: "Not initialized" };

    const initialAssignments = await api.getInitialState();

    drawState.assignments = initialAssignments;
    drawState.currentPot = 1;
    drawState.selectedTeam = null;
    drawState.validGroup = null;
    drawState.history = [];

    // Add hosts to history
    for (const [team, group] of Object.entries(config.hosts)) {
        drawState.history.push({ team, group, isHost: true });
    }

    return { success: true, message: "Draw reset" };
}

/**
 * Run full draw automatically
 * Returns array of assignments
 */
export async function runFullDraw(delayMs = 0) {
    const results = [];

    while (getCurrentPot() > 0) {
        const result = await drawOneTeam();
        results.push(result);

        if (!result.success) break;

        if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    return results;
}

/**
 * Get all groups with their assigned teams
 */
export function getGroups() {
    if (!config) return {};
    const numGroups = config.pots[0]?.length || 12;
    const groups = {};
    for (let i = 1; i <= numGroups; i++) {
        groups[getGroupLetter(i)] = [];
    }

    for (const [team, groupNum] of Object.entries(drawState.assignments)) {
        const letter = getGroupLetter(groupNum);
        groups[letter].push({
            name: team,
            pot: getTeamPot(team)
        });
    }

    return groups;
}

// Expose to window for console testing
if (typeof window !== 'undefined') {
    window.drawActions = {
        getState,
        getTeamInfo,
        getCurrentPot,
        getUnassignedTeamsInCurrentPot,
        selectTeam,
        confirmSelection,
        clearSelection,
        assignTeam,
        drawOneTeam,
        undo,
        reset,
        runFullDraw,
        getGroups
    };
}
