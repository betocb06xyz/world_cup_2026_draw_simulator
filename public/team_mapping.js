/**
 * FIFA 2026 World Cup - Team Mapping
 * Maps placeholder codes to real country names and metadata
 */

const TEAM_DATA = {
  // ========== CONCACAF (6 teams) ==========
  "NA": { name: "Mexico", confederation: "CONCACAF", flag: "mx", pot: 1, host: true },
  "NB": { name: "Canada", confederation: "CONCACAF", flag: "ca", pot: 1, host: true },
  "NC": { name: "USA", confederation: "CONCACAF", flag: "us", pot: 1, host: true },
  "ND": { name: "Panama", confederation: "CONCACAF", flag: "pa", pot: 3 },
  "NE": { name: "Curacao", confederation: "CONCACAF", flag: "cw", pot: 4 },
  "NF": { name: "Haiti", confederation: "CONCACAF", flag: "ht", pot: 4 },

  // ========== CONMEBOL (6 teams) ==========
  "CA": { name: "Argentina", confederation: "CONMEBOL", flag: "ar", pot: 1 },
  "CB": { name: "Brazil", confederation: "CONMEBOL", flag: "br", pot: 1 },
  "CC": { name: "Uruguay", confederation: "CONMEBOL", flag: "uy", pot: 2 },
  "CD": { name: "Colombia", confederation: "CONMEBOL", flag: "co", pot: 2 },
  "CE": { name: "Ecuador", confederation: "CONMEBOL", flag: "ec", pot: 2 },
  "CF": { name: "Paraguay", confederation: "CONMEBOL", flag: "py", pot: 3 },

  // ========== UEFA (16 teams) ==========
  "EA": { name: "England", confederation: "UEFA", flag: "gb-eng", pot: 1 },
  "EB": { name: "France", confederation: "UEFA", flag: "fr", pot: 1 },
  "EC": { name: "Spain", confederation: "UEFA", flag: "es", pot: 1 },
  "ED": { name: "Germany", confederation: "UEFA", flag: "de", pot: 1 },
  "EE": { name: "Portugal", confederation: "UEFA", flag: "pt", pot: 1 },
  "EF": { name: "Netherlands", confederation: "UEFA", flag: "nl", pot: 1 },
  "EG": { name: "Belgium", confederation: "UEFA", flag: "be", pot: 1 },
  "EH": { name: "Austria", confederation: "UEFA", flag: "at", pot: 2 },
  "EI": { name: "Croatia", confederation: "UEFA", flag: "hr", pot: 2 },
  "EJ": { name: "Switzerland", confederation: "UEFA", flag: "ch", pot: 2 },
  "EK": { name: "Norway", confederation: "UEFA", flag: "no", pot: 3 },
  "EL": { name: "Scotland", confederation: "UEFA", flag: "gb-sct", pot: 3 },
  "EM": { name: "ITA/NIR/WAL/BHA", fullName: "Italy / Northern Ireland / Wales / Bosnia-Herzegovina", confederation: "UEFA", flag: "uefa", pot: 4, playoff: true },
  "EN": { name: "UKR/SWE/POL/ALB", fullName: "Ukraine / Sweden / Poland / Albania", confederation: "UEFA", flag: "uefa", pot: 4, playoff: true },
  "EO": { name: "TUR/ROU/SVK/KOS", fullName: "Turkey / Romania / Slovakia / Kosovo", confederation: "UEFA", flag: "uefa", pot: 4, playoff: true },
  "EP": { name: "DEN/MKD/CZE/IRL", fullName: "Denmark / North Macedonia / Czech Republic / Ireland", confederation: "UEFA", flag: "uefa", pot: 4, playoff: true },

  // ========== CAF (9 teams) ==========
  "FA": { name: "Senegal", confederation: "CAF", flag: "sn", pot: 2 },
  "FB": { name: "Morocco", confederation: "CAF", flag: "ma", pot: 2 },
  "FC": { name: "Tunisia", confederation: "CAF", flag: "tn", pot: 3 },
  "FD": { name: "Ivory Coast", confederation: "CAF", flag: "ci", pot: 3 },
  "FE": { name: "South Africa", confederation: "CAF", flag: "za", pot: 3 },
  "FF": { name: "Egypt", confederation: "CAF", flag: "eg", pot: 3 },
  "FG": { name: "Algeria", confederation: "CAF", flag: "dz", pot: 3 },
  "FH": { name: "Ghana", confederation: "CAF", flag: "gh", pot: 4 },
  "FI": { name: "Cape Verde", confederation: "CAF", flag: "cv", pot: 4 },

  // ========== AFC (8 teams) ==========
  "AA": { name: "Japan", confederation: "AFC", flag: "jp", pot: 2 },
  "AB": { name: "South Korea", confederation: "AFC", flag: "kr", pot: 2 },
  "AC": { name: "Iran", confederation: "AFC", flag: "ir", pot: 2 },
  "AD": { name: "Australia", confederation: "AFC", flag: "au", pot: 2 },
  "AE": { name: "Saudi Arabia", confederation: "AFC", flag: "sa", pot: 3 },
  "AF": { name: "Qatar", confederation: "AFC", flag: "qa", pot: 3 },
  "AG": { name: "Uzbekistan", confederation: "AFC", flag: "uz", pot: 3 },
  "AH": { name: "Jordan", confederation: "AFC", flag: "jo", pot: 4 },

  // ========== OFC (1 team) ==========
  "XA": { name: "New Zealand", confederation: "OFC", flag: "nz", pot: 4 },

  // ========== PLAYOFF TEAMS ==========
  // Pathway 1: CAF vs CONCACAF vs OFC
  "YA": {
    name: "RDC/JAM/CAL",
    fullName: "DR Congo / Jamaica / New Caledonia",
    confederation: "PLAYOFF",
    flag: "fifa",
    pot: 4,
    playoff: true
  },

  // Pathway 2: AFC vs CONMEBOL vs CONCACAF
  "ZA": {
    name: "IRQ/BOL/SUR",
    fullName: "Iraq / Bolivia / Suriname",
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
