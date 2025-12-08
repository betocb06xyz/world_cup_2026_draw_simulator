"""
Test that validates the solver against the actual FIFA 2026 World Cup draw.
"""
import os
import unittest
import yaml

from api.config import load_config
from api.solver import get_initial_state, get_valid_group_for_team, check_feasibility

TESTS_DIR = os.path.dirname(__file__)
CONFIG_PATH = os.path.join(TESTS_DIR, '..', 'data', 'draw_config.yaml')
DRAW_PATH = os.path.join(TESTS_DIR, 'actual_draw_dec05_2025.yaml')

GROUP_TO_NUM = {
    "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6,
    "G": 7, "H": 8, "I": 9, "J": 10, "K": 11, "L": 12
}


def load_draw_sequence():
    with open(DRAW_PATH, 'r') as f:
        data = yaml.safe_load(f)
    return [(team, group) for team, group in data['draw_sequence']]


class TestSolver(unittest.TestCase):
    """Test the solver reproduces the actual draw results"""

    @classmethod
    def setUpClass(cls):
        cls.config = load_config(CONFIG_PATH)
        cls.draw_sequence = load_draw_sequence()

    def test_actual_draw_sequence(self):
        """
        Simulate the draw in the exact order of the real event.
        Each team must be assigned to the same group as in the actual draw.
        """
        state = get_initial_state(self.config)

        for team_name, expected_group in self.draw_sequence:
            expected_group_num = GROUP_TO_NUM[expected_group]

            # Skip hosts (already assigned)
            if team_name in state:
                self.assertEqual(
                    state[team_name], expected_group_num,
                    f"Host {team_name} should be in Group {expected_group}"
                )
                continue

            # Get the group assignment from solver
            assigned_group = get_valid_group_for_team(self.config, team_name, state)

            self.assertIsNotNone(
                assigned_group,
                f"No valid group found for {team_name}"
            )
            self.assertEqual(
                assigned_group, expected_group_num,
                f"{team_name} should be in Group {expected_group}, "
                f"but solver assigned Group {chr(ord('A') + assigned_group - 1)}"
            )

            state[team_name] = assigned_group

        # Verify final state is feasible
        self.assertTrue(
            check_feasibility(self.config, state),
            "Final draw state should be feasible"
        )

        # Verify all 48 teams are assigned
        self.assertEqual(len(state), 48, "All 48 teams should be assigned")


if __name__ == "__main__":
    unittest.main()
