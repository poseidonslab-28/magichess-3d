// js/data/heroes.js
const HERO_DATA = {
    // ==================== TIER 1 (Cost 1) ====================
    k1: { 
        id:'k1', name:'Valor', cost:1, traits:['knight','human'], color:'#4488cc',
        stats:{hp:6000, atk:50, def:35, spd:0.6, range:1}, mana:{max:70, start:60},
        skill: {
            name: 'Holy Strike',
            type: 'single',
            multiplier: 2.0,
            effect: 'damage',
            vfx: {
                attack: {
                    impact: 'slash',
                    color: 0xffdd44,
                    textType: 'damage'
                },
                skill: {
                    impact: 'slash',
                    color: 0xffdd44,
                    textType: 'damage',
                    extraImpacts: 2,
                    screenShake: 0.3
                }
            }
        }
    },
    m1: { id:'m1', name:'Frost', cost:1, traits:['mage','elf'], emoji:'🧙', color:'#8844cc',
        stats:{hp:4500, atk:40, def:15, spd:0.7, range:3},
        mana:{max:50, start:30},
        skill:{ 
            name:'Glacial Nova', 
            desc:'200% AoE freeze + damage', 
            type:'aoe',               // <-- changed from 'single'
            multiplier:2.0,           // bumped up a bit
            effect:'freeze',          // freeze instead of slow
            aoeRadius: 2.5,           // 🆕 NEW: tells system it's a ground slam
            stunDuration: 1500        // optional: matches your stunTimer
        }
    },
    a1: { id:'a1', name:'Wind', cost:1, traits:['archer','elf'], emoji:'🏹', color:'#44aa44',
        stats:{hp:500, atk:55, def:20, spd:0.8, range:4}, mana:{max:60, start:0},
        skill:{name:'Power Shot', desc:'180% pierce damage', type:'single', multiplier:1.8, effect:'pierce'} },
    t1: { id:'t1', name:'Iron', cost:1, traits:['tank','human'], emoji:'🛡️', color:'#aa8844',
        stats:{hp:800, atk:35, def:50, spd:0.5, range:1}, mana:{max:100, start:0},
        skill:{name:'Fortify', desc:'Gain 300 shield', type:'self', multiplier:0, effect:'shield', value:300} },
    s1: { id:'s1', name:'Luna', cost:1, traits:['support','celestial'], emoji:'🌙', color:'#ffcc44',
        stats:{hp:500, atk:30, def:20, spd:0.6, range:3}, mana:{max:60, start:30},
        skill:{name:'Moonlight', desc:'Heal lowest ally 250 HP', type:'heal', multiplier:0, effect:'heal', value:250} },
    as1: { id:'as1', name:'Shade', cost:1, traits:['assassin','void'], emoji:'🌑', color:'#555577',
        stats:{hp:480, atk:65, def:18, spd:0.9, range:1}, mana:{max:45, start:0},
        skill:{name:'Void Strike', desc:'250% armor pierce', type:'single', multiplier:2.5, effect:'pierce'} },
    w1: { id:'w1', name:'Fang', cost:1, traits:['warrior','beast'], emoji:'🐺', color:'#cc8844',
        stats:{hp:550, atk:60, def:25, spd:0.7, range:1}, mana:{max:55, start:0},
        skill:{name:'Feral Claw', desc:'200% dmg + bleed', type:'single', multiplier:2.0, effect:'bleed', bleedDmg:80} },

    // ==================== TIER 2 (Cost 2) ====================
    k2: { id:'k2', name:'Aurora', cost:2, traits:['knight','elf'], emoji:'❄️', color:'#66aadd',
        stats:{hp:700, atk:60, def:40, spd:0.7, range:1}, mana:{max:60, start:0},
        skill:{name:'Frost Blade', desc:'200% dmg + freeze 1s', type:'single', multiplier:2.0, effect:'freeze'} },
    m2: { id:'m2', name:'Ember', cost:2, traits:['mage','demon'], emoji:'🔥', color:'#cc4444',
        stats:{hp:550, atk:45, def:15, spd:0.7, range:3}, mana:{max:40, start:20},
        skill:{name:'Fireball', desc:'180% AoE damage', type:'aoe', multiplier:1.8, effect:'burn', burnDmg:60} },
    a2: { id:'a2', name:'Storm', cost:2, traits:['archer','human'], emoji:'⚡', color:'#44cc88',
        stats:{hp:600, atk:65, def:25, spd:0.9, range:4}, mana:{max:50, start:0},
        skill:{name:'Lightning Arrow', desc:'200% dmg, chains 3x', type:'chain', multiplier:2.0, effect:'chain', chains:3} },
    t2: { id:'t2', name:'Drake', cost:2, traits:['tank','dragon'], emoji:'🐉', color:'#cc6644',
        stats:{hp:900, atk:40, def:55, spd:0.5, range:1}, mana:{max:90, start:0},
        skill:{name:'Dragon Scales', desc:'Reflect 30% for 3s', type:'self', multiplier:0, effect:'reflect', value:30} },
    as2: { id:'as2', name:'Blight', cost:2, traits:['assassin','undead'], emoji:'💀', color:'#446644',
        stats:{hp:580, atk:75, def:20, spd:1.0, range:1}, mana:{max:40, start:0},
        skill:{name:'Death Mark', desc:'300% dmg to lowest HP', type:'execute', multiplier:3.0, effect:'damage'} },
    w2: { id:'w2', name:'Blade', cost:2, traits:['warrior','human'], emoji:'🗡️', color:'#888844',
        stats:{hp:650, atk:70, def:30, spd:0.75, range:1}, mana:{max:50, start:0},
        skill:{name:'Blade Storm', desc:'150% AoE spin', type:'aoe', multiplier:1.5, effect:'damage'} },

    // ==================== TIER 3 (Cost 3) ====================
    k3: { id:'k3', name:'Drakon', cost:3, traits:['knight','dragon'], emoji:'🐲', color:'#ff8844',
        stats:{hp:850, atk:70, def:50, spd:0.7, range:1}, mana:{max:50, start:20},
        skill:{name:'Dragon Breath', desc:'200% AoE fire', type:'aoe', multiplier:2.0, effect:'burn', burnDmg:80} },
    m3: { id:'m3', name:'Lich', cost:3, traits:['mage','undead'], emoji:'🧟', color:'#668844',
        stats:{hp:600, atk:55, def:20, spd:0.75, range:3}, mana:{max:35, start:20},
        skill:{name:'Soul Drain', desc:'200% dmg + heal self', type:'single', multiplier:2.0, effect:'lifesteal'} },
    a3: { id:'a3', name:'Talon', cost:3, traits:['archer','beast'], emoji:'🦅', color:'#aa8844',
        stats:{hp:700, atk:75, def:30, spd:1.0, range:4}, mana:{max:45, start:0},
        skill:{name:'Hunting Hawk', desc:'250% dmg + mark', type:'single', multiplier:2.5, effect:'mark'} },
    t3: { id:'t3', name:'Grim', cost:3, traits:['tank','undead'], emoji:'🏰', color:'#555555',
        stats:{hp:1100, atk:45, def:70, spd:0.5, range:1}, mana:{max:100, start:0},
        skill:{name:'Stone Skin', desc:'Gain 500 shield', type:'self', multiplier:0, effect:'shield', value:500} },
    s2: { id:'s2', name:'Sol', cost:3, traits:['support','dragon'], emoji:'☀️', color:'#ffaa00',
        stats:{hp:650, atk:35, def:25, spd:0.65, range:3}, mana:{max:55, start:30},
        skill:{name:'Sun Blessing', desc:'Heal all allies 200 HP', type:'heal', multiplier:0, effect:'heal', value:200} },

    // ==================== TIER 4 (Cost 4) ====================
    k4: { id:'k4', name:'Seraph', cost:4, traits:['knight','celestial'], emoji:'👼', color:'#ffddff',
        stats:{hp:950, atk:80, def:55, spd:0.75, range:1}, mana:{max:45, start:0},
        skill:{name:'Divine Judgment', desc:'300% damage', type:'single', multiplier:3.0, effect:'damage'} },
    as3: { id:'as3', name:'Reaper', cost:4, traits:['assassin','demon'], emoji:'😈', color:'#884444',
        stats:{hp:700, atk:95, def:25, spd:1.1, range:1}, mana:{max:30, start:0},
        skill:{name:'Hellfire', desc:'250% AoE + burn', type:'aoe', multiplier:2.5, effect:'burn', burnDmg:120} },
    m4: { id:'m4', name:'Eldritch', cost:4, traits:['mage','void'], emoji:'🌀', color:'#664488',
        stats:{hp:650, atk:60, def:18, spd:0.8, range:3}, mana:{max:35, start:25},
        skill:{name:'Void Rift', desc:'200% AoE + teleport', type:'aoe', multiplier:2.0, effect:'teleport'} },
    w3: { id:'w3', name:'Dragoon', cost:4, traits:['warrior','dragon'], emoji:'⚔️🐉', color:'#cc6622',
        stats:{hp:800, atk:85, def:40, spd:0.8, range:1}, mana:{max:40, start:15},
        skill:{name:'Dragon Lance', desc:'350% pierce damage', type:'single', multiplier:3.5, effect:'pierce'} },

    // ==================== TIER 5 (Cost 5) ====================
    d1: { id:'d1', name:'Bahamut', cost:5, traits:['dragon','celestial'], emoji:'🌟🐉', color:'#ffdd00',
        stats:{hp:1200, atk:90, def:50, spd:0.8, range:2}, mana:{max:30, start:30},
        skill:{name:'Supernova', desc:'300% AoE all enemies', type:'aoe', multiplier:3.0, effect:'damage'} },
    v1: { id:'v1', name:'Abyss', cost:5, traits:['undead','void'], emoji:'🕳️', color:'#111133',
        stats:{hp:1000, atk:100, def:35, spd:0.9, range:1}, mana:{max:25, start:0},
        skill:{name:'Consume', desc:'400% execute <20% HP', type:'execute', multiplier:4.0, effect:'damage'} }
};

function getHeroesByCost(cost) {
    return Object.values(HERO_DATA).filter(h => h.cost === cost);
}