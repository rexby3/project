// Generate a 1024x1024 PNG icon and a 2732x2732 splash from scratch using sharp
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SIZE = 1024;
const SPLASH_SIZE = 2732;
const BG = '#0B0B0F';
const PRIMARY = '#7C5CFF';
const PRIMARY_END = '#3D2BFF';

// Icon: rounded square gradient with letter "E"
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${PRIMARY}"/>
      <stop offset="100%" stop-color="${PRIMARY_END}"/>
    </linearGradient>
  </defs>
  <rect width="${ICON_SIZE}" height="${ICON_SIZE}" rx="0" ry="0" fill="url(#g)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="-apple-system, Helvetica, Arial, sans-serif"
        font-size="640" font-weight="800" fill="#ffffff" letter-spacing="-20">E</text>
</svg>`;

// Splash: dark background, centered icon-style logo (smaller)
const LOGO_SIZE = 512;
const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SPLASH_SIZE}" height="${SPLASH_SIZE}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${PRIMARY}"/>
      <stop offset="100%" stop-color="${PRIMARY_END}"/>
    </linearGradient>
  </defs>
  <rect width="${SPLASH_SIZE}" height="${SPLASH_SIZE}" fill="${BG}"/>
  <rect x="${(SPLASH_SIZE - LOGO_SIZE) / 2}" y="${(SPLASH_SIZE - LOGO_SIZE) / 2}"
        width="${LOGO_SIZE}" height="${LOGO_SIZE}" rx="115" ry="115" fill="url(#g)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="-apple-system, Helvetica, Arial, sans-serif"
        font-size="320" font-weight="800" fill="#ffffff" letter-spacing="-10">E</text>
</svg>`;

(async () => {
  await sharp(Buffer.from(iconSvg)).png().toFile('resources/icon.png');
  await sharp(Buffer.from(iconSvg))
    .composite([{ input: Buffer.from(iconSvg), gravity: 'center' }])
    .png().toFile('resources/icon-foreground.png');

  // Foreground for adaptive icon needs transparent BG with logo centered
  const fgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}">
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
          font-family="-apple-system, Helvetica, Arial, sans-serif"
          font-size="500" font-weight="800" fill="#ffffff" letter-spacing="-15">E</text>
  </svg>`;
  await sharp(Buffer.from(fgSvg)).png().toFile('resources/icon-foreground.png');

  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${PRIMARY}"/>
        <stop offset="100%" stop-color="${PRIMARY_END}"/>
      </linearGradient>
    </defs>
    <rect width="${ICON_SIZE}" height="${ICON_SIZE}" fill="url(#g)"/>
  </svg>`;
  await sharp(Buffer.from(bgSvg)).png().toFile('resources/icon-background.png');

  await sharp(Buffer.from(splashSvg)).png().toFile('resources/splash.png');
  await sharp(Buffer.from(splashSvg)).png().toFile('resources/splash-dark.png');

  console.log('OK:');
  for (const f of fs.readdirSync('resources')) console.log(' -', f, fs.statSync(path.join('resources', f)).size, 'bytes');
})().catch(e => { console.error(e); process.exit(1); });
