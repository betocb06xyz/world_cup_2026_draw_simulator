/**
 * Global state and action queue for FIFA 2026 World Cup Draw Simulator
 */

// ===== Global State =====
export let POTS = null;  // Loaded from API

export function setPots(pots) {
    POTS = pots;
}

export const drawState = {
    assignments: {},
    currentPot: 1,
    selectedTeam: null,
    validGroup: null,      // Valid group for selected team
    history: []            // Stack of team codes for undo (excludes hosts)
};

// Flag for full draw mode
export let isRunningFullDraw = false;

export function setIsRunningFullDraw(value) {
    isRunningFullDraw = value;
}

// ===== Action Queue (prevents race conditions) =====
export const actionQueue = {
    queue: [],
    processing: false,
    cancelRequested: false,

    enqueue(action) {
        this.queue.push(action);
        this.processNext();
    },

    cancel() {
        this.cancelRequested = true;
    },

    async processNext() {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;
        this.cancelRequested = false;

        try {
            await this.queue[0]();
        } catch (error) {
            console.error('Action failed:', error);
        }

        this.queue.shift();  // dequeue after completion
        this.processing = false;
        this.processNext();
    },

    shouldStop() {
        return this.cancelRequested;
    }
};
