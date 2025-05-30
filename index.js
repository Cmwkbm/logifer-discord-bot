require('./keepAlive');
require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require('discord.js');
const { searchUnits } = require('./unitSearch');
const { scrapeUnitData } = require('./unitScraper');
const { createUnitEmbed } = require('./unitEmbed');
const { parseList } = require('./listParser');
const { createCondensedEmbed } = require('./listEmbed');
const crypto = require('crypto');
const { storeList, getList } = require('./listCache'); // renamed here


const factionAbbreviations = require('./unitSearch').factionAbbreviations; // Required for !whhelp factions

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildPresences,
  ],
    partials: [Partials.Channel] // Required to receive DMs
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  client.user.setPresence({
    activities: [{ name: 'for !wh help', type: 3 }], // 3 = WATCHING
    status: 'online',
  });

  console.log('Presence set.');
});






client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  if (content.toLowerCase().startsWith('!whlist ')) {
    const arg = message.content.slice(8).trim();

    if (message.channel.type === 'DM') {
      if (!arg) {
        return message.channel.send('⚠️ Please paste your full army list text after `!whlist`.');
      }
      try {
        const parsed = parseList(arg);
        if (!parsed || !parsed.units || parsed.units.length === 0) {
          return message.channel.send('❌ Could not parse a valid army list. Please check your formatting.');
        }
        const embed = createCondensedEmbed(parsed);

        const token = crypto.randomBytes(4).toString('hex');

        storeList(token, parsed);

        await message.channel.send({ embeds: [embed] });
        await message.channel.send(`✅ Your list has been saved! Use this token in public channels:\n\`!whlist ${token}\``);
      } catch (err) {
        console.error('Error parsing list:', err);
        return message.channel.send('❌ Error processing your army list. Please check your formatting.');
      }
      return;
    }

    // Public channel — treat arg as token
    try {
      const cachedList = getList(arg);
      if (!cachedList) {
        return message.channel.send(`❌ No saved list found for token: \`${arg}\`.`);
      }
      const embed = createCondensedEmbed(cachedList);
      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('Error retrieving cached list:', err);
      message.channel.send('❌ There was an error retrieving the cached list.');
    }
    return;
  }
  if (message.author.bot) return;


  // === Handle !whhelp and subcommands ===
  // === Handle !whhelp and !wh help ===
  if (content.startsWith('!whhelp') || content.startsWith('!wh help') || content.startsWith('!logifer help')) {
    const args = content
      .replace(/^!whhelp|^!wh help/, '') // Remove either command prefix
      .trim()
      .split(/\s+/);

    if (args[0] === 'factions') {
      const factionList = Object.entries(factionAbbreviations)
        .map(([abbr, full]) => `\`${abbr}\` → ${full}`)
        .sort()
        .join('\n');

      const embed = new EmbedBuilder()
        .setTitle('Supported Faction Abbreviations')
        .setColor(0x00bfff)
        .setDescription(factionList)
        .setFooter({ text: 'Use these with the !wh command for best results.' });

      return message.author.send({ embeds: [embed] }).catch(() => {
        message.channel.send('❌ I couldn’t DM you. Do you have DMs disabled?');
      });
    }

    // Default help message
  const helpEmbed = new EmbedBuilder()
  .setTitle('Logifer Bot — Warhammer Unit Search')
  .setColor(0x00bfff)
  .setDescription(
    `This bot currently supports embedded unit searches from Wahapedia and Army List embedding.\n\n` +
    `Use the !wh command to search Wahapedia for Warhammer 40K units.\n\n` +
    `**Basic Syntax:** \`!wh [faction abbreviation] [unit name]\`\n` +
    `🔹 Example: \`!wh sm terminators\` → Space Marine Terminators\n\n` +
    `Colloquial names like \`termie\`, \`custodes\`, or \`csm\` are supported.\n\n` +
    `➡️ Type \`!whhelp factions\` or \`!wh help factions\` to see supported faction abbreviations.\n` +
    `ℹ️ Any message starting with \`!wh \` will be treated as a unit search.\n\n` +
    `For army list embedding, please retrieve your army list link from New Recruit.\n` +
    `Once you have your list, copy the full text of the list in the default format.\n` +
    `You can then either paste the list into a public channel with the command \`!whlist <list>\`, or paste it here in DMs with me.\n\n` +
    `🔹 If used in a **public channel**, the bot will delete your message and replace it with a concise, formatted embed of your list.\n` +
    `🔹 If used in **DMs**, the bot will reply with a concise embed and a token you can use later in public.\n\n` +
    `➡️ To share a DM-submitted list in a public channel, type \`!whlist <token>\` — the bot will embed it for you. Tokens are saved indefinitely.`
  )
  .setFooter({ text: 'If you have any questions, DM saintmikal' });

 

    return message.author.send({ embeds: [helpEmbed] }).then(() => {
      message.react('📬');
    }).catch(() => {
      message.channel.send('❌ I couldn’t DM you. Do you have DMs disabled?');
    });
  }


  // === Handle !wh unit search ===
  if (content.startsWith('!wh ')) {
    const query = message.content.slice(4).trim();

    if (!query) {
      message.channel.send("⚠️ Please provide a unit name after '!wh'. Enter `!whhelp` for help.");
      return;
    }

    try {
      const results = searchUnits(query);
      if (results.length === 0) {
        message.channel.send(`❌ No results found for: "${query}"`);
        return;
      }

      const bestMatch = results[0].item;
// Helper to timeout slow requests
const timeout = (ms) => new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Timeout')), ms)
);

let scrapedData;
try {
  // Set timeout for Wahapedia scrape (e.g., 10 seconds)
  scrapedData = await Promise.race([
    scrapeUnitData(bestMatch.url),
    timeout(10000) // 10 seconds
  ]);
} catch (err) {
  console.error('Timeout or scrape error:', err);
  return message.channel.send(
    '❄️ Wahapedia appears to be experiencing the effects of a Siberian Winter. Please try again in a minute.'
  );
}

// Optional: check if scrape returned garbage
const isBadScrape = Object.values(scrapedData || {}).every(
  val => val === 'N/A' || val == null
);

if (isBadScrape) {
  console.warn('Bad scrape detected (all N/A):', scrapedData);
  return message.channel.send(
    '🥶 Wahapedia responded, but only with frozen scraps of data. Try again shortly.'
  );
}


      const embed = await createUnitEmbed(bestMatch, scrapedData);
      if (embed) {
        await message.channel.send({ embeds: [embed] });
      } else {
        message.channel.send(`**[${bestMatch.name}](${bestMatch.url})**`);
      }
    } catch (error) {
      console.error('Error creating embed:', error);
      message.channel.send(`❌ Error while processing: ${error.message}`);
    }
  }
});

console.log("Token is:", token);
client.login(token);

