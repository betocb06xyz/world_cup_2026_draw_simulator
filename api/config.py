"""
Configuration loader for FIFA World Cup Draw Simulator.
Loads draw configuration from YAML file.
"""
import yaml


def load_config(config_path):
    """Load draw configuration from YAML file."""
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)
