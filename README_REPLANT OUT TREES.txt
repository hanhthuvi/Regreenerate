# Replant Our Trees


## Overview
**Replant Our Trees** is an interactive visual experience built with p5.js. This project symbolizes ecological regeneration by allowing users to interact with seed icons that sprout vibrant overlays and visuals. With every click, new life is revealed beneath a fading canopy—illustrating the power of replanting to restore land and biodiversity. Ambient sounds and organic audio cues deepen the immersive connection with the digital forest.


## Features
- **Seed Interaction**: Clickable seed icons placed randomly across the canvas.
- **Overlay Erasure**: Clicking on seeds "erases" part of the overlaid image, revealing the forest beneath.
- **Popup Animations**: Fun animated boxes burst out with organic imagery when seeds are activated.
- **Sound Design**: Ambient forest audio and dynamic pop sounds respond to user interaction.
- **Regrowth Option**: Pressing `W` adds more seeds to the canvas.


## Controls
- **Click on a seed**: Reveals forest elements and triggers animations/sound.
- **Press `W` key**: Plants 3 more seeds on the canvas (up to a safe limit).


## File Structure
```
Replant-Our-Trees/
|
├── index.html
├── sketch.js
├── Lyassets/
│   ├── greenbg.png             # Background forest image
│   ├── trucly_newbg.png        # Overlay image
│   ├── seedicon.png            # Seed icon image
│   ├── popup1.png ... popup9.png  # Popup visuals
│   ├── pop1.wav ... pop3.wav   # Sound effects triggered by seed clicks
│   └── ambience cangio.wav     # Ambient forest background sound
└── README.md
```


## Installation
1. Download or clone this repository.
2. Make sure your directory includes all the files in the `Lyassets/` folder.
3. Open `index.html` in a modern browser (Chrome recommended).


## Dependencies
- [p5.js](https://p5js.org/)
- [p5.sound.js](https://p5js.org/reference/#/libraries/p5.sound)


## License


This project is licensed under the **GNU General Public License v3.0 (GPLv3)**.


You are free to **run, study, share, and modify** this software under the terms of the GPLv3.  
See the full license text here: https://www.gnu.org/licenses/gpl-3.0.html


## Acknowledgments
- Inspired by **SDG Goal 15: Life on Land** – a call to protect, restore, and promote sustainable use of terrestrial ecosystems.
- Created using [p5.js](https://p5js.org/) to explore environmental storytelling through interactive code.
- Sound and imagery designed to represent the healing process of reforestation and ecological revival.