// js/systems/PoolSystem.js
class HeroPool {
    constructor() {
        this.pool = {};
        const sizes = {1:39, 2:26, 3:21, 4:13, 5:10};
        Object.values(HERO_DATA).forEach(h => {
            this.pool[h.id] = sizes[h.cost] || 20;
        });
    }
    
    getHero(level) {
        const probs = {
            1:{1:100},2:{1:100},3:{1:75,2:25},4:{1:55,2:30,3:15},
            5:{1:40,2:35,3:20,4:5},6:{1:25,2:35,3:30,4:10},
            7:{1:19,2:30,3:30,4:20,5:1},8:{1:15,2:20,3:30,4:30,5:5},
            9:{1:10,2:15,3:25,4:35,5:15},10:{1:5,2:10,3:20,4:40,5:25}
        };
        const p = probs[Math.min(level,10)] || probs[1];
        
        let roll = Math.random()*100, cost=1, cum=0;
        for (const [c,prob] of Object.entries(p)) {
            cum += prob;
            if (roll <= cum) { cost = parseInt(c); break; }
        }
        
        const avail = Object.entries(this.pool).filter(([id,ct]) => ct>0 && HERO_DATA[id].cost===cost);
        if (avail.length===0) return null;
        
        const [hid] = avail[Math.floor(Math.random()*avail.length)];
        this.pool[hid]--;
        return HERO_DATA[hid];
    }
    
    returnHero(id) { if (this.pool[id]!==undefined) this.pool[id]++; }
}