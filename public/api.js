/**
 * API client for FIFA World Cup Draw Simulator
 *
 * Pure API calls - no state management.
 * State is managed by actions.js
 */

import { API_ENDPOINT } from './config.js';
import { CONFIG, setConfig } from './state.js';
import { getAssignments } from './actions.js';

/**
 * Call the API with an action and data
 */
export async function callAPI(action, data = {}) {
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action,
            assignments: getAssignments(),
            ...data
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
}

/**
 * Get valid group for a team from the solver
 */
export async function getValidGroupForTeam(teamName) {
    const result = await callAPI('get_valid_group', { team: teamName });
    return result.valid_group;
}

/**
 * Get initial state from API and store config
 * Returns { assignments, config }
 */
export async function fetchInitialState() {
    const result = await callAPI('get_initial_state');

    // Store config globally
    const config = {
        pots: result.pots,
        hosts: result.hosts,
        display_overrides: result.display_overrides,
        team_categories: result.team_categories,
        ui: result.ui
    };
    setConfig(config);

    return {
        assignments: result.assignments,
        config
    };
}
