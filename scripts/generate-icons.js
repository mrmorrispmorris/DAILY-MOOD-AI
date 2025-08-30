const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="url(#gradient)"/>
  <text x="256" y="320" font-family="Arial" font-size="200" text-anchor="middle" fill="white">🧠</text>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6"/>
      <stop offset="100%" style="stop-color:#EC4899"/>
    </linearGradient>
  </defs>
</svg>
`;

// Save SVG
fs.writeFileSync(path.join(__dirname, '../public/icon.svg'), svgIcon);

console.log('✅ Icon generated at public/icon.svg');
console.log('📝 Note: For production, replace with professional icons');
