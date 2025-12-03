/**
 * FIFA 2026 World Cup - Team Mapping
 * Maps placeholder codes to real country names and metadata
 */

const TEAM_DATA = {
  // ========== CONCACAF (6 teams) ==========
  "NA": { name: "Mexico", displayName: "Mexico - CONCACAF", confederation: "CONCACAF", flag: "mx", pot: 1, host: true },
  "NB": { name: "Canada", displayName: "Canada - CONCACAF", confederation: "CONCACAF", flag: "ca", pot: 1, host: true },
  "NC": { name: "USA", displayName: "USA - CONCACAF", confederation: "CONCACAF", flag: "us", pot: 1, host: true },
  "ND": { name: "Panama", displayName: "Panama - CONCACAF", confederation: "CONCACAF", flag: "pa", pot: 3 },
  "NE": { name: "Curacao", displayName: "Curacao - CONCACAF", confederation: "CONCACAF", flag: "cw", pot: 4 },
  "NF": { name: "Haiti", displayName: "Haiti - CONCACAF", confederation: "CONCACAF", flag: "ht", pot: 4 },

  // ========== CONMEBOL (6 teams) ==========
  "CA": { name: "Argentina", displayName: "Argentina - CONMEBOL", confederation: "CONMEBOL", flag: "ar", pot: 1 },
  "CB": { name: "Brazil", displayName: "Brazil - CONMEBOL", confederation: "CONMEBOL", flag: "br", pot: 1 },
  "CC": { name: "Uruguay", displayName: "Uruguay - CONMEBOL", confederation: "CONMEBOL", flag: "uy", pot: 2 },
  "CD": { name: "Colombia", displayName: "Colombia - CONMEBOL", confederation: "CONMEBOL", flag: "co", pot: 2 },
  "CE": { name: "Ecuador", displayName: "Ecuador - CONMEBOL", confederation: "CONMEBOL", flag: "ec", pot: 2 },
  "CF": { name: "Paraguay", displayName: "Paraguay - CONMEBOL", confederation: "CONMEBOL", flag: "py", pot: 3 },

  // ========== UEFA (16 teams) ==========
  "EA": { name: "Spain", displayName: "Spain - UEFA", confederation: "UEFA", flag: "es", pot: 1 },
  "EB": { name: "France", displayName: "France - UEFA", confederation: "UEFA", flag: "fr", pot: 1 },
  "EC": { name: "England", displayName: "England - UEFA", confederation: "UEFA", flag: "gb-eng", pot: 1 },
  "ED": { name: "Germany", displayName: "Germany - UEFA", confederation: "UEFA", flag: "de", pot: 1 },
  "EE": { name: "Portugal", displayName: "Portugal - UEFA", confederation: "UEFA", flag: "pt", pot: 1 },
  "EF": { name: "Netherlands", displayName: "Netherlands - UEFA", confederation: "UEFA", flag: "nl", pot: 1 },
  "EG": { name: "Belgium", displayName: "Belgium - UEFA", confederation: "UEFA", flag: "be", pot: 1 },
  "EH": { name: "Austria", displayName: "Austria - UEFA", confederation: "UEFA", flag: "at", pot: 2 },
  "EI": { name: "Croatia", displayName: "Croatia - UEFA", confederation: "UEFA", flag: "hr", pot: 2 },
  "EJ": { name: "Switzerland", displayName: "Switzerland - UEFA", confederation: "UEFA", flag: "ch", pot: 2 },
  "EK": { name: "Norway", displayName: "Norway - UEFA", confederation: "UEFA", flag: "no", pot: 3 },
  "EL": { name: "Scotland", displayName: "Scotland - UEFA", confederation: "UEFA", flag: "gb-sct", pot: 3 },
  "EM": { name: "UEFA 1", displayName: "UEFA 1: ITA/WAL/NIR/BIH", fullName: "Italy / Wales / Northern Ireland / Bosnia-Herzegovina", confederation: "UEFA", flag: "uefa", pot: 4, playoff: true },
  "EN": { name: "UEFA 2", displayName: "UEFA 2: UKR/POL/SWE/ALB", fullName: "Ukraine / Poland / Sweden / Albania", confederation: "UEFA", flag: "uefa", pot: 4, playoff: true },
  "EO": { name: "UEFA 3", displayName: "UEFA 3: TUR/ROU/SVK/KOS", fullName: "Turkey / Romania / Slovakia / Kosovo", confederation: "UEFA", flag: "uefa", pot: 4, playoff: true },
  "EP": { name: "UEFA 4", displayName: "UEFA 4: DEN/CZE/MKD/IRL", fullName: "Denmark / Czech Republic / North Macedonia / Ireland", confederation: "UEFA", flag: "uefa", pot: 4, playoff: true },

  // ========== CAF (9 teams) ==========
  "FA": { name: "Senegal", displayName: "Senegal - CAF", confederation: "CAF", flag: "sn", pot: 2 },
  "FB": { name: "Morocco", displayName: "Morocco - CAF", confederation: "CAF", flag: "ma", pot: 2 },
  "FC": { name: "Tunisia", displayName: "Tunisia - CAF", confederation: "CAF", flag: "tn", pot: 3 },
  "FD": { name: "Ivory Coast", displayName: "Ivory Coast - CAF", confederation: "CAF", flag: "ci", pot: 3 },
  "FE": { name: "South Africa", displayName: "South Africa - CAF", confederation: "CAF", flag: "za", pot: 3 },
  "FF": { name: "Egypt", displayName: "Egypt - CAF", confederation: "CAF", flag: "eg", pot: 3 },
  "FG": { name: "Algeria", displayName: "Algeria - CAF", confederation: "CAF", flag: "dz", pot: 3 },
  "FH": { name: "Ghana", displayName: "Ghana - CAF", confederation: "CAF", flag: "gh", pot: 4 },
  "FI": { name: "Cape Verde", displayName: "Cape Verde - CAF", confederation: "CAF", flag: "cv", pot: 4 },

  // ========== AFC (8 teams) ==========
  "AA": { name: "Japan", displayName: "Japan - AFC", confederation: "AFC", flag: "jp", pot: 2 },
  "AB": { name: "South Korea", displayName: "South Korea - AFC", confederation: "AFC", flag: "kr", pot: 2 },
  "AC": { name: "Iran", displayName: "Iran - AFC", confederation: "AFC", flag: "ir", pot: 2 },
  "AD": { name: "Australia", displayName: "Australia - AFC", confederation: "AFC", flag: "au", pot: 2 },
  "AE": { name: "Saudi Arabia", displayName: "Saudi Arabia - AFC", confederation: "AFC", flag: "sa", pot: 3 },
  "AF": { name: "Qatar", displayName: "Qatar - AFC", confederation: "AFC", flag: "qa", pot: 3 },
  "AG": { name: "Uzbekistan", displayName: "Uzbekistan - AFC", confederation: "AFC", flag: "uz", pot: 3 },
  "AH": { name: "Jordan", displayName: "Jordan - AFC", confederation: "AFC", flag: "jo", pot: 4 },

  // ========== OFC (1 team) ==========
  "XA": { name: "New Zealand", displayName: "New Zealand - OFC", confederation: "OFC", flag: "nz", pot: 4 },

  // ========== PLAYOFF TEAMS ==========
  // Pathway 1: CAF vs CONCACAF vs OFC
  "YA": {
    name: "FIFA 1",
    displayName: "FIFA 1: COD/JAM/NCL",
    fullName: "DR Congo / Jamaica / New Caledonia",
    confederation: "PLAYOFF",
    flag: "fifa",
    pot: 4,
    playoff: true
  },

  // Pathway 2: AFC vs CONMEBOL vs CONCACAF
  "ZA": {
    name: "FIFA 2",
    displayName: "FIFA 2: IRQ/BOL/SUR",
    fullName: "Iraq / Bolivia / Suriname",
    confederation: "PLAYOFF",
    flag: "fifa",
    pot: 4,
    playoff: true
  }
};

// Group letters
const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TEAM_DATA,
    GROUP_LETTERS
  };
}
