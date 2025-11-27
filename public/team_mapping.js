/**
 * FIFA 2026 World Cup - Team Mapping
 * Maps placeholder codes to real country names and metadata
 */

const TEAM_DATA = {
  // ========== CONCACAF (6 teams) ==========
  "NA": { name: "Mexico", confederation: "CONCACAF", flag: "mx", pot: 1, host: true },
  "NB": { name: "Canada", confederation: "CONCACAF", flag: "ca", pot: 1, host: true },
  "NC": { name: "USA", confederation: "CONCACAF", flag: "us", pot: 1, host: true },
  "ND": { name: "Costa Rica", confederation: "CONCACAF", flag: "cr", pot: 3 },
  "NE": { name: "Jamaica", confederation: "CONCACAF", flag: "jm", pot: 4 },
  "NF": { name: "Panama", confederation: "CONCACAF", flag: "pa", pot: 4 },

  // ========== CONMEBOL (6 teams) ==========
  "CA": { name: "Argentina", confederation: "CONMEBOL", flag: "ar", pot: 1 },
  "CB": { name: "Brazil", confederation: "CONMEBOL", flag: "br", pot: 1 },
  "CC": { name: "Uruguay", confederation: "CONMEBOL", flag: "uy", pot: 2 },
  "CD": { name: "Colombia", confederation: "CONMEBOL", flag: "co", pot: 2 },
  "CE": { name: "Chile", confederation: "CONMEBOL", flag: "cl", pot: 2 },
  "CF": { name: "Ecuador", confederation: "CONMEBOL", flag: "ec", pot: 3 },

  // ========== UEFA (16 teams) ==========
  "EA": { name: "England", confederation: "UEFA", flag: "gb-eng", pot: 1 },
  "EB": { name: "France", confederation: "UEFA", flag: "fr", pot: 1 },
  "EC": { name: "Spain", confederation: "UEFA", flag: "es", pot: 1 },
  "ED": { name: "Germany", confederation: "UEFA", flag: "de", pot: 1 },
  "EE": { name: "Portugal", confederation: "UEFA", flag: "pt", pot: 1 },
  "EF": { name: "Netherlands", confederation: "UEFA", flag: "nl", pot: 1 },
  "EG": { name: "Italy", confederation: "UEFA", flag: "it", pot: 1 },
  "EH": { name: "Belgium", confederation: "UEFA", flag: "be", pot: 2 },
  "EI": { name: "Croatia", confederation: "UEFA", flag: "hr", pot: 2 },
  "EJ": { name: "Denmark", confederation: "UEFA", flag: "dk", pot: 2 },
  "EK": { name: "Switzerland", confederation: "UEFA", flag: "ch", pot: 3 },
  "EL": { name: "Austria", confederation: "UEFA", flag: "at", pot: 3 },
  "EM": { name: "POL/WAL/GRE/AUT", fullName: "Poland / Wales / Greece / Austria", confederation: "UEFA", flag: "uefa", pot: 4, playoff: true },
  "EN": { name: "SRB/SCO/SUI/SVK", fullName: "Serbia / Scotland / Switzerland / Slovakia", confederation: "UEFA", flag: "uefa", pot: 4, playoff: true },
  "EO": { name: "UKR/TUR/CZE/ISL", fullName: "Ukraine / Turkey / Czech Republic / Iceland", confederation: "UEFA", flag: "uefa", pot: 4, playoff: true },
  "EP": { name: "SWE/NOR/FIN/BUL", fullName: "Sweden / Norway / Finland / Bulgaria", confederation: "UEFA", flag: "uefa", pot: 4, playoff: true },

  // ========== CAF (9 teams) ==========
  "FA": { name: "Senegal", confederation: "CAF", flag: "sn", pot: 2 },
  "FB": { name: "Morocco", confederation: "CAF", flag: "ma", pot: 2 },
  "FC": { name: "Tunisia", confederation: "CAF", flag: "tn", pot: 3 },
  "FD": { name: "Nigeria", confederation: "CAF", flag: "ng", pot: 3 },
  "FE": { name: "Cameroon", confederation: "CAF", flag: "cm", pot: 3 },
  "FF": { name: "Egypt", confederation: "CAF", flag: "eg", pot: 3 },
  "FG": { name: "Algeria", confederation: "CAF", flag: "dz", pot: 3 },
  "FH": { name: "Ghana", confederation: "CAF", flag: "gh", pot: 4 },
  "FI": { name: "Mali", confederation: "CAF", flag: "ml", pot: 4 },

  // ========== AFC (8 teams) ==========
  "AA": { name: "Japan", confederation: "AFC", flag: "jp", pot: 2 },
  "AB": { name: "South Korea", confederation: "AFC", flag: "kr", pot: 2 },
  "AC": { name: "Iran", confederation: "AFC", flag: "ir", pot: 2 },
  "AD": { name: "Australia", confederation: "AFC", flag: "au", pot: 2 },
  "AE": { name: "Saudi Arabia", confederation: "AFC", flag: "sa", pot: 3 },
  "AF": { name: "Qatar", confederation: "AFC", flag: "qa", pot: 3 },
  "AG": { name: "UAE", confederation: "AFC", flag: "ae", pot: 3 },
  "AH": { name: "Iraq", confederation: "AFC", flag: "iq", pot: 4 },

  // ========== OFC (1 team) ==========
  "XA": { name: "New Zealand", confederation: "OFC", flag: "nz", pot: 4 },

  // ========== PLAYOFF TEAMS ==========
  // Pathway 1: CONCACAF vs CAF vs OFC
  "YA": {
    name: "JAM/CGO/CAL",
    fullName: "Jamaica / DR Congo / New Caledonia",
    confederation: "PLAYOFF",
    flag: "fifa",
    pot: 4,
    playoff: true
  },

  // Pathway 2: CONMEBOL vs CONCACAF vs AFC
  "ZA": {
    name: "BOL/SUR/IRQ",
    fullName: "Bolivia / Suriname / Iraq",
    confederation: "PLAYOFF",
    flag: "fifa",
    pot: 4,
    playoff: true
  }
};

// Confederation metadata
const CONFEDERATION_INFO = {
  "CONCACAF": { fullName: "North/Central America & Caribbean", maxPerGroup: 1 },
  "CONMEBOL": { fullName: "South America", maxPerGroup: 1 },
  "UEFA": { fullName: "Europe", maxPerGroup: 2 },
  "CAF": { fullName: "Africa", maxPerGroup: 1 },
  "AFC": { fullName: "Asia", maxPerGroup: 1 },
  "OFC": { fullName: "Oceania", maxPerGroup: 1 },
  "PLAYOFF": { fullName: "Intercontinental Playoff", maxPerGroup: 1 }
};

// Pot definitions (same as Python)
const POTS = {
  1: ["NA", "NB", "NC", "CA", "CB", "EA", "EB", "EC", "ED", "EE", "EF", "EG"],
  2: ["CC", "CD", "CE", "EH", "EI", "EJ", "FA", "FB", "AA", "AB", "AC", "AD"],
  3: ["ND", "CF", "EK", "EL", "FC", "FD", "FE", "FF", "FG", "AE", "AF", "AG"],
  4: ["NE", "NF", "EM", "EN", "EO", "EP", "FH", "FI", "AH", "XA", "YA", "ZA"]
};

// Host pre-assignments
const HOST_ASSIGNMENTS = {
  "NA": 1,  // Mexico → Group A
  "NB": 2,  // Canada → Group B
  "NC": 4   // USA → Group D
};

// Group letters
const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

// Helper functions
function getTeamName(code) {
  return TEAM_DATA[code]?.name || code;
}

function getTeamFlag(code) {
  return TEAM_DATA[code]?.flag || "fifa";
}

function getTeamConfederation(code) {
  return TEAM_DATA[code]?.confederation || "UNKNOWN";
}

function getTeamPot(code) {
  return TEAM_DATA[code]?.pot || 0;
}

function isPlayoffTeam(code) {
  return TEAM_DATA[code]?.playoff === true;
}

function getTeamFullName(code) {
  return TEAM_DATA[code]?.fullName || TEAM_DATA[code]?.name || code;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TEAM_DATA,
    CONFEDERATION_INFO,
    POTS,
    HOST_ASSIGNMENTS,
    GROUP_LETTERS,
    getTeamName,
    getTeamFlag,
    getTeamConfederation,
    getTeamPot,
    isPlayoffTeam,
    getTeamFullName
  };
}
