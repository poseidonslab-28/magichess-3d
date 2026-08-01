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
        console.log('VFX initialized:', !!this.vfx, 'combat.vfx:', !!this.combat.vfx);
        this.combat.vfx = this.vfx;
        this.codexUI = new CodexUI(this);
        this._initDragArcVFX();

        for (let r = 0; r < 8; r++) {
            this.board[r] = [];
            for (let c = 0; c < 8; c++) {
                this.board[r][c] = { hero: null, row: r, col: c };
            }
        }

        // ============ CLICK - PLACE OR SELECT HERO ============
        this.board3D.renderer.domElement.addEventListener('click', (e) => {
            if (this.phase !== 'plan') return;

            const tile = this._getTileFromMouse(e);
            if (!tile || tile.row < 4 || tile.row > 7) return;

            console.log('CLICK tile:', tile.row, tile.col, 'bench:', this.selectedBenchHero, 'board:', !!this.selectedBoardHero);

            // CASE 1: Place from bench
            if (this.selectedBenchHero !== null) {
                if (!this.board[tile.row][tile.col].hero) {
                    this.placeHero(tile.row, tile.col);
                }
                return;
            }

            // CASE 2: Move selected board hero
            if (this.selectedBoardHero !== null) {
                const srcR = this.selectedBoardHero.row;
                const srcC = this.selectedBoardHero.col;
                if (srcR !== tile.row || srcC !== tile.col) {
                    if (!this.board[tile.row][tile.col].hero) {
                        this.moveBoardHero(srcR, srcC, tile.row, tile.col);
                    }
                }
                return;
            }

            // CASE 3: Select board hero
            if (this.board[tile.row][tile.col].hero) {
                this.selectedBoardHero = { row: tile.row, col: tile.col };
                this.selectedBenchHero = null;
                this._createGhostForBoardHero(tile.row, tile.col);
                this.board3D.highlightPlayerSide(0x4488ff);
                this.benchUI.render(this.bench);
            }
        });

        // ============ RIGHT CLICK - RETURN TO BENCH ============
        this.board3D.renderer.domElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.phase !== 'plan') return;
            const tile = this._getTileFromMouse(e);
            if (tile && this.board[tile.row][tile.col].hero) {
                this.returnHeroToBench(tile.row, tile.col);
            }
        });

        // ============ MOUSEMOVE - GHOST + ARC + HIGHLIGHT ============
        this.board3D.renderer.domElement.addEventListener('mousemove', (e) => {
            if (this.phase !== 'plan') return;
            if (this.selectedBenchHero === null && !this.selectedBoardHero) return;

            const rect = this.board3D.renderer.domElement.getBoundingClientRect();
            const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            this.raycaster.setFromCamera(new THREE.Vector2(mx, my), this.board3D.camera);

            const hits = this.raycaster.intersectObjects(this.board3D.tileMeshes);
            if (hits.length > 0) {
                const pt = hits[0].point;
                const tile = hits[0].object;

                if (tile.userData?.row !== undefined) {
                    this.board3D.highlightTile(tile.userData.row, tile.userData.col);
                }

                if (this.previewGhost) {
                    this.previewGhost.position.set(pt.x, pt.y + 0.4, pt.z);
                    this.previewGhost.visible = true;
                }

                if (this.dragArcLine) {
                    let startPos;
                    if (this.selectedBenchHero !== null) {
                        const totalSlots = 8;
                        const slotSpacing = 1.0;
                        const benchStartX = 0 - ((totalSlots - 1) * slotSpacing) / 2;
                        const benchX = benchStartX + this.selectedBenchHero * slotSpacing;
                        startPos = new THREE.Vector3(benchX, 0.2, 4.5);
                    } else if (this.selectedBoardHero) {
                        const hero = this.board[this.selectedBoardHero.row]?.[this.selectedBoardHero.col]?.hero;
                        if (hero?.mesh) {
                            startPos = hero.mesh.position.clone();
                            startPos.y += 0.3;
                        }
                    }
                    if (startPos) this._updateDragArcVFX(startPos, pt);
                }
            }
        });

        this.refreshShop();
        this.updateUI();
        this.animate();
    }

    _createGhostForBoardHero(row, col) {
        this._removeGhostPreview();
        const hero = this.board[row][col].hero;
        if (!hero) return;

        // HIDE the original model
        if (hero.mesh) {
            hero.mesh.visible = false;
            this._hiddenBoardHero = hero; // Remember to show later
        }

        const heroData = hero.data;

        try {
            this.previewGhost = HeroModels.create({ data: heroData, star: hero.star || 1 });
        } catch (e) {
            const color = parseInt(heroData.color?.replace('#', '0x') || '0xff4444');
            const geo = new THREE.SphereGeometry(0.35, 8, 8);
            this.previewGhost = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, depthTest: false, depthWrite: false }));
        }

        if (!this.previewGhost) return;

        this.previewGhost.traverse(child => {
            if (child.material) {
                child.material.transparent = true;
                child.material.opacity = 0.4;
                child.material.depthTest = false;
                child.material.depthWrite = false;
            }
        });

        this.previewGhost.renderOrder = 9999;
        this.previewGhost.position.copy(hero.mesh.position);
        this.previewGhost.position.y += 0.3;
        this.previewGhost.visible = true;
        this.board3D.scene.add(this.previewGhost);
    }

    swapBoardHeroes(row1, col1, row2, col2) {
        const hero1 = this.board[row1][col1].hero;
        const hero2 = this.board[row2][col2].hero;

        this.board[row1][col1].hero = hero2;
        this.board[row2][col2].hero = hero1;

        hero1.row = row2; hero1.col = col2;
        hero2.row = row1; hero2.col = col1;

        if (hero1.mesh) {
            hero1.mesh.position.x = (col2 - 3.5) * this.board3D.tileSize;
            hero1.mesh.position.z = (row2 - 3.5) * this.board3D.tileSize;
        }
        if (hero2.mesh) {
            hero2.mesh.position.x = (col1 - 3.5) * this.board3D.tileSize;
            hero2.mesh.position.z = (row1 - 3.5) * this.board3D.tileSize;
        }

        this.selectedBoardHero = null;
        this.board3D.clearSideHighlight();
        this.updateUI();
    }

    moveBoardHero(srcRow, srcCol, destRow, destCol) {
        if (this.board[destRow][destCol].hero) return;

        const hero = this.board[srcRow][srcCol].hero;
        this.board[srcRow][srcCol].hero = null;
        this.board[destRow][destCol].hero = hero;
        hero.row = destRow; hero.col = destCol;

        if (hero.mesh) {
            hero.mesh.position.x = (destCol - 3.5) * this.board3D.tileSize;
            hero.mesh.position.z = (destRow - 3.5) * this.board3D.tileSize;
        }
        if (this._hiddenBoardHero?.mesh) {
            this._hiddenBoardHero.mesh.visible = true;
            this._hiddenBoardHero = null;
        }
        
        this.clearSelection();

        this.selectedBoardHero = null;
        this.board3D.clearSideHighlight();
        this.updateUI();
    }

    selectBenchHero(index) {
        console.log('selectBenchHero called with index:', index);
        console.log('bench has:', this.bench.length, 'heroes');

        if (this.phase !== 'plan') { console.log('Not plan phase'); return; }
        if (index >= this.bench.length) { console.log('Index out of range'); return; }
        if (this.selectedBenchHero === index) {
            console.log('Same hero, deselecting');
            this.clearSelection();
            return;
        }

        console.log('Creating ghost and arc...');

        this.clearSelection();
        this.selectedBenchHero = index;
        this.benchUI.render(this.bench, index);
        this._createGhostPreview(index);

        // HIGHLIGHT player side green, dim enemy
        this.board3D.highlightPlayerSide();

        const totalSlots = 8;
        const slotSpacing = 1.0;
        const benchStartX = 0 - ((totalSlots - 1) * slotSpacing) / 2;
        const benchX = benchStartX + index * slotSpacing;
        const benchPos = new THREE.Vector3(benchX, 0.2, 4.5);
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
        if (this._hiddenBoardHero?.mesh) {
            this._hiddenBoardHero.mesh.visible = true;
            this._hiddenBoardHero = null;
        }
        
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
        // Show hidden board hero if any
        if (this._hiddenBoardHero && this._hiddenBoardHero.mesh) {
            this._hiddenBoardHero.mesh.visible = true;
            this._hiddenBoardHero = null;
        }

        this.selectedBenchHero = null;
        this.selectedBoardHero = null;
        this._removeGhostPreview();
        if (this.dragArcLine) this.dragArcLine.visible = false;
        this.board3D?.clearSideHighlight();
        this.board3D?.clearHighlight();
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
}