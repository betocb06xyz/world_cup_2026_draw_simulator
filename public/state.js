/**
 * Global state for FIFA 2026 World Cup Draw Simulator
 */

// Config loaded from API
export let CONFIG = null;

export function setConfig(config) {
    CONFIG = config;
}

// Draw state
export const drawState = {
    assignments: {},      // { teamName: groupNumber }
    currentPot: 1,
    selectedTeam: null,   // team name
    validGroup: null,     // group number (1-12)
    history: []           // [{ team: name, group: number, isHost: boolean }]
};

// Flag for full draw mode
export let isRunningFullDraw = false;

export function setIsRunningFullDraw(value) {
    isRunningFullDraw = value;
}

// Action queue (prevents race conditions)
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

        this.queue.shift();
        this.processing = false;
        this.processNext();
    },

    shouldStop() {
        return this.cancelRequested;
    }
};

// Group letters constant
export const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
