# Future Improvements

## Dynamic HTML Generation

Currently, `index.html` has hardcoded:
- 12 group divs (`group-1` to `group-12`)
- 4 pot divs (`pot-1` to `pot-4`)

To support different tournament formats (e.g., 32-team World Cup with 8 groups), these should be generated dynamically from config:

1. Move group/pot grid HTML generation to JavaScript
2. Generate divs based on `numGroups` and `numPots` from config
3. Make `index.html` just have placeholder containers

This would allow changing tournament format by only modifying `draw_config.yaml` - zero code/HTML changes needed.
