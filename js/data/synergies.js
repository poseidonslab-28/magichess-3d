const SYNERGY_DATA = {
    knight: { 
        name: 'Knight', type: 'class', icon: '⚔', iconColor: '#8899cc',
        breakpoints: [2,4,6], teamBonus: [10,20,30], classBonus: [20,40,60]
    },
    mage: { 
        name: 'Mage', type: 'class', icon: '◆', iconColor: '#aa44ff',
        breakpoints: [2,4], teamBonus: [15,30], classBonus: [35,70]
    },
    archer: { 
        name: 'Archer', type: 'class', icon: '▲', iconColor: '#44cc44',
        breakpoints: [2,4], teamBonus: [10,20], classBonus: [25,50]
    },
    tank: { 
        name: 'Tank', type: 'class', icon: '■', iconColor: '#cc8844',
        breakpoints: [2,4], teamBonus: [100,200], classBonus: [300,600]
    },
    assassin: { 
        name: 'Assassin', type: 'class', icon: '▼', iconColor: '#cc44cc',
        breakpoints: [2,4], teamBonus: [10,20], classBonus: [25,50]
    },
    support: { 
        name: 'Support', type: 'class', icon: '●', iconColor: '#ffcc44',
        breakpoints: [2,4], teamBonus: [10,20], classBonus: [25,50]
    },
    warrior: { 
        name: 'Warrior', type: 'class', icon: '★', iconColor: '#ff6644',
        breakpoints: [2,4], teamBonus: [10,20], classBonus: [25,50]
    },
    human: { 
        name: 'Human', type: 'origin', element: 'physical', icon: 'H', iconColor: '#aaaacc',
        breakpoints: [2,4,6], bonus: [20,40,70]
    },
    elf: { 
        name: 'Elf', type: 'origin', element: 'nature', icon: 'E', iconColor: '#44cc44',
        breakpoints: [2,4], bonus: [25,50]
    },
    demon: { 
        name: 'Demon', type: 'origin', element: 'fire', icon: 'D', iconColor: '#ff4444',
        breakpoints: [2,4], bonus: [15,30]
    },
    dragon: { 
        name: 'Dragon', type: 'origin', element: 'lightning', icon: 'W', iconColor: '#ffaa00',
        breakpoints: [2,3], bonus: [50,100]
    },
    undead: { 
        name: 'Undead', type: 'origin', element: 'shadow', icon: 'U', iconColor: '#66aa66',
        breakpoints: [2,4], bonus: [20,40]
    },
    beast: { 
        name: 'Beast', type: 'origin', element: 'feral', icon: 'B', iconColor: '#cc8844',
        breakpoints: [2,4], bonus: [30,60]
    },
    celestial: { 
        name: 'Celestial', type: 'origin', element: 'holy', icon: 'C', iconColor: '#ffddff',
        breakpoints: [2], bonus: [1]
    },
    void: { 
        name: 'Void', type: 'origin', element: 'cosmic', icon: 'V', iconColor: '#8866cc',
        breakpoints: [2], bonus: [100]
    }
};