# Perfect Day map
- `main.js` owns the state machine, menus, SDK wiring, camera, particles, and ending flow; `gameplay.js` owns world state, physics, tasks, interactions, and rewards.
- `game-data.js` is the only content table for the exactly two characters and three worlds; `art-menu.js` contains shared shapes/menu art, `art-world.js` renders the live route, and `art.js` keeps the render API stable.
- Flow: `index.html` → `main.js` → `game-data.js` + `gameplay.js` + `art.js`; `art.js` re-exports `art-menu.js` and `art-world.js`. SDKs are imported only by `main.js`.
