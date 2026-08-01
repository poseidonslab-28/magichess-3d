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

        // State tracking for selection and dragging
        this.selectedBenchHero = null;
        this.selectedBoardHero = null;
        this.dragState = null; // { hero, srcType: 'bench'|'board', srcRow, srcCol, startPos }

        // Animation and VFX queues
        this.arcAnimations = [];
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

        // Create the 3D line geometry for the dynamic drag arc VFX
        this._initDragArcVFX();

        // Initialize grid state
        for (let r = 0; r < 8; r++) {
            this.board[r] = [];
            for (let c = 0; c < 8; c++) {
                this.board[r][c] = { hero: null, row: r, col: c };
            }
        }

        // Attach canvas mouse input listeners
        this._setupInputListeners();

        this.refreshShop();
        this.updateUI();
        this.animate();
    }

    // ============ INPUT LISTENERS (CLICK, DRAG, RIGHT-CLICK) ============
    _setupInputListeners() {
        const canvas = this.board3D.renderer.domElement;

        // Prevent browser context menu
        window.addEventListener('contextmenu', (e) => e.preventDefault());

        canvas.addEventListener('mousedown', (e) => {
            if (this.phase !== 'plan') return;
            const tile = this._getTileFromMouse(e);

            // RIGHT CLICK (button 2) -> Instant return to bench
            if (e.button === 2) {
                if (tile && this.board[tile.row][tile.col].hero) {
                    this.rightClickBoard(tile.row, tile.col);
                }
                return;
            }

            // LEFT CLICK (button 0) -> Drag start or placement
            if (e.button === 0) {
                // If bench hero selected, click board to place
                if (this.selectedBenchHero !== null) {
                    if (tile) this.clickBoard(tile.row, tile.col);
                    return;
                }

                // Drag start from Board
                if (tile && this.board[tile.row][tile.col].hero) {
                    const hero = this.board[tile.row][tile.col].hero;
                    const startPos = hero.mesh ? hero.mesh.position.clone() : new THREE.Vector3();

                    this.dragState = {
                        hero,
                        srcType: 'board',
                        srcRow: tile.row,
                        srcCol: tile.col,
                        startPos
                    };
                }
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (this.phase !== 'plan') return;

            // Update 3D drag arc if holding a hero
            if (this.dragState) {
                const groundIntersection = this._getGroundPointFromMouse(e);
                if (groundIntersection) {
                    this._updateDragArcVFX(this.dragState.startPos, groundIntersection);
                }
            }
        });

        canvas.addEventListener('mouseup', (e) => {
            if (this.phase !== 'plan') return;

            // Release drag
            if (e.button === 0 && this.dragState) {
                const targetTile = this._getTileFromMouse(e);
                this._hideDragArcVFX();

                if (targetTile) {
                    // Reposition or swap on destination tile
                    this.clickBoard(targetTile.row, targetTile.col);
                }

                this.dragState = null;
            }
        });
    }

    // ============ BENCH ============
    selectBenchHero(index) {
        if (this.phase !== 'plan') return;
        if (index >= this.bench.length) return;

        this.selectedBoardHero = null;
        this.selectedBenchHero = index;
        this.benchUI.render(this.bench, index);

        // Show arc from bench position
        const benchStartPos = new THREE.Vector3(0, 0.15, 4.5);
        const boardCenter = new THREE.Vector3(0, 0.3, 2);
        this.dragState = {
            hero: this.bench[index],
            srcType: 'bench',
            benchIndex: index,
            startPos: benchStartPos
        };
        this._updateDragArcVFX(benchStartPos, boardCenter);
    }

    // ============ BOARD INTERACTION ============
    clickBoard(row, col) {
        if (this.phase !== 'plan') return;
        const targetCell = this.board[row][col];

        // 1. PLACE FROM BENCH -> BOARD
        if (this.selectedBenchHero !== null) {
            if (targetCell.hero) {
                this._hideDragArcVFX();
                return;
            }

            let count = 0;
            for (let r = 4; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (this.board[r][c].hero) count++;
                }
            }
            if (count >= Math.min(this.economy.level, 10)) {
                this._hideDragArcVFX();
                return;
            }

            const benchIndex = this.selectedBenchHero;
            const hero = this.bench.splice(benchIndex, 1)[0];

            targetCell.hero = hero;
            hero.row = row;
            hero.col = col;

            this._placeHeroWithArc(hero, row, col);

            this.selectedBenchHero = null;
            this.benchUI.render(this.bench);
            this.updateUI();
            this._hideDragArcVFX();
            return;
        }

        // 2. REPOSITION OR SWAP BOARD HERO
        if (this.selectedBoardHero !== null) {
            const { row: srcR, col: srcC } = this.selectedBoardHero;

            if (srcR === row && srcC === col) {
                this.selectedBoardHero = null;
                this.updateUI();
                this._hideDragArcVFX();
                return;
            }

            const srcHero = this.board[srcR][srcC].hero;
            const destHero = targetCell.hero;

            if (srcHero) {
                if (!destHero) {
                    // Move to empty tile
                    this.board[srcR][srcC].hero = null;
                    targetCell.hero = srcHero;
                    srcHero.row = row;
                    srcHero.col = col;

                    this._placeHeroWithArc(srcHero, row, col);
                } else {
                    // Swap positions
                    this._swapHeroesWithArc(srcHero, srcR, srcC, destHero, row, col);
                }
            }

            this.selectedBoardHero = null;
            this.updateUI();
            this._hideDragArcVFX();
            return;
        }

        // 3. SELECT BOARD HERO FOR MOVE
        if (targetCell.hero) {
            this.selectedBoardHero = { row, col };
            this.selectedBenchHero = null;
            this.benchUI.render(this.bench);
        }
    }

    // ============ RIGHT CLICK -> RETURN TO BENCH ============
    rightClickBoard(row, col) {
        if (this.phase !== 'plan') return;
        const targetCell = this.board[row][col];

        if (targetCell.hero) {
            if (this.bench.length >= 8) return; // Bench full

            const hero = targetCell.hero;
            targetCell.hero = null;
            hero.row = -1;
            hero.col = -1;

            this.bench.push(hero);
            this.board3D.removeHeroMeshByHero(hero);

            // Clear selections and drag state
            this.selectedBoardHero = null;
            this.selectedBenchHero = null;
            this.dragState = null;
            this._hideDragArcVFX();

            this.benchUI.render(this.bench);
            this.updateUI();
        }
    }

    // ============ DYNAMIC ARC LINE VFX ============
    _initDragArcVFX() {
        const points = [];
        for (let i = 0; i <= 24; i++) points.push(new THREE.Vector3());

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x00e5ff,
            linewidth: 1,
            transparent: true,
            opacity: 1.0, // FULL opacity
            depthTest: false, // Always visible
            depthWrite: false
        });

        this.dragArcLine = new THREE.Line(geometry, material);
        this.dragArcLine.visible = false;
        this.dragArcLine.renderOrder = 999; // Render on top
        this.dragArcLine.frustumCulled = false;
        this.board3D.scene.add(this.dragArcLine);
    }

    _updateDragArcVFX(startPos, endPos) {
        if (!this.dragArcLine) return;
        this.dragArcLine.visible = true;

        const distance = startPos.distanceTo(endPos);
        const midX = (startPos.x + endPos.x) / 2;
        const midZ = (startPos.z + endPos.z) / 2;
        const midY = Math.max(startPos.y, endPos.y) + Math.min(distance * 0.5, 3.0); // HIGHER arc

        const curve = new THREE.QuadraticBezierCurve3(
            startPos,
            new THREE.Vector3(midX, midY, midZ),
            endPos
        );

        const points = curve.getPoints(24);
        this.dragArcLine.geometry.setFromPoints(points);
        this.dragArcLine.geometry.attributes.position.needsUpdate = true;
    }

    _hideDragArcVFX() {
        if (this.dragArcLine) this.dragArcLine.visible = false;
    }

    // ============ PARABOLIC JUMP LANDING ANIMATIONS ============
    _placeHeroWithArc(hero, targetRow, targetCol) {
        let startPos = null;

        if (hero.mesh) {
            startPos = hero.mesh.position.clone();
        }

        this.board3D.placeHero(hero, targetRow, targetCol);

        if (hero.mesh) {
            const targetPos = hero.mesh.position.clone();

            if (!startPos) {
                startPos = targetPos.clone().add(new THREE.Vector3(0, -0.5, 3));
            }

            hero.mesh.position.copy(startPos);
            this.startArcAnimation(hero.mesh, startPos, targetPos, 0.35);
        }
    }

    _swapHeroesWithArc(heroA, rowA, colA, heroB, rowB, colB) {
        const startPosA = heroA.mesh ? heroA.mesh.position.clone() : null;
        const startPosB = heroB.mesh ? heroB.mesh.position.clone() : null;

        this.board[rowA][colA].hero = heroB;
        this.board[rowB][colB].hero = heroA;
        heroA.row = rowB; heroA.col = colB;
        heroB.row = rowA; heroB.col = colA;

        this.board3D.placeHero(heroA, rowB, colB);
        this.board3D.placeHero(heroB, rowA, colA);

        if (heroA.mesh && startPosA) {
            const targetPosA = heroA.mesh.position.clone();
            heroA.mesh.position.copy(startPosA);
            this.startArcAnimation(heroA.mesh, startPosA, targetPosA, 0.35);
        }

        if (heroB.mesh && startPosB) {
            const targetPosB = heroB.mesh.position.clone();
            heroB.mesh.position.copy(startPosB);
            this.startArcAnimation(heroB.mesh, startPosB, targetPosB, 0.35);
        }
    }

    startArcAnimation(mesh, startPos, endPos, duration = 0.35) {
        this.arcAnimations.push({
            mesh,
            startPos: startPos.clone(),
            endPos: endPos.clone(),
            duration,
            elapsed: 0
        });
    }

    updateArcAnimations(dt) {
        const arcHeight = 1.8;

        for (let i = this.arcAnimations.length - 1; i >= 0; i--) {
            const anim = this.arcAnimations[i];
            anim.elapsed += dt;
            const progress = Math.min(anim.elapsed / anim.duration, 1.0);

            const x = THREE.MathUtils.lerp(anim.startPos.x, anim.endPos.x, progress);
            const z = THREE.MathUtils.lerp(anim.startPos.z, anim.endPos.z, progress);
            const baseY = THREE.MathUtils.lerp(anim.startPos.y, anim.endPos.y, progress);
            const arcY = Math.sin(progress * Math.PI) * arcHeight;

            anim.mesh.position.set(x, baseY + arcY, z);

            if (progress >= 1.0) {
                anim.mesh.position.copy(anim.endPos);
                this.arcAnimations.splice(i, 1);
            }
        }
    }

    // ============ RAYCAST HELPERS ============
    _getTileFromMouse(event) {
        if (!this.board3D || !this.board3D.camera) return null;
        const rect = this.board3D.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.board3D.camera);

        // Raycast against board tile meshes
        if (this.board3D.tileMeshes) {
            const intersects = this.raycaster.intersectObjects(this.board3D.tileMeshes);
            if (intersects.length > 0) {
                const tileMesh = intersects[0].object;
                if (tileMesh.userData && tileMesh.userData.row !== undefined) {
                    return { row: tileMesh.userData.row, col: tileMesh.userData.col };
                }
            }
        }
        return null;
    }

    _getGroundPointFromMouse(event) {
        if (!this.board3D || !this.board3D.camera) return null;
        const rect = this.board3D.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.board3D.camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const target = new THREE.Vector3();
        return this.raycaster.ray.intersectPlane(plane, target);
    }

    // ============ GAME LOGIC ============
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
        if (!h || this.economy.gold < h.cost || this.bench.length >= 8) return false;
        this.economy.gold -= h.cost;
        this.bench.push(new HeroInstance(h, 1));
        this.shop.splice(index, 1);
        this.shopUI.render(this.shop);
        this.benchUI.render(this.bench);
        this.updateUI();
        return true;
    }

    rerollShop() {
        if (this.phase !== 'plan' || this.economy.gold < 2) return;
        this.shop.forEach(h => { if (h?.id) this.pool.returnHero(h.id); });
        this.economy.gold -= 2;
        this.refreshShop();
        this.updateUI();
    }

    startRound() {
        if (this.phase !== 'plan') return;
        this.heroes = [];
        for (let r = 4; r < 8; r++)
            for (let c = 0; c < 8; c++)
                if (this.board[r][c].hero) {
                    this.board[r][c].hero.reset();
                    this.heroes.push(this.board[r][c].hero);
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
        this.board3D.clearEnemies(); this.enemies = [];
        this.heroes.forEach(h => h.reset());
        this.economy.addGold(this.economy.calculateIncome());
        this.economy.exp += 2; this.economy.checkLevelUp();
        this.refreshShop(); this.updateUI();
        if (this.hp <= 0) { alert(`Game Over! Round ${this.round}`); return; }
        setTimeout(() => { this.round++; this.phase = 'plan'; document.getElementById('btn-start').style.display = 'block'; }, 2000);
    }

    updateUI() {
        document.getElementById('gold-display').textContent = this.economy.gold;
        document.getElementById('level-display').textContent = this.economy.level;
        document.getElementById('xp-display').textContent = `${this.economy.exp}/${this.economy.xpNeeded[this.economy.level - 1]}`;
        document.getElementById('health-display').textContent = this.hp;
        const boardHeroes = [];
        for (let r = 4; r < 8; r++) for (let c = 0; c < 8; c++) if (this.board[r][c].hero) boardHeroes.push(this.board[r][c].hero);
        if (this.synergyUI) this.synergyUI.render(boardHeroes);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.board3D) this.board3D.render();
        if (this.combat?.active) {
            this.combat.update(16, 16);
            this.board3D.updateHeroPositions(this.heroes, this.enemies);
        }
        if (this.vfx) this.vfx.update(0.016);
        this.updateArcAnimations(0.016);
    }
}/ /   t e s t   p u s h  
 