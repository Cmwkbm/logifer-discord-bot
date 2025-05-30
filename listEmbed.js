function createCondensedEmbed(parsed) {
  // Helper: remove points and trailing info from unit name for grouping
  function normalizeName(name) {
    return name.replace(/\s*\(.*?\)/, "").trim();
  }

  // Split characters and units (including allies)
  const characters = [];
  const unitMap = {}; // name → count

  parsed.units.forEach(unit => {
    const isCharacter = unit.name.startsWith("Char");

    if (isCharacter) {
      // Extract character name (without CharX: prefix and points)
      let charName = unit.name.replace(/^Char\d+:\s*/, "");
      charName = charName.replace(/\s*\(.*?\)/, "").trim();

      // Get enhancements as a string e.g. "Praesidius, Superior Creation"
      const enhancements = unit.details
        .filter(d => d.startsWith("Enhancement:"))
        .map(d => d.replace("Enhancement: ", ""))
        .join(", ");

      const displayName = enhancements ? `${charName} (${enhancements})` : charName;
      characters.push(displayName);
    } else {
      // Non-character units: group by normalized name
      const baseName = normalizeName(unit.name);
      unitMap[baseName] = (unitMap[baseName] || 0) + 1;
    }
  });

  // Format unit lines like "5x Custodian Guard"
  const unitLines = Object.entries(unitMap).map(([name, count]) => {
    return `${count}x ${name}`;
  });

  // Compose the embed
  const embed = {
    title: `${parsed.faction} - ${parsed.detachment} (${parsed.points})`,
    color: 0xffa500,
    fields: []
  };

  if (characters.length) {
    embed.fields.push({
      name: "Characters",
      value: characters.join("\n"),
      inline: false
    });
  }

  if (unitLines.length) {
    embed.fields.push({
      name: "Units",
      value: unitLines.join("\n"),
      inline: false
    });
  }

  // Note: No separate Allies field, allies go into chars/units

  return embed;
}

module.exports = { createCondensedEmbed };

