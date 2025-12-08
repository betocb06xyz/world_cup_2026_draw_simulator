/**
 * API calls for FIFA 2026 World Cup Draw Simulator
 */

import { API_ENDPOINT } from './config.js';
import { drawState, CONFIG, setConfig } from './state.js';

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

export async function getValidGroupForTeam(teamName) {
    const result = await callAPI('get_valid_group', { team: teamName });
    return result.valid_group;
}

export async function getInitialState() {
    const result = await callAPI('get_initial_state');

    // Store config (pots, hosts, display_overrides, team_categories)
    setConfig({
        pots: result.pots,
        hosts: result.hosts,
        display_overrides: result.display_overrides,
        team_categories: result.team_categories
    });

    return result.assignments;
}

export function getCurrentPot() {
    if (!CONFIG) return 0;
    for (let pot = 1; pot <= 4; pot++) {
        const teams = CONFIG.pots[pot];
        const assigned = teams.filter(t => t in drawState.assignments).length;
        if (assigned < teams.length) {
            return pot;
        }
    }
    return 0;
}
