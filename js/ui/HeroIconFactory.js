/**
 * HeroIconFactory.js
 * Generates dark-fantasy SVG vector hero portraits and skill icons.
 */
const HeroIconFactory = {
    // Rarity Tiers with Multi-stop Gradient Borders & BG Aura
    RARITY_COLORS: {
        1: { border: ['#e2e8f0', '#475569'], glow: 'rgba(226, 232, 240, 0.25)', bg: '#0f172a' }, // Common (Steel)
        2: { border: ['#4ade80', '#15803d'], glow: 'rgba(74, 222, 128, 0.35)', bg: '#022c22' },  // Uncommon (Emerald)
        3: { border: ['#38bdf8', '#1d4ed8'], glow: 'rgba(56, 189, 248, 0.40)', bg: '#0c4a6e' },  // Rare (Sapphire)
        4: { border: ['#c084fc', '#6b21a8'], glow: 'rgba(192, 132, 252, 0.45)', bg: '#3b0764' },  // Epic (Amethyst)
        5: { border: ['#fde047', '#b45309'], glow: 'rgba(253, 224, 71, 0.60)', bg: '#451a03' }   // Legendary (Gold)
    },

    /**
     * Main Portrait Generator
     */
    createPortraitSVG(hero, size = 64) {
        if (!hero) return '';
        const rarity = this.RARITY_COLORS[hero.cost] || this.RARITY_COLORS[1];
        const uid = `p_${hero.id}_${Math.random().toString(36).substring(2, 7)}`;
        const starCount = hero.star || 1;

        return `
        <svg class="hero-portrait-svg" width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <!-- Border Metallic Gradient -->
                <linearGradient id="b_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${rarity.border[0]}"/>
                    <stop offset="50%" stop-color="#ffffff" stop-opacity="0.6"/>
                    <stop offset="100%" stop-color="${rarity.border[1]}"/>
                </linearGradient>

                <!-- Background Aura Gradient -->
                <radialGradient id="a_${uid}" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stop-color="${hero.color}" stop-opacity="0.85"/>
                    <stop offset="65%" stop-color="${rarity.bg}" stop-opacity="0.95"/>
                    <stop offset="100%" stop-color="#030712"/>
                </radialGradient>

                <!-- Shading Glow Filter -->
                <filter id="g_${uid}" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.8" result="blur"/>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                </filter>

                <!-- Gold Star Gradient -->
                <linearGradient id="st_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#ffe066"/>
                    <stop offset="100%" stop-color="#d97706"/>
                </linearGradient>
            </defs>

            <!-- Card Backing & Aura -->
            <rect x="2" y="2" width="96" height="96" rx="14" fill="#030712"/>
            <rect x="6" y="6" width="88" height="88" rx="10" fill="url(#a_${uid})"/>
            
            <!-- Vignette & Grid Backdrop -->
            <circle cx="50" cy="50" r="42" fill="none" stroke="${hero.color}" stroke-opacity="0.2" stroke-width="1" stroke-dasharray="2,4"/>
            <path d="M 12 50 L 88 50 M 50 12 L 50 88" stroke="${hero.color}" stroke-opacity="0.1" stroke-width="1"/>

            <!-- Hero Vector Illustration -->
            <g transform="translate(10, 10) scale(0.8)" filter="url(#g_${uid})">
                ${this.getHeroPortrait(hero.id, hero.color, hero.traits)}
            </g>

            <!-- Outer Metallic Frame -->
            <rect x="4" y="4" width="92" height="92" rx="12" fill="none" stroke="url(#b_${uid})" stroke-width="3.5"/>
            <rect x="7" y="7" width="86" height="86" rx="9" fill="none" stroke="#000000" stroke-opacity="0.6" stroke-width="1.2"/>

            <!-- Corner Studs -->
            <circle cx="8" cy="8" r="2" fill="${rarity.border[0]}"/>
            <circle cx="92" cy="8" r="2" fill="${rarity.border[0]}"/>
            <circle cx="8" cy="92" r="2" fill="${rarity.border[0]}"/>
            <circle cx="92" cy="92" r="2" fill="${rarity.border[0]}"/>

            <!-- Cost Crest Badge -->
            <g transform="translate(70, 70)">
                <polygon points="12,0 24,12 12,24 0,12" fill="#090d16" stroke="url(#b_${uid})" stroke-width="1.5"/>
                <text x="12" y="16" font-family="'Cinzel', Georgia, serif" font-size="11" font-weight="900" fill="${rarity.border[0]}" text-anchor="middle">${hero.cost}</text>
            </g>
            
            <!-- Star Level Rating -->
            <g transform="translate(12, 18)">
                ${Array.from({ length: starCount }).map((_, i) => 
                    `<polygon points="${i*9},0 ${i*9+2},3 ${i*9+6},3 ${i*9+3},5 ${i*9+4},8 ${i*9},6 ${i*9-4},8 ${i*9-3},5 ${i*9-6},3 ${i*9-2},3" fill="url(#st_${uid})"/>`
                ).join('')}
            </g>
        </svg>`;
    },

    /**
     * Skill Icon SVG Generator
     */
    createSkillIconSVG(skill, size = 36) {
        if (!skill) return '';
        const effect = skill.effect || 'damage';
        const uid = `s_${Math.random().toString(36).substring(2, 7)}`;

        return `
        <svg class="skill-icon-svg" width="${size}" height="${size}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="sb_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#2a1a08"/>
                    <stop offset="100%" stop-color="#0a0500"/>
                </linearGradient>
            </defs>
            <circle cx="30" cy="30" r="27" fill="url(#sb_${uid})" stroke="#f5d061" stroke-width="2"/>
            <circle cx="30" cy="30" r="24" fill="none" stroke="#805b0d" stroke-width="1" stroke-dasharray="4,2"/>
            <g transform="translate(10, 10)">
                ${this.getSkillEffectVector(effect)}
            </g>
        </svg>`;
    },

    /**
     * Hero Portrait Router
     */
    getHeroPortrait(heroId, color, traits) {
        const primaryClass = traits ? traits[0] : 'warrior';

        switch(heroId) {
            // Tier 1
            case 'k1': return this.drawValor(color);
            case 'm1': return this.drawFrost(color);
            case 'a1': return this.drawWind(color);
            case 't1': return this.drawIron(color);
            case 's1': return this.drawLuna(color);
            case 'as1': return this.drawShade(color);
            case 'w1': return this.drawFang(color);

            // Tier 2
            case 'k2': return this.drawAurora(color);
            case 'm2': return this.drawEmber(color);
            case 'a2': return this.drawStorm(color);
            case 't2': return this.drawDrake(color);
            case 'as2': return this.drawBlight(color);
            case 'w2': return this.drawBlade(color);

            // Tier 3
            case 'k3': return this.drawDrakon(color);
            case 'm3': return this.drawLich(color);
            case 'a3': return this.drawTalon(color);
            case 't3': return this.drawGrim(color);
            case 's2': return this.drawSol(color);

            // Tier 4
            case 'k4': return this.drawSeraph(color);
            case 'as3': return this.drawReaper(color);
            case 'm4': return this.drawEldritch(color);
            case 'w3': return this.drawDragoon(color);

            // Tier 5
            case 'd1': return this.drawBahamut(color);
            case 'v1': return this.drawAbyss(color);

            default: return this.drawByClass(primaryClass, color);
        }
    },

    // =========================================================================
    // TIER 1 HEROES
    // =========================================================================

    drawValor(color) {
        return `
            <!-- Heavy Steel Helmet -->
            <path d="M 25 20 L 75 20 L 80 48 Q 50 82 20 48 Z" fill="#334155" stroke="#cbd5e1" stroke-width="2"/>
            <path d="M 30 25 L 70 25 L 74 45 Q 50 72 26 45 Z" fill="#1e293b"/>
            <!-- Golden Cross Visor -->
            <path d="M 50 25 L 50 65 M 32 38 L 68 38" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="square"/>
            <path d="M 50 25 L 50 65 M 32 38 L 68 38" stroke="#fef08a" stroke-width="2" stroke-linecap="square"/>
            <!-- Plume -->
            <path d="M 50 20 C 45 -10 15 5 10 25 C 25 15 45 15 50 20 Z" fill="#dc2626"/>
            <!-- Pauldrons -->
            <path d="M 5 50 Q 20 40 25 52 L 15 85 Z M 95 50 Q 80 40 75 52 L 85 85 Z" fill="${color}" stroke="#cbd5e1" stroke-width="1.5"/>
        `;
    },

    drawFrost(color) {
        return `
            <!-- Arcane Elf Hood -->
            <path d="M 50 5 Q 85 10 80 50 Q 50 60 20 50 Q 15 10 50 5 Z" fill="#1e1b4b" stroke="${color}" stroke-width="2"/>
            <!-- Pointed Ears -->
            <path d="M 22 35 L 5 28 L 20 45 Z M 78 35 L 95 28 L 80 45 Z" fill="#fbcfe8"/>
            <!-- Shadow Face -->
            <ellipse cx="50" cy="42" rx="18" ry="14" fill="#090d16"/>
            <!-- Icy Glowing Eyes -->
            <ellipse cx="42" cy="40" rx="4" ry="2" fill="#38bdf8"/>
            <ellipse cx="58" cy="40" rx="4" ry="2" fill="#38bdf8"/>
            <circle cx="42" cy="40" r="1.5" fill="#fff"/>
            <circle cx="58" cy="40" r="1.5" fill="#fff"/>
            <!-- Floating Ice Crystal Crest -->
            <polygon points="50,12 56,22 50,30 44,22" fill="#7dd3fc" opacity="0.9"/>
        `;
    },

    drawWind(color) {
        return `
            <!-- Ranger Cowl -->
            <path d="M 50 8 Q 80 18 72 55 L 50 78 L 28 55 Q 20 18 50 8 Z" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
            <!-- Face -->
            <path d="M 35 32 Q 50 25 65 32 L 60 55 Q 50 62 40 55 Z" fill="#fde047" opacity="0.85"/>
            <!-- Mask / Bandana -->
            <path d="M 32 42 Q 50 48 68 42 L 65 60 L 35 60 Z" fill="#022c22"/>
            <!-- Keen Eyes -->
            <ellipse cx="43" cy="38" rx="3.5" ry="1.5" fill="#a7f3d0"/>
            <ellipse cx="57" cy="38" rx="3.5" ry="1.5" fill="#a7f3d0"/>
            <!-- Bow Notch Silhouette -->
            <path d="M 80 25 C 92 40 92 60 80 75" stroke="#78350f" stroke-width="3" fill="none"/>
            <line x1="80" y1="25" x2="80" y2="75" stroke="#f3f4f6" stroke-width="0.8"/>
        `;
    },

    drawIron(color) {
        return `
            <!-- Massive Iron Bucket Helm -->
            <rect x="22" y="15" width="56" height="55" rx="6" fill="#334155" stroke="#94a3b8" stroke-width="2.5"/>
            <!-- Heavy Visor Plates -->
            <rect x="26" y="32" width="48" height="10" fill="#0f172a"/>
            <line x1="28" y1="37" x2="72" y2="37" stroke="#ef4444" stroke-width="2"/>
            <!-- Reinforced Metal Rivets -->
            <circle cx="28" cy="22" r="1.5" fill="#cbd5e1"/>
            <circle cx="72" cy="22" r="1.5" fill="#cbd5e1"/>
            <circle cx="28" cy="62" r="1.5" fill="#cbd5e1"/>
            <circle cx="72" cy="62" r="1.5" fill="#cbd5e1"/>
            <!-- Iron Horns -->
            <path d="M 22 25 L 8 10 L 22 35 Z M 78 25 L 92 10 L 78 35 Z" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
        `;
    },

    drawLuna(color) {
        return `
            <!-- Celestial Halo -->
            <circle cx="50" cy="22" r="20" fill="none" stroke="#fde047" stroke-width="2.5" stroke-dasharray="8,3"/>
            <!-- Silver Hair -->
            <path d="M 25 30 C 20 10 80 10 75 30 C 82 55 78 75 70 85 C 50 70 50 70 30 85 C 22 75 18 55 25 30 Z" fill="#e2e8f0"/>
            <!-- Face -->
            <circle cx="50" cy="38" r="14" fill="#fde047" opacity="0.3"/>
            <circle cx="50" cy="38" r="12" fill="#fff1f2"/>
            <ellipse cx="45" cy="37" rx="2" ry="3" fill="#0284c7"/>
            <ellipse cx="55" cy="37" rx="2" ry="3" fill="#0284c7"/>
            <!-- Crescent Tiara -->
            <path d="M 42 26 C 50 22 50 22 58 26 C 52 28 48 28 42 26 Z" fill="#f59e0b"/>
        `;
    },

    drawShade(color) {
        return `
            <!-- Void Cowl -->
            <path d="M 50 5 Q 85 8 78 50 Q 50 70 22 50 Q 15 8 50 5 Z" fill="#090514" stroke="#a855f7" stroke-width="2"/>
            <!-- Shadow Face -->
            <path d="M 30 30 L 70 30 L 62 60 L 38 60 Z" fill="#000000"/>
            <!-- Eyes (Purple Fire) -->
            <polygon points="38,38 46,36 42,42" fill="#c084fc"/>
            <polygon points="62,38 54,36 58,42" fill="#c084fc"/>
            <!-- Lower Face Mask -->
            <path d="M 32 46 L 68 46 L 50 68 Z" fill="#1e1b4b" stroke="#581c87" stroke-width="1.5"/>
            <!-- Floating Void Orbs -->
            <circle cx="18" cy="65" r="3" fill="#a855f7" opacity="0.7"/>
            <circle cx="82" cy="65" r="2" fill="#a855f7" opacity="0.7"/>
        `;
    },

    drawFang(color) {
        return `
            <!-- Feral Beast Hood / Head -->
            <path d="M 20 25 Q 50 0 80 25 L 85 55 Q 50 80 15 55 Z" fill="#78350f" stroke="#d97706" stroke-width="2"/>
            <!-- Beast Snout -->
            <path d="M 35 40 Q 50 30 65 40 L 58 62 Q 50 68 42 62 Z" fill="#451a03"/>
            <polygon points="50,42 55,48 45,48" fill="#1c1917"/>
            <!-- Glowing Amber Eyes -->
            <ellipse cx="38" cy="32" rx="4" ry="2.5" fill="#f59e0b"/>
            <ellipse cx="62" cy="32" rx="4" ry="2.5" fill="#f59e0b"/>
            <!-- Fangs -->
            <polygon points="40,58 43,68 45,58" fill="#f8fafc"/>
            <polygon points="60,58 57,68 55,58" fill="#f8fafc"/>
        `;
    },

    // =========================================================================
    // TIER 2 HEROES
    // =========================================================================

    drawAurora(color) {
        return `
            <!-- Frost Crown Helm -->
            <path d="M 25 25 L 50 8 L 75 25 L 70 55 Q 50 75 30 55 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
            <polygon points="50,8 58,25 42,25" fill="#e0f2fe"/>
            <!-- Visor Slit with Cyan Glow -->
            <rect x="34" y="34" width="32" height="6" rx="2" fill="#0c4a6e"/>
            <rect x="36" y="36" width="28" height="2" fill="#38bdf8"/>
            <!-- Ice Crystals Shoulder -->
            <polygon points="10,45 22,40 18,65" fill="#7dd3fc"/>
            <polygon points="90,45 78,40 82,65" fill="#7dd3fc"/>
        `;
    },

    drawEmber(color) {
        return `
            <!-- Fiery Demon Horns -->
            <path d="M 30 25 C 10 -5 0 20 15 35 C 22 28 28 26 30 25 Z" fill="#991b1b" stroke="#ef4444" stroke-width="1.5"/>
            <path d="M 70 25 C 90 -5 100 20 85 35 C 78 28 72 26 70 25 Z" fill="#991b1b" stroke="#ef4444" stroke-width="1.5"/>
            <!-- Head & Cowl -->
            <path d="M 28 25 Q 50 15 72 25 L 68 60 Q 50 75 32 60 Z" fill="#450a0a"/>
            <!-- Burning Eyes -->
            <ellipse cx="40" cy="38" rx="4" ry="2" fill="#facc15"/>
            <ellipse cx="60" cy="38" rx="4" ry="2" fill="#facc15"/>
            <!-- Flame Crest -->
            <path d="M 50 15 C 42 0 58 0 50 15 Z" fill="#f97316"/>
        `;
    },

    drawStorm(color) {
        return `
            <!-- Lightning Hood -->
            <path d="M 50 6 Q 80 15 75 52 L 50 75 L 25 52 Q 20 15 50 6 Z" fill="#0f172a" stroke="#facc15" stroke-width="2"/>
            <!-- Electric Eyes -->
            <circle cx="40" cy="38" r="3" fill="#facc15"/>
            <circle cx="60" cy="38" r="3" fill="#facc15"/>
            <!-- Lightning Bolt Emblem -->
            <polygon points="52,18 44,32 50,32 46,46 56,30 50,30" fill="#fef08a"/>
        `;
    },

    drawDrake(color) {
        return `
            <!-- Dragon Horned Helmet -->
            <path d="M 20 30 C 5 10 15 0 25 15 L 30 30 Z" fill="#7f1d1d"/>
            <path d="M 80 30 C 95 10 85 0 75 15 L 70 30 Z" fill="#7f1d1d"/>
            <path d="M 25 25 L 75 25 L 80 55 Q 50 80 20 55 Z" fill="#450a0a" stroke="#f97316" stroke-width="2"/>
            <rect x="32" y="38" width="36" height="8" fill="#18181b"/>
            <line x1="32" y1="42" x2="68" y2="42" stroke="#ea580c" stroke-width="3"/>
        `;
    },

    drawBlight(color) {
        return `
            <!-- Undead Skull Hood -->
            <path d="M 50 8 C 20 8 20 40 20 55 C 30 72 70 72 80 55 C 80 40 80 8 50 8 Z" fill="#14532d" stroke="#22c55e" stroke-width="1.5"/>
            <!-- Eye Sockets -->
            <circle cx="38" cy="38" r="7" fill="#052e16"/>
            <circle cx="62" cy="38" r="7" fill="#052e16"/>
            <circle cx="38" cy="38" r="3" fill="#4ade80"/>
            <circle cx="62" cy="38" r="3" fill="#4ade80"/>
            <!-- Triangular Nose Cavity -->
            <polygon points="50,46 53,52 47,52" fill="#052e16"/>
        `;
    },

    drawBlade(color) {
        return `
            <!-- Scarred Warrior Headband -->
            <rect x="25" y="20" width="50" height="40" rx="10" fill="#78350f"/>
            <rect x="20" y="28" width="60" height="8" fill="#1e293b"/>
            <circle cx="50" cy="32" r="3" fill="#f59e0b"/>
            <!-- Eyes & Scar -->
            <circle cx="38" cy="42" r="2.5" fill="#f8fafc"/>
            <circle cx="62" cy="42" r="2.5" fill="#f8fafc"/>
            <line x1="32" y1="35" x2="42" y2="48" stroke="#dc2626" stroke-width="1.8"/>
        `;
    },

    // =========================================================================
    // TIER 3 HEROES
    // =========================================================================

    drawDrakon(color) {
        return `
            <!-- Dragon Knight Full Plate Helm -->
            <path d="M 50 5 L 78 22 L 70 60 L 50 82 L 30 60 L 22 22 Z" fill="#431407" stroke="#ea580c" stroke-width="2.5"/>
            <path d="M 30 35 L 70 35 L 65 48 L 35 48 Z" fill="#0f172a"/>
            <line x1="30" y1="41.5" x2="70" y2="41.5" stroke="#f97316" stroke-width="3"/>
            <!-- Dragon Crest Spikes -->
            <polygon points="50,2 55,14 45,14" fill="#f97316"/>
            <polygon points="35,8 40,18 30,18" fill="#ea580c"/>
            <polygon points="65,8 70,18 60,18" fill="#ea580c"/>
        `;
    },

    drawLich(color) {
        return `
            <!-- Lich Crown & Hood -->
            <path d="M 50 5 L 68 18 L 78 45 Q 50 75 22 45 L 32 18 Z" fill="#064e3b" stroke="#a7f3d0" stroke-width="2"/>
            <polygon points="50,8 56,22 44,22" fill="#10b981"/>
            <!-- Skeletal Face -->
            <path d="M 32 30 C 32 20 68 20 68 30 C 68 50 58 62 50 62 C 42 62 32 50 32 30 Z" fill="#ecfdf5"/>
            <!-- Soul Flame Eyes -->
            <circle cx="42" cy="36" r="5" fill="#064e3b"/>
            <circle cx="58" cy="36" r="5" fill="#064e3b"/>
            <circle cx="42" cy="36" r="2.5" fill="#34d399"/>
            <circle cx="58" cy="36" r="2.5" fill="#34d399"/>
        `;
    },

    drawTalon(color) {
        return `
            <!-- Eagle Mask / Crest -->
            <path d="M 50 10 L 75 28 L 68 60 L 50 80 L 32 60 L 25 28 Z" fill="#78350f" stroke="#f59e0b" stroke-width="2"/>
            <!-- Golden Beak -->
            <polygon points="50,38 60,52 50,68 40,52" fill="#fbbf24"/>
            <!-- Sharp Avian Eyes -->
            <polygon points="32,32 44,36 36,40" fill="#fef08a"/>
            <polygon points="68,32 56,36 64,40" fill="#fef08a"/>
        `;
    },

    drawGrim(color) {
        return `
            <!-- Gothic Fortress Helm -->
            <rect x="20" y="18" width="60" height="52" rx="4" fill="#1e293b" stroke="#64748b" stroke-width="3"/>
            <path d="M 20 18 L 50 5 L 80 18 Z" fill="#0f172a"/>
            <!-- Grate Visor -->
            <rect x="30" y="32" width="40" height="18" fill="#020617"/>
            <line x1="38" y1="32" x2="38" y2="50" stroke="#94a3b8" stroke-width="2"/>
            <line x1="50" y1="32" x2="50" y2="50" stroke="#94a3b8" stroke-width="2"/>
            <line x1="62" y1="32" x2="62" y2="50" stroke="#94a3b8" stroke-width="2"/>
        `;
    },

    drawSol(color) {
        return `
            <!-- Sun Crown & Dragon Horns -->
            <circle cx="50" cy="40" r="28" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6,4"/>
            <path d="M 30 25 L 50 10 L 70 25 L 65 55 Q 50 70 35 55 Z" fill="#78350f" stroke="#fbbf24" stroke-width="2"/>
            <circle cx="50" cy="38" r="10" fill="#fef08a"/>
        `;
    },

    // =========================================================================
    // TIER 4 & 5 HEROES
    // =========================================================================

    drawSeraph(color) {
        return `
            <!-- Angelic Winged Helm -->
            <path d="M 20 30 Q 0 10 10 0 Q 25 15 30 28 Z" fill="#f8fafc" stroke="#eab308" stroke-width="1.5"/>
            <path d="M 80 30 Q 100 10 90 0 Q 75 15 70 28 Z" fill="#f8fafc" stroke="#eab308" stroke-width="1.5"/>
            <path d="M 28 20 L 72 20 L 76 50 Q 50 78 24 50 Z" fill="#f1f5f9" stroke="#eab308" stroke-width="2.5"/>
            <!-- Golden Visor Cross -->
            <path d="M 50 20 L 50 62 M 34 36 L 66 36" stroke="#eab308" stroke-width="3.5"/>
            <path d="M 50 20 L 50 62 M 34 36 L 66 36" stroke="#fef08a" stroke-width="1.5"/>
        `;
    },

    drawReaper(color) {
        return `
            <!-- Demon Assassin Horned Skull -->
            <path d="M 25 20 C 5 -10 0 15 15 30 Z" fill="#450a0a" stroke="#dc2626" stroke-width="2"/>
            <path d="M 75 20 C 95 -10 100 15 85 30 Z" fill="#450a0a" stroke="#dc2626" stroke-width="2"/>
            <path d="M 22 22 L 78 22 L 72 65 L 50 80 L 28 65 Z" fill="#18181b" stroke="#dc2626" stroke-width="2"/>
            <ellipse cx="38" cy="40" rx="6" ry="4" fill="#dc2626"/>
            <ellipse cx="62" cy="40" rx="6" ry="4" fill="#dc2626"/>
        `;
    },

    drawEldritch(color) {
        return `
            <!-- Void Rift Tentacle Crown -->
            <circle cx="50" cy="42" r="30" fill="#1e1b4b" stroke="#c084fc" stroke-width="2"/>
            <circle cx="50" cy="42" r="18" fill="#090514"/>
            <!-- Eldritch Center Eye -->
            <ellipse cx="50" cy="42" rx="10" ry="14" fill="#a855f7"/>
            <ellipse cx="50" cy="42" rx="3" ry="10" fill="#020617"/>
            <circle cx="48" cy="38" r="2" fill="#fff"/>
        `;
    },

    drawDragoon(color) {
        return `
            <!-- Dragoon Helmet -->
            <path d="M 50 2 L 62 18 L 50 14 L 38 18 Z" fill="#ea580c"/>
            <path d="M 25 22 L 75 22 L 80 52 Q 50 82 20 52 Z" fill="#292524" stroke="#ea580c" stroke-width="2.5"/>
            <polygon points="50,22 65,38 35,38" fill="#78350f"/>
            <rect x="30" y="38" width="40" height="5" fill="#f97316"/>
        `;
    },

    drawBahamut(color) {
        return `
            <!-- Cosmic Celestial Dragon Crown -->
            <path d="M 50 2 L 62 20 L 80 8 L 72 32 L 95 30 L 78 50 Q 50 85 22 50 L 5 30 L 28 32 L 20 8 L 38 20 Z" fill="#451a03" stroke="#fde047" stroke-width="2.5"/>
            <circle cx="50" cy="45" r="12" fill="#fbbf24"/>
            <circle cx="50" cy="45" r="6" fill="#fff"/>
            <!-- Dragon Eyes -->
            <polygon points="30,35 42,38 34,44" fill="#fde047"/>
            <polygon points="70,35 58,38 66,44" fill="#fde047"/>
        `;
    },

    drawAbyss(color) {
        return `
            <!-- Void Singularity Face -->
            <circle cx="50" cy="42" r="32" fill="#030712" stroke="#6366f1" stroke-width="3"/>
            <path d="M 25 25 Q 50 5 75 25 Q 95 50 75 75 Q 50 95 25 75 Q 5 50 25 25 Z" fill="none" stroke="#4f46e5" stroke-width="1.5" stroke-dasharray="8,4"/>
            <ellipse cx="50" cy="42" rx="8" ry="16" fill="#c084fc"/>
            <ellipse cx="50" cy="42" rx="2" ry="12" fill="#000"/>
        `;
    },

    // =========================================================================
    // FALLBACK CLASS DRAWINGS
    // =========================================================================

    drawByClass(className, color) {
        switch((className || '').toLowerCase()) {
            case 'knight': return this.drawValor(color);
            case 'mage': return this.drawFrost(color);
            case 'archer': return this.drawWind(color);
            case 'tank': return this.drawIron(color);
            case 'assassin': return this.drawShade(color);
            case 'support': return this.drawLuna(color);
            case 'warrior': return this.drawFang(color);
            case 'dragon': return this.drawBahamut(color);
            default: return `<circle cx="50" cy="40" r="22" fill="${color || '#64748b'}"/>`;
        }
    },

    getSkillEffectVector(effect) {
        switch ((effect || '').toLowerCase()) {
            case 'shield':
                return `<path d="M20 5 L35 12 L30 30 L20 38 L10 30 L5 12 Z" fill="#38bdf8" stroke="#fff" stroke-width="1.5"/>`;
            case 'heal':
                return `<path d="M15 5 H25 V15 H35 V25 H25 V35 H15 V25 H5 V15 H15 Z" fill="#4ade80"/>`;
            case 'burn':
            case 'bleed':
                return `<path d="M20 2 C20 2 32 14 32 24 C32 31 26 36 20 36 C14 36 8 31 8 24 C8 14 20 2 20 2 Z" fill="#ef4444"/>`;
            case 'freeze':
            case 'slow':
                return `<path d="M20 2 V38 M2 20 H38 M7 7 L33 33 M7 33 L33 7" stroke="#00d2ff" stroke-width="3" stroke-linecap="round"/>`;
            case 'chain':
                return `<polygon points="22,2 8,20 20,20 16,38 34,16 20,16" fill="#facc15"/>`;
            case 'pierce':
            case 'damage':
            default:
                return `<path d="M5 35 L35 5 M35 5 H20 M35 5 V20" stroke="#f87171" stroke-width="3.5" stroke-linecap="round"/>`;
        }
    }
};