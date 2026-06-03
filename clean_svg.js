const fs = require('fs');
let svg = fs.readFileSync('Bertin/world_map.svg', 'utf8');
svg = svg.replace(/<rect[^>]+>/gi, '');
svg = svg.replace(/fill="[^"]+"/g, '');
svg = svg.replace(/style="[^"]+"/g, '');
svg = svg.replace(/<svg([^>]+)>/i, '<svg$1 style="fill: none; stroke: rgba(255,255,255,0.15); stroke-width: 0.5px;">');
fs.writeFileSync('Bertin/world_map_clean.svg', svg);
console.log('Done');
