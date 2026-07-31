// js/ui/HUD.js
class HUD {
    constructor(game) {
        this.game = game;
        this.setupButtons();
    }
    
    setupButtons() {
        document.getElementById('btn-buy-xp').onclick = () => {
            if (this.game.phase === 'plan') {
                if (this.game.economy.buyXP()) {
                    this.game.updateUI();
                }
            }
        };
        
        document.getElementById('btn-reroll').onclick = () => {
            if (this.game.phase === 'plan' && this.game.economy.gold >= 2) {
                this.game.shop.forEach(h => this.game.pool.returnHero(h.id));
                this.game.economy.gold -= 2;
                this.game.refreshShop();
                this.game.updateUI();
            }
        };
        
        document.getElementById('btn-start').onclick = () => {
            this.game.startRound();
        };

        document.getElementById('btn-reroll').onclick = () => {
            this.game.rerollShop();
        };
    }
    
    update(data) {
        document.getElementById('gold-display').textContent = data.gold;
        document.getElementById('health-display').textContent = data.hp;
        document.getElementById('level-display').textContent = data.level;
        document.getElementById('xp-display').textContent = `${data.exp}/${data.xpNeeded}`;
    }
}