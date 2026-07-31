class SynergyUI {
    constructor(game) {
        this.game = game;
        this.activeTooltipRow = null;
        this.initTooltipContainer();
    }

    initTooltipContainer() {
        if (!document.getElementById('synergy-buff-tooltip')) {
            const tooltip = document.createElement('div');
            tooltip.id = 'synergy-buff-tooltip';
            tooltip.style.cssText = `
                display: none;
                position: fixed;
                z-index: 100;
                width: 250px;
                padding: 12px;
                background: linear-gradient(180deg, rgba(18, 22, 38, 0.98) 0%, rgba(8, 10, 18, 0.98) 100%);
                border: 1px solid var(--gold-secondary, #c49529);
                border-radius: 10px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.8), 0 0 12px rgba(212, 175, 55, 0.2);
                backdrop-filter: blur(8px);
                color: #e2e8f0;
                font-family: var(--font-body, sans-serif);
                pointer-events: auto;
            `;
            document.body.appendChild(tooltip);

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.synergy-row') && !e.target.closest('#synergy-buff-tooltip')) {
                    this.hideBuffDetails();
                }
            });
        }
    }

    render(boardHeroes) {
        const counts = {};
        const counted = {};
        
        boardHeroes.forEach(h => {
            const key = h.data.id;
            if (!counted[key]) {
                counted[key] = true;
                h.data.traits.forEach(t => {
                    counts[t] = (counts[t] || 0) + 1;
                });
            }
        });
        
        const panel = document.getElementById('synergy-list');
        let html = '';
        
        const buildRowHtml = (id, syn) => {
            const cnt = counts[id] || 0;
            if (cnt === 0) return '';
            const nextBP = syn.breakpoints.find(bp => cnt < bp);
            const active = syn.breakpoints.some(bp => cnt >= bp);
            
            return `
                <div class="synergy-row${active ? ' active' : ''}" data-id="${id}" style="cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: 4px; margin-bottom: 2px;">
                    <canvas class="synergy-canvas-icon" data-id="${id}" width="22" height="22" style="flex-shrink:0;"></canvas>
                    <span>${syn.name}</span>
                    <span style="margin-left:auto;color:#FFD700;font-weight:bold;">${cnt}${nextBP ? '/'+nextBP : ''}</span>
                </div>
            `;
        };

        // Render Classes section
        html += '<div style="color:#FFD700;font-size:9px;text-align:center;margin:6px 0 2px;letter-spacing:1px;font-weight:bold;">CLASSES</div>';
        Object.entries(SYNERGY_DATA)
            .filter(([id, syn]) => syn.type === 'class')
            .forEach(([id, syn]) => {
                html += buildRowHtml(id, syn);
            });
        
        // Render Origins section
        html += '<div style="color:#FFD700;font-size:9px;text-align:center;margin:6px 0 2px;letter-spacing:1px;font-weight:bold;">ORIGINS</div>';
        Object.entries(SYNERGY_DATA)
            .filter(([id, syn]) => syn.type === 'origin')
            .forEach(([id, syn]) => {
                html += buildRowHtml(id, syn);
            });
        
        panel.innerHTML = html;

        // Draw Canvas Icons & Attach Click Listeners
        panel.querySelectorAll('.synergy-row').forEach(row => {
            const traitId = row.getAttribute('data-id');
            const canvas = row.querySelector('.synergy-canvas-icon');
            
            if (canvas && typeof SynergyIcons !== 'undefined' && SynergyIcons.renderIcon) {
                SynergyIcons.renderIcon(canvas, traitId, 22);
            }

            row.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.activeTooltipRow === traitId) {
                    this.hideBuffDetails();
                } else {
                    this.showBuffDetails(traitId, row, counts[traitId] || 0);
                }
            });
        });
    }

    showBuffDetails(traitId, rowElement, currentCount) {
        const syn = SYNERGY_DATA[traitId];
        if (!syn) return;

        const tooltip = document.getElementById('synergy-buff-tooltip');
        this.activeTooltipRow = traitId;

        // Position tooltip adjacent to the hovered/clicked row
        const rect = rowElement.getBoundingClientRect();
        tooltip.style.top = `${Math.max(10, rect.top - 10)}px`;
        tooltip.style.left = `${rect.right + 12}px`;

        // Format Buff Tiers based on SYNERGY_DATA attributes
        const tiersHtml = this.getBuffTierDescriptions(traitId, syn, currentCount);

        tooltip.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(212,175,55,0.3);">
                <canvas id="tooltip-icon-canvas" width="28" height="28"></canvas>
                <div>
                    <div style="color:#FFD700;font-weight:bold;font-size:13px;font-family:'Cinzel',serif;">${syn.name}</div>
                    <div style="font-size:9px;color:#94a3b8;text-transform:uppercase;">${syn.type} • Active Count: <span style="color:#38ef7d;font-weight:bold;">${currentCount}</span></div>
                </div>
            </div>
            <div>${tiersHtml}</div>
        `;

        const tooltipCanvas = tooltip.querySelector('#tooltip-icon-canvas');
        if (tooltipCanvas && typeof SynergyIcons !== 'undefined') {
            SynergyIcons.renderIcon(tooltipCanvas, traitId, 28);
        }

        tooltip.style.display = 'block';
    }

    getBuffTierDescriptions(id, syn, currentCount) {
        // Label mapping for Class bonuses
        const classStatLabels = {
            knight: { stat: 'Armor', unit: '' },
            mage: { stat: 'Spell Power', unit: '' },
            archer: { stat: 'Atk Speed', unit: '%' },
            tank: { stat: 'HP', unit: '' },
            assassin: { stat: 'Crit', unit: '%' },
            support: { stat: 'Mana/atk', unit: '' },
            warrior: { stat: 'Atk Dmg', unit: '' }
        };

        // Formatter mapping for Origin bonuses
        const originFormatters = {
            human: (v) => `+${v}% Max Mana`,
            elf: (v) => `+${v}% Dodge`,
            demon: (v) => `+${v}% True Damage`,
            dragon: (v) => `Start with +${v} Mana`,
            undead: (v) => `-${v} Enemy Armor`,
            beast: (v) => `+${v}% Atk Speed below 50% HP`,
            celestial: (v) => `Revive once with 50% HP`,
            void: (v) => `Ignore 100% Enemy Armor`
        };

        return syn.breakpoints.map((bp, idx) => {
            const isActive = currentCount >= bp;
            const activeStyle = isActive 
                ? 'color: #38ef7d; font-weight: bold;' 
                : 'color: #8a99ad; font-weight: normal; opacity: 0.65;';
            
            let text = '';

            if (syn.type === 'class' && classStatLabels[id]) {
                const info = classStatLabels[id];
                const teamVal = syn.teamBonus[idx];
                const classVal = syn.classBonus[idx];
                text = `Team +${teamVal}${info.unit} ${info.stat} | ${syn.name}s get +${classVal}${info.unit}`;
            } else if (syn.type === 'origin' && originFormatters[id]) {
                const bonusVal = syn.bonus[idx];
                text = originFormatters[id](bonusVal);
            }

            return `
                <div style="display: flex; align-items: flex-start; gap: 8px; margin-top: 6px; font-size: 11px; ${activeStyle}">
                    <span style="background: ${isActive ? 'rgba(56, 239, 125, 0.2)' : 'rgba(255,255,255,0.05)'}; padding: 1px 5px; border-radius: 4px; border: 1px solid ${isActive ? '#38ef7d' : 'rgba(255,255,255,0.15)'}; flex-shrink: 0; font-size: 10px;">
                        ${bp}
                    </span>
                    <span style="line-height: 1.3;">${text}</span>
                </div>
            `;
        }).join('');
    }

    hideBuffDetails() {
        const tooltip = document.getElementById('synergy-buff-tooltip');
        if (tooltip) tooltip.style.display = 'none';
        this.activeTooltipRow = null;
    }
}