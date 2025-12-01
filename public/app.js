/**
 * FIFA 2026 World Cup Draw Simulator
 * Frontend with Python API backend (Vercel)
 */

// API endpoint - will be '/api/solver' in production, can be overridden for local dev
// In localhost, uses the same port the page is served from (or ?port=XXXX to override)
const API_ENDPOINT = (() => {
    if (window.location.hostname !== 'localhost') {
        return '/api/solver';  // Production
    }
    const urlParams = new URLSearchParams(window.location.search);
    const port = urlParams.get('port') || window.location.port || '3000';
    return `http://localhost:${port}/api/solver`;
})();

// ===== Global State =====
let drawState = {
    assignments: {},
    currentPot: 1,
    selectedTeam: null,
    validGroups: [],      // Valid groups for selected team
    isDrawing: false
};

// ===== API Calls =====
async function callAPI(action, data = {}) {
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

async function getValidGroupsForTeam(teamCode) {
    const result = await callAPI('get_valid_groups', { team: teamCode });
    return result.valid_groups;
}

async function getInitialState() {
    const result = await callAPI('get_initial_state');
    return result.assignments;
}

function getCurrentPot(assignments) {
    for (let pot = 1; pot <= 4; pot++) {
        const teams = POTS[pot];
        const assigned = teams.filter(t => t in assignments).length;
        if (assigned < teams.length) {
            return pot;
        }
    }
    return 0;
}

// ===== Initialization =====
async function init() {
    console.log("Initializing FIFA 2026 Draw Simulator...");

    try {
        await initializeDraw();

        // Hide loading screen
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';

        // Setup event listeners
        setupEventListeners();

        console.log("✓ FIFA 2026 Draw Simulator initialized successfully");
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
    drawState.assignments = await getInitialState();
    drawState.currentPot = 1;
    drawState.selectedTeam = null;

    updateLoadingMessage('Loading interface...');

    // Populate UI
    populatePots();
    updateGroupsDisplay();
    updatePotStatus();

    // Clear and initialize assignment log
    clearAssignmentLog();

    // Add hosts to log
    addToAssignmentLog("NA", 1, true);
    addToAssignmentLog("NB", 2, true);
    addToAssignmentLog("NC", 4, true);

    updateDrawStatus("Ready to begin drawing. Hosts pre-assigned to Groups A, B, and D.");
}

function updateLoadingMessage(message) {
    const detailElement = document.querySelector('.loading-detail');
    if (detailElement) {
        detailElement.textContent = message;
    }
}

// ===== UI Population =====
function populatePots() {
    for (let pot = 1; pot <= 4; pot++) {
        const teams = POTS[pot];
        const container = document.getElementById(`pot-${pot}-teams`);
        container.innerHTML = '';

        teams.forEach(teamCode => {
            const teamData = TEAM_DATA[teamCode];
            const teamItem = createTeamItem(teamCode, teamData);
            container.appendChild(teamItem);
        });
    }
}

function createTeamItem(teamCode, teamData) {
    const div = document.createElement('div');
    div.className = 'team-item';
    div.dataset.team = teamCode;
    div.dataset.pot = teamData.pot;

    const flag = document.createElement('img');
    flag.className = 'team-flag';
    flag.src = `flags/${teamData.flag}.svg`;
    flag.alt = teamData.name;
    flag.onerror = () => { flag.src = 'flags/placeholder.svg'; };

    const name = document.createElement('span');
    name.className = 'team-name';
    name.textContent = teamData.name;

    div.appendChild(flag);
    div.appendChild(name);

    div.addEventListener('click', (e) => {
        e.stopPropagation();
        handleTeamClick(teamCode);
    });

    return div;
}

// ===== Groups Display =====
function updateGroupsDisplay() {
    for (let group = 1; group <= 12; group++) {
        const groupElement = document.getElementById(`group-${group}`);
        const slots = groupElement.querySelectorAll('.team-slot');

        slots.forEach(slot => {
            slot.innerHTML = '';
            slot.classList.remove('filled', 'host');
        });

        for (const [teamCode, assignedGroup] of Object.entries(drawState.assignments)) {
            if (assignedGroup === group) {
                const teamData = TEAM_DATA[teamCode];
                const pot = teamData.pot;
                // Special display orders for groups
                const ORDER_1324 = {1: 0, 3: 1, 2: 2, 4: 3};  // 1, 3, 2, 4 (A, D, G, J)
                const ORDER_1432 = {1: 0, 4: 1, 3: 2, 2: 3};  // 1, 4, 3, 2 (B)
                const ORDER_1243 = {1: 0, 2: 1, 4: 2, 3: 3};  // 1, 2, 4, 3 (C)
                let slotIndex = pot - 1;
                if ([1, 4, 7, 10].includes(group)) slotIndex = ORDER_1324[pot];  // A, D, G, J
                else if ([2, 5, 8, 11].includes(group)) slotIndex = ORDER_1432[pot];  // B, E, H, K
                else if ([3, 6, 9, 12].includes(group)) slotIndex = ORDER_1243[pot];  // C, F, I, L
                const slot = slots[slotIndex];

                const content = document.createElement('div');
                content.className = 'team-slot-content';

                const flag = document.createElement('img');
                flag.className = 'team-slot-flag';
                flag.src = `flags/${teamData.flag}.svg`;
                flag.alt = teamData.name;
                flag.onerror = () => { flag.src = 'flags/placeholder.svg'; };

                const name = document.createElement('span');
                name.className = 'team-slot-name';
                name.textContent = teamData.name;

                content.appendChild(flag);
                content.appendChild(name);
                slot.appendChild(content);
                slot.classList.add('filled');

                if (teamData.host) {
                    slot.classList.add('host');
                }
            }
        }
    }
}

// ===== Pot Status Update =====
function updatePotStatus() {
    for (let pot = 1; pot <= 4; pot++) {
        const teams = POTS[pot];
        const assigned = teams.filter(t => t in drawState.assignments).length;
        const total = teams.length;

        document.getElementById(`pot-${pot}-status`).textContent = `${assigned}/${total}`;

        const potElement = document.getElementById(`pot-${pot}`);
        potElement.classList.toggle('active', pot === drawState.currentPot);

        teams.forEach(teamCode => {
            const teamItem = document.querySelector(`.team-item[data-team="${teamCode}"]`);
            if (teamItem) {
                const isAssigned = teamCode in drawState.assignments;
                teamItem.classList.toggle('assigned', isAssigned);
                teamItem.classList.toggle('disabled', pot !== drawState.currentPot);
                teamItem.classList.toggle('clickable', pot === drawState.currentPot && !isAssigned);
            }
        });
    }

    const currentPot = getCurrentPot(drawState.assignments);
    if (currentPot === 0) {
        document.getElementById('current-pot-text').textContent = 'Complete!';
    } else {
        document.getElementById('current-pot-text').textContent = `Pot ${currentPot}`;
    }
}

// ===== Team Click Handler =====
async function handleTeamClick(teamCode) {
    if (drawState.isDrawing) return;

    const teamData = TEAM_DATA[teamCode];

    if (teamData.pot !== drawState.currentPot || teamCode in drawState.assignments) {
        return;
    }

    // If clicking the same team again while it's selected, confirm the assignment
    if (drawState.selectedTeam === teamCode && drawState.validGroups.length > 0) {
        const group = drawState.validGroups[0];
        clearHighlights();
        assignTeamToGroup(teamCode, group);
        return;
    }

    // If a different team is selected, clear previous selection first
    if (drawState.selectedTeam && drawState.selectedTeam !== teamCode) {
        clearHighlights();
    }

    drawState.isDrawing = true;
    updateDrawStatus(`Checking valid groups for ${teamData.name}...`);

    try {
        const validGroups = await getValidGroupsForTeam(teamCode);

        if (validGroups.length === 0) {
            updateDrawStatus(`ERROR: No valid groups for ${teamData.name}`);
            drawState.isDrawing = false;
            return;
        }

        // Sort and store valid groups
        validGroups.sort((a, b) => a - b);
        drawState.selectedTeam = teamCode;
        drawState.validGroups = validGroups;

        // Highlight the team as selected
        highlightSelectedTeam(teamCode);

        // Highlight valid group(s) and the specific slot
        highlightValidGroups(validGroups, teamData.pot);

        const groupLetter = GROUP_LETTERS[validGroups[0] - 1];
        updateDrawStatus(`${teamData.name} → Group ${groupLetter}. Click team or group to confirm.`);

    } catch (error) {
        console.error('Error in team click:', error);
        updateDrawStatus('Error checking constraints. Please try again.');
    }

    drawState.isDrawing = false;
}

// ===== Highlight Functions =====
function highlightSelectedTeam(teamCode) {
    // Remove previous selection
    document.querySelectorAll('.team-item.selected').forEach(el => {
        el.classList.remove('selected');
    });

    // Add selection to current team
    const teamItem = document.querySelector(`.team-item[data-team="${teamCode}"]`);
    if (teamItem) {
        teamItem.classList.add('selected');
    }
}

function highlightValidGroups(validGroups, pot) {
    // Clear previous highlights
    document.querySelectorAll('.group').forEach(g => {
        g.classList.remove('highlight', 'dimmed');
    });
    document.querySelectorAll('.team-slot').forEach(s => {
        s.classList.remove('highlight-slot');
    });

    // Only proceed if we have valid groups
    if (!validGroups || validGroups.length === 0) {
        return;
    }

    // Dim all groups first, then highlight the valid one
    document.querySelectorAll('.group').forEach(g => {
        g.classList.add('dimmed');
    });

    // There's only one valid group
    const group = validGroups[0];
    const groupElement = document.getElementById(`group-${group}`);
    if (groupElement) {
        groupElement.classList.remove('dimmed');
        groupElement.classList.add('highlight');

        // Highlight the specific slot based on pot and group display order
        const slots = groupElement.querySelectorAll('.team-slot');
        const ORDER_1324 = {1: 0, 3: 1, 2: 2, 4: 3};
        const ORDER_1432 = {1: 0, 4: 1, 3: 2, 2: 3};
        const ORDER_1243 = {1: 0, 2: 1, 4: 2, 3: 3};

        let slotIndex = pot - 1;
        if ([1, 4, 7, 10].includes(group)) slotIndex = ORDER_1324[pot];
        else if ([2, 5, 8, 11].includes(group)) slotIndex = ORDER_1432[pot];
        else if ([3, 6, 9, 12].includes(group)) slotIndex = ORDER_1243[pot];

        if (slots[slotIndex]) {
            slots[slotIndex].classList.add('highlight-slot');
        }
    }
}

function clearHighlights() {
    drawState.selectedTeam = null;
    drawState.validGroups = [];

    document.querySelectorAll('.team-item.selected').forEach(el => {
        el.classList.remove('selected');
    });
    document.querySelectorAll('.group').forEach(g => {
        g.classList.remove('highlight', 'dimmed');
    });
    document.querySelectorAll('.team-slot').forEach(s => {
        s.classList.remove('highlight-slot');
    });
}

// ===== Group Click Handler =====
function handleGroupClick(group, event) {
    event.stopPropagation();  // Prevent document click from cancelling

    // Only act if a team is selected AND this is the valid group
    if (!drawState.selectedTeam) {
        return;
    }

    // Ignore clicks on non-valid groups (ensure integer comparison)
    const validGroup = drawState.validGroups[0];
    if (validGroup !== group) {
        return;
    }

    const teamCode = drawState.selectedTeam;
    clearHighlights();
    assignTeamToGroup(teamCode, group);
}

// ===== Assign Team to Group =====
function assignTeamToGroup(teamCode, group) {
    drawState.assignments[teamCode] = group;
    drawState.selectedTeam = null;
    drawState.validGroups = [];

    // Clear any remaining highlights
    document.querySelectorAll('.team-item.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.group').forEach(g => g.classList.remove('highlight', 'dimmed'));
    document.querySelectorAll('.team-slot').forEach(s => s.classList.remove('highlight-slot'));

    updateGroupsDisplay();
    updateCurrentPot();
    updatePotStatus();

    const teamData = TEAM_DATA[teamCode];
    const groupLetter = GROUP_LETTERS[group - 1];

    // Add to assignment log
    addToAssignmentLog(teamCode, group, false);

    updateDrawStatus(`${teamData.name} assigned to Group ${groupLetter}`);
}

// ===== Assignment Log Functions =====
function addToAssignmentLog(teamCode, group, isHost = false) {
    const logContent = document.getElementById('assignment-log-content');
    const teamData = TEAM_DATA[teamCode];
    const groupLetter = GROUP_LETTERS[group - 1];

    const entry = document.createElement('div');
    entry.className = 'assignment-log-entry' + (isHost ? ' host' : '');

    const flag = document.createElement('img');
    flag.className = 'assignment-log-flag';
    flag.src = `flags/${teamData.flag}.svg`;
    flag.alt = teamData.name;
    flag.onerror = () => { flag.src = 'flags/placeholder.svg'; };

    const teamName = document.createElement('span');
    teamName.textContent = teamData.name;

    const arrow = document.createElement('span');
    arrow.className = 'assignment-log-arrow';
    arrow.textContent = '→';

    const groupName = document.createElement('span');
    groupName.className = 'assignment-log-group';
    groupName.textContent = `Group ${groupLetter}`;

    entry.appendChild(flag);
    entry.appendChild(teamName);
    entry.appendChild(arrow);
    entry.appendChild(groupName);

    logContent.appendChild(entry);

    // Auto-scroll to bottom
    logContent.scrollTop = logContent.scrollHeight;
}

function clearAssignmentLog() {
    const logContent = document.getElementById('assignment-log-content');
    logContent.innerHTML = '';
}

// ===== Draw One Random Team =====
async function drawOneTeam(calledFromFullDraw = false) {
    if (!calledFromFullDraw && drawState.isDrawing) return;

    const currentPot = getCurrentPot(drawState.assignments);
    if (currentPot === 0) {
        updateDrawStatus("Draw complete!");
        return;
    }

    if (!calledFromFullDraw) {
        drawState.isDrawing = true;
        document.getElementById('draw-one-btn').disabled = true;
        document.getElementById('run-all-btn').disabled = true;
    }
    updateDrawStatus("Drawing one team...");

    try {
        const potTeams = POTS[currentPot];
        const unassigned = potTeams.filter(t => !(t in drawState.assignments));

        if (unassigned.length === 0) {
            updateCurrentPot();
            return;
        }

        const teamCode = unassigned[Math.floor(Math.random() * unassigned.length)];
        const validGroups = await getValidGroupsForTeam(teamCode);

        if (validGroups.length === 0) {
            updateDrawStatus(`ERROR: No valid groups for ${TEAM_DATA[teamCode].name}`);
            return;
        }

        // Pick lowest valid group number
        const group = Math.min(...validGroups);
        assignTeamToGroup(teamCode, group);

    } catch (error) {
        console.error("Error drawing team:", error);
        updateDrawStatus("Error during draw");
    } finally {
        if (!calledFromFullDraw) {
            drawState.isDrawing = false;
            document.getElementById('draw-one-btn').disabled = false;
            document.getElementById('run-all-btn').disabled = false;
        }
    }
}

// ===== Run Full Draw =====
async function runFullDraw() {
    if (drawState.isDrawing) return;

    drawState.isDrawing = true;
    document.getElementById('draw-one-btn').disabled = true;
    document.getElementById('run-all-btn').disabled = true;

    updateDrawStatus("Running full draw...");

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {
        let iterations = 0;
        const maxIterations = 100;

        while (getCurrentPot(drawState.assignments) > 0 && iterations < maxIterations) {
            await drawOneTeam(true);
            await delay(200);
            iterations++;
        }

        if (iterations >= maxIterations) {
            updateDrawStatus("Draw stopped - safety limit reached");
        } else {
            updateDrawStatus("Draw complete! All teams assigned.");
        }
    } catch (error) {
        console.error("Error in full draw:", error);
        updateDrawStatus("Error during full draw: " + error.message);
    }

    document.getElementById('draw-one-btn').disabled = false;
    document.getElementById('run-all-btn').disabled = false;
    drawState.isDrawing = false;
}

// ===== Helper Functions =====
function updateCurrentPot() {
    drawState.currentPot = getCurrentPot(drawState.assignments);
}

function updateDrawStatus(message) {
    document.getElementById('draw-status').textContent = message;
}

// ===== Reset =====
async function resetDraw() {
    if (confirm("Start over? This will reset the entire draw.")) {
        await initializeDraw();
    }
}

// ===== Event Listeners =====
function setupEventListeners() {
    document.getElementById('reset-btn').addEventListener('click', resetDraw);
    document.getElementById('draw-one-btn').addEventListener('click', () => drawOneTeam());
    document.getElementById('run-all-btn').addEventListener('click', runFullDraw);

    // Add click listeners to groups for two-click confirmation
    for (let group = 1; group <= 12; group++) {
        const groupElement = document.getElementById(`group-${group}`);
        groupElement.addEventListener('click', (e) => handleGroupClick(group, e));
    }

    // Cancel selection when clicking outside
    document.addEventListener('click', (e) => {
        if (drawState.selectedTeam &&
            !e.target.closest('.team-item') &&
            !e.target.closest('.group')) {
            clearHighlights();
            updateDrawStatus('Selection cancelled.');
        }
    });
}

// ===== Start Application =====
window.addEventListener('DOMContentLoaded', init);
