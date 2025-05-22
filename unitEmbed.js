const { EmbedBuilder } = require('discord.js');

function createUnitEmbed(unit, scrapedData) {
  const embed = new EmbedBuilder()
    .setTitle(unit.name || 'Unknown Unit')
    .setColor(0x0099ff);

  // Only set URL if unit.url is a non-empty string
  if (unit.url && unit.url.trim() !== '') {
    embed.setURL(unit.url);
  }

  if (!scrapedData) {
    // fallback if scraping failed or returned nothing
    embed.addFields(
      
      { name: 'Info', value: 'No scraped data available.', inline: false }
    );
    return embed;
  }

embed.addFields(
  { name: 'Movement', value: scrapedData.movement || 'N/A', inline: true },
  { name: 'Toughness', value: scrapedData.toughness || 'N/A', inline: true },
  { name: 'Save', value: scrapedData.save || 'N/A', inline: true },
  { name: 'Wounds', value: scrapedData.wounds || 'N/A', inline: true },
  { name: 'Leadership', value: scrapedData.leadership || 'N/A', inline: true },
  { name: 'Objective Control', value: scrapedData.oc || 'N/A', inline: true }
);

if (scrapedData.invulnerableSave) {
  embed.addFields({ name: 'Invulnerable Save', value: scrapedData.invulnerableSave, inline: true });
}


  if (scrapedData.points) {
    embed.addFields({ name: 'Points', value: scrapedData.points, inline: true });
  }

  return embed;
}

module.exports = { createUnitEmbed };
