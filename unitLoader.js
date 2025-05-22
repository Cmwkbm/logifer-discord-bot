const fs = require('fs');
const path = require('path');

function loadAllUnits() {
  const units = [];
  const folderPath = path.join(__dirname, 'factions');

  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    if (file.endsWith('.json')) {
      const data = fs.readFileSync(path.join(folderPath, file), 'utf-8');
      const factionUnits = JSON.parse(data);
      units.push(...factionUnits);
    }
  }

  return units;
}

module.exports = { loadAllUnits };
