// js/Hero.js
class HeroInstance {
    constructor(data, star = 1) {
        this.data = data;
        this.star = star;
        const m = [1, 1.8, 3.24][star - 1];
        this.maxHp = data.stats.hp * m;
        this.hp = this.maxHp;
        this.atk = data.stats.atk * m;
        this.def = data.stats.def;
        this.spd = data.stats.spd;
        this.range = data.stats.range;
        this.maxMana = data.mana.max;
        this.mana = data.mana.start || 0;
        this.alive = true;
        this.row = -1;
        this.col = -1;
        this.atkTimer = 0;
        this.target = null;
        this.mesh = null;
    }
    
    takeDmg(amt) {
        const dmg = Math.round(amt * (100 / (100 + this.def)));
        this.hp -= dmg;
        if (this.hp <= 0) { this.hp = 0; this.alive = false; }
        return dmg;
    }
    
    heal(amt) {
        this.hp = Math.min(this.hp + amt, this.maxHp);
    }
    
    reset() {
        this.hp = this.maxHp;
        this.mana = this.data.mana.start || 0;
        this.alive = true;
        this.atkTimer = 0;
        this.target = null;
    }
}