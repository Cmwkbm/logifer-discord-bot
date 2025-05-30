// listParser.js

/**
 * Parses a raw New Recruit army list text into a structured object
 * @param {string} raw - The raw pasted list text
 * @returns {object} Parsed list data
 */
function parseList(raw) {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const headerLines = [];
  const unitLines = [];
  let inHeader = false;
  let inUnits = false;

  for (const line of lines) {
    if (line.startsWith('+') || line.startsWith('&')) {
      inHeader = true;
      if (!inUnits) headerLines.push(line);
    } else if (line.match(/^\d+x |^Char\d+:|^\u2022|^\•/)) {
      inUnits = true;
      unitLines.push(line);
    } else if (inUnits) {
      unitLines.push(line);
    }
  }

  const headerData = {
    faction: null,
    detachment: null,
    points: null,
    allies: null,
  };

  for (const line of headerLines) {
    const clean = line.replace(/^\+|^&/, '').trim();
    if (clean.startsWith('FACTION KEYWORD:')) headerData.faction = clean.split(':')[1].trim();
    else if (clean.startsWith('DETACHMENT:')) headerData.detachment = clean.split(':')[1].trim();
    else if (clean.startsWith('TOTAL ARMY POINTS:')) headerData.points = clean.split(':')[1].trim();
    else if (clean.startsWith('ALLIED UNITS:')) headerData.allies = clean.split(':')[1].trim();
  }

  const units = [];
  let currentUnit = null;

  for (const line of unitLines) {
    if (line.match(/^Char\d+:|^\d+x /)) {
      if (currentUnit) units.push(currentUnit);
      currentUnit = {
        name: line,
        details: []
      };
    } else if (currentUnit) {
      currentUnit.details.push(line);
    }
  }
  if (currentUnit) units.push(currentUnit);

  return {
    ...headerData,
    units,
  };
}

module.exports = { parseList };
