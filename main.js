import { game, tunable } from '/star-sdk/v1/dom.js';
import createAudio from '/star-sdk/audio.js';
import { createLeaderboard } from '/star-sdk/v1/leaderboard.js';
import { CHARACTERS, WORLD_DATA, WORLD_ORDER, clamp } from './game-data.js';
import { createWorld, stepWorld, advanceWorldVisuals } from './gameplay.js';
import { drawTitleBackdrop, drawCharacterSelectScene, drawWorldSelectScene, drawGame, drawEndingGlow } from './art.js';

const leaderboard = createLeaderboard();
const audio = createAudio();
audio.preload({
  click: { synth: 'click', volume: 0.28 },
  select: { synth: 'select', volume: 0.34 },
  jump: { synth: 'jump', volume: 0.35 },
  pickup: { synth: 'pickup', volume: 0.42 },
  coin: { synth: 'coin', volume: 0.4 },
  bonus: { synth: 'bonus', volume: 0.48 },
  success: { synth: 'success', volume: 0.54 },
  hurt: { synth: 'hurt', volume: 0.4 },
  swoosh: { synth: 'swoosh', volume: 0.34 }
});

game((g) => {
  const { ctx, ui, on, canvas } = g;
  const input = g.input({
    preset: 'platformer',
    actions: {
      interact: { type: 'button', keys: ['KeyE', 'Enter'], gamepad: ['x'], touch: 'button' }
    }
  });
  const physics = tunable('physics', {
    runSpeed: 118,
    maxSpeed: 315,
    acceleration: 680,
    gravity: 1700,
    jumpForce: 610
  }, {
    runSpeed: { min: 60, max: 210, step: 2, label: 'Auto-run speed' },
    maxSpeed: { min: 170, max: 480, step: 5, label: 'Sprint speed' },
    acceleration: { min: 250, max: 1200, step: 25, label: 'Steering snap' },
    gravity: { min: 800, max: 3000, step: 50, label: 'Gravity' },
    jumpForce: { min: 380, max: 880, step: 10, label: 'Jump power' }
  }, { label: 'Runner feel' });
  const difficulty = tunable('difficulty', {
    hazardEnergy: 8,
    eventFrequency: 1
  }, {
    hazardEnergy: { min: 2, max: 18, step: 1, label: 'Energy lost on hazards' },
    eventFrequency: { min: .5, max: 1.8, step: .1, label: 'Good-news frequency' }
  }, { label: 'Adventure balance' });
  const look = tunable('look', {
    uiGlow: .85,
    sparkleSize: 1
  }, {
    uiGlow: { min: .25, max: 1, step: .05, label: 'HUD glow' },
    sparkleSize: { min: .6, max: 1.6, step: .05, label: 'Sparkle size' }
  }, { label: 'Dreamy finish' });

  let state = 'title';
  let selectedCharacter = null;
  let selectedWorld = null;
  let world = null;
  let cameraX = 0;
  let globalTime = 0;
  let particles = [];
  let toast = null;
  let screenShake = 0;
  let muted = false;
  let endingInfo = null;

  function play(sound) {
    if (!muted) audio.play(sound);
  }

  function setEnabled() {
    input.setEnabled(state === 'playing');
  }

  function titleScreen() {
    ui.render(`
      <section class="screen title-screen" aria-label="Perfect Day title screen">
        <div class="title-lockup">
          <p class="eyebrow">A tiny adventure about the moments that matter</p>
          <h1 class="game-title"><span class="spark">✦</span> PERFECT DAY <span class="spark">✦</span></h1>
          <p class="title-subtitle">One day. One adventure. Make it perfect.</p>
          <button id="start-adventure" class="primary-button" type="button">Start Adventure <span aria-hidden="true">→</span></button>
          <p class="control-hint">Move with A / D or ← / → &nbsp; • &nbsp; Jump with Space</p>
        </div>
        <div class="corner-badge">An original adventure runner</div>
      </section>
    `);
  }

  function characterScreen() {
    const luna = CHARACTERS.luna;
    const zara = CHARACTERS.zara;
    ui.render(`
      <section class="screen selection-screen" aria-label="Choose your character">
        <p class="eyebrow">The first step of a day worth remembering</p>
        <h2 class="screen-heading">Choose Your Character</h2>
        <p class="screen-kicker">Two hearts. Two ways to make the world brighter.</p>
        <div class="choice-grid">
          <button id="character-luna" class="choice-card ${selectedCharacter === 'luna' ? 'selected' : ''}" type="button" aria-pressed="${selectedCharacter === 'luna'}">
            <span class="card-icon">${luna.icon}</span>
            <h3>${luna.name}</h3>
            <p>${luna.personality}</p>
            <p class="card-ability">✦ ${luna.ability}</p>
          </button>
          <button id="character-zara" class="choice-card ${selectedCharacter === 'zara' ? 'selected' : ''}" type="button" aria-pressed="${selectedCharacter === 'zara'}">
            <span class="card-icon">${zara.icon}</span>
            <h3>${zara.name}</h3>
            <p>${zara.personality}</p>
            <p class="card-ability">✦ ${zara.ability}</p>
          </button>
        </div>
        <div class="selection-actions">
          <button id="back-to-title" class="text-button" type="button">← Back</button>
          <button id="continue-character" class="primary-button" type="button" ${selectedCharacter ? '' : 'disabled'}>Continue →</button>
        </div>
        <p class="selection-note">Choose a character to reveal her special strength.</p>
      </section>
    `);
  }

  function worldScreen() {
    const cards = WORLD_ORDER.map((id) => {
      const place = WORLD_DATA[id];
      return `
        <button id="world-${id}" class="world-card ${selectedWorld === id ? 'selected' : ''}" type="button" aria-pressed="${selectedWorld === id}">
          <span class="card-icon">${place.icon}</span>
          <h3>${place.name}</h3>
          <p>${place.description}</p>
          <p class="world-focus">${place.focus}</p>
        </button>
      `;
    }).join('');
    ui.render(`
      <section class="screen selection-screen" aria-label="Choose your world">
        <p class="eyebrow">The day is waiting to unfold</p>
        <h2 class="screen-heading">Choose Your World</h2>
        <p class="screen-kicker">Pick one magical route. Every route holds a different memory.</p>
        <div class="world-grid">${cards}</div>
        <div class="selection-actions">
          <button id="back-to-character" class="text-button" type="button">← Back</button>
          <button id="enter-world" class="primary-button" type="button" ${selectedWorld ? '' : 'disabled'}>Enter My World →</button>
        </div>
        <p class="selection-note">Reach the palace before the last star comes out.</p>
      </section>
    `);
  }

  function endingScreen() {
    if (!world || !endingInfo) return;
    const perfect = endingInfo.perfect;
    const character = CHARACTERS[world.characterId];
    const place = world.def;
    ui.render(`
      <section class="screen ending-screen" aria-label="Adventure ending">
        <div class="ending-card">
          <p class="ending-kicker">${perfect ? '✦ The day you created ✦' : '☼ The day still mattered ☼'}</p>
          <h2>${perfect ? 'You Did It!' : 'Almost Perfect'}</h2>
          <p class="ending-message">${perfect ? 'Your Perfect Day is complete!' : 'Not every day goes exactly as planned. But every adventure can create a beautiful memory.'}</p>
          <div class="ending-stats">
            <div class="ending-stat"><strong>${character.name}</strong><span>Character</span></div>
            <div class="ending-stat"><strong>${place.name.replace(' Palace', '')}</strong><span>World</span></div>
            <div class="ending-stat"><strong>${Math.round(world.score)}</strong><span>Day score</span></div>
          </div>
          <div class="ending-stats">
            <div class="ending-stat"><strong>♥ ${world.happiness}</strong><span>Happiness</span></div>
            <div class="ending-stat"><strong>⚡ ${world.energy}</strong><span>Energy</span></div>
            <div class="ending-stat"><strong>✦ ${world.memories}</strong><span>Memories</span></div>
          </div>
          <div class="ending-meter">✨ PERFECT DAY: ${Math.round(world.progress)}%</div>
          <div class="ending-actions">
            <button id="play-again" class="primary-button" type="button">${perfect ? 'Play Again' : 'Try Again'}</button>
            <button id="choose-world-again" class="secondary-button" type="button">${perfect ? 'Choose Another World' : 'Play Another World'}</button>
            <button id="view-leaderboard" class="text-button" type="button">View Leaderboard</button>
          </div>
          <p class="ending-quote">“You didn't just complete a day. You created a memory.”</p>
        </div>
      </section>
    `);
  }

  function chooseCharacter(id) {
    selectedCharacter = id;
    play('select');
    characterScreen();
  }

  function chooseWorld(id) {
    selectedWorld = id;
    play('select');
    worldScreen();
  }

  function startWorld(id = selectedWorld) {
    if (!id || !selectedCharacter) return;
    selectedWorld = id;
    world = createWorld(WORLD_DATA[id], selectedCharacter);
    cameraX = 0;
    particles = [];
    toast = null;
    endingInfo = null;
    screenShake = 0;
    state = 'playing';
    setEnabled();
    ui.render('');
    showToast('MAKE YOUR PERFECT DAY', 'A / D move  •  Space jump  •  E interact', '#fff0a5');
    play('success');
  }

  function within(point, rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
  }

  function showToast(message, sub = '', color = '#fff0a5', kind = 'normal') {
    toast = { text: message, sub, color, kind, timer: kind === 'task' ? 3.1 : 2.45 };
  }

  function burst(x, y, color, count = 12, shape = 'star') {
    const sizeScale = look.sparkleSize;
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 35 + Math.random() * 115;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 35,
        life: .45 + Math.random() * .55,
        maxLife: 1,
        size: (2 + Math.random() * 4) * sizeScale,
        color,
        shape
      });
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 175 * dt;
      particle.vx *= Math.pow(.06, dt);
      if (particle.life <= 0) particles.splice(i, 1);
    }
  }

  function beginEnding(perfect) {
    if (!world || state === 'ending') return;
    endingInfo = { perfect: Boolean(perfect) };
    state = 'ending';
    world.player.action = 'celebrating';
    world.player.actionTimer = 3;
    setEnabled();
    leaderboard.submit(Math.round(world.score), {
      stats: {
        happiness: world.happiness,
        energy: world.energy,
        memories: world.memories,
        perfectDay: Math.round(world.progress)
      }
    });
    endingScreen();
  }

  function processEvents(events) {
    for (const event of events) {
      if (event.type === 'jump') {
        burst(event.x, event.y, '#f4e0b4', 7, 'dot');
        play('jump');
      } else if (event.type === 'pickup') {
        burst(event.x, event.y, world.def.accent, 10);
        play('pickup');
        showToast(event.label, '', '#fff0a5');
      } else if (event.type === 'bonus') {
        burst(event.x, event.y, '#fff0a0', 18);
        play('bonus');
        showToast('BONUS MEMORY!', `+${event.progressGain}% Perfect Day`, '#fff0a0');
      } else if (event.type === 'random') {
        burst(event.x, event.y, '#ffdb8c', 24);
        play('bonus');
        showToast(event.message, `+${event.progressGain}% Perfect Day`, '#ffe69d');
      } else if (event.type === 'task') {
        burst(event.x, event.y - 18, '#fff0a0', 28);
        play('success');
        const bonusText = event.bonus ? `  ✦ ability bonus +${event.bonus}%` : '';
        showToast('✨ TASK COMPLETE!', `+${event.progressGain}% Perfect Day${bonusText}`, '#fff0a0', 'task');
      } else if (event.type === 'hit') {
        burst(event.x, event.y, '#ff9bab', 14, 'dot');
        screenShake = Math.min(screenShake + 6, 11);
        play('hurt');
        showToast('A little bump — keep going!', `Energy ${world.energy}`, '#ffb2c6');
      } else if (event.type === 'fall') {
        burst(event.x, event.y, '#88d9e2', 17, 'dot');
        screenShake = Math.min(screenShake + 4, 9);
        play('hurt');
        showToast('The path was wobbly. You found your footing!', `Energy ${world.energy}`, '#aeeef0');
      } else if (event.type === 'npc' || event.type === 'special' || event.type === 'sandcastle') {
        burst(event.x, event.y, '#c4f3bd', 18);
        play('success');
      } else if (event.type === 'mini-start') {
        play('select');
        showToast('BUILD THE SANDCASTLE', 'Press E three times to shape the royal towers.', '#ffe2a0');
      } else if (event.type === 'mini-progress') {
        burst(event.x, event.y, '#ffe2a0', 7, 'dot');
        play('coin');
      } else if (event.type === 'gate') {
        showToast(event.ready ? 'The final path is ready.' : 'The palace door remembers what you missed.', event.ready ? 'Press E to begin the final challenge.' : 'Press E to enter with the memories you have.', event.ready ? '#fff0a0' : '#e9dcf4');
      } else if (event.type === 'final-start') {
        burst(event.x, event.y, '#fff0a0', 34);
        play('swoosh');
        showToast('✨ FINAL CHALLENGE!', 'Run through the palace lights to finish your day.', '#fff0a0', 'task');
      } else if (event.type === 'almost-finish') {
        burst(event.x, event.y, '#c4e5ff', 32);
        play('success');
        beginEnding(false);
      } else if (event.type === 'finish') {
        burst(event.x, event.y, '#fff0a0', 46);
        burst(event.x, event.y - 80, '#ff9dcb', 32);
        play('success');
        beginEnding(event.perfect);
      }
    }
  }

  function renderFrame(dt) {
    if (state === 'title') {
      drawTitleBackdrop(ctx, g.width, g.height, globalTime);
    } else if (state === 'character') {
      drawCharacterSelectScene(ctx, g.width, g.height, globalTime, selectedCharacter);
    } else if (state === 'world') {
      drawWorldSelectScene(ctx, g.width, g.height, globalTime, selectedWorld);
    } else if (world) {
      const shakeX = screenShake > 0 ? (Math.random() - .5) * screenShake : 0;
      const shakeY = screenShake > 0 ? (Math.random() - .5) * screenShake : 0;
      drawGame(ctx, g.width, g.height, world, cameraX, particles, toast, muted, shakeX, shakeY, look);
      if (state === 'ending') drawEndingGlow(ctx, g.width, g.height, globalTime, endingInfo?.perfect);
    }
  }

  on('click', '#start-adventure', () => {
    play('click');
    state = 'character';
    selectedCharacter = null;
    setEnabled();
    characterScreen();
  });
  on('click', '#back-to-title', () => {
    play('click');
    state = 'title';
    selectedCharacter = null;
    selectedWorld = null;
    setEnabled();
    titleScreen();
  });
  on('click', '#character-luna', () => chooseCharacter('luna'));
  on('click', '#character-zara', () => chooseCharacter('zara'));
  on('click', '#continue-character', () => {
    if (!selectedCharacter) return;
    play('click');
    state = 'world';
    selectedWorld = null;
    setEnabled();
    worldScreen();
  });
  on('click', '#back-to-character', () => {
    play('click');
    state = 'character';
    selectedWorld = null;
    setEnabled();
    characterScreen();
  });
  on('click', '#world-enchanted', () => chooseWorld('enchanted'));
  on('click', '#world-beach', () => chooseWorld('beach'));
  on('click', '#world-forest', () => chooseWorld('forest'));
  on('click', '#enter-world', () => {
    if (selectedWorld) startWorld();
  });
  on('click', '#play-again', () => {
    play('click');
    startWorld(selectedWorld);
  });
  on('click', '#choose-world-again', () => {
    play('click');
    state = 'world';
    selectedWorld = null;
    endingInfo = null;
    setEnabled();
    worldScreen();
  });
  on('click', '#view-leaderboard', (event) => {
    event.stopPropagation();
    leaderboard.show();
  });

  titleScreen();
  setEnabled();

  g.loop((rawDt) => {
    const dt = Math.min(rawDt, .05);
    globalTime += dt;
    if (toast) {
      toast.timer -= dt;
      if (toast.timer <= 0) toast = null;
    }
    screenShake = Math.max(0, screenShake - dt * 20);

    if (state === 'playing' && world) {
      if (g.tap && within(g.tap, { x: g.width - 50, y: 58, w: 44, h: 32 })) {
        muted = !muted;
        audio.toggleMute();
      }
      const move = input.get('move');
      const controls = {
        move,
        jumpPressed: input.justPressed('jump', { buffer: .12, ready: world.player.onGround || world.player.coyote > 0 }),
        jumpHeld: input.held('jump'),
        interactPressed: input.justPressed('interact')
      };
      const events = stepWorld(world, controls, dt, {
        runSpeed: physics.runSpeed,
        maxSpeed: physics.maxSpeed,
        acceleration: physics.acceleration,
        gravity: physics.gravity,
        jumpForce: physics.jumpForce,
        hazardEnergy: difficulty.hazardEnergy,
        eventFrequency: difficulty.eventFrequency
      });
      processEvents(events);
      const targetCamera = clamp(world.player.x - 178, 0, world.levelWidth - g.width);
      const follow = 1 - Math.exp(-8 * dt);
      cameraX += (targetCamera - cameraX) * follow;
    } else if (state === 'ending' && world) {
      advanceWorldVisuals(world, dt);
      const targetCamera = clamp(world.player.x - 178, 0, world.levelWidth - g.width);
      cameraX += (targetCamera - cameraX) * (1 - Math.exp(-5 * dt));
    }
    updateParticles(dt);
    canvas.style.cursor = state === 'playing' ? 'none' : 'auto';
    renderFrame(dt);
  });
});
