import { clamp, dayPhase, mixHex, phaseName, timeLabel } from './game-data.js';
import { circle, fillRounded, line, rounded, starPath, strokeRounded, text, drawCharacter } from './art-menu.js';

function palette(def, phase) {
  const stops = [0, .27, .53, .78, 1]; const names = ['dawn', 'day', 'dusk', 'night'];
  let index = 0; while (index < names.length - 2 && phase > stops[index + 1]) index += 1;
  const local = clamp((phase - stops[index]) / (stops[index + 1] - stops[index]), 0, 1);
  return { top: mixHex(def.sky[names[index]][0], def.sky[names[index + 1]][0], local), bottom: mixHex(def.sky[names[index]][1], def.sky[names[index + 1]][1], local) };
}

function cloud(ctx, x, y, scale, color) {
  ctx.fillStyle = color; ctx.beginPath();
  ctx.arc(x, y, 13 * scale, Math.PI, 0); ctx.arc(x + 15 * scale, y - 6 * scale, 17 * scale, Math.PI, 0); ctx.arc(x + 34 * scale, y, 12 * scale, Math.PI, 0);
  ctx.lineTo(x + 46 * scale, y + 12 * scale); ctx.lineTo(x - 10 * scale, y + 12 * scale); ctx.closePath(); ctx.fill();
}

function backdrop(ctx, width, height, def, cameraX, phase, t) {
  const colors = palette(def, phase); const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, colors.top); sky.addColorStop(1, colors.bottom); ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
  const night = clamp((phase - .58) * 2.5, 0, .92);
  if (night > 0) {
    for (let i = 0; i < 22; i += 1) { const x = (i * 91 + 28) % width; const y = 22 + (i * 29) % 126; ctx.globalAlpha = night * (.35 + (i % 3) * .12); starPath(ctx, x, y, i % 4 === 0 ? 2.5 : 1.2, .55, 4); ctx.fillStyle = '#fff0ad'; ctx.fill(); }
    ctx.globalAlpha = night; circle(ctx, width * .82, 61, 22, '#fff3c0'); circle(ctx, width * .84, 55, 20, colors.top);
  } else { ctx.globalAlpha = .72; circle(ctx, width * (.74 - phase * .13), 65 + phase * 15, 27, '#fff0ae'); }
  ctx.globalAlpha = .2; const offset = -(cameraX * .13) % 260; const cloudColor = phase > .7 ? '#dbe3f5' : '#fff7f0';
  for (let i = -1; i < 4; i += 1) cloud(ctx, offset + i * 260 + 75, 55 + (i % 2) * 42, 1 + (i % 3) * .15, cloudColor); ctx.globalAlpha = 1;
  const hillOffset = -(cameraX * .18) % 420;
  ctx.fillStyle = phase > .7 ? 'rgba(20,36,77,.33)' : def.id === 'beach' ? 'rgba(82,160,172,.27)' : 'rgba(50,74,111,.25)'; ctx.beginPath(); ctx.moveTo(0, 216);
  for (let i = -1; i < 5; i += 1) { const x = hillOffset + i * 420; ctx.quadraticCurveTo(x + 100, 165 + (i % 2) * 24, x + 210, 216); ctx.quadraticCurveTo(x + 320, 168 + (i % 3) * 20, x + 420, 216); }
  ctx.lineTo(width, height); ctx.lineTo(0, height); ctx.closePath(); ctx.fill();
}

function tree(ctx, x, base, scale, dark = false, far = false) {
  ctx.fillStyle = dark ? '#2d3b3d' : '#5a3d3a'; rounded(ctx, x - 7 * scale, base - 88 * scale, 14 * scale, 89 * scale, 5 * scale); ctx.fill();
  const leaf = dark ? '#264d53' : far ? '#3f8b72' : '#3c8b68';
  circle(ctx, x - 21 * scale, base - 86 * scale, 25 * scale, leaf); circle(ctx, x + 13 * scale, base - 92 * scale, 29 * scale, leaf); circle(ctx, x - 2 * scale, base - 117 * scale, 31 * scale, leaf);
  ctx.globalAlpha = .15; circle(ctx, x - 9 * scale, base - 129 * scale, 12 * scale, '#fff'); ctx.globalAlpha = 1;
}

function palm(ctx, x, base, scale, dark = false) {
  line(ctx, [x, base, x + 7 * scale, base - 105 * scale], dark ? '#394451' : '#936048', 8 * scale);
  const leaf = dark ? '#315b6b' : '#329a82';
  for (let i = 0; i < 6; i += 1) { const angle = -1.9 + i * .45; line(ctx, [x + 7 * scale, base - 105 * scale, x + 7 * scale + Math.cos(angle) * 44 * scale, base - 105 * scale + Math.sin(angle) * 23 * scale], leaf, 5 * scale); }
}

function worldDecor(ctx, world, cameraX, phase, t) {
  const def = world.def; const dark = phase > .72;
  ctx.save(); ctx.translate(cameraX * .58, 0);
  if (def.id === 'forest') for (let i = -3; i < 34; i += 1) tree(ctx, i * 175 + 55, 295, 1 + (i % 3) * .15, dark, true);
  else if (def.id === 'beach') for (let i = -3; i < 23; i += 1) palm(ctx, i * 260 + 100, 296, 1 + (i % 2) * .12, dark);
  else for (let i = -3; i < 23; i += 1) { const x = i * 250 + 120; ctx.strokeStyle = dark ? '#4e4c83' : '#ae73a4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, 230, 54, Math.PI, 0); ctx.stroke(); for (let j = 0; j < 3; j += 1) circle(ctx, x - 34 + j * 30, 220 + (j % 2) * 6, 5, dark ? '#8f80c7' : '#f3c1cf'); }
  ctx.restore();
  ctx.save(); ctx.translate(cameraX * .36, 0);
  if (def.id === 'forest') for (let i = -4; i < 42; i += 1) tree(ctx, i * 140 + 80, 299, .58 + (i % 2) * .1, dark);
  else if (def.id === 'beach') for (let i = -4; i < 30; i += 1) { ctx.globalAlpha = .38; circle(ctx, i * 200 + 50, 258, 4, '#fff4bd'); circle(ctx, i * 200 + 71, 249, 3, '#fff4bd'); ctx.globalAlpha = 1; }
  else for (let i = -4; i < 40; i += 1) { const x = i * 135 + 70; circle(ctx, x, 265, 8, dark ? '#645fa9' : '#ff9fc2'); circle(ctx, x + 10, 267, 6, dark ? '#8d79c4' : '#b8efc0'); }
  ctx.restore();
  landmark(ctx, def, 1060, phase, t); landmark(ctx, def, 1580, phase, t);
}

function landmark(ctx, def, x, phase, t) {
  const ground = 286; const glow = .28 + Math.sin(t * 2 + x) * .05; ctx.globalAlpha = glow;
  if (def.id === 'enchanted') { circle(ctx, x, ground - 46, 42, '#99f4ec'); ctx.globalAlpha = 1; circle(ctx, x, ground - 10, 28, '#7b9bd5'); circle(ctx, x, ground - 28, 22, '#b9e9f0'); for (let i = 0; i < 3; i += 1) circle(ctx, x - 20 + i * 20, ground - 59 - (i % 2) * 7, 3, '#fff1a6'); }
  else if (def.id === 'beach') { ctx.globalAlpha = 1; fillRounded(ctx, x - 48, ground - 57, 96, 57, 8, phase > .7 ? '#425c86' : '#f8d077'); ctx.fillStyle = phase > .7 ? '#7185ac' : '#fff0b0'; ctx.beginPath(); ctx.moveTo(x - 59, ground - 57); ctx.lineTo(x, ground - 88); ctx.lineTo(x + 59, ground - 57); ctx.closePath(); ctx.fill(); circle(ctx, x, ground - 35, 11, '#f08d9f'); }
  else { ctx.globalAlpha = 1; tree(ctx, x, ground, 1.22, phase > .7); circle(ctx, x - 30, ground - 44, 5, '#ffe5a0'); circle(ctx, x + 26, ground - 69, 4, '#ffe5a0'); }
  ctx.globalAlpha = 1;
}

function ground(ctx, world, t, phase) {
  let cursor = 0; for (const gap of world.gaps) { groundSegment(ctx, cursor, gap.x, world.groundY, world.def, phase); gapWater(ctx, gap, world.groundY, world.def, t); cursor = gap.x + gap.w; }
  groundSegment(ctx, cursor, world.levelWidth + 180, world.groundY, world.def, phase);
}

function groundSegment(ctx, x, end, y, def, phase) {
  ctx.fillStyle = phase > .72 ? mixHex(def.ground[0], '#172346', .5) : def.ground[0]; ctx.fillRect(x, y, end - x, 90);
  ctx.fillStyle = phase > .72 ? mixHex(def.ground[1], '#3a4771', .4) : def.ground[1]; ctx.fillRect(x, y, end - x, 8); ctx.globalAlpha = .28;
  for (let i = x + 18; i < end; i += 42) { if (def.id === 'beach') line(ctx, [i, y + 25, i + 13, y + 23], '#fff0ba', 2); else if (def.id === 'forest') line(ctx, [i, y + 14, i + 5, y + 8], '#b6e28d', 2); else circle(ctx, i, y + 28, 2, '#f1a6cb'); }
  ctx.globalAlpha = 1;
}

function gapWater(ctx, gap, y, def, t) {
  ctx.fillStyle = def.id === 'beach' ? '#3a98bc' : def.id === 'forest' ? '#27677b' : '#3d5db4'; ctx.fillRect(gap.x, y, gap.w, 80); ctx.globalAlpha = .5;
  for (let yy = y + 14; yy < y + 70; yy += 17) { const offset = Math.sin(t * 2 + yy) * 5; line(ctx, [gap.x + 8 + offset, yy, gap.x + gap.w - 8 + offset, yy], '#8de4e2', 2); } ctx.globalAlpha = 1;
}

function collectible(ctx, item, world, t) {
  const y = item.y + Math.sin(t * 4 + item.x * .02) * 3; ctx.globalAlpha = .24; circle(ctx, item.x, y, 18, world.def.id === 'forest' ? '#c6ef8e' : '#ffe49d'); ctx.globalAlpha = 1;
  if (world.def.id === 'beach') { ctx.fillStyle = '#ffd8c9'; ctx.beginPath(); ctx.arc(item.x, y + 4, 11, Math.PI, 0); ctx.lineTo(item.x + 9, y + 8); ctx.lineTo(item.x - 9, y + 8); ctx.closePath(); ctx.fill(); for (let i = -6; i <= 6; i += 4) line(ctx, [item.x, y + 3, item.x + i, y + 8], '#e998ac', 1); }
  else { line(ctx, [item.x, y + 5, item.x, y + 23], '#5abf86', 3); for (let i = 0; i < 5; i += 1) { const angle = i * Math.PI * .4; circle(ctx, item.x + Math.cos(angle) * 7, y + Math.sin(angle) * 7, 5, world.def.id === 'forest' ? (i % 2 ? '#f4a6b9' : '#fff2a2') : (i % 2 ? '#ff9ac8' : '#f8c6ff')); } circle(ctx, item.x, y, 3.4, '#fff0a2'); }
}

function bonus(ctx, item, t) { const y = item.y + Math.sin(t * 3 + item.x) * 5; ctx.globalAlpha = .2; circle(ctx, item.x, y, 22, '#fff09b'); ctx.globalAlpha = 1; starPath(ctx, item.x, y, 12, 5, 5); ctx.fillStyle = '#fff09b'; ctx.fill(); starPath(ctx, item.x, y, 7, 3, 5); ctx.fillStyle = '#fffceb'; ctx.fill(); }

function obstacle(ctx, o, def, phase, t) {
  const x = o.x; const y = o.y;
  if (o.kind === 'rock' || o.kind === 'root') { ctx.fillStyle = def.id === 'forest' ? '#6d665e' : '#8b6f93'; ctx.beginPath(); ctx.moveTo(x, y + o.h); ctx.lineTo(x + 8, y + 7); ctx.lineTo(x + o.w * .6, y); ctx.lineTo(x + o.w, y + 10); ctx.lineTo(x + o.w - 4, y + o.h); ctx.closePath(); ctx.fill(); line(ctx, [x + 11, y + 12, x + 22, y + 9], '#c0a7ba', 2); }
  else if (o.kind === 'barrier') { ctx.globalAlpha = .3; fillRounded(ctx, x - 6, y - 8, o.w + 12, o.h + 16, 12, '#9af4e6'); ctx.globalAlpha = 1; strokeRounded(ctx, x, y, o.w, o.h, 7, '#d4ffff', 3); line(ctx, [x + 8, y + o.h - 8, x + o.w - 8, y + 8], '#fff1a8', 2); }
  else if (o.kind === 'crystal') { ctx.globalAlpha = .25; circle(ctx, x + o.w / 2, y + o.h / 2, 25, '#9bdfff'); ctx.globalAlpha = 1; ctx.fillStyle = phase > .72 ? '#8098e2' : '#b57df3'; ctx.beginPath(); ctx.moveTo(x + 4, y + o.h); ctx.lineTo(x + o.w * .38, y + 2); ctx.lineTo(x + o.w * .64, y + 10); ctx.lineTo(x + o.w - 3, y + o.h); ctx.closePath(); ctx.fill(); }
  else if (o.kind === 'driftwood' || o.kind === 'branch') { line(ctx, [x, y + o.h - 2, x + o.w, y + 4], def.id === 'beach' ? '#95684d' : '#513f3c', 9); line(ctx, [x + o.w * .3, y + 9, x + o.w * .15, y - 7], '#60453f', 4); line(ctx, [x + o.w * .65, y + 8, x + o.w * .86, y - 5], '#60453f', 4); }
  else { ctx.globalAlpha = .3; circle(ctx, x + o.w / 2, y + 10, 25 + Math.sin(t * 6) * 3, '#9be8ed'); ctx.globalAlpha = 1; line(ctx, [x, y + o.h, x + o.w * .45, y + 4, x + o.w, y + o.h], '#71cfe2', 6); }
}

function npc(ctx, world, t) {
  if (!world.npc || world.npc.helped) return; const x = world.npc.x; const y = world.groundY + Math.sin(t * 4 + x) * 2;
  if (world.npc.kind === 'sandcastle') { ctx.fillStyle = '#e4b771'; ctx.beginPath(); ctx.moveTo(x - 33, world.groundY); ctx.lineTo(x - 28, world.groundY - 29); ctx.lineTo(x - 16, world.groundY - 29); ctx.lineTo(x - 16, world.groundY - 42); ctx.lineTo(x - 8, world.groundY - 42); ctx.lineTo(x - 8, world.groundY - 29); ctx.lineTo(x + 8, world.groundY - 29); ctx.lineTo(x + 8, world.groundY - 48); ctx.lineTo(x + 16, world.groundY - 48); ctx.lineTo(x + 16, world.groundY - 29); ctx.lineTo(x + 28, world.groundY - 29); ctx.lineTo(x + 33, world.groundY); ctx.closePath(); ctx.fill(); fillRounded(ctx, x - 5, world.groundY - 17, 10, 17, 4, '#9c6c5d'); return; }
  if (world.npc.kind === 'fairy') { ctx.globalAlpha = .22; circle(ctx, x, y - 32, 27, '#fff09e'); ctx.globalAlpha = 1; ctx.fillStyle = '#c7a0ff'; ctx.beginPath(); ctx.ellipse(x - 14, y - 26, 12, 19, -.45, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + 14, y - 26, 12, 19, .45, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ff98c6'; ctx.beginPath(); ctx.moveTo(x - 12, y - 5); ctx.lineTo(x, y - 32); ctx.lineTo(x + 12, y - 5); ctx.closePath(); ctx.fill(); circle(ctx, x, y - 40, 10, '#ffd6bd'); circle(ctx, x, y - 47, 10, '#e79ad7'); circle(ctx, x - 3, y - 40, 1.4, '#432858'); circle(ctx, x + 3, y - 40, 1.4, '#432858'); }
  else { circle(ctx, x + 14, y - 30, 16, '#d98955'); circle(ctx, x, y - 24, 14, '#dc9865'); circle(ctx, x - 10, y - 40, 6, '#dc9865'); circle(ctx, x + 6, y - 40, 6, '#dc9865'); circle(ctx, x - 4, y - 26, 1.7, '#3c2630'); circle(ctx, x + 4, y - 26, 1.7, '#3c2630'); ctx.strokeStyle = '#d98955'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x + 17, y - 32, 24, -.8, 1.8); ctx.stroke(); }
}

function special(ctx, world, t) {
  const s = world.special; if (s && !s.found) { const y = s.y + Math.sin(t * 3 + s.x) * 4; ctx.globalAlpha = .22; circle(ctx, s.x, y, 25, world.def.accent); ctx.globalAlpha = 1; if (s.kind === 'key') { circle(ctx, s.x - 5, y, 8, '#ffe278'); line(ctx, [s.x + 1, y, s.x + 18, y, s.x + 18, y + 8], '#ffe278', 5); } else if (s.kind === 'treasure') { fillRounded(ctx, s.x - 17, y - 3, 34, 22, 5, '#d78b50'); ctx.fillStyle = '#f6d768'; ctx.beginPath(); ctx.moveTo(s.x - 20, y - 3); ctx.quadraticCurveTo(s.x, y - 24, s.x + 20, y - 3); ctx.closePath(); ctx.fill(); } else { ctx.fillStyle = '#a9e98e'; ctx.beginPath(); ctx.ellipse(s.x, y, 9, 17, -.55, 0, Math.PI * 2); ctx.fill(); line(ctx, [s.x - 2, y + 15, s.x + 7, y + 2], '#4f9d75', 2); } }
  if (world.butterfly && !world.butterfly.found) { const b = world.butterfly; const flap = Math.sin(t * 10) * .3; ctx.globalAlpha = .26; circle(ctx, b.x, b.y, 20, '#e9c6ff'); ctx.globalAlpha = 1; ctx.fillStyle = '#b18af1'; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(flap); ctx.beginPath(); ctx.ellipse(-8, -3, 8, 12, -.5, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(8, -3, 8, 12, .5, 0, Math.PI * 2); ctx.fill(); ctx.restore(); line(ctx, [b.x, b.y - 7, b.x, b.y + 8], '#4f447c', 2); }
}

function gate(ctx, world, phase, t) {
  const x = world.def.gateX; const dark = phase > .72; ctx.globalAlpha = .25 + Math.sin(t * 2) * .04; circle(ctx, x, world.groundY - 96, 74, world.def.accent); ctx.globalAlpha = 1;
  if (world.def.id === 'beach') { fillRounded(ctx, x - 76, world.groundY - 116, 152, 116, 12, dark ? '#3c4e78' : '#f1c878'); ctx.fillStyle = dark ? '#7184aa' : '#fff0ae'; ctx.beginPath(); ctx.moveTo(x - 88, world.groundY - 116); ctx.lineTo(x, world.groundY - 163); ctx.lineTo(x + 88, world.groundY - 116); ctx.closePath(); ctx.fill(); fillRounded(ctx, x - 15, world.groundY - 58, 30, 58, 12, '#7c5a70'); palm(ctx, x - 95, world.groundY, .62, dark); palm(ctx, x + 96, world.groundY, .62, dark); }
  else if (world.def.id === 'forest') { tree(ctx, x - 44, world.groundY, 1.35, dark); tree(ctx, x + 44, world.groundY, 1.35, dark); fillRounded(ctx, x - 52, world.groundY - 106, 104, 106, 18, dark ? '#344968' : '#896b58'); ctx.fillStyle = dark ? '#698a9b' : '#b5d17c'; ctx.beginPath(); ctx.moveTo(x - 64, world.groundY - 106); ctx.lineTo(x, world.groundY - 151); ctx.lineTo(x + 64, world.groundY - 106); ctx.closePath(); ctx.fill(); fillRounded(ctx, x - 14, world.groundY - 55, 28, 55, 13, '#664b59'); }
  else { ctx.strokeStyle = dark ? '#9c90dc' : '#fff0a5'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(x, world.groundY - 20, 66, Math.PI, 0); ctx.stroke(); line(ctx, [x - 66, world.groundY - 20, x - 66, world.groundY], ctx.strokeStyle, 12); line(ctx, [x + 66, world.groundY - 20, x + 66, world.groundY], ctx.strokeStyle, 12); circle(ctx, x, world.groundY - 61, 13, '#ffb3db'); }
  text(ctx, world.finalActive ? 'FINAL PATH' : 'PALACE', x, world.groundY - 180, 10, dark ? '#fff0ac' : '#fffef0', 'center', 900);
}

function prompt(ctx, value, width, height) { if (!value) return; const w = Math.min(440, width - 44); const x = width / 2 - w / 2; const y = height - 48; fillRounded(ctx, x, y, w, 28, 14, 'rgba(18, 12, 54, .88)'); strokeRounded(ctx, x, y, w, 28, 14, 'rgba(255,236,164,.42)', 1); text(ctx, value, width / 2, y + 14, 10, '#fff1b0', 'center', 900); }

function tasks(ctx, world) {
  const x = 12; const y = 67; const w = 218; const h = 124; fillRounded(ctx, x, y, w, h, 13, 'rgba(19, 15, 53, .7)'); strokeRounded(ctx, x, y, w, h, 13, 'rgba(255,255,255,.12)', 1); text(ctx, "TODAY'S ADVENTURE", x + 13, y + 14, 9, '#fff0a5', 'left', 900);
  world.tasks.forEach((task, i) => { const yy = y + 32 + i * 17; ctx.globalAlpha = task.done ? .7 : 1; circle(ctx, x + 14, yy, 5, task.done ? '#96f0c4' : task.active ? '#ffe39a' : '#7b7199'); if (task.done) line(ctx, [x + 11, yy, x + 13, yy + 2, x + 17, yy - 3], '#243c4d', 1.5); text(ctx, task.label, x + 26, yy, 9, task.done ? '#b9e7d2' : '#f4eafa', 'left', task.active ? 850 : 650); ctx.globalAlpha = 1; });
}

function hud(ctx, width, height, world, phase, muted, look = { uiGlow: 1 }) {
  fillRounded(ctx, 10, 10, width - 20, 44, 14, 'rgba(18, 13, 53, .73)'); strokeRounded(ctx, 10, 10, width - 20, 44, 14, 'rgba(255,255,255,.14)', 1);
  text(ctx, '♥', 22, 25, 15, '#ff94ba', 'left', 900); text(ctx, `${world.happiness}`, 43, 25, 13, '#fffafc', 'left', 900); text(ctx, '⚡', 74, 25, 13, '#ffe68c', 'left', 900); text(ctx, `${world.energy}`, 94, 25, 13, '#fffafc', 'left', 900); text(ctx, '✦', 126, 25, 14, '#a9f0e0', 'left', 900); text(ctx, `${world.memories}`, 147, 25, 13, '#fffafc', 'left', 900);
  text(ctx, '✨ PERFECT DAY', width / 2, 19, 10, '#fff0a6', 'center', 900); fillRounded(ctx, width / 2 - 88, 29, 176, 9, 5, 'rgba(255,255,255,.13)'); ctx.globalAlpha = clamp(look.uiGlow, .2, 1); fillRounded(ctx, width / 2 - 88, 29, 176 * world.progress / 100, 9, 5, '#ffe28d'); ctx.globalAlpha = 1; text(ctx, `${Math.round(world.progress)}%`, width / 2, 42, 9, '#fffaf0', 'center', 900);
  text(ctx, `🕐 ${timeLabel(phase)}`, width - 25, 25, 11, '#f7ecff', 'right', 800); text(ctx, phaseName(phase), width - 25, 42, 8, '#c3f2de', 'right', 900); fillRounded(ctx, width - 43, 62, 31, 23, 10, 'rgba(18, 13, 53, .68)'); text(ctx, muted ? '×' : '♫', width - 27, 74, 13, muted ? '#b8abc9' : '#fff0a7', 'center', 900); tasks(ctx, world);
}

function toast(ctx, item, width) { if (!item || item.timer <= 0) return; ctx.globalAlpha = clamp(Math.min(1, item.timer * 2), 0, 1); const y = item.kind === 'task' ? 91 : 238; const w = Math.min(330, width - 260); fillRounded(ctx, width / 2 - w / 2, y, w, item.kind === 'task' ? 42 : 34, 14, item.kind === 'task' ? 'rgba(91, 51, 110, .92)' : 'rgba(24, 18, 65, .86)'); text(ctx, item.text, width / 2, y + (item.kind === 'task' ? 14 : 12), item.kind === 'task' ? 11 : 10, item.color || '#fff1a8', 'center', 900); if (item.sub) text(ctx, item.sub, width / 2, y + 29, 9, '#f5e8fc', 'center', 700); ctx.globalAlpha = 1; }

function mini(ctx, width, miniGame) { fillRounded(ctx, width / 2 - 132, 114, 264, 78, 17, 'rgba(24, 16, 65, .93)'); strokeRounded(ctx, width / 2 - 132, 114, 264, 78, 17, '#ffe298', 2); text(ctx, 'BUILD THE SANDCASTLE', width / 2, 131, 11, '#fff0a4', 'center', 900); text(ctx, 'PRESS E / TAP THE ACTION BUTTON', width / 2, 149, 9, '#e7d9f2', 'center', 700); for (let i = 0; i < miniGame.total; i += 1) circle(ctx, width / 2 - 28 + i * 28, 173, 7, i < miniGame.presses ? '#ffe29a' : 'rgba(255,255,255,.2)'); }

export function drawGame(ctx, width, height, world, cameraX, particles, currentToast, muted, shakeX = 0, shakeY = 0, look) {
  const phase = dayPhase(world.player.x, world.def.gateX); backdrop(ctx, width, height, world.def, cameraX, phase, world.elapsed);
  ctx.save(); ctx.translate(-Math.round(cameraX) + shakeX, shakeY); worldDecor(ctx, world, cameraX, phase, world.elapsed); ground(ctx, world, world.elapsed, phase);
  for (const item of world.collectibles) if (!item.collected) collectible(ctx, item, world, world.elapsed); for (const item of world.bonusItems) if (!item.collected) bonus(ctx, item, world.elapsed); special(ctx, world, world.elapsed); npc(ctx, world, world.elapsed); for (const o of world.obstacles) if (!o.hit) obstacle(ctx, o, world.def, phase, world.elapsed); gate(ctx, world, phase, world.elapsed);
  for (const p of particles) { ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1); ctx.fillStyle = p.color; if (p.shape === 'star') { starPath(ctx, p.x, p.y, p.size, p.size * .38, 4); ctx.fill(); } else fillRounded(ctx, p.x, p.y, p.size, p.size, p.size * .35, p.color); } ctx.globalAlpha = 1;
  const state = world.player.action || (world.player.onGround ? (Math.abs(world.player.vx) > 30 ? 'running' : 'idle') : 'jumping'); drawCharacter(ctx, world.player.x + world.player.w / 2, world.player.y + world.player.h, 1, world.characterId, state, world.elapsed, world.player.facing); ctx.restore();
  hud(ctx, width, height, world, phase, muted, look); prompt(ctx, world.prompt, width, height); if (world.miniGame) mini(ctx, width, world.miniGame); toast(ctx, currentToast, width);
}

export function drawEndingGlow(ctx, width, height, t, perfect) { ctx.fillStyle = perfect ? 'rgba(23, 12, 54, .26)' : 'rgba(23, 20, 59, .38)'; ctx.fillRect(0, 0, width, height); ctx.globalAlpha = .25 + Math.sin(t * 2) * .05; circle(ctx, width / 2, height * .42, 128, perfect ? '#ff9bca' : '#9bb6e9'); ctx.globalAlpha = 1; for (let i = 0; i < 14; i += 1) { const x = (i * 83 + Math.sin(t * 1.5 + i) * 18) % width; const y = (i * 47 + t * (12 + i % 4)) % height; starPath(ctx, x, y, i % 3 === 0 ? 4 : 2, 1, 4); ctx.fillStyle = perfect ? '#fff0a1' : '#d9ebff'; ctx.fill(); } }
