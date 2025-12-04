/**
 * Configuration and constants for FIFA 2026 World Cup Draw Simulator
 */

// API endpoint - will be '/api' in production, can be overridden for local dev
// In localhost, uses the same port the page is served from (or ?port=XXXX to override)
export const API_ENDPOINT = (() => {
    if (window.location.hostname !== 'localhost') {
        return '/api';  // Production
    }
    const urlParams = new URLSearchParams(window.location.search);
    const port = urlParams.get('port') || window.location.port || '3000';
    return `http://localhost:${port}/api`;
})();

// ===== Display Order Constants =====
// Maps pot number to slot index for each group type
export const DISPLAY_ORDERS = {
    ORDER_1324: {1: 0, 3: 1, 2: 2, 4: 3},  // Groups A, D, G, J
    ORDER_1432: {1: 0, 4: 1, 3: 2, 2: 3},  // Groups B, E, H, K
    ORDER_1243: {1: 0, 2: 1, 4: 2, 3: 3}   // Groups C, F, I, L
};

// Maps slot index to pot number (reverse mappings)
export const SLOT_TO_POT = {
    ORDER_1324: {0: 1, 1: 3, 2: 2, 3: 4},
    ORDER_1432: {0: 1, 1: 4, 2: 3, 3: 2},
    ORDER_1243: {0: 1, 1: 2, 2: 4, 3: 3}
};

export function getDisplayOrderForGroup(group) {
    if ([1, 4, 7, 10].includes(group)) return 'ORDER_1324';
    if ([2, 5, 8, 11].includes(group)) return 'ORDER_1432';
    return 'ORDER_1243';
}
