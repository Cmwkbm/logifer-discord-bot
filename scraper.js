const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Change this URL to the faction datasheets page you want to scrape
const factionDatasheetsUrl = 'https://wahapedia.ru/wh40k10ed/factions/space-marines/datasheets.html';

// Manually set your faction aliases here as an array
const factionAliases = ['Space marines', 'Adeptus Astartes', 'Marines'];

// Base URL to reconstruct full unit page URLs
const baseUrl = factionDatasheetsUrl.replace(/datasheets\.html$/, '');

async function scrapeUnits() {
  try {
    const res = await fetch(factionDatasheetsUrl);
    const html = await res.text();

    const $ = cheerio.load(html);

    const units = [];

    // Wahapedia uses a consistent structure: anchors in the table of contents at the top
    // Adjust selector if needed based on actual page HTML structure
    $('a').each((_, el) => {
      const href = $(el).attr('href');

      // Only process anchors that are internal anchors to datasheets on the same page
      // i.e., href starts with 'datasheets.html#' or just '#'
      if (href && (href.startsWith('datasheets.html#') || href.startsWith('#'))) {
        // Extract unit name from anchor text
        const name = $(el).text().trim();

        // Construct full URL by replacing datasheets.html# with empty string to get unit page
        let unitPagePath = href.replace('datasheets.html#', '').replace('#', '');
        const fullUrl = baseUrl + unitPagePath;

        units.push({
          name,
          url: fullUrl,
          faction: factionAliases,
        });
      }
    });
// Remove duplicates by URL
const uniqueUnits = units.filter((unit, index, self) =>
  index === self.findIndex(u => u.name === unit.name)
);

return uniqueUnits;


  } catch (err) {
    console.error('Error scraping units:', err);
    return [];
  }
}

// Run scraper and output JSON to console (you can redirect this to a file)
scrapeUnits().then(units => {
  console.log(JSON.stringify(units, null, 2));
});
