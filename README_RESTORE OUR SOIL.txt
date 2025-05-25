# Restore our Soil

![Project Image](assets/hanh.png)

## Overview
Restore the Soil is an interactive visual experience built using p5.js. It simulates a lively forest ecosystem where bugs move, collide, and spawn vibrant organic bursts of shapes—representing the vital interactions that help restore soil health and biodiversity. Ambient and responsive audio enhances the immersive experience.

## Features
- Bug Movement: Bugs randomly roam the canvas and bounce off edges.
- Collision-Triggered Art: When bugs collide, they spawn beautiful temporary shape bursts (representing fungi or microbial growth).
- Sound Design: Natural ambiance, bug sounds, wind, and soil-beat effects react dynamically.
- Save Artwork: Click the "Save Image" button to download a screenshot of the current canvas.

## Controls
- Click anywhere: Adds a new bug (up to 25 max).
- Press "Save Image": Downloads the current state of the artwork.

## File Structure
Restore-the-Soil/
|
├── index.html
├── sketch.js
├── assets/
│   └── hanh.png               # Forest background image
├── bugs/
│   └── bug 1.png ... bug 8.png # Bug sprite images
├── sounds/
│   ├── ambience.wav
│   ├── soil-beat.wav
│   ├── bug-collide.wav
│   ├── bug-movement-chirp.wav
│   ├── fungi-grow.wav
│   ├── leaf-moving.wav
│   └── wind2.wav
└── README.txt

## Installation
1. Download or clone this repository.
2. Make sure your directory includes all the required images and sound files.
3. Open index.html in a modern browser.

## Dependencies
- p5.js
- p5.sound.js (for audio support)

## License

This project is licensed under the GNU General Public License v3.0 (GPLv3).

You are free to run, study, share, and modify this software under the terms of the GNU GPL v3.  
See the full license text here: https://www.gnu.org/licenses/gpl-3.0.html

## Acknowledgments
- Inspired by the SDG Goal 15: Life on Land
- Built using p5.js to explore the creative coding potential of ecosystems and soil regeneration.
