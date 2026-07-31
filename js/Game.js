// js/Game.js
class Game {
    constructor() {
        this.phase = 'plan';
        this.round = 1;
        this.hp = 100;
        this.board = [];
        this.bench = [];
        this.shop = [];
        this.heroes = [];
        this.enemies = [];
        this.economy = new EconomySystem();
        this.pool = new HeroPool();
        this.combat = new CombatSystem(this);
        this.selectedBenchHero = null;
        this.previewMesh = null;
        this.previewRow = -1;
        this.previewCol = -1;
    }
    
    init() {
        this.board3D = new Board(this);
        this.hud = new HUD(this);
        this.shopUI = new ShopUI(this);
        this.benchUI = new BenchUI(this);
        this.synergyUI = new SynergyUI(this);
        this.codexUI = new CodexUI(this);
        this.vfx = new VFXRenderer(this.board3D.scene);
        this.combat.vfx = this.vfx;

        for (let r = 0; r < 8; r++) {
            this.board[r] = [];
            for (let c = 0; c < 8; c++) {
                this.board[r][c] = { hero: null, row: r, col: c };
            }
        }
        
        // Click board to place
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        this.board3D.renderer.domElement.addEventListener('click', (event) => {
            if (this.phase !== 'plan') return;
            
            const rect = this.board3D.renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.board3D.camera);
            
            // First check if clicking a board hero
            const heroHits = raycaster.intersectObjects(this.board3D.heroMeshes, true);
            if (heroHits.length > 0) {
                let obj = heroHits[0].object;
                while (obj && !obj.userData.hero) obj = obj.parent;
                
                if (obj && obj.userData.hero) {
                    const hero = obj.userData.hero;
                    
                    // If we have a bench hero selected, swap
                    if (this.selectedBenchHero !== null) {
                        this.swapHeroFromBench(hero.row, hero.col);
                        return;
                    }
                    
                    // If clicking own hero on player side, pick it up (select for moving)
                    if (hero.row >= 4) {
                        this.selectBoardHero(hero);
                        return;
                    }
                }
            }
            
            // Then check if placing on a tile
            const hits = raycaster.intersectObjects(this.board3D.boardGroup.children);
            if (hits.length > 0) {
                const pos = hits[0].object.position;
                const col = Math.round(pos.x / 1.3 + 3.5);
                const row = Math.round(pos.z / 1.3 + 3.5);
                
                if (row >= 4 && row <= 7 && col >= 0 && col <= 7) {
                    // If we have a board hero selected, move it
                    if (this.selectedBoardHero && !this.board[row][col].hero) {
                        this.moveBoardHero(row, col);
                        return;
                    }
                    
                    // If we have a bench hero selected, place it
                    if (this.selectedBenchHero !== null && !this.board[row][col].hero) {
                        this.placeHero(row, col);
                        return;
                    }
                }
            }
            
            // Clicked empty space - deselect everything
            this.deselectAll();
        });

        // RIGHT CLICK - Return hero to bench
        this.board3D.renderer.domElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            if (this.phase !== 'plan') return;
            
            const rect = this.board3D.renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.board3D.camera);
            const heroHits = raycaster.intersectObjects(this.board3D.heroMeshes, true);
            
            if (heroHits.length > 0) {
                let obj = heroHits[0].object;
                while (obj && !obj.userData.hero) obj = obj.parent;
                
                if (obj && obj.userData.hero && obj.userData.hero.row >= 4) {
                    this.returnHeroToBench(obj.userData.hero);
                }
            }
        });
        
        this.refreshShop();
        this.updateUI();
        this.animate();
    }
    
    placeHero(row, col) {
        if (this.selectedBenchHero === null || this.selectedBenchHero >= this.bench.length) return;
        
        this.hidePreview();
        
        const hero = this.bench.splice(this.selectedBenchHero, 1)[0];
        this.board[row][col].hero = hero;
        hero.row = row;
        hero.col = col;
        hero.bx = 0;
        hero.by = 0;
        
        this.board3D.placeHero(hero, row, col);
        this.selectedBenchHero = null;
        this.benchUI.render(this.bench);
        this.updateUI();
    }
    
    selectBenchHero(index) {
        if (this.phase !== 'plan') return;
        if (index < this.bench.length) {
            this.selectedBenchHero = index;
            this.benchUI.render(this.bench, index);
            this.showPreview(index);
        }
    }
    
    refreshShop() {
        this.shop = [];
        for (let i = 0; i < 5; i++) {
            const h = this.pool.getHero(this.economy.level);
            if (h) this.shop.push(h);
        }
        if (this.shopUI) this.shopUI.render(this.shop);
    }
    
    buyHero(index) {
        const h = this.shop[index];
        if (!h || this.economy.gold < h.cost) return false;
        if (this.bench.length >= 8) return false;
        
        this.economy.gold -= h.cost;
        this.bench.push(new HeroInstance(h, 1));
        this.shop.splice(index, 1);
        this.shopUI.render(this.shop);
        this.benchUI.render(this.bench);
        this.updateUI();
        return true;
    }
    
    startRound() {
        if (this.phase !== 'plan') return;
        
        this.heroes = [];
        for (let r = 4; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c].hero) {
                    this.board[r][c].hero.reset();
                    this.heroes.push(this.board[r][c].hero);
                }
            }
        }
        
        if (this.heroes.length === 0) return;
        
        this.phase = 'combat';
        document.getElementById('btn-start').style.display = 'none';
        
        this.enemies = [];
        this.board3D.clearEnemies();
        const count = Math.min(2 + Math.floor(this.round / 2), 8);
        for (let i = 0; i < count; i++) {
            const avail = Object.values(HERO_DATA).filter(h => h.cost <= Math.min(this.economy.level, 5));
            const hd = avail[Math.floor(Math.random() * avail.length)];
            const enemy = new HeroInstance(hd, this.round >= 8 && Math.random() < 0.3 ? 2 : 1);
            enemy.row = Math.floor(i / 4);
            enemy.col = (i % 4) + 2;
            enemy.bx = 0;
            enemy.by = 0;
            this.board3D.placeHero(enemy, enemy.row, enemy.col, true);
            this.enemies.push(enemy);
        }
        
        this.combat.start(this.heroes, this.enemies);
    }
    
    onWin() { this.economy.winStreak++; this.economy.loseStreak = 0; this.endRound(); }
    onLose() { this.economy.loseStreak++; this.economy.winStreak = 0; this.hp -= 5 + Math.floor(this.round / 3); this.endRound(); }
    onDraw() { this.endRound(); }
    
    endRound() {
        this.board3D.clearEnemies();
        this.enemies = [];
        this.heroes.forEach(h => h.reset());
        
        this.economy.addGold(this.economy.calculateIncome());
        this.economy.exp += 2;
        this.economy.checkLevelUp();
        
        this.refreshShop();
        this.updateUI();
        
        if (this.hp <= 0) {
            alert(`Game Over! Round ${this.round}`);
            return;
        }
        
        setTimeout(() => {
            this.round++;
            this.phase = 'plan';
            document.getElementById('btn-start').style.display = 'block';
        }, 2000);
    }
    
    updateUI() {
        document.getElementById('gold-display').textContent = this.economy.gold;
        document.getElementById('level-display').textContent = this.economy.level;
        document.getElementById('xp-display').textContent = `${this.economy.exp}/${this.economy.xpNeeded[this.economy.level-1]}`;
        document.getElementById('health-display').textContent = this.hp;
        
        const boardHeroes = [];
        for (let r = 4; r < 8; r++)
            for (let c = 0; c < 8; c++)
                if (this.board[r][c].hero) boardHeroes.push(this.board[r][c].hero);
        if (this.synergyUI) this.synergyUI.render(boardHeroes);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.board3D) this.board3D.render();
        if (this.combat && this.combat.active) {
            this.combat.update(16, 16);
            this.board3D.updateHeroPositions(this.heroes, this.enemies);
        }
        if (this.vfx) this.vfx.update(0.016);
    }


    showPreview(benchIndex) {
        this.hidePreview();
        
        const hero = this.bench[benchIndex];
        this.previewMesh = HeroFactory.createMesh(hero, false);
        this.previewMesh.traverse(child => {
            if (child.material) {
                child.material.transparent = true;
                child.material.opacity = 0.5;
            }
        });
        this.previewMesh.position.y = 0.15;
        this.previewMesh.visible = false;
        this.board3D.scene.add(this.previewMesh);
        
        // Mouse move to update preview position
        this.onPreviewMove = (event) => {
            const rect = this.board3D.renderer.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                -((event.clientY - rect.top) / rect.height) * 2 + 1
            );
            
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.board3D.camera);
            const hits = raycaster.intersectObjects(this.board3D.boardGroup.children);
            
            if (hits.length > 0) {
                const pos = hits[0].object.position;
                const col = Math.round(pos.x / 1.3 + 3.5);
                const row = Math.round(pos.z / 1.3 + 3.5);
                
                if (row >= 4 && row <= 7 && col >= 0 && col <= 7 && !this.board[row][col].hero) {
                    this.previewMesh.position.x = (col - 3.5) * 1.3;
                    this.previewMesh.position.z = (row - 3.5) * 1.3;
                    this.previewMesh.visible = true;
                    this.previewRow = row;
                    this.previewCol = col;
                    
                    // Highlight tile
                    this.board3D.highlightTile(row, col);
                } else {
                    this.previewMesh.visible = false;
                    this.board3D.clearHighlight();
                }
            }
        };
        
        window.addEventListener('mousemove', this.onPreviewMove);
    }

    hidePreview() {
        if (this.previewMesh) {
            this.board3D.scene.remove(this.previewMesh);
            this.previewMesh = null;
        }
        if (this.onPreviewMove) {
            window.removeEventListener('mousemove', this.onPreviewMove);
            this.onPreviewMove = null;
        }
        this.board3D.clearHighlight();
    }

    selectBoardHero(hero) {
        this.deselectAll();
        this.selectedBoardHero = hero;
        // Highlight the selected hero
        if (hero.mesh) {
            hero.mesh.traverse(child => {
                if (child.material && child.material.emissive) {
                    child.material.emissive.set(0x444444);
                    child.material.emissiveIntensity = 1;
                }
            });
        }
        // Show preview for moving
        this.showBoardHeroPreview();
    }

    showBoardHeroPreview() {
        this.hidePreview();
        
        this.previewMesh = HeroFactory.createMesh(this.selectedBoardHero, false);
        this.previewMesh.traverse(child => {
            if (child.material) {
                child.material.transparent = true;
                child.material.opacity = 0.5;
            }
        });
        this.previewMesh.position.y = 0.15;
        this.previewMesh.visible = false;
        this.board3D.scene.add(this.previewMesh);
        
        this.onPreviewMove = (event) => {
            const rect = this.board3D.renderer.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                -((event.clientY - rect.top) / rect.height) * 2 + 1
            );
            
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.board3D.camera);
            const hits = raycaster.intersectObjects(this.board3D.boardGroup.children);
            
            if (hits.length > 0) {
                const pos = hits[0].object.position;
                const col = Math.round(pos.x / 1.3 + 3.5);
                const row = Math.round(pos.z / 1.3 + 3.5);
                
                if (row >= 4 && row <= 7 && col >= 0 && col <= 7 && !this.board[row][col].hero) {
                    this.previewMesh.position.x = (col - 3.5) * 1.3;
                    this.previewMesh.position.z = (row - 3.5) * 1.3;
                    this.previewMesh.visible = true;
                    this.board3D.highlightTile(row, col);
                } else {
                    this.previewMesh.visible = false;
                    this.board3D.clearHighlight();
                }
            }
        };
        
        window.addEventListener('mousemove', this.onPreviewMove);
    }

    moveBoardHero(row, col) {
        if (!this.selectedBoardHero) return;
        
        const oldRow = this.selectedBoardHero.row;
        const oldCol = this.selectedBoardHero.col;
        
        this.board[oldRow][oldCol].hero = null;
        this.board[row][col].hero = this.selectedBoardHero;
        this.selectedBoardHero.row = row;
        this.selectedBoardHero.col = col;
        
        if (this.selectedBoardHero.mesh) {
            this.selectedBoardHero.mesh.position.x = (col - 3.5) * 1.3;
            this.selectedBoardHero.mesh.position.z = (row - 3.5) * 1.3;
        }
        
        this.deselectAll();
        this.updateUI();
    }

    swapHeroFromBench(row, col) {
        const benchHero = this.bench[this.selectedBenchHero];
        const boardHero = this.board[row][col].hero;
        
        this.board[row][col].hero = benchHero;
        benchHero.row = row;
        benchHero.col = col;
        
        this.bench[this.selectedBenchHero] = boardHero;
        this.board3D.removeHero(row, col);
        this.board3D.placeHero(benchHero, row, col);
        
        this.selectedBenchHero = null;
        this.hidePreview();
        this.benchUI.render(this.bench);
        this.updateUI();
    }

    returnHeroToBench(hero) {
        if (this.bench.length >= 8) return;
        
        this.board[hero.row][hero.col].hero = null;
        this.bench.push(hero);
        this.board3D.removeHero(hero.row, hero.col);
        
        this.deselectAll();
        this.benchUI.render(this.bench);
        this.updateUI();
    }

    deselectAll() {
        this.selectedBoardHero = null;
        this.selectedBenchHero = null;
        this.hidePreview();
        this.board3D.clearHighlight();
        
        // Remove highlights from all heroes
        this.board3D.heroMeshes.forEach(m => {
            m.traverse(child => {
                if (child.material && child.material.emissive) {
                    child.material.emissive.set(0x000000);
                    child.material.emissiveIntensity = 0;
                }
            });
        });
        
        this.benchUI.render(this.bench);
    }

    rerollShop() {
        if (this.phase !== 'plan') return;
        if (this.economy.gold < 2) return;
        
        // Return current shop heroes to pool
        this.shop.forEach(h => {
            if (h && h.id) this.pool.returnHero(h.id);
        });
        
        this.economy.gold -= 2;
        this.refreshShop();
        this.updateUI();
    }
}