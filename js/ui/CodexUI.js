// js/ui/CodexUI.js
class CodexUI {
    constructor(game) {
        this.game = game;
        this.currentTab = 'heroes';

        // Make sure the button exists and click works
        const codexBtn = document.getElementById('btn-open-codex');
        if (codexBtn) {
            codexBtn.onclick = () => this.open();
        }

        const closeBtn = document.getElementById('btn-close-codex');
        if (closeBtn) {
            closeBtn.onclick = () => this.close();
        }

        // Tab switching
        document.querySelectorAll('.codex-tab').forEach(tab => {
            tab.onclick = () => this.switchTab(tab.dataset.tab);
        });
    }

    open() {
        console.log('Codex opening...');
        const modal = document.getElementById('codex-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.renderHeroes();
        }
    }

    close() {
        const modal = document.getElementById('codex-modal');
        if (modal) modal.style.display = 'none';
    }

    switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.codex-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.querySelectorAll('.codex-page').forEach(p => p.classList.remove('active'));
        document.getElementById(`codex-${tab}`).classList.add('active');

        if (tab === 'heroes') this.renderHeroes();
        else this.renderSynergies();
    }

    renderHeroes() {
        const grid = document.getElementById('codex-hero-grid');
        grid.innerHTML = '';

        const byCost = {};
        Object.values(HERO_DATA).forEach(h => {
            if (!byCost[h.cost]) byCost[h.cost] = [];
            byCost[h.cost].push(h);
        });

        for (let cost = 1; cost <= 5; cost++) {
            if (!byCost[cost]) continue;

            const header = document.createElement('div');
            header.style.cssText = 'grid-column:1/-1;color:#FFD700;font-size:14px;font-weight:bold;margin-top:10px;padding-bottom:4px;border-bottom:1px solid #8B6914;';
            header.textContent = `Tier ${cost}`;
            grid.appendChild(header);

            byCost[cost].forEach(h => {
                const card = document.createElement('div');
                card.style.cssText = `
                    background: rgba(139,105,20,0.1);
                    border: 1px solid #8B6914;
                    border-radius: 10px;
                    padding: 12px;
                    cursor: pointer;
                    text-align: center;
                    transition: all 0.2s;
                `;

                // Synergy icon canvases
                const iconHTML = h.traits.map((t, j) =>
                    `<canvas class="hero-syn-icon-${h.id}-${j}" width="24" height="24" style="border-radius:4px;margin:2px;display:inline-block;"></canvas>`
                ).join('');

                card.innerHTML = `
                    <div style="font-size:28px;margin-bottom:4px;">${h.emoji || '?'}</div>
                    <div style="font-weight:bold;color:#FFD700;font-size:13px;">${h.name}</div>
                    <div style="margin:6px 0;">${iconHTML}</div>
                    <div style="font-size:10px;color:#b8a080;">
                        ${h.traits.map(t => SYNERGY_DATA[t]?.name || t).join(' • ')}
                    </div>
                    <div style="font-size:9px;color:#aaa;margin-top:4px;">
                        HP ${h.stats.hp} | ATK ${h.stats.atk} | DEF ${h.stats.def}
                    </div>
                    <div style="font-size:9px;color:#aaa;">
                        SPD ${h.stats.spd} | Range ${h.stats.range}
                    </div>
                    ${h.skill ? `<div style="font-size:10px;color:#ffaa44;margin-top:4px;font-style:italic;">⚡ ${h.skill.name}</div>` : ''}
                    <div style="background:#FFD700;color:#1a1a0a;padding:3px 10px;border-radius:10px;font-weight:bold;font-size:11px;margin-top:6px;display:inline-block;">${h.cost} GOLD</div>
                `;

                // Draw synergy icons after DOM insertion
                setTimeout(() => {
                    h.traits.forEach((t, j) => {
                        const canvas = card.querySelector(`.hero-syn-icon-${h.id}-${j}`);
                        if (canvas) {
                            SynergyIcons.renderIcon(canvas, t, 24);
                        }
                    });
                }, 10);

                card.onmouseenter = () => {
                    card.style.borderColor = '#FFD700';
                    card.style.transform = 'translateY(-3px)';
                    card.style.boxShadow = '0 6px 15px rgba(255,215,0,0.2)';
                };
                card.onmouseleave = () => {
                    card.style.borderColor = '#8B6914';
                    card.style.transform = 'translateY(0)';
                    card.style.boxShadow = 'none';
                };

                card.onclick = () => this.showHeroDetail(h);
                grid.appendChild(card);
            });
        }
    }

    renderSynergies() {
        const list = document.getElementById('codex-synergy-list');
        list.innerHTML = '';

        // Enable Scrolling
        list.style.maxHeight = '50vh';
        list.style.overflowY = 'auto';
        list.style.paddingRight = '8px';

        ['class', 'origin'].forEach(type => {
            const header = document.createElement('div');
            header.style.cssText = 'color:#FFD700;font-size:14px;font-weight:bold;margin:12px 0 6px;padding-bottom:4px;border-bottom:1px solid #8B6914;position:sticky;top:0;background:rgba(20,15,10,0.95);z-index:2;';
            header.textContent = type === 'class' ? '⚔️ CLASSES' : '🌍 ORIGINS';
            list.appendChild(header);

            Object.entries(SYNERGY_DATA).filter(([id, s]) => s.type === type).forEach(([id, syn]) => {
                const row = document.createElement('div');
                row.style.cssText = `
                    display:flex;
                    align-items:center;
                    gap:12px;
                    padding:8px 12px;
                    background:rgba(139,105,20,0.1);
                    border:1px solid #8B6914;
                    border-radius:8px;
                    margin:6px 0;
                    cursor:pointer;
                    transition:all 0.2s;
                `;

                const canvas = document.createElement('canvas');
                canvas.width = 36;
                canvas.height = 36;
                canvas.style.cssText = 'border-radius:6px; flex-shrink:0;';

                // Draw Synergy Icon directly (No setTimeout needed!)
                SynergyIcons.renderIcon(canvas, id, 36);

                const content = document.createElement('div');
                content.style.flex = '1';
                content.innerHTML = `
                    <div style="color:#FFD700;font-weight:bold;font-size:12px;">${syn.name}</div>
                    <div style="color:#b8a080;font-size:10px;">${syn.breakpoints.join(' → ')} units</div>
                `;

                const typeTag = document.createElement('div');
                typeTag.style.cssText = 'color:#FFD700;font-size:11px;text-transform:capitalize;';
                typeTag.textContent = syn.type;

                row.appendChild(canvas);
                row.appendChild(content);
                row.appendChild(typeTag);

                row.onmouseenter = () => {
                    row.style.borderColor = '#FFD700';
                    row.style.background = 'rgba(139,105,20,0.3)';
                };
                row.onmouseleave = () => {
                    row.style.borderColor = '#8B6914';
                    row.style.background = 'rgba(139,105,20,0.1)';
                };
                row.onclick = () => this.showSynergyDetail(id, syn);

                list.appendChild(row);
            });
        });
    }

    showSynergyDetail(id, syn) {
        const existing = document.querySelector('.synergy-detail-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.className = 'synergy-detail-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(180deg, rgba(20,15,10,0.98), rgba(30,20,15,0.98));
            border: 3px solid #FFD700;
            border-radius: 16px;
            padding: 24px;
            z-index: 600;
            color: #e0d0b0;
            font-family: 'Georgia', serif;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 0 40px rgba(255,215,0,0.4);
            text-align: center;
        `;

        // Synergy icon
        const iconCanvas = document.createElement('canvas');
        iconCanvas.width = 64;
        iconCanvas.height = 64;
        iconCanvas.style.cssText = 'margin: 0 auto 12px; display: block; border-radius: 8px;';
        popup.appendChild(iconCanvas);

        // Draw icon
        setTimeout(() => {
            if (typeof SynergyIcons !== 'undefined') {
                SynergyIcons.renderIcon(iconCanvas, id, 64);
            }
        }, 10);

        // Synergy info
        const typeLabel = syn.type === 'class' ? '⚔️ CLASS' : '🌍 ORIGIN';
        const breakpoints = syn.breakpoints.join(' → ');

        let bonusText = '';
        const descriptions = {
            knight: { team: 'Armor', class: 'Armor' },
            mage: { team: 'Spell Power', class: 'Spell Power' },
            archer: { team: '% Atk Speed', class: '% Atk Speed' },
            tank: { team: 'HP', class: 'HP' },
            assassin: { team: '% Crit Chance', class: '% Crit Chance' },
            support: { team: 'Mana/Atk', class: 'Mana/Atk' },
            warrior: { team: 'Atk Damage', class: 'Atk Damage' },
            human: 'Max Mana',
            elf: '% Dodge Chance',
            demon: '% True Damage',
            dragon: 'Starting Mana',
            undead: 'Enemy Armor Reduction',
            beast: '% Atk Speed (below 50% HP)',
            celestial: 'Revive once with 50% HP',
            void: '% Armor Penetration',
        };

        if (syn.type === 'class') {
            const desc = descriptions[id] || { team: 'Bonus', class: 'Bonus' };
            syn.breakpoints.forEach((bp, i) => {
                const tb = syn.teamBonus?.[i] || 0;
                const cb = syn.classBonus?.[i] || 0;
                bonusText += `
            <div style="margin: 6px 0; padding: 8px; background: rgba(139,105,20,0.2); border-radius: 6px; text-align: left;">
                <b style="color:#FFD700;">${bp} ${syn.name}s:</b><br>
                <span style="color:#aaddff;">Team +${tb} ${desc.team}</span><br>
                <span style="color:#ffcc44;">${syn.name}s +${cb} ${desc.class}</span>
            </div>
        `;
            });
        } else {
            const desc = typeof descriptions[id] === 'string' ? descriptions[id] : 'Bonus';
            syn.breakpoints.forEach((bp, i) => {
                const b = syn.bonus?.[i] || 0;
                bonusText += `
            <div style="margin: 6px 0; padding: 8px; background: rgba(139,105,20,0.2); border-radius: 6px; text-align: left;">
                <b style="color:#FFD700;">${bp} ${syn.name}s:</b>
                <span style="color:#aaddff;">+${b} ${desc}</span>
            </div>
        `;
            });
        }

        // Count active heroes with this synergy
        const boardHeroes = [];
        for (let r = 4; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.game.board[r][c].hero) boardHeroes.push(this.game.board[r][c].hero);
            }
        }
        const matchingHeroes = boardHeroes.filter(h => h.data.traits.includes(id));
        const count = matchingHeroes.length;

        popup.innerHTML += `
            <div style="font-size: 20px; font-weight: bold; color: #FFD700; margin-bottom: 4px;">${syn.name}</div>
            <div style="font-size: 11px; color: #b8a080; margin-bottom: 12px;">${typeLabel} • ${breakpoints} units needed</div>
            <div style="font-size: 12px; color: #FFD700; margin-bottom: 8px;">Active: ${count} / ${syn.breakpoints[syn.breakpoints.length - 1]}</div>
            <div style="margin: 10px 0;">${bonusText}</div>
            ${matchingHeroes.length > 0 ? `
                <div style="margin-top: 10px; font-size: 10px; color: #aaa;">
                    Heroes: ${matchingHeroes.map(h => h.data.emoji + ' ' + h.data.name + ' ' + '★'.repeat(h.star)).join(', ')}
                </div>
            ` : ''}
            ${syn.element ? `<div style="margin-top: 8px; font-size: 10px; color: #aaa;">Element: ${syn.element}</div>` : ''}
            <button onclick="this.parentElement.remove()" style="
                margin-top: 14px;
                background: #8B0000; color: #FFD700; 
                border: 1px solid #FFD700; 
                padding: 8px 20px; border-radius: 20px; 
                cursor: pointer; font-family: 'Georgia', serif;
            ">Close</button>
        `;

        document.body.appendChild(popup);

        // Click outside to close
        popup.addEventListener('click', (e) => {
            if (e.target === popup) popup.remove();
        });
    }

    showHeroDetail(hero) {
        // Create a nice detail popup
        const existing = document.querySelector('.hero-detail-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.className = 'hero-detail-popup';
        popup.style.cssText = `
            position:fixed;
            top:50%;left:50%;
            transform:translate(-50%,-50%);
            background:linear-gradient(180deg,rgba(30,20,15,0.98),rgba(20,15,10,0.98));
            border:3px solid #FFD700;
            border-radius:16px;
            padding:24px;
            z-index:600;
            text-align:center;
            color:#FFD700;
            font-family:'Georgia',serif;
            min-width:250px;
            box-shadow:0 0 40px rgba(255,215,0,0.4);
        `;

        const synergyIcons = hero.traits.map(t => {
            const syn = SYNERGY_DATA[t];
            return `<span style="display:inline-block;width:24px;height:24px;background:${syn?.iconColor || '#8B6914'};border-radius:4px;margin:2px;font-size:11px;line-height:24px;color:white;">${syn?.icon || t.charAt(0)}</span>`;
        }).join('');


        // Render Skill Icon SVG
        const skillIconSVG = hero.skill ? HeroIconFactory.createSkillIconSVG(hero.skill, 32) : '';

        popup.innerHTML = `
            <div style="display:flex; justify-center; align-items:center; gap:12px;">
                ${HeroIconFactory.createPortraitSVG(hero, 60)}
                <div>
                    <div style="font-size:18px; font-weight:bold; color:${hero.color};">${hero.name}</div>
                    <div style="font-size:11px; color:#aaa;">Cost: ${hero.cost} Gold</div>
                </div>
            </div>
            
            <div id="popup-synergy-icons" style="margin: 10px 0;"></div>

            ${hero.skill ? `
                <div style="background:rgba(255,170,68,0.15); border:1px solid rgba(255,170,68,0.4); padding:8px; border-radius:8px; display:flex; align-items:center; gap:10px;">
                    ${skillIconSVG}
                    <div>
                        <div style="color:#ffaa44; font-weight:bold; font-size:12px;">${hero.skill.name}</div>
                        <div style="color:#ccc; font-size:10px;">${hero.skill.desc}</div>
                    </div>
                </div>
            ` : ''}
        `;

        // 2. Query the icon container and render a canvas icon for each trait
        const iconContainer = popup.querySelector('#popup-synergy-icons');
        if (iconContainer && hero.traits) {
            hero.traits.forEach(traitId => {
                const canvas = document.createElement('canvas');
                // Render 32x32 size icon badge
                SynergyIcons.renderIcon(canvas, traitId, 32);
                canvas.title = traitId.toUpperCase();
                iconContainer.appendChild(canvas);
            });
        }

        document.body.appendChild(popup);

        popup.onclick = (e) => {
            if (e.target === popup) popup.remove();
        };
    }
}