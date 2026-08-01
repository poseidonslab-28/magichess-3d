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
        this.previewGhost = null;
        this.dragArcLine = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    init() {
        this.board3D = new Board(this);
        this.hud = new HUD(this);
        this.shopUI = new ShopUI(this);
        this.benchUI = new BenchUI(this);
        this.synergyUI = new SynergyUI(this);
        this.vfx = new VFXRenderer(this.board3D.scene);
        this.combat.vfx = this.vfx;
        this._initDragArcVFX();

        for (let r = 0; r < 8; r++) {
            this.board[r] = [];
            for (let c = 0; c < 8; c++) {
                this.board[r][c] = { hero: null, row: r, col: c };
            }
        }

        // Add this in init():
        window.addEventListener('mousemove', (e) => {
            const canvas = this.board3D.renderer.domElement;
            const rect = canvas.getBoundingClientRect();

            // Check if mouse is over the canvas
            if (e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom) {

                console.log('OVER CANVAS'); // Should spam when mouse is over the game

                const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

                const rc = new THREE.Raycaster();
                rc.setFromCamera(new THREE.Vector2(x, y), this.board3D.camera);

                if (this.board3D.tileMeshes) {
                    const hits = rc.intersectObjects(this.board3D.tileMeshes);
                    if (hits.length > 0 && this.previewGhost) {
                        const pt = hits[0].point;
                        this.previewGhost.position.set(pt.x, pt.y + 0.4, pt.z);
                        this.previewGhost.visible = true;
                        if (this.dragArcLine) {
                            this._updateDragArcVFX(new THREE.Vector3(0, 0.3, 4), pt);
                        }
                    }
                }
            }
        });

        // Click on board
        this.board3D.renderer.domElement.addEventListener('click', (e) => {
            if (this.phase !== 'plan') return;
            const tile = this._getTileFromMouse(e);
            if (!tile || tile.row < 4 || tile.row > 7) return;

            if (this.selectedBenchHero !== null) {
                this.placeHero(tile.row, tile.col);
            } else if (this.board[tile.row][tile.col].hero) {
                this.returnHeroToBench(tile.row, tile.col);
            }
        });

        // Right click
        this.board3D.renderer.domElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.phase !== 'plan') return;
            const tile = this._getTileFromMouse(e);
            if (tile && this.board[tile.row][tile.col].hero) {
                this.returnHeroToBench(tile.row, tile.col);
            }
        });

        this.refreshShop();
        this.updateUI();
        this.animate();
    }

    selectBenchHero(index) {
        if (this.phase !== 'plan') return;
        if (index >= this.bench.length) return;
        if (this.selectedBenchHero === index) { this.clearSelection(); return; }

        this.clearSelection();
        this.selectedBenchHero = index;
        this.benchUI.render(this.bench, index);
        this._createGhostPreview(index);

        // Calculate bench slot position in 3D space
        // Bench slots are arranged horizontally, centered at bottom of board
        const totalSlots = 8;
        const slotSpacing = 1.0;
        const benchCenterX = 0;
        const benchStartX = benchCenterX - ((totalSlots - 1) * slotSpacing) / 2;
        const benchX = benchStartX + index * slotSpacing;
        const benchZ = 4.5; // Bench is at the bottom of the board
        const benchY = 0.2;

        const benchPos = new THREE.Vector3(benchX, benchY, benchZ);
        const boardCenter = new THREE.Vector3(0, 0.3, 1.5);

        this._updateDragArcVFX(benchPos, boardCenter);
    }

    placeHero(row, col) {
        if (this.selectedBenchHero === null || this.board[row][col].hero) return;
        let count = 0;
        for (let r = 4; r < 8; r++) for (let c = 0; c < 8; c++) if (this.board[r][c].hero) count++;
        if (count >= Math.min(this.economy.level, 10)) return;

        const hero = this.bench.splice(this.selectedBenchHero, 1)[0];
        this.board[row][col].hero = hero;
        hero.row = row; hero.col = col;
        this.board3D.placeHero(hero, row, col);
        this.clearSelection();
        this.benchUI.render(this.bench);
        this.updateUI();
    }

    returnHeroToBench(row, col) {
        if (this.bench.length >= 8) return;
        const hero = this.board[row][col].hero;
        if (!hero) return;
        this.board[row][col].hero = null;
        hero.row = -1; hero.col = -1;
        this.bench.push(hero);
        this.board3D.removeHeroMeshByHero(hero);
        this.benchUI.render(this.bench);
        this.updateUI();
    }

    clearSelection() {
        this.selectedBenchHero = null;
        this._removeGhostPreview();
        if (this.dragArcLine) this.dragArcLine.visible = false;
        this.benchUI.render(this.bench);
    }

    // ============ GHOST & ARC ============
    _createGhostPreview(benchIndex) {
        this._removeGhostPreview();
        const hero = this.bench[benchIndex];
        if (!hero) return;
        const heroData = hero.data || hero;

        // Create the ACTUAL hero model
        try {
            this.previewGhost = HeroModels.create({ data: heroData, star: hero.star || 1 });
        } catch (e) {
            console.log('HeroModels.create failed, using fallback sphere');
            const color = parseInt(heroData.color?.replace('#', '0x') || '0xff4444');
            const geo = new THREE.SphereGeometry(0.35, 8, 8);
            const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, depthTest: false, depthWrite: false });
            this.previewGhost = new THREE.Mesh(geo, mat);
        }

        if (!this.previewGhost) return;

        // Make ALL materials transparent
        this.previewGhost.traverse(child => {
            if (child.material) {
                child.material.transparent = true;
                child.material.opacity = 0.4;
                child.material.depthTest = false;
                child.material.depthWrite = false;
            }
        });

        this.previewGhost.renderOrder = 9999;
        this.previewGhost.position.set(0, 2, 2);
        this.previewGhost.visible = true;
        this.board3D.scene.add(this.previewGhost);

        console.log('GHOST HERO CREATED:', heroData.name);
    }

    _removeGhostPreview() {
        if (this.previewGhost) { this.board3D.scene.remove(this.previewGhost); this.previewGhost = null; }
    }

    _initDragArcVFX() {
        const tubeGeo = new THREE.TubeGeometry(
            new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(0, 0.2, 4.5),  // Start near bench area
                new THREE.Vector3(0, 3, 2),       // Arc peak
                new THREE.Vector3(0, 0.3, 0)      // End at board center
            ),
            20, 0.08, 8, false
        );
        const tubeMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.9,
            depthTest: false,
            depthWrite: false
        });
        this.dragArcLine = new THREE.Mesh(tubeGeo, tubeMat);
        this.dragArcLine.visible = false;
        this.dragArcLine.renderOrder = 9999;
        this.board3D.scene.add(this.dragArcLine);
    }

    // Update the arc to start from the bench slot position
    _updateDragArcVFX(startPos, endPos) {
        if (!this.dragArcLine) return;
        this.dragArcLine.geometry.dispose();

        const midX = (startPos.x + endPos.x) / 2;
        const midZ = (startPos.z + endPos.z) / 2;
        const midY = Math.max(startPos.y, endPos.y) + 2.5;

        const curve = new THREE.QuadraticBezierCurve3(
            startPos,
            new THREE.Vector3(midX, midY, midZ),
            endPos
        );
        this.dragArcLine.geometry = new THREE.TubeGeometry(curve, 20, 0.06, 8, false);
        this.dragArcLine.visible = true;
    }

    // ============ HELPERS ============
    _getTileFromMouse(event) {
        if (!this.board3D?.camera) return null;
        const rect = this.board3D.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.board3D.camera);
        if (this.board3D.tileMeshes) {
            const hits = this.raycaster.intersectObjects(this.board3D.tileMeshes);
            if (hits.length > 0 && hits[0].object.userData?.row !== undefined) {
                return { row: hits[0].object.userData.row, col: hits[0].object.userData.col };
            }
        }
        return null;
    }

    // ============ GAME LOGIC ============
    refreshShop() { this.shop = []; for (let i = 0; i < 5; i++) { const h = this.pool.getHero(this.economy.level); if (h) this.shop.push(h); } if (this.shopUI) this.shopUI.render(this.shop); }
    buyHero(index) { const h = this.shop[index]; if (!h || this.economy.gold < h.cost || this.bench.length >= 8) return false; this.economy.gold -= h.cost; this.bench.push(new HeroInstance(h, 1)); this.shop.splice(index, 1); this.shopUI.render(this.shop); this.benchUI.render(this.bench); this.updateUI(); return true; }
    rerollShop() { if (this.phase !== 'plan' || this.economy.gold < 2) return; this.shop.forEach(h => { if (h?.id) this.pool.returnHero(h.id); }); this.economy.gold -= 2; this.refreshShop(); this.updateUI(); }

    startRound() {
        if (this.phase !== 'plan') return;
        this.heroes = [];
        for (let r = 4; r < 8; r++) for (let c = 0; c < 8; c++) if (this.board[r][c].hero) { this.board[r][c].hero.reset(); this.heroes.push(this.board[r][c].hero); }
        if (this.heroes.length === 0) return;
        this.phase = 'combat'; document.getElementById('btn-start').style.display = 'none';
        this.enemies = []; this.board3D.clearEnemies();
        const count = Math.min(2 + Math.floor(this.round / 2), 8);
        for (let i = 0; i < count; i++) {
            const avail = Object.values(HERO_DATA).filter(h => h.cost <= Math.min(this.economy.level, 5));
            const hd = avail[Math.floor(Math.random() * avail.length)];
            const enemy = new HeroInstance(hd, this.round >= 8 && Math.random() < 0.3 ? 2 : 1);
            enemy.row = Math.floor(i / 4); enemy.col = (i % 4) + 2;
            this.board3D.placeHero(enemy, enemy.row, enemy.col, true);
            this.enemies.push(enemy);
        }
        this.combat.start(this.heroes, this.enemies);
    }

    onWin() { this.economy.winStreak++; this.economy.loseStreak = 0; this.endRound(); }
    onLose() { this.economy.loseStreak++; this.economy.winStreak = 0; this.hp -= 5 + Math.floor(this.round / 3); this.endRound(); }
    onDraw() { this.endRound(); }

    endRound() {
        this.board3D.clearEnemies(); this.enemies = []; this.heroes.forEach(h => h.reset());
        this.economy.addGold(this.economy.calculateIncome()); this.economy.exp += 2; this.economy.checkLevelUp();
        this.refreshShop(); this.updateUI();
        if (this.hp <= 0) { alert(`Game Over! Round ${this.round}`); return; }
        setTimeout(() => { this.round++; this.phase = 'plan'; document.getElementById('btn-start').style.display = 'block'; }, 2000);
    }

    updateUI() {
        document.getElementById('gold-display').textContent = this.economy.gold;
        document.getElementById('level-display').textContent = this.economy.level;
        document.getElementById('xp-display').textContent = `${this.economy.exp}/${this.economy.xpNeeded[this.economy.level - 1]}`;
        document.getElementById('health-display').textContent = this.hp;
        const bh = []; for (let r = 4; r < 8; r++) for (let c = 0; c < 8; c++) if (this.board[r][c].hero) bh.push(this.board[r][c].hero);
        if (this.synergyUI) this.synergyUI.render(bh);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.board3D) this.board3D.render();
        if (this.combat?.active) { this.combat.update(16, 16); this.board3D.updateHeroPositions(this.heroes, this.enemies); }
        if (this.vfx) this.vfx.update(0.016);
    }
}