const Fuse = require('fuse.js');
const { loadAllUnits } = require('./unitLoader');

const allUnits = loadAllUnits();

const substitutions = {
  csm: 'chaos space marines',
  termie: 'terminator',
  sisters: 'adepta sororitas',
  sos: 'sisters of silence',
  custodes: 'adeptus custodes',
  sm: 'space marines',
  asm: 'adepta sororitas',
  dkok: 'death korps of krieg',
  tsons: 'thousand sons',
  dg: 'death guard',
  gsc: 'genestealer cults',
  nids: 'tyranids',
  necrons: 'necrons',
  eldar: 'aeldari',
  de: 'drukhari',
  we: 'world eaters',
  ts: 'thousand sons'
};

const factionAbbreviations = {
  sm: 'space marines',
  ac: 'adeptus custodes',
  csm: 'chaos space marines',
  dg: 'death guard',
  ne: 'necrons',
  orks: 'orks',
  gsc: 'genestealer cults',
  tyr: 'tyranids',
  ik: 'imperial knights',
  admech:'adeptus mechanicus',
  tsons: 'thousand sons',
  de: 'drukhari',
  cw: 'craftworlds',
  har: 'harlequins',
  or: 'orks',
  nids: 'tyranids',
  tau: 'tau empire',
  sob: 'adepta sororitas',
  sisters: 'adepta sororitas',
  aeldari: 'aeldari',
  cd: 'chaos daemons',
  ck: 'chaos knights',
  ig: 'astra militarum',
  ad: 'adeptus mechanicus',
  we: 'world eaters',
  lov: 'Leagues of Votann',
  gk: 'grey knights',
  custodes: 'adeptus custodes',
  astartes: 'space marines',
  ia: 'imperial agents',
  agents: 'imperial agents',
  ec: 'emperors children',
  necrons: 'necrons',
  crons: 'necrons',
  drukhari: 'drukhari',
  harlequins: 'harlequins',


};


function preprocessQuery(query) {
  return query
    .split(' ')
    .map(word => substitutions[word.toLowerCase()] || word)
    .join(' ');
}

const fuseOptions = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'faction', weight: 0.3 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

const fuse = new Fuse(allUnits, fuseOptions);

const characterKeywords = ['captain', 'lord', 'librarian', 'sorceror', 'chaplain'];

function searchUnits(query) {
  const tokens = query.trim().split(/\s+/);
  let factionAbbreviation = null;
  let unitQuery = query;

  // Check if the first token is a known faction abbreviation
  const possibleAbbreviation = tokens[0].toLowerCase();
  if (factionAbbreviations[possibleAbbreviation]) {
    factionAbbreviation = factionAbbreviations[possibleAbbreviation];
    unitQuery = tokens.slice(1).join(' '); // remove the faction part
  }

  const normalizedQuery = preprocessQuery(unitQuery);
  const queryTokens = normalizedQuery.split(' ').map(t => t.toLowerCase()).filter(Boolean);

  // Filter units to faction if abbreviation specified, else all units
  const unitsToSearch = factionAbbreviation
    ? allUnits.filter(unit => 
        unit.faction.some(f => f.toLowerCase() === factionAbbreviation.toLowerCase())
      )
    : allUnits;

  // Create a new Fuse instance scoped to filtered units
  const fuse = new Fuse(unitsToSearch, fuseOptions);

  const results = fuse.search(normalizedQuery);
  if (results.length === 0) return [];

  const queryHasCharKeyword = characterKeywords.some(kw => queryTokens.includes(kw));
  const queryFactionKeywords = Object.values(substitutions).filter(fk =>
    queryTokens.includes(fk.toLowerCase())
  );

  function scoreUnit(unit) {
    const name = unit.name.toLowerCase();
    const factionList = unit.faction.map(f => f.toLowerCase());

    const tokenMatches = queryTokens.filter(t => name.includes(t)).length;
    const phraseMatch = name.includes(queryTokens.join(' ')) ? 3 : 0;
    const charPenalty =
      !queryHasCharKeyword && characterKeywords.some(kw => name.includes(kw)) ? 5 : 0;

    // Since units are filtered to faction, no penalty for faction mismatch needed
    const exactMatchBonus = name === normalizedQuery.toLowerCase() ? 10 : 0;

    return tokenMatches + phraseMatch - charPenalty + exactMatchBonus;
  }

  const scoredResults = results.map(r => ({
    ...r,
    customScore: scoreUnit(r.item)
  }));

  scoredResults.sort((a, b) => b.customScore - a.customScore);

  return scoredResults;
}



module.exports = { searchUnits, factionAbbreviations };






