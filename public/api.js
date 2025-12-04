/**
 * API calls for FIFA 2026 World Cup Draw Simulator
 */

import { API_ENDPOINT } from './config.js';
import { drawState, POTS, setPots } from './state.js';

export async function callAPI(action, data = {}) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action,
                assignments: drawState.assignments,
                ...data
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

export async function getValidGroupForTeam(teamCode) {
    const result = await callAPI('get_valid_group', { team: teamCode });
    return result.valid_group;
}

export async function getInitialState() {
    const result = await callAPI('get_initial_state');
    setPots(result.pots);
    return result.assignments;
}

export function getCurrentPot(assignments) {
    for (let pot = 1; pot <= 4; pot++) {
        const teams = POTS[pot];
        const assigned = teams.filter(t => t in assignments).length;
        if (assigned < teams.length) {
            return pot;
        }
    }
    return 0;
}
