import random
from copy import deepcopy
from enum import Enum, auto


class Federation(Enum):
    CONCACAF = auto()
    CONMEBOL = auto()
    UEFA     = auto()
    CAF      = auto()
    AFC      = auto()
    OFC      = auto()


MAX_TEAMS_IN_GROUP = {
    Federation.CONCACAF: 1,
    Federation.CONMEBOL: 1,
    Federation.UEFA:     2,
    Federation.CAF:      1,
    Federation.AFC:      1,
    Federation.OFC:      1,
}


INITIAL_GROUPS = [
    ["MEXICO"], # A
    ["CANADA"], # B
    [],
    ["USA"],    # D

    [],
    [],
    [],
    [],

    [],
    [],
    [],
    [],
]

FEDERATIONS =     {
    "MEXICO":          [Federation.CONCACAF],
    "CANADA":          [Federation.CONCACAF],
    "USA":             [Federation.CONCACAF],
    "CURACAO":         [Federation.CONCACAF],
    "HAITI":           [Federation.CONCACAF],
    "PANAMA":          [Federation.CONCACAF],

    "ARGENTINA":       [Federation.CONMEBOL],
    "BRAZIL":          [Federation.CONMEBOL],
    "COLOMBIA":        [Federation.CONMEBOL],
    "URUGUAY":         [Federation.CONMEBOL],
    "ECUADOR":         [Federation.CONMEBOL],
    "PARAGUAY":        [Federation.CONMEBOL],

    "ENGLAND":         [Federation.UEFA],
    "FRANCE":          [Federation.UEFA],
    "PORTUGAL":        [Federation.UEFA],
    "NETHERLANDS":     [Federation.UEFA],
    "GERMANY":         [Federation.UEFA],
    "BELGIUM":         [Federation.UEFA],
    "SPAIN":           [Federation.UEFA],
    "CROATIA":         [Federation.UEFA],
    "SWITZERLAND":     [Federation.UEFA],
    "AUSTRIA":         [Federation.UEFA],
    "NORWAY":          [Federation.UEFA],
    "SCOTLAND":        [Federation.UEFA],

    "MOROCCO":         [Federation.CAF],
    "SENEGAL":         [Federation.CAF],
    "EGYPT":           [Federation.CAF],
    "ARGELIA":         [Federation.CAF],
    "TUNISIA":         [Federation.CAF],
    "IVORY COAST":     [Federation.CAF],
    "SOUTH AFRICA":    [Federation.CAF],
    "CAPE VERDE":      [Federation.CAF],
    "GHANA":           [Federation.CAF],

    "JAPAN":           [Federation.AFC],
    "IRAN":            [Federation.AFC],
    "SOUTH KOREA":     [Federation.AFC],
    "AUSTRALIA":       [Federation.AFC],
    "USBEKISTAN":      [Federation.AFC],
    "QATAR":           [Federation.AFC],
    "SAUDI ARABIA":    [Federation.AFC],
    "JORDAN":          [Federation.AFC],

    "NEW_ZELAND":      [Federation.OFC],

    "ITA/NIR/WAL/BHA": [Federation.UEFA],
    "UKR/SWE/POL/ALB": [Federation.UEFA],
    "TUR/ROU/SVK/KOS": [Federation.UEFA],
    "DEN/MKD/CZE/IRL": [Federation.UEFA],

    "RDC/JAM/CAL":     [Federation.CAF, Federation.CONCACAF, Federation.OFC],
    "IRQ/BOL/SUR":     [Federation.AFC, Federation.CONMEBOL, Federation.CONCACAF],
}

def num_to_letter(n):
    return chr(ord("A") + n)


INITIAL_POTS = [
    {   # POT 1
        "ARGENTINA",
        "BRAZIL",
        "ENGLAND",
        "FRANCE",
        "PORTUGAL",
        "NETHERLANDS",
        "GERMANY",
        "BELGIUM",
        "SPAIN",
    },
    {   # POT 2
        "CROATIA",
        "MOROCCO",
        "COLOMBIA",
        "URUGUAY",
        "SENEGAL",
        "SWITZERLAND",
        "JAPAN",
        "IRAN",
        "SOUTH KOREA",
        "ECUADOR",
        "AUSTRIA",
        "AUSTRALIA",
    },
    {   # POT 3
        "NORWAY",
        "PANAMA",
        "EGYPT",
        "ARGELIA",
        "SCOTLAND",
        "PARAGUAY",
        "TUNISIA",
        "IVORY COAST",
        "USBEKISTAN",
        "QATAR",
        "SAUDI ARABIA",
        "SOUTH AFRICA",
    },
    {   # POT 4
        "JORDAN",
        "CAPE VERDE",
        "GHANA",
        "CURACAO",
        "HAITI",
        "NEW_ZELAND",
        "NEW_ZELAND",

        "ITA/NIR/WAL/BHA",
        "UKR/SWE/POL/ALB",
        "TUR/ROU/SVK/KOS",
        "DEN/MKD/CZE/IRL",

        "RDC/JAM/CAL",
        "IRQ/BOL/SUR",
    }
        
]


class WCDraw:
    def __init__(self, groups, pots):
        self.groups = deepcopy(groups)
        self.pots = deepcopy(pots)

    def __str__(self):
        output_str = ""
        for ix, group in enumerate(self.groups):
            output_str += f"\nGroup: {num_to_letter(ix)}\n"
            for i, team in enumerate(group):
                output_str += f"{team} - {FEDERATIONS[team]}"
                if i < 3:
                    output_str += ", "
        return output_str

    def get_current_pot_number(self):
        for pot_number, pot in enumerate(self.pots):
            if pot:
                return pot_number
        return

    def done(self):
        if self.get_current_pot_number() is None:
            return True
        return False

    def remove_team(self, team, pot_number):
        pot = self.pots[pot_number]
        pot.remove(team)

    def get_names_from_pot(self, pot_number):
        pot = self.pots[pot_number]
        return tuple(pot.copy())

    def draw_team_from_pot_randomly(self, pot_number):
        teams = self.get_names_from_pot(pot_number)
        team  = random.choice(teams)
        self.remove_team(team, pot_number)
        return team

    def get_copy(self):
        return WCDraw(self.groups, self.pots)

    def get_federation_count(self, group, federation):
        federation_count = 0
        for team in group:
            if federation == FEDERATIONS[team][0]:
                federation_count += 1

        return federation_count

    def get_valid_group_ix(self, pot_number, team):
        # print(f"current_pot_number: {pot_number}") # DEBUG

        for group_ix, group in enumerate(self.groups):
            # Check if group already have a team from pot_number
            if len(group) > pot_number:
                continue

            # Check number of teams from the same federation in group
            for federation in FEDERATIONS[team]: # Playoff spots count as 'multi-federation' teams
                federation_count = self.get_federation_count(group, federation)
                if federation_count >= MAX_TEAMS_IN_GROUP[federation]:
                    continue

                if self.is_valid(team, group_ix):
                    return group_ix

        # print(f"FAILED TO PLACE: {team} - {FEDERATIONS[team]} from Pot: {pot_number+1}") # DEBUG
        return

    def draw_team_randomly(self) -> bool:
        pot_number = self.get_current_pot_number()
        team       = self.draw_team_from_pot_randomly(pot_number)
        group_ix   = self.get_valid_group_ix(pot_number, team)        
        return pot_number, team, group_ix

    def place_team_in_group(self, team, group_ix):
        self.groups[group_ix].append(team)

    def is_valid(self, test_team, test_group_ix):
        wc_draw_copy = self.get_copy()
        wc_draw_copy.place_team_in_group(test_team, test_group_ix)
        # print(wc_draw_copy) # DEBUG

        if wc_draw_copy.done():
            return True
        
        _, _, valid_group_ix = wc_draw_copy.draw_team_randomly()
        if not valid_group_ix is None:
            return True

        return False


for seed in range(100000):
    print(f"\n\n*** Starting new simulation with seed: {seed}")
    random.seed(seed)
    wc_draw = WCDraw(INITIAL_GROUPS, INITIAL_POTS)

    while not wc_draw.done():
        pot_number = wc_draw.get_current_pot_number()
        teams = wc_draw.get_names_from_pot(pot_number)
        team = random.choice(teams)
        print(f"*** Current Pot: {pot_number+1}, Next random team: {team}...")

        wc_draw.remove_team(team, pot_number)
        group_ix = wc_draw.get_valid_group_ix(pot_number, team)   
        if group_ix is None:
            print(wc_draw)
            print(f"ERROR found with seed: {seed}:")
            print(f"Could not place Team: {team} from Pot: {pot_number} in any group!")
            exit(-1)

        wc_draw.place_team_in_group(team, group_ix)
        print(f"*** {team} placed in Group: {num_to_letter(group_ix)}")

    print(wc_draw)
    del wc_draw