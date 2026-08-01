// js/ui/BenchUI.js
class BenchUI {
    constructor(game) {
        this.game = game;
        this.selectedIndex = null;
        
        const bc = document.getElementById('bench-slots');
        bc.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            const slot = document.createElement('div');
            slot.className = 'bench-slot';
            slot.onclick = (e) => {
                e.stopPropagation();
                console.log('BENCH SLOT CLICKED:', i, 'has hero:', !!this.game.bench[i]);
                this.game.selectBenchHero(i);
            };
            bc.appendChild(slot);
        }
    }
    
    render(bench, selectedIndex = null) {
        this.selectedIndex = selectedIndex;
        const slots = document.querySelectorAll('.bench-slot');
        
        slots.forEach((s, i) => {
            s.innerHTML = '';
            s.style.cssText = `
                width: 70px; height: 88px;
                background: rgba(20,15,10,0.9);
                border: 2px dashed #8B6914;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
                transition: all 0.2s;
            `;
            
            if (i < bench.length) {
                const h = bench[i];
                const heroData = h.data || h;
                
                // Card-style portrait
                s.innerHTML = `
                    <div style="font-size:28px;">${heroData.emoji || '⚔️'}</div>
                    <div style="font-size:9px;color:#FFD700;font-weight:bold;text-align:center;margin-top:2px;">${heroData.name}</div>
                    <div style="font-size:8px;color:#FFD700;text-align:center;">${'★'.repeat(h.star || 1)}</div>
                    <div style="position:absolute;top:2px;right:2px;background:#FFD700;color:#1a1a0a;font-size:7px;padding:1px 4px;border-radius:6px;">${heroData.cost}g</div>
                `;
                
                if (i === selectedIndex) {
                    s.style.border = '2px solid #FFD700';
                    s.style.boxShadow = '0 0 12px rgba(255,215,0,0.4)';
                }
            }
        });
    }
}