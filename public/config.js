/**
 * Configuration and constants for FIFA 2026 World Cup Draw Simulator
 */

import { CONFIG } from './state.js';

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

// ===== Display Order Functions =====
// These read from CONFIG.ui which is loaded from YAML

/**
 * Get display orders mapping (pot number -> slot index)
 */
export function getDisplayOrders() {
    return CONFIG?.ui?.display_orders || {};
}

/**
 * Get slot to pot mapping (reverse of display_orders)
 */
export function getSlotToPot() {
    const displayOrders = getDisplayOrders();
    const slotToPot = {};
    for (const [orderName, potToSlot] of Object.entries(displayOrders)) {
        slotToPot[orderName] = {};
        for (const [pot, slot] of Object.entries(potToSlot)) {
            slotToPot[orderName][slot] = parseInt(pot);
        }
    }
    return slotToPot;
}

/**
 * Get the display order key for a given group number
 */
export function getDisplayOrderForGroup(group) {
    const groupDisplayOrder = CONFIG?.ui?.group_display_order || {};
    for (const [orderName, groups] of Object.entries(groupDisplayOrder)) {
        if (groups.includes(group)) {
            return orderName;
        }
    }
    // Fallback to first order if not found
    return Object.keys(groupDisplayOrder)[0] || 'ORDER_1324';
}
