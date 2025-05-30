const fs = require('fs');
const { parseList } = require('./listParser');
const { createCondensedEmbed } = require('./listEmbed');

// Paste your sample list here as a multi-line string
const sampleList = `
+++++++++++++++++++++++++++++++++++++++++++++++
+ FACTION KEYWORD: Imperium - Adeptus Custodes
+ DETACHMENT: Lions of the Emperor
+ TOTAL ARMY POINTS: 1995pts
+ ALLIED UNITS: Agents of the Imperium
+
+ WARLORD: Char5: Shield-Captain on Dawneagle Jetbike
+ ENHANCEMENT: Praesidius (on Char3: Shield-Captain in Allarus Terminator Armour)
& Superior Creation (on Char4: Shield-Captain in Allarus Terminator Armour)
& Admonimortis (on Char5: Shield-Captain on Dawneagle Jetbike)
+ NUMBER OF UNITS: 14
+ SECONDARY: - Assassination: 7 Characters
+++++++++++++++++++++++++++++++++++++++++++++++

Char1: 1x Blade Champion (120 pts): Vaultswords
Char2: 1x Blade Champion (120 pts): Vaultswords
Char3: 1x Shield-Captain in Allarus Terminator Armour (155 pts): Balistus grenade launcher, Guardian Spear
Enhancement: Praesidius (+25 pts)
Char4: 1x Shield-Captain in Allarus Terminator Armour (155 pts): Balistus grenade launcher, Guardian Spear
Enhancement: Superior Creation (+25 pts)
Char5: 1x Shield-Captain on Dawneagle Jetbike (160 pts): Warlord, Interceptor lance, Vertus hurricane bolter
Enhancement: Admonimortis (+10 pts)

4x Custodian Guard (170 pts)
• 3x Custodian Guard (Sentinel Blade & Praesidium Shield): 3 with Sentinel blade
• 1x Custodian Guard (Vexilla, Praesidium Shield & Misericordia): Vexilla, Misericordia
4x Custodian Guard (170 pts): 4 with Guardian Spear
4x Custodian Guard (170 pts): 4 with Guardian Spear
4x Custodian Guard (170 pts)
• 3x Custodian Guard (Sentinel Blade & Praesidium Shield): 3 with Sentinel blade
• 1x Custodian Guard (Vexilla, Praesidium Shield & Misericordia): Vexilla, Misericordia

4x Custodian Wardens (210 pts)
• 3x Custodian Warden (Guardian Spear): 3 with Guardian Spear
• 1x Custodian Warden: Vexilla, Guardian Spear
4x Witchseekers (50 pts)
• 1x Witchseeker Sister Superior: Close combat weapon, Witchseeker flamer
• 3x Witchseeker: 3 with Close combat weapon, Witchseeker flamer
2x Vertus Praetors (150 pts): 2 with Interceptor lance, Vertus hurricane bolter

Char6: 1x Callidus Assassin (100 pts): Neural shredder, Phase sword and poison blades
Char7: 1x Inquisitor Draxus (95 pts): Dirgesinger, Power fist, Psychic Tempest
`;

const parsed = parseList(sampleList);
console.log("Parsed:", JSON.stringify(parsed, null, 2));

const embed = createCondensedEmbed(parsed);
console.log("Embed:", JSON.stringify(embed, null, 2));
