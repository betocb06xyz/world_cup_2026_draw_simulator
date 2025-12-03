# FIFA World Cup 2026 Draw Simulator

An interactive web application that simulates the FIFA World Cup 2026 group stage draw using constraint programming, implementing the official FIFA draw procedures.

## Features

- **Two-Click Selection**: Click a team to see its valid group highlighted, click again to confirm
- **Constraint Validation**: Uses OR-Tools CP-SAT solver to ensure all FIFA draw rules are respected
- **Optimized Solver**: Returns the first valid group immediately (lowest-numbered), matching official procedure
- **Race-Condition Free**: Action queue system ensures reliable operation even with fast clicks
- **Modern UI**: Clean 2x2 pot grid layout with 3x4 group display
- **Complete Simulation**: Run the entire draw automatically or control each selection

## Official Draw Rules Implemented

Based on the [Official FIFA Draw Procedures](https://digitalhub.fifa.com/m/2d1a1ac7bab78995/original/Draw-Procedures-for-the-FIFA-World-Cup-2026.pdf).

### Slot Allocation (48 Teams)

| Confederation | Teams | Notes |
|---------------|-------|-------|
| AFC | 8 | Australia, Iran, Japan, Jordan, South Korea, Qatar, Saudi Arabia, Uzbekistan |
| CAF | 9 | Algeria, Cabo Verde, Ivory Coast, Egypt, Ghana, Morocco, Senegal, South Africa, Tunisia |
| CONCACAF | 6 | Canada*, Mexico*, USA* (*hosts) + Curaçao, Haiti, Panama |
| CONMEBOL | 6 | Argentina, Brazil, Colombia, Ecuador, Paraguay, Uruguay |
| OFC | 1 | New Zealand |
| UEFA | 16 | 12 qualified + 4 playoff winners |
| FIFA Playoffs | 2 | Winners of intercontinental playoff tournament |

### Pot Allocation

Teams are allocated to pots based on the FIFA World Ranking (November 2025):

- **Pot 1**: 3 hosts (Canada, Mexico, USA) + 9 highest-ranked teams
- **Pot 2**: Next 12 highest-ranked teams
- **Pot 3**: Next 12 highest-ranked teams
- **Pot 4**: 6 lowest-ranked teams + 4 UEFA playoff placeholders + 2 FIFA playoff placeholders

### Draw Constraints

#### Confederation Separation
- **CONCACAF, CONMEBOL, CAF, AFC**: Maximum 1 team per group
- **UEFA**: 1-2 teams per group (16 teams across 12 groups means 4 groups have 2 UEFA teams)
- **OFC**: No special constraint (only 1 team)

#### Host Pre-Assignment
- Mexico → Group A (Position A1)
- Canada → Group B (Position B1)
- USA → Group D (Position D1)

#### Top-Ranked Team Separation
To ensure competitive balance in the knockout stage:
- The top 4 ranked teams are separated into different tournament pathways
- Argentina (1st) and Spain (2nd) must be in opposite halves
- France (3rd) and England (4th) must be in opposite halves
- This ensures top teams cannot meet before the semi-finals

#### Group Position Pattern
Teams are placed in specific positions based on their pot (see Appendix B in official document):

| Position | A | B | C | D | E | F | G | H | I | J | K | L |
|----------|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | MEX | CAN | P1 | USA | P1 | P1 | P1 | P1 | P1 | P1 | P1 | P1 |
| 2 | P3 | P4 | P2 | P3 | P4 | P2 | P3 | P4 | P2 | P3 | P4 | P2 |
| 3 | P2 | P3 | P4 | P2 | P3 | P4 | P2 | P3 | P4 | P2 | P3 | P4 |
| 4 | P4 | P2 | P3 | P4 | P2 | P3 | P4 | P2 | P3 | P4 | P2 | P3 |

#### Playoff Team Constraints

**FIFA Playoff Winners:**
- Playoff 1 (COD/JAM/NCL): Cannot be grouped with CONCACAF, CAF, or OFC teams
- Playoff 2 (IRQ/BOL/SUR): Cannot be grouped with CONMEBOL, CONCACAF, or AFC teams

**UEFA Playoff Winners:**
- Treated as UEFA teams for confederation constraints

### Playoff Pathways

#### FIFA World Cup 2026 Play-Off Tournament
- **Pathway 1**: New Caledonia vs Jamaica → Winner vs DR Congo
- **Pathway 2**: Bolivia vs Suriname → Winner vs Iraq

#### UEFA Play-Offs
- **Path A**: Italy/N.Ireland/Wales/Bosnia-Herzegovina
- **Path B**: Ukraine/Sweden/Poland/Albania
- **Path C**: Turkey/Romania/Slovakia/Kosovo
- **Path D**: Denmark/N.Macedonia/Czechia/Ireland

## Technology Stack

- **Frontend**: Pure HTML, CSS, JavaScript
- **Backend**: Python with OR-Tools CP-SAT solver
- **Deployment**: Vercel serverless functions

## Project Structure

```
├── api/
│   ├── index.py                # API endpoint (Vercel serverless)
│   └── solver.py               # Constraint solver (OR-Tools)
├── public/
│   ├── index.html
│   ├── style.css
│   ├── app.js                  # Main application
│   ├── team_mapping.js         # Team display data
│   └── flags/                  # SVG flag files
├── docs/                       # Official FIFA documentation
├── journey/                    # Development history
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

### Two-Click Selection Process

1. **First Click**: Select a team from the current pot
   - The solver calculates the valid group
   - The valid group and specific slot are highlighted with a glowing effect
   - Other groups are dimmed

2. **Second Click**: Confirm the assignment
   - Click the team again, OR
   - Click the highlighted group
   - The team is assigned and the next team can be selected

3. **Cancel**: Click anywhere outside to cancel the selection

### Automated Drawing

- **Draw One Team**: Randomly selects a team and assigns to the lowest valid group
- **Run Full Draw**: Completes the entire draw automatically
- **Start Over**: Resets the draw (hosts are re-assigned)

## References

- **Official FIFA Draw Procedures**: [Draw Procedures for the FIFA World Cup 2026](https://digitalhub.fifa.com/m/2d1a1ac7bab78995/original/Draw-Procedures-for-the-FIFA-World-Cup-2026.pdf)
- **Constraint Solver**: [OR-Tools by Google](https://developers.google.com/optimization)
- **Flags**: [FlagCDN](https://flagcdn.com/)

## Credits

Built by [betocb06xyz](https://github.com/betocb06xyz) & Claude

## License

MIT License - Feel free to use, modify, and distribute.
