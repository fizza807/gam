export const CHARACTERS = {
  luna: {
    id: 'luna',
    name: 'Luna',
    icon: '🌸',
    personality: 'Creative, cheerful, curious and imaginative.',
    ability: 'Creativity Boost',
    abilityText: 'Magic, creative and puzzle tasks earn bonus memories.',
    hair: '#9a5be7',
    hairLight: '#d59bff',
    outfit: '#ff75b8',
    outfitLight: '#ffc0e5',
    accent: '#7ce7dd',
    skin: '#ffd5bd'
  },
  zara: {
    id: 'zara',
    name: 'Zara',
    icon: '🌿',
    personality: 'Brave, energetic, adventurous and confident.',
    ability: 'Adventure Boost',
    abilityText: 'Exploration, hidden-object and movement tasks earn bonus memories.',
    hair: '#4c2d3f',
    hairLight: '#8e526d',
    outfit: '#35b996',
    outfitLight: '#a4efd2',
    accent: '#ffb447',
    skin: '#c98260'
  }
};

const commonObstacles = {
  enchanted: [
    { x: 700, w: 42, h: 25, kind: 'rock' },
    { x: 1035, w: 34, h: 54, kind: 'barrier' },
    { x: 1800, w: 48, h: 30, kind: 'crystal' },
    { x: 2630, w: 42, h: 46, kind: 'barrier' },
    { x: 2875, w: 48, h: 25, kind: 'rock' },
    { x: 3330, w: 48, h: 32, kind: 'crystal' },
    { x: 3840, w: 44, h: 25, kind: 'rock' },
    { x: 4120, w: 38, h: 47, kind: 'barrier' }
  ],
  beach: [
    { x: 650, w: 46, h: 22, kind: 'driftwood' },
    { x: 1090, w: 43, h: 27, kind: 'rock' },
    { x: 2540, w: 44, h: 24, kind: 'driftwood' },
    { x: 2805, w: 55, h: 28, kind: 'wave' },
    { x: 3300, w: 48, h: 25, kind: 'rock' },
    { x: 3740, w: 51, h: 23, kind: 'driftwood' },
    { x: 4140, w: 45, h: 28, kind: 'rock' }
  ],
  forest: [
    { x: 660, w: 52, h: 21, kind: 'root' },
    { x: 980, w: 43, h: 27, kind: 'rock' },
    { x: 1650, w: 60, h: 30, kind: 'branch' },
    { x: 2080, w: 48, h: 22, kind: 'root' },
    { x: 2730, w: 47, h: 29, kind: 'rock' },
    { x: 3190, w: 60, h: 33, kind: 'branch' },
    { x: 3680, w: 56, h: 28, kind: 'branch' },
    { x: 4140, w: 46, h: 23, kind: 'root' }
  ]
};

export const WORLD_DATA = {
  enchanted: {
    id: 'enchanted',
    name: 'Enchanted Palace',
    icon: '🏰',
    description: 'A glowing garden of fairies, secret paths and impossible colors.',
    focus: 'Magic • creativity • discovery',
    collectible: 'glowing flower',
    collectiblePlural: 'glowing flowers',
    collectibleIcon: '🌸',
    specialIcon: '🔑',
    npc: { name: 'Pip the fairy', icon: '🧚', x: 1450, kind: 'fairy', taskId: 'npc' },
    special: { name: 'hidden magic key', icon: '🔑', x: 1935, y: 238, kind: 'key', taskId: 'hidden' },
    tasks: [
      { id: 'collect', label: 'Collect 5 glowing flowers', kind: 'collect', ability: 'magic', reward: 5 },
      { id: 'npc', label: 'Help the garden fairy', kind: 'interact', ability: 'magic', reward: 15 },
      { id: 'hidden', label: 'Find the hidden magic key', kind: 'hidden', ability: 'hidden', reward: 15 },
      { id: 'challenge', label: 'Cross the magical bridge', kind: 'challenge', ability: 'movement', reward: 20 },
      { id: 'final', label: 'Reach the Enchanted Palace', kind: 'final', ability: 'movement', reward: 25 }
    ],
    collectXs: [400, 590, 820, 1120, 1320],
    bonusXs: [910, 2320, 3460, 3980],
    challenge: { start: 2460, end: 3220, label: 'MAGICAL BRIDGE' },
    gaps: [{ x: 2490, w: 78 }, { x: 3080, w: 92 }],
    obstacles: commonObstacles.enchanted,
    sky: {
      dawn: ['#efb5d4', '#ffd7ad'], day: ['#56c8e8', '#b1f2e4'], dusk: ['#eb7b99', '#ffc07f'], night: ['#121a4b', '#314f91']
    },
    ground: ['#6d4e8e', '#bd78a6'],
    accent: '#f8d878',
    gateX: 4230,
    levelWidth: 4720
  },
  beach: {
    id: 'beach',
    name: 'Royal Beach Palace',
    icon: '🌊',
    description: 'Sunlit sand, singing waves and a treasure trail to the shore palace.',
    focus: 'Collecting • treasure • adventure',
    collectible: 'seashell',
    collectiblePlural: 'seashells',
    collectibleIcon: '🐚',
    specialIcon: '💎',
    npc: { name: 'sandcastle', icon: '🏖️', x: 2180, kind: 'sandcastle', taskId: 'build' },
    special: { name: 'hidden beach treasure', icon: '💎', x: 1740, y: 242, kind: 'treasure', taskId: 'hidden' },
    tasks: [
      { id: 'collect', label: 'Collect 5 seashells', kind: 'collect', ability: 'exploration', reward: 5 },
      { id: 'hidden', label: 'Find the hidden treasure', kind: 'hidden', ability: 'hidden', reward: 15 },
      { id: 'build', label: 'Build a royal sandcastle', kind: 'puzzle', ability: 'creative', reward: 15 },
      { id: 'challenge', label: 'Avoid the incoming waves', kind: 'challenge', ability: 'movement', reward: 20 },
      { id: 'final', label: 'Reach the Royal Beach Palace', kind: 'final', ability: 'movement', reward: 25 }
    ],
    collectXs: [380, 560, 780, 980, 1210],
    bonusXs: [890, 1450, 3110, 3920],
    challenge: { start: 2600, end: 3340, label: 'WAVE RUN' },
    gaps: [{ x: 2880, w: 72 }, { x: 3500, w: 78 }],
    obstacles: commonObstacles.beach,
    sky: {
      dawn: ['#efb7a7', '#ffe0a5'], day: ['#4dbce5', '#d7f3da'], dusk: ['#f08483', '#ffc987'], night: ['#11183e', '#345b88']
    },
    ground: ['#d7a367', '#f4ca82'],
    accent: '#fff09a',
    gateX: 4230,
    levelWidth: 4720
  },
  forest: {
    id: 'forest',
    name: 'Forest Palace',
    icon: '🌲',
    description: 'A hush-filled woodland with friendly animals and a palace behind the trees.',
    focus: 'Nature • hidden paths • kindness',
    collectible: 'magical flower',
    collectiblePlural: 'magical flowers',
    collectibleIcon: '🌼',
    specialIcon: '🍃',
    npc: { name: 'Moss the squirrel', icon: '🐿️', x: 1900, kind: 'squirrel', taskId: 'animal' },
    special: { name: 'hidden forest charm', icon: '🍃', x: 2450, y: 246, kind: 'charm', taskId: 'hidden' },
    butterfly: { name: 'magical butterfly', icon: '🦋', x: 1400, y: 210, kind: 'butterfly', taskId: 'butterfly' },
    tasks: [
      { id: 'collect', label: 'Collect 5 magical flowers', kind: 'collect', ability: 'nature', reward: 5 },
      { id: 'butterfly', label: 'Follow the magical butterfly', kind: 'interact', ability: 'exploration', reward: 15 },
      { id: 'animal', label: 'Help the forest friend', kind: 'interact', ability: 'nature', reward: 15 },
      { id: 'hidden', label: 'Find the hidden forest charm', kind: 'hidden', ability: 'hidden', reward: 20 },
      { id: 'final', label: 'Reach the Forest Palace', kind: 'final', ability: 'movement', reward: 25 }
    ],
    collectXs: [370, 540, 760, 970, 1190],
    bonusXs: [870, 1560, 2860, 3800],
    challenge: { start: 2250, end: 3090, label: 'HIDDEN PATH' },
    gaps: [{ x: 2300, w: 84 }, { x: 3440, w: 86 }],
    obstacles: commonObstacles.forest,
    sky: {
      dawn: ['#a6b9ad', '#ecd9b5'], day: ['#4b9d9a', '#bde1b0'], dusk: ['#b96672', '#e6ae83'], night: ['#101a37', '#2d5060']
    },
    ground: ['#3d7357', '#71a967'],
    accent: '#c5ef9a',
    gateX: 4230,
    levelWidth: 4720
  }
};

export const WORLD_ORDER = ['enchanted', 'beach', 'forest'];

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function mix(a, b, t) {
  return a + (b - a) * t;
}

function hexToRgb(hex) {
  const raw = hex.replace('#', '');
  const normalized = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  };
}

export function mixHex(a, b, t) {
  const one = hexToRgb(a);
  const two = hexToRgb(b);
  return `rgb(${Math.round(mix(one.r, two.r, t))}, ${Math.round(mix(one.g, two.g, t))}, ${Math.round(mix(one.b, two.b, t))})`;
}

export function dayPhase(x, gateX) {
  return clamp(x / (gateX + 370), 0, 1);
}

export function timeLabel(phase) {
  const minutes = Math.round(360 + phase * 960);
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = String(minutes % 60).padStart(2, '0');
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour = hour24 % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
}

export function phaseName(phase) {
  if (phase < 0.27) return 'MORNING';
  if (phase < 0.53) return 'AFTERNOON';
  if (phase < 0.78) return 'EVENING';
  return 'NIGHT';
}
