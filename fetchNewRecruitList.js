const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetch and parse a New Recruit list link
 * @param {string} url - New Recruit army list link
 * @returns {Promise<{ units: string[], characters: string[] }>} Parsed list
 */
async function fetchNewRecruitList(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const parsedUnits = [];
    const parsedCharacters = [];

    // Selectors are based on New Recruit's current layout
    $('.unit-entry').each((_, element) => {
      const name = $(element).find('.unit-name').text().trim();

      if (!name) return;

      // Separate characters from regular units by keyword (simplified check)
      const isCharacter = /captain|lord|champ|commander|inquisitor|assassin|sorcerer|chaplain/i.test(name);

      if (isCharacter) {
        parsedCharacters.push(name);
      } else {
        parsedUnits.push(name);
      }
    });

    return {
      characters: parsedCharacters,
      units: parsedUnits,
    };
  } catch (err) {
    console.error('Failed to fetch or parse New Recruit list:', err.message);
    throw new Error('Could not retrieve or parse the list. Check the link or try again later.');
  }
}

module.exports = { fetchNewRecruitList };