# FIFA 2026 World Cup Draw Simulator

An interactive web application that simulates the FIFA 2026 World Cup group stage draw using constraint programming.

## Features

- **Interactive Drawing**: Click teams to manually assign them to groups, or draw teams randomly
- **Constraint Validation**: Uses OR-Tools CP-SAT solver to ensure all FIFA draw rules are respected
- **Modern UI**: Clean, minimalist design with 3x4 group grid layout
- **Real-time Feedback**: Visual indicators show which groups can accept which teams
- **Complete Simulation**: Run the entire draw automatically or control each selection
- **Accurate Rules**: Implements all confederation constraints, pot rules, and playoff restrictions

## Draw Rules Implemented

### Pot Constraints
- 4 pots of 12 teams each
- Each pot fills all 12 groups exactly once

### Confederation Constraints
- **CONCACAF** (6 teams): Max 1 per group
- **CONMEBOL** (6 teams): Max 1 per group
- **CAF** (9 teams): Max 1 per group
- **AFC** (8 teams): Max 1 per group
- **UEFA** (16 teams): 1-2 per group (since 16 teams across 12 groups)
- **OFC** (1 team): No special constraint

### Special Rules
- **Hosts Pre-assigned**: Mexico (Group A), Canada (Group B), USA (Group D)
- **Playoff Team Y**: Cannot be with CONCACAF, CAF, or OFC teams
- **Playoff Team Z**: Cannot be with CONMEBOL, CONCACAF, or AFC teams

## Technology Stack

- **Frontend**: Pure HTML, CSS, JavaScript
- **Backend**: Python with OR-Tools CP-SAT solver

## Project Structure

```
├── api/
│   └── solver.py               # Python constraint solver (Vercel serverless)
├── public/                     # Frontend files
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── team_mapping.js
│   └── flags/                  # SVG flag files
├── journey/                    # Development journey scripts
│   ├── chapter_1_xd.py
│   ├── chapter_2.py
│   └── chapter_3.py
├── fifa_wc_2026_draw_simulator.py  # Standalone Python simulator
├── local_server.py             # Local development server
├── requirements.txt            # Python dependencies
├── vercel.json                 # Vercel configuration
└── README.md
```

## Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/betocb06xyz/world_cup_2026_draw_simulator.git
   cd world_cup_2026_draw_simulator
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the local server**:
   ```bash
   python3 local_server.py
   ```

4. **Open in browser**:
   ```
   http://localhost:3000
   ```

## Usage

### Starting the Draw

1. **Initial State**: The page loads with all pots visible and hosts pre-assigned
2. **Current Pot**: Shows which pot is currently being drawn (starts with Pot 1)

### Drawing Modes

#### 1. Manual Team Selection
- Click any team in the current pot
- Valid groups will be highlighted in green
- Invalid groups will be grayed out
- Click a valid group to assign the team

#### 2. Draw One Random Team
- Click **"Draw One Team"** button
- Randomly selects a team from the current pot
- Assigns to the lowest valid group number
- Automatically moves to next pot when current is complete

#### 3. Run Full Draw
- Click **"Run Full Draw"** button
- Completes the entire draw automatically
- Assigns each team to the lowest valid group number
- Can be run at any time, even after manually selecting some teams

### Resetting

- Click **"Start Over"** to reset the entire draw
- Hosts will be re-assigned to their designated groups

## Credits

- **Constraint Solver**: [OR-Tools by Google](https://developers.google.com/optimization)
- **Flags**: [FlagCDN](https://flagcdn.com/)
- **FIFA Draw Rules**: Based on official FIFA 2026 World Cup regulations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - Feel free to use, modify, and distribute.
