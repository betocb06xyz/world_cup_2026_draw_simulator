"""
Configuration loader for FIFA World Cup Draw Simulator.
Loads draw configuration from YAML file.
"""
import yaml


def derive_team_categories(confederations, display_overrides):
    """
    Derive team -> category mapping.
    - Teams with display_overrides.category use that value
    - Regular teams get their confederation as category
    """
    team_categories = {}

    # First, get categories from display_overrides
    for team, overrides in display_overrides.items():
        if 'category' in overrides:
            team_categories[team] = overrides['category']

    # Then, fill in regular teams with their confederation
    for confed, teams in confederations.items():
        for team in teams:
            if team not in team_categories:
                team_categories[team] = confed

    return team_categories


def load_config(config_path):
    """Load draw configuration from YAML file and derive additional mappings."""
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)

    # Derive team_categories from display_overrides (for exceptions) and confederations (for regular teams)
    config['team_categories'] = derive_team_categories(
        config.get('confederations', {}),
        config.get('display_overrides', {})
    )

    return config
