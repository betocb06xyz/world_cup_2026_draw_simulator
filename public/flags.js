/**
 * Global team-to-flag mapping
 * Append-only registry - add new teams, never remove
 * Flag values correspond to files in /flags/{flag}.svg
 */

export const TEAM_FLAGS = {
    // CONCACAF
    "Mexico": "mx",
    "Canada": "ca",
    "USA": "us",
    "Panama": "pa",
    "Curacao": "cw",
    "Haiti": "ht",

    // CONMEBOL
    "Argentina": "ar",
    "Brazil": "br",
    "Uruguay": "uy",
    "Colombia": "co",
    "Ecuador": "ec",
    "Paraguay": "py",

    // UEFA
    "Spain": "es",
    "France": "fr",
    "England": "gb-eng",
    "Germany": "de",
    "Portugal": "pt",
    "Netherlands": "nl",
    "Belgium": "be",
    "Austria": "at",
    "Croatia": "hr",
    "Switzerland": "ch",
    "Norway": "no",
    "Scotland": "gb-sct",

    // CAF
    "Senegal": "sn",
    "Morocco": "ma",
    "Tunisia": "tn",
    "Ivory Coast": "ci",
    "South Africa": "za",
    "Egypt": "eg",
    "Algeria": "dz",
    "Ghana": "gh",
    "Cape Verde": "cv",

    // AFC
    "Japan": "jp",
    "South Korea": "kr",
    "Iran": "ir",
    "Australia": "au",
    "Saudi Arabia": "sa",
    "Qatar": "qa",
    "Uzbekistan": "uz",
    "Jordan": "jo",

    // OFC
    "New Zealand": "nz",
};

/**
 * Get flag code for a team, with fallback to display_overrides from config
 */
export function getFlag(teamName, displayOverrides = {}) {
    // Check config overrides first (for playoffs, etc.)
    if (displayOverrides[teamName]?.flag) {
        return displayOverrides[teamName].flag;
    }
    // Fall back to global registry
    return TEAM_FLAGS[teamName] || "placeholder";
}

/**
 * Get display name for a team, with fallback to team name
 */
export function getDisplayName(teamName, displayOverrides = {}) {
    // Check config overrides first (for playoffs, etc.)
    if (displayOverrides[teamName]?.display_name) {
        return displayOverrides[teamName].display_name;
    }
    // Fall back to team name
    return teamName;
}
