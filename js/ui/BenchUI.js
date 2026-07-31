// js/ui/BenchUI.js
class BenchUI {
    constructor(game) {
        this.game = game;
        this.selectedIndex = null;
        
        const bc = document.getElementById('bench-slots');
        for (let i = 0; i < 8; i++) {
            const slot = document.createElement('div');
            slot.className = 'bench-slot';
            slot.onclick = () => this.game.selectBenchHero(i);
            bc.appendChild(slot);
        }
    }
    
    render(bench, selectedIndex = null) {
        this.selectedIndex = selectedIndex;
        const slots = document.querySelectorAll('.bench-slot');
        slots.forEach((s, i) => {
            if (i < bench.length) {
                s.innerHTML = `
                    <div style="font-size:24px;">${bench[i].data.emoji}</div>
                    <div style="font-size:7px;color:white;">${bench[i].data.name}</div>
                    <div style="font-size:7px;color:#FFD700;">${'★'.repeat(bench[i].star)}</div>
                `;
                s.style.border = i === selectedIndex ? '2px solid #FFD700' : '2px dashed #3a3a5a';
            } else {
                s.innerHTML = '';
                s.style.border = '2px dashed #3a3a5a';
            }
        });
    }
}