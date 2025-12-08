"""
End-to-end test that validates the draw through the API layer,
exactly as the UI would call it.
"""
import os
import unittest
import yaml

from api.index import get_initial_state_response, get_valid_group_response

TESTS_DIR = os.path.dirname(__file__)
DRAW_PATH = os.path.join(TESTS_DIR, 'actual_draw_dec05_2025.yaml')

GROUP_TO_NUM = {
    "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6,
    "G": 7, "H": 8, "I": 9, "J": 10, "K": 11, "L": 12
}


def load_draw_sequence():
    with open(DRAW_PATH, 'r') as f:
        data = yaml.safe_load(f)
    return [(team, group) for team, group in data['draw_sequence']]


class TestAPI(unittest.TestCase):
    """Test the actual draw sequence through the API layer"""

    @classmethod
    def setUpClass(cls):
        cls.draw_sequence = load_draw_sequence()

    def test_actual_draw_via_api(self):
        """
        Simulate the draw calling API functions exactly as the UI would.
        """
        # Step 1: Get initial state (like UI does on load)
        initial_response = get_initial_state_response()

        self.assertIn('assignments', initial_response)
        self.assertIn('pots', initial_response)
        self.assertIn('hosts', initial_response)
        self.assertIn('display_overrides', initial_response)

        assignments = initial_response['assignments']

        # Verify hosts are pre-assigned
        self.assertEqual(assignments['Mexico'], 1)
        self.assertEqual(assignments['Canada'], 2)
        self.assertEqual(assignments['USA'], 4)

        # Step 2: Draw each team in sequence, calling API for valid group
        for team_name, expected_group in self.draw_sequence:
            expected_group_num = GROUP_TO_NUM[expected_group]

            # Skip hosts (already assigned)
            if team_name in assignments:
                self.assertEqual(
                    assignments[team_name], expected_group_num,
                    f"Host {team_name} should be in Group {expected_group}"
                )
                continue

            # Call API to get valid group (like UI does on team click)
            response = get_valid_group_response({
                'team': team_name,
                'assignments': assignments
            })

            valid_group = response['valid_group']

            self.assertIsNotNone(
                valid_group,
                f"API returned no valid group for {team_name}"
            )
            self.assertEqual(
                valid_group, expected_group_num,
                f"{team_name} should go to Group {expected_group}, "
                f"but API returned Group {chr(ord('A') + valid_group - 1)}"
            )

            # Assign team (like UI does on confirmation)
            assignments[team_name] = valid_group

        # Verify all 48 teams assigned
        self.assertEqual(len(assignments), 48)

    def test_api_returns_correct_structure(self):
        """Verify API response structure matches what UI expects"""
        response = get_initial_state_response()

        # Check structure
        self.assertIsInstance(response['assignments'], dict)
        self.assertIsInstance(response['pots'], dict)
        self.assertIsInstance(response['hosts'], dict)
        self.assertIsInstance(response['display_overrides'], dict)
        self.assertIsInstance(response['team_confederations'], dict)

        # Check pots have correct count
        self.assertEqual(len(response['pots']), 4)
        self.assertEqual(len(response['pots'][1]), 12)
        self.assertEqual(len(response['pots'][2]), 12)
        self.assertEqual(len(response['pots'][3]), 12)
        self.assertEqual(len(response['pots'][4]), 12)

        # Check display_overrides for playoff teams
        self.assertIn('FIFA 1', response['display_overrides'])
        self.assertIn('UEFA 1', response['display_overrides'])
        self.assertEqual(response['display_overrides']['FIFA 1']['flag'], 'fifa')
        self.assertEqual(response['display_overrides']['UEFA 1']['flag'], 'uefa')

        # Check team_confederations
        self.assertEqual(response['team_confederations']['Brazil'], 'CONMEBOL')
        self.assertEqual(response['team_confederations']['Spain'], 'UEFA')
        self.assertEqual(response['team_confederations']['Japan'], 'AFC')
        self.assertEqual(response['team_confederations']['Mexico'], 'CONCACAF')


if __name__ == "__main__":
    unittest.main()
