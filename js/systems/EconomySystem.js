// js/systems/EconomySystem.js
class EconomySystem {
    constructor() {
        this.gold = 10;
        this.level = 3;
        this.exp = 0;
        this.winStreak = 0;
        this.loseStreak = 0;
        // XP needed per level (index 0 = level 1, index 8 = level 9)
        this.xpNeeded = [2, 2, 6, 10, 20, 36, 56, 80, 100];
        // Buy XP cost increases with level
        this.xpCost = 4;
    }
    
    getXPCost() {
        // Cost increases at higher levels
        if (this.level >= 8) return 8;
        if (this.level >= 6) return 6;
        return 4;
    }
    
    getMaxBenchSize() {
        return this.level + 4; // Level 1 = 5 bench, Level 5 = 9 bench
    }
    
    getMaxBoardSize() {
        return this.level; // Level 1 = 1 hero, Level 5 = 5 heroes, etc. (capped at board size 4x8=32)
    }
    
    buyXP() {
        const cost = this.getXPCost();
        if (this.gold >= cost) {
            this.gold -= cost;
            this.exp += 4;
            return this.checkLevelUp();
        }
        return false;
    }
    
    checkLevelUp() {
        const needed = this.xpNeeded[this.level - 1];
        if (this.exp >= needed && this.level < 10) {
            this.exp -= needed;
            this.level++;
            return true;
        }
        return false;
    }
    
    addGold(amount) {
        this.gold += amount;
    }
    
    calculateIncome() {
        // Base income
        let income = 5;
        
        // Interest (10% of current gold, max 5)
        const interest = Math.min(Math.floor(this.gold * 0.1), 5);
        income += interest;
        
        // Win/Loss streak bonus
        if (this.winStreak >= 2) {
            income += Math.min(this.winStreak, 5);
        } else if (this.loseStreak >= 2) {
            income += Math.min(this.loseStreak - 1, 4);
        }
        
        return income;
    }
}