const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function fetchNewRecruitList(url) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  // Find the NR Format block (assume it's inside a <pre> tag)
  const nrFormat = $('pre').text();
  if (!nrFormat) {
    throw new Error('NR Format not found on the page.');
  }

  const lines = nrFormat.split('\n').map(line => line.trim()).filter(Boolean);

  let detachment = '';
  const characters = [];
  const allies = [];
  const units = [];

  let currentSection = 'units'; // Default section

  for (const line of lines) {
    if (line.startsWith('Detachment:')) {
      detachment = line.replace('Detachment:', '').trim();
    } else if (line.startsWith('##Character')) {
      currentSection = 'characters';
    } else if (line.startsWith('##Allied Units')) {
      currentSection = 'allies';
    } else if (line.startsWith('##')) {
      currentSection = 'units'; // Covers all other sections
    } else if (line.match(/^\d+x /)) {
      if (currentSection === 'characters') {
        characters.push(line);
      } else if (currentSection === 'allies') {
        allies.push(line);
      } else {
        units.push(line);
      }
    }
  }

  return {
    detachment,
    characters,
    allies,
    units
  };
}

module.exports = { fetchNewRecruitList2 };

