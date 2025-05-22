const cheerio = require('cheerio');
const fetch = require('node-fetch');

async function scrapeUnitData(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const scrapedStats = {};
    
    // Extract unit stats
    $('.dsCharWrap').each((i, el) => {
      const statName = $(el).find('.dsCharName').text().trim();
      const statValue = $(el).find('.dsCharValue').text().trim();

      switch (statName) {
        case 'M': scrapedStats.movement = statValue; break;
        case 'T': scrapedStats.toughness = statValue; break;
        case 'Sv': scrapedStats.save = statValue; break;
        case 'W': scrapedStats.wounds = statValue; break;
        case 'Ld': scrapedStats.leadership = statValue; break;
        case 'OC': scrapedStats.oc = statValue; break;
      }
    });

    // Extract invulnerable save
    const invulSave = $('.dsCharInvulValue').first().text().trim();
    if (invulSave) {
      scrapedStats.invulnerableSave = invulSave;
    }

    // Extract points
    const pointsRows = $('.dsAbility table tr');
    const pointsArray = [];

    pointsRows.each((i, row) => {
      const sizeText = $(row).find('td').first().text().trim();
      const pointsText = $(row).find('.PriceTag').first().text().trim();

      if (sizeText && pointsText) {
        pointsArray.push(`${sizeText}: ${pointsText} pts`);
      }
    });

    if (pointsArray.length > 0) {
      scrapedStats.points = pointsArray.join('\n');
    }

    return scrapedStats;
  } catch (error) {
    console.error('Error scraping unit data:', error);
    return null;
  }
}

module.exports = { scrapeUnitData };

