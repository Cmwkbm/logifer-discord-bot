const { EmbedBuilder } = require('discord.js');

function condenseLines(lines) {
  const counts = {};

  lines.forEach(line => {
    counts[line] = (counts[line] || 0) + 1;
  });

  const condensed = [];
  for (const [line, count] of Object.entries(counts)) {
    if (count > 1) {
      condensed.push(`${count}x ${line}`);
    } else {
      condensed.push(line);
    }
  }
  return condensed;
}

function formatCategory(title, lines) {
  if (lines.length === 0) return null;
  const condensedLines = condenseLines(lines);
  return { name: title, value: condensedLines.join('\n'), inline: false };
}

function createListEmbed(listData) {
  const { characters = [], allies = [], units = [], detachment = 'Unknown Detachment', enhancements = [] } = listData;

  const embed = new EmbedBuilder()
    .setTitle(`Army List - ${detachment}`)
    .setColor('#0099ff')
    .setTimestamp();

  const charField = formatCategory('Characters', characters);
  const allyField = formatCategory('Allied Units', allies);
  const unitField = formatCategory('Units', units);

  if (charField) embed.addFields(charField);
  if (allyField) embed.addFields(allyField);
  if (unitField) embed.addFields(unitField);

  if (enhancements.length > 0) {
    embed.addFields({
      name: 'Enhancements',
      value: enhancements.join('\n'),
      inline: false
    });
  }

  return embed;
}

module.exports = { createListEmbed };

