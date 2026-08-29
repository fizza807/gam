import { CHARACTERS } from './game-data.js';

export function rounded(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w * .5, h * .5);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function fillRounded(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  rounded(ctx, x, y, w, h, r);
  ctx.fill();
}

export function strokeRounded(ctx, x, y, w, h, r, color, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  rounded(ctx, x, y, w, h, r);
  ctx.stroke();
}

export function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function line(ctx, points, color, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
  ctx.stroke();
}

export function starPath(ctx, x, y, outer, inner, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (Math.PI * i) / points;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function text(ctx, value, x, y, size, color, align = 'left', weight = 700) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

export function drawTitleBackdrop(ctx, width, height, t) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#171348'); gradient.addColorStop(.52, '#41276e'); gradient.addColorStop(1, '#d56e9a');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = .2;
  circle(ctx, width * .76, height * .17, 112 + Math.sin(t * .35) * 5, '#f0c8ff');
  circle(ctx, width * .84, height * .84, 146, '#ff9bc9');
  circle(ctx, width * .16, height * .84, 90, '#70d9df');
  ctx.globalAlpha = 1;
  for (let i = 0; i < 7; i += 1) {
    const x = ((i * 139 + t * (7 + i)) % (width + 180)) - 90;
    const y = 45 + ((i * 53) % 145) + Math.sin(t * .45 + i) * 5;
    ctx.globalAlpha = .1 + (i % 3) * .04;
    circle(ctx, x, y, 18 + (i % 3) * 8, '#fff3d1'); circle(ctx, x + 20, y + 5, 13 + (i % 2) * 6, '#fff3d1');
    ctx.globalAlpha = 1;
  }
  for (let i = 0; i < 30; i += 1) {
    const x = (i * 97 + Math.sin(t * .2 + i) * 28) % width;
    const y = (i * 47 + t * (3 + i % 4)) % height;
    const size = i % 4 === 0 ? 2.8 : 1.2;
    ctx.globalAlpha = .25 + (i % 4) * .12;
    starPath(ctx, x, y, size * 2.4, size * .65, 4); ctx.fillStyle = i % 3 === 0 ? '#ffe7a0' : '#f9ddff'; ctx.fill();
  }
  ctx.globalAlpha = 1;
  const haze = ctx.createLinearGradient(0, height * .52, 0, height);
  haze.addColorStop(0, 'rgba(14, 10, 53, 0)'); haze.addColorStop(1, 'rgba(14, 10, 53, .34)');
  ctx.fillStyle = haze; ctx.fillRect(0, height * .52, width, height * .48);
}

export function drawCharacterSelectScene(ctx, width, height, t, selected) {
  drawTitleBackdrop(ctx, width, height, t);
  ctx.globalAlpha = .23; circle(ctx, 164, 215, 100, '#ff8ac5'); circle(ctx, 478, 215, 100, '#64e0c7'); ctx.globalAlpha = 1;
  drawCharacter(ctx, 164, height - 46, 1.42, 'luna', selected === 'luna' ? 'celebrating' : 'idle', t, 1);
  drawCharacter(ctx, 478, height - 46, 1.42, 'zara', selected === 'zara' ? 'celebrating' : 'idle', t, 1);
  ctx.globalAlpha = .42;
  text(ctx, 'CREATIVE SPIRIT', 164, 55, 10, '#ffe8fa', 'center', 900); text(ctx, 'BOLD EXPLORER', 478, 55, 10, '#dcfff4', 'center', 900);
  ctx.globalAlpha = 1;
}

export function drawWorldSelectScene(ctx, width, height, t, selected) {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#24205a'); sky.addColorStop(1, '#151334'); ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
  const portals = [
    { id: 'enchanted', x: 105, color: '#d88bff', color2: '#ffb1cb' },
    { id: 'beach', x: 320, color: '#72d8ef', color2: '#ffda8d' },
    { id: 'forest', x: 535, color: '#70dba7', color2: '#b7e88f' }
  ];
  for (const portal of portals) {
    const pulse = selected === portal.id ? 5 + Math.sin(t * 3) * 2 : Math.sin(t * 1.5 + portal.x) * 2;
    ctx.globalAlpha = selected === portal.id ? .27 : .13; circle(ctx, portal.x, 173, 80 + pulse, portal.color);
    ctx.globalAlpha = .12; circle(ctx, portal.x, 173, 53 + pulse, portal.color2); ctx.globalAlpha = 1;
    ctx.strokeStyle = selected === portal.id ? '#fff0a7' : 'rgba(255,255,255,.25)'; ctx.lineWidth = selected === portal.id ? 3 : 1;
    ctx.beginPath(); ctx.arc(portal.x, 173, 59 + pulse, 0, Math.PI * 2); ctx.stroke();
  }
  for (let i = 0; i < 20; i += 1) {
    const x = (i * 77 + t * (2 + i % 2)) % width; const y = 25 + (i * 31) % 115;
    ctx.globalAlpha = .2 + (i % 3) * .08; starPath(ctx, x, y, i % 4 === 0 ? 3 : 1.4, .6, 4); ctx.fillStyle = '#fff0a7'; ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawCharacter(ctx, x, baseY, scale, characterId, state, t, facing = 1) {
  const c = CHARACTERS[characterId];
  const running = state === 'running'; const jumping = state === 'jumping'; const collecting = state === 'collecting';
  const interacting = state === 'interacting'; const recovering = state === 'recovering'; const celebrating = state === 'celebrating';
  const stride = running ? Math.sin(t * 14) : jumping ? .18 : 0; const bob = running ? Math.abs(Math.sin(t * 14)) * -2 : 0;
  ctx.save(); ctx.translate(x, baseY + bob); ctx.scale(facing * scale, scale);
  ctx.globalAlpha = .18; ctx.beginPath(); ctx.ellipse(0, 3, 18, 5, 0, 0, Math.PI * 2); ctx.fillStyle = '#211a4f'; ctx.fill(); ctx.globalAlpha = 1;
  const legA = celebrating ? -.5 : stride * .5; const legB = celebrating ? .5 : -stride * .5;
  line(ctx, [-7, -20, -9 + legA * 7, -5, -13 + legA * 9, 2], '#4d3c69', 7); line(ctx, [7, -20, 9 + legB * 7, -5, 13 + legB * 9, 2], '#4d3c69', 7);
  line(ctx, [-16 + legA * 9, 2, -7 + legA * 9, 2], '#fff0f1', 5); line(ctx, [7 + legB * 9, 2, 17 + legB * 9, 2], '#fff0f1', 5);
  if (characterId === 'luna') {
    ctx.fillStyle = c.outfit; ctx.beginPath(); ctx.moveTo(-14, -48); ctx.lineTo(14, -48); ctx.lineTo(22, -19); ctx.quadraticCurveTo(0, -11, -22, -19); ctx.closePath(); ctx.fill();
    fillRounded(ctx, -13, -54, 26, 20, 7, c.outfitLight); line(ctx, [-10, -37, 10, -37], '#fff0c4', 2);
  } else {
    fillRounded(ctx, -14, -51, 28, 30, 7, c.outfit); fillRounded(ctx, -17, -23, 15, 9, 3, c.outfitLight); fillRounded(ctx, 2, -23, 15, 9, 3, c.outfitLight);
    line(ctx, [-9, -48, -5, -23], c.accent, 3); line(ctx, [9, -48, 5, -23], c.accent, 3);
  }
  const armY = -43;
  if (celebrating) { line(ctx, [-13, armY, -25, armY - 18, -20, armY - 26], c.skin, 6); line(ctx, [13, armY, 25, armY - 18, 20, armY - 26], c.skin, 6); }
  else if (collecting || interacting) { line(ctx, [-13, armY, -22, armY + 5, -30, armY - 2], c.skin, 6); line(ctx, [13, armY, 24, armY - 3, 31, armY - 10], c.skin, 6); }
  else if (recovering) { line(ctx, [-13, armY, -27, armY - 4], c.skin, 6); line(ctx, [13, armY, 27, armY + 5], c.skin, 6); }
  else { line(ctx, [-13, armY, -20, armY + 10 + stride * 5], c.skin, 6); line(ctx, [13, armY, 20, armY + 10 - stride * 5], c.skin, 6); }
  circle(ctx, -27, celebrating ? armY - 26 : armY + 5, 4.5, c.skin); circle(ctx, 27, celebrating ? armY - 26 : armY - 10, 4.5, c.skin);
  if (characterId === 'luna') { circle(ctx, -13, -69, 12, c.hair); circle(ctx, 13, -69, 12, c.hair); circle(ctx, -15, -74, 5, c.hairLight); circle(ctx, 15, -74, 5, c.hairLight); }
  else { circle(ctx, 14, -71, 16, c.hair); circle(ctx, -10, -73, 10, c.hairLight); }
  circle(ctx, 0, -70, 17, c.skin); ctx.fillStyle = c.hair; ctx.beginPath(); ctx.arc(0, -75, 17, Math.PI, Math.PI * 2); ctx.lineTo(15, -68); ctx.quadraticCurveTo(9, -77, 5, -80); ctx.quadraticCurveTo(-3, -73, -15, -68); ctx.closePath(); ctx.fill();
  if (characterId === 'luna') { circle(ctx, 11, -81, 3.5, c.accent); starPath(ctx, 11, -81, 3.2, 1.3, 5); ctx.fillStyle = '#fff1a5'; ctx.fill(); }
  else { line(ctx, [14, -84, 23, -90], c.accent, 3); line(ctx, [17, -82, 25, -82], c.accent, 3); }
  circle(ctx, -6, -70, 1.8, '#443052'); circle(ctx, 6, -70, 1.8, '#443052');
  ctx.strokeStyle = '#a14e6d'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -65, 5, .2, Math.PI - .2); ctx.stroke();
  if (jumping) { ctx.globalAlpha = .45; starPath(ctx, -25, -18, 3, 1.2, 4); ctx.fillStyle = '#fff0aa'; ctx.fill(); starPath(ctx, 26, -26, 3, 1.2, 4); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.restore();
}
