import { clamp } from './game-data.js';

const PLAYER_W = 42;
const PLAYER_H = 56;
const COYOTE_TIME = 0.1;

function copyTask(task) {
  return { ...task, done: false, active: false, count: 0 };
}

export function createWorld(definition, characterId) {
  const groundY = 296;
  const collectibles = definition.collectXs.map((x, index) => ({
    id: `collectible-${index}`,
    x,
    y: groundY - 24 - (index % 2) * 5,
    radius: 13,
    collected: false
  }));

  const bonusItems = definition.bonusXs.map((x, index) => ({
    id: `bonus-${index}`,
    x,
    y: groundY - 70 - (index % 3) * 15,
    radius: 12,
    collected: false
  }));

  return {
    def: definition,
    characterId,
    levelWidth: definition.levelWidth,
    groundY,
    elapsed: 0,
    player: {
      x: 94,
      y: groundY - PLAYER_H,
      w: PLAYER_W,
      h: PLAYER_H,
      vx: 0,
      vy: 0,
      onGround: true,
      coyote: COYOTE_TIME,
      action: null,
      actionTimer: 0,
      animTime: 0,
      facing: 1
    },
    collectibles,
    bonusItems,
    obstacles: definition.obstacles.map((obstacle) => ({
      ...obstacle,
      y: groundY - obstacle.h,
      hit: false
    })),
    gaps: definition.gaps.map((gap) => ({ ...gap })),
    tasks: definition.tasks.map(copyTask),
    npc: definition.npc ? {
      ...definition.npc,
      y: groundY - (definition.npc.kind === 'sandcastle' ? 24 : 42),
      helped: false
    } : null,
    special: definition.special ? { ...definition.special, found: false } : null,
    butterfly: definition.butterfly ? { ...definition.butterfly, baseX: definition.butterfly.x, baseY: definition.butterfly.y, found: false } : null,
    energy: 100,
    happiness: 70,
    memories: 0,
    progress: 0,
    score: 0,
    lastSafeX: 94,
    nextEvent: 9 + Math.random() * 5,
    miniGame: null,
    finalActive: false,
    gatePrompted: false,
    ended: false,
    prompt: '',
    challengeActive: false
  };
}

export function coreTasksDone(world) {
  return world.tasks.slice(0, 4).every((task) => task.done);
}

export function mainTasksDone(world) {
  return world.tasks.every((task) => task.done);
}

function playerCenter(player) {
  return { x: player.x + player.w * 0.5, y: player.y + player.h * 0.52 };
}

function near(player, point, radius = 62) {
  const center = playerCenter(player);
  const dx = center.x - point.x;
  const dy = center.y - point.y;
  return dx * dx + dy * dy <= radius * radius;
}

function circleTouchesPlayer(player, item) {
  const center = playerCenter(player);
  const dx = center.x - item.x;
  const dy = center.y - item.y;
  const reach = item.radius + 26;
  return dx * dx + dy * dy <= reach * reach;
}

function rectTouches(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function inGap(x, gaps) {
  return gaps.some((gap) => x > gap.x && x < gap.x + gap.w);
}

function addProgress(world, amount) {
  const before = world.progress;
  world.progress = clamp(world.progress + amount, 0, 100);
  world.score += Math.round(amount * 10);
  return world.progress - before;
}

function addHappiness(world, amount) {
  world.happiness = clamp(world.happiness + amount, 0, 100);
}

function addEnergy(world, amount) {
  world.energy = clamp(world.energy + amount, 0, 100);
}

function boostFor(world, task) {
  if (world.characterId === 'luna' && ['magic', 'creative', 'puzzle'].includes(task.ability)) return 4;
  if (world.characterId === 'zara' && ['exploration', 'hidden', 'movement'].includes(task.ability)) return 4;
  return 0;
}

function setAction(player, action, duration) {
  player.action = action;
  player.actionTimer = duration;
}

function completeTask(world, taskId, events) {
  const task = world.tasks.find((candidate) => candidate.id === taskId);
  if (!task || task.done) return false;
  task.done = true;
  task.active = false;
  const bonus = boostFor(world, task);
  const gain = task.reward + bonus;
  const progressGain = addProgress(world, gain);
  addHappiness(world, 5);
  events.push({
    type: 'task',
    taskId,
    label: task.label,
    gain,
    progressGain,
    bonus,
    x: world.player.x + world.player.w * 0.5,
    y: world.player.y
  });
  return true;
}

function collectItem(world, item, events, isBonus = false) {
  if (item.collected) return;
  item.collected = true;
  world.memories += 1;
  addHappiness(world, isBonus ? 4 : 2);
  const progressGain = addProgress(world, isBonus ? 3 : 4);
  setAction(world.player, 'collecting', 0.42);
  events.push({
    type: isBonus ? 'bonus' : 'pickup',
    x: item.x,
    y: item.y,
    progressGain,
    label: isBonus ? 'BONUS MEMORY!' : `+${progressGain}% PERFECT DAY`
  });
}

function updateActionAndWorldClock(world, dt) {
  world.elapsed += dt;
  world.player.animTime += dt;
  if (world.player.actionTimer > 0) {
    world.player.actionTimer -= dt;
    if (world.player.actionTimer <= 0) world.player.action = null;
  }

  if (world.butterfly) {
    world.butterfly.x = world.butterfly.baseX + Math.sin(world.elapsed * 1.35) * 34;
    world.butterfly.y = world.butterfly.baseY + Math.sin(world.elapsed * 2.1) * 11;
  }
}

export function advanceWorldVisuals(world, dt) {
  updateActionAndWorldClock(world, dt);
  if (world.ended) {
    world.player.action = 'celebrating';
    world.player.actionTimer = Math.max(world.player.actionTimer, 0.1);
  }
}

function updatePrompt(world) {
  const player = world.player;
  const def = world.def;
  world.prompt = '';

  if (world.miniGame) {
    world.prompt = `BUILD THE SANDCASTLE  •  PRESS E ${world.miniGame.total - world.miniGame.presses} MORE TIME${world.miniGame.total - world.miniGame.presses === 1 ? '' : 'S'}`;
    return;
  }

  if (world.special && !world.special.found && near(player, world.special, 70)) {
    world.prompt = `${world.special.icon} ${world.special.name.toUpperCase()}  •  PRESS E`;
    return;
  }

  if (world.butterfly && !world.butterfly.found && near(player, world.butterfly, 72)) {
    world.prompt = `${world.butterfly.icon} ${world.butterfly.name.toUpperCase()}  •  PRESS E`;
    return;
  }

  if (world.npc && !world.npc.helped && near(player, world.npc, 72)) {
    if (world.npc.kind === 'sandcastle') {
      world.prompt = '🏖️ BUILD A SANDCASTLE  •  PRESS E';
    } else {
      world.prompt = `${world.npc.icon} ${world.npc.name.toUpperCase()}  •  PRESS E TO HELP`;
    }
    return;
  }

  if (player.x >= def.gateX - 75 && !world.finalActive) {
    world.prompt = coreTasksDone(world)
      ? '✨ FINAL CHALLENGE  •  PRESS E TO BEGIN'
      : '🏰 THE PALACE AWAITS  •  PRESS E TO ENTER';
  }
}

function positiveEvent(world, events, frequency = 1) {
  const choices = [
    ['You discovered a secret path!', 'secret'],
    ['A rainbow appeared!', 'rainbow'],
    ['A magical butterfly is following you!', 'butterfly'],
    ['You found a surprise!', 'surprise'],
    ['BONUS MEMORY!', 'memory']
  ];
  const [message, kind] = choices[Math.floor(Math.random() * choices.length)];
  world.memories += 1;
  addHappiness(world, 3);
  const progressGain = addProgress(world, 4);
  events.push({ type: 'random', message, kind, progressGain, x: world.player.x, y: world.player.y - 36 });
  world.nextEvent = world.elapsed + (12 + Math.random() * 8) / Math.max(.25, frequency);
}

function handleSpecialInteraction(world, controls, events) {
  const player = world.player;

  if (world.special && !world.special.found && near(player, world.special, 70)) {
    if (controls.interactPressed) {
      world.special.found = true;
      setAction(player, 'interacting', 0.62);
      completeTask(world, world.special.taskId, events);
      events.push({ type: 'special', x: world.special.x, y: world.special.y, label: world.special.name });
    }
    return true;
  }

  if (world.butterfly && !world.butterfly.found && near(player, world.butterfly, 72)) {
    if (controls.interactPressed) {
      world.butterfly.found = true;
      setAction(player, 'interacting', 0.62);
      completeTask(world, world.butterfly.taskId, events);
      events.push({ type: 'special', x: world.butterfly.x, y: world.butterfly.y, label: world.butterfly.name });
    }
    return true;
  }

  if (world.npc && !world.npc.helped && near(player, world.npc, 72)) {
    if (controls.interactPressed) {
      if (world.npc.kind === 'sandcastle') {
        world.miniGame = { presses: 0, total: 3 };
        player.x = world.npc.x - 35;
        player.vx = 0;
        setAction(player, 'interacting', 0.45);
        events.push({ type: 'mini-start', x: world.npc.x, y: world.groundY - 48 });
      } else {
        world.npc.helped = true;
        setAction(player, 'interacting', 0.7);
        completeTask(world, world.npc.taskId, events);
        events.push({ type: 'npc', x: world.npc.x, y: world.groundY - 55, label: world.npc.name });
      }
    }
    return true;
  }

  return false;
}

function updateMiniGame(world, controls, events) {
  const miniGame = world.miniGame;
  if (!miniGame) return false;
  world.player.vx = 0;
  world.player.y = world.groundY - world.player.h;
  world.player.onGround = true;
  if (controls.interactPressed) {
    miniGame.presses += 1;
    setAction(world.player, 'interacting', 0.32);
    if (miniGame.presses >= miniGame.total) {
      world.miniGame = null;
      world.npc.helped = true;
      completeTask(world, world.npc.taskId, events);
      events.push({ type: 'sandcastle', x: world.npc.x, y: world.groundY - 50 });
    } else {
      events.push({ type: 'mini-progress', x: world.npc.x, y: world.groundY - 50, presses: miniGame.presses });
    }
  }
  updatePrompt(world);
  return true;
}

export function stepWorld(world, controls, dt, tuning) {
  const events = [];
  if (world.ended) return events;
  updateActionAndWorldClock(world, dt);

  if (world.miniGame) {
    updateMiniGame(world, controls, events);
    return events;
  }

  const player = world.player;
  const { def } = world;

  if (world.elapsed >= world.nextEvent && player.x < def.gateX - 150) positiveEvent(world, events, tuning.eventFrequency);

  player.coyote = player.onGround ? COYOTE_TIME : player.coyote - dt;
  if (controls.jumpPressed && player.coyote > 0) {
    player.vy = -tuning.jumpForce;
    player.onGround = false;
    player.coyote = 0;
    player.action = null;
    events.push({ type: 'jump', x: player.x + player.w * 0.5, y: player.y + player.h });
  }

  if (controls.jumpHeld && player.vy < -tuning.jumpForce * 0.42) {
    player.vy += tuning.gravity * dt * 0.22;
  }
  player.vy = Math.min(player.vy + tuning.gravity * dt, 1080);

  const direction = controls.move?.x || 0;
  const desiredSpeed = clamp(tuning.runSpeed + direction * 225, -95, tuning.maxSpeed);
  const acceleration = clamp(tuning.acceleration * dt, 0, 1);
  player.vx += (desiredSpeed - player.vx) * acceleration;
  player.x += player.vx * dt;
  player.facing = player.vx < -8 ? -1 : player.vx > 8 ? 1 : player.facing;
  player.x = clamp(player.x, 0, world.levelWidth - player.w);

  player.y += player.vy * dt;
  player.onGround = false;
  const footX = player.x + player.w * 0.52;
  const overGap = inGap(footX, world.gaps);
  if (!overGap && player.y + player.h >= world.groundY && player.vy >= 0) {
    player.y = world.groundY - player.h;
    player.vy = 0;
    player.onGround = true;
    if (player.action === null) player.actionTimer = 0;
  }

  if (player.y > 410) {
    player.x = clamp(world.lastSafeX, 50, world.levelWidth - 200);
    player.y = world.groundY - player.h;
    player.vx = Math.max(65, tuning.runSpeed * 0.65);
    player.vy = 0;
    player.onGround = true;
    world.energy = clamp(world.energy - tuning.hazardEnergy * 1.6, 0, 100);
    addHappiness(world, -5);
    setAction(player, 'recovering', 0.58);
    events.push({ type: 'fall', x: player.x, y: world.groundY - 10 });
  } else if (player.onGround && !overGap) {
    world.lastSafeX = player.x;
  }

  for (const obstacle of world.obstacles) {
    if (obstacle.hit || obstacle.x + obstacle.w < player.x - 16 || obstacle.x > player.x + player.w + 16) continue;
    const obstacleRect = { x: obstacle.x, y: obstacle.y, w: obstacle.w, h: obstacle.h };
    if (rectTouches(player, obstacleRect)) {
      obstacle.hit = true;
      world.energy = clamp(world.energy - tuning.hazardEnergy, 0, 100);
      addHappiness(world, -4);
      player.x = player.vx >= 0 ? Math.max(world.lastSafeX, obstacle.x - player.w - 2) : obstacle.x + obstacle.w + 3;
      player.vx = Math.max(55, tuning.runSpeed * 0.55);
      setAction(player, 'recovering', 0.5);
      events.push({ type: 'hit', x: obstacle.x + obstacle.w * 0.5, y: obstacle.y + obstacle.h * 0.35, kind: obstacle.kind });
      break;
    }
  }

  for (const item of world.collectibles) {
    if (!item.collected && circleTouchesPlayer(player, item)) {
      collectItem(world, item, events);
      const collectTask = world.tasks.find((task) => task.id === 'collect');
      if (collectTask) {
        collectTask.count += 1;
        if (collectTask.count >= world.collectibles.length) completeTask(world, 'collect', events);
      }
    }
  }

  for (const item of world.bonusItems) {
    if (!item.collected && circleTouchesPlayer(player, item)) collectItem(world, item, events, true);
  }

  const handledInteraction = handleSpecialInteraction(world, controls, events);

  const challengeTask = world.tasks.find((task) => task.kind === 'challenge');
  if (challengeTask && !challengeTask.done) {
    if (player.x >= def.challenge.start) {
      challengeTask.active = true;
      world.challengeActive = true;
    }
    if (player.x >= def.challenge.end) completeTask(world, challengeTask.id, events);
  }

  if (player.x >= def.gateX - 75 && !world.finalActive) {
    player.x = Math.min(player.x, def.gateX - 43);
    player.vx = 0;
    if (!world.gatePrompted) {
      world.gatePrompted = true;
      events.push({ type: 'gate', x: def.gateX, y: world.groundY - 100, ready: coreTasksDone(world) });
    }
    if (controls.interactPressed) {
      if (coreTasksDone(world)) {
        world.finalActive = true;
        const finalTask = world.tasks.find((task) => task.id === 'final');
        if (finalTask) finalTask.active = true;
        player.vx = tuning.runSpeed;
        setAction(player, 'interacting', 0.75);
        events.push({ type: 'final-start', x: def.gateX, y: world.groundY - 90 });
      } else {
        world.ended = true;
        player.action = 'celebrating';
        events.push({ type: 'almost-finish', x: def.gateX, y: world.groundY - 90 });
      }
    }
  }

  if (world.finalActive && player.x >= world.levelWidth - 105) {
    completeTask(world, 'final', events);
    world.ended = true;
    player.action = 'celebrating';
    player.vx = 0;
    events.push({ type: 'finish', x: player.x, y: player.y, perfect: mainTasksDone(world) });
  }

  if (!handledInteraction && player.action === null) {
    player.action = player.onGround ? (Math.abs(player.vx) > 30 ? 'running' : 'idle') : 'jumping';
  }
  updatePrompt(world);
  return events;
}
