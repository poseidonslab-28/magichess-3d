// js/Board.js
class Board {
    constructor(game) {
        this.game = game;
        this.heroMeshes = [];
        this.enemyMeshes = [];
        this.tileMeshes = []; // ADD THIS
        this.tileSize = 1.3;
        this.init();
    }
    
    init() {
        this.clock = new THREE.Clock(); // Add clock for delta time calculation
        const container = document.getElementById('game-container');
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0b0e14);
        this.scene.fog = new THREE.FogExp2(0x0b0e14, 0.048);
        
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 80);
        this.camera.position.set(0, 10, 9.0);
        this.camera.lookAt(0, -3, 0);
        // this.camera.position.set(0, 2, 9.0);
        // this.camera.lookAt(0, -2, 0);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2; // Brighter!
        container.appendChild(this.renderer.domElement);
        
        // Lighting (only once!)
        const keyLight = new THREE.DirectionalLight(0xc8d8e8, 5); // Brighter moonlight
        keyLight.position.set(8, 16, -6);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        this.scene.add(keyLight);
        
        const ambient = new THREE.AmbientLight(0x708090, 0.9);
        this.scene.add(ambient);
        const hemi = new THREE.HemisphereLight(0x8090a0, 0x3a3a3a, 0.7);
        this.scene.add(hemi);
        
        this.createGround();
        this.createBoard();
        this.createEnvironment();
        this.createParticles();
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });


        this.renderer.domElement.addEventListener('click', (event) => {
            if (!this.game || this.game.phase !== 'plan') return;
            
            const rect = this.renderer.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                -((event.clientY - rect.top) / rect.height) * 2 + 1
            );
            
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);
            const hits = raycaster.intersectObjects(this.boardGroup.children);
            
            if (hits.length > 0) {
                const pos = hits[0].object.position;
                const col = Math.round(pos.x / 1.3 + 3.5);
                const row = Math.round(pos.z / 1.3 + 3.5);
                if (row >= 4 && row <= 7 && col >= 0 && col <= 7) {
                    this.game.clickBoard(row, col);
                }
            }
        });

        // Right click
        this.renderer.domElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            if (!this.game || this.game.phase !== 'plan') return;
            
            const rect = this.renderer.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                -((event.clientY - rect.top) / rect.height) * 2 + 1
            );
            
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);
            const hits = raycaster.intersectObjects(this.boardGroup.children);
            
            if (hits.length > 0) {
                const pos = hits[0].object.position;
                const col = Math.round(pos.x / 1.3 + 3.5);
                const row = Math.round(pos.z / 1.3 + 3.5);
                if (row >= 4 && row <= 7 && col >= 0 && col <= 7 && this.game.board[row][col].hero) {
                    this.game.rightClickBoard(row, col); // Same as left click - returns to bench
                }
            }
        });
    }

    createGround() {
        // Dark, damp mud / wet earth terrain
        const groundGeo = new THREE.PlaneGeometry(45, 45, 24, 24);
        const groundMat = new THREE.MeshStandardMaterial({ 
            color: 0x16181b, 
            roughness: 0.95,
            metalness: 0.02
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.55;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Massive, weathered stone platform
        const platformGeo = new THREE.BoxGeometry(12.2, 0.35, 12.2);
        const platformMat = new THREE.MeshStandardMaterial({ 
            color: 0x1d2126, 
            roughness: 0.85,
            metalness: 0.05
        });
        const platform = new THREE.Mesh(platformGeo, platformMat);
        platform.position.y = -0.38;
        platform.receiveShadow = true;
        platform.castShadow = true;
        this.scene.add(platform);
    }

    createBoard() {
        this.boardGroup = new THREE.Group();
        const ts = this.tileSize;
        
        // Outer Heavy Weathered Iron & Timber Border
        const frameGeo = new THREE.BoxGeometry(ts * 8 + 0.45, 0.18, ts * 8 + 0.45);
        const frameMat = new THREE.MeshStandardMaterial({ 
            color: 0x121110, 
            roughness: 0.7,
            metalness: 0.4
        });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.y = -0.09;
        frame.receiveShadow = true;
        frame.castShadow = true;
        this.boardGroup.add(frame);
        
        // Dark Mortar/Grout Base Bed
        const groutBaseGeo = new THREE.BoxGeometry(ts * 8, 0.04, ts * 8);
        const groutBaseMat = new THREE.MeshStandardMaterial({ color: 0x090a0c, roughness: 1.0 });
        const groutBase = new THREE.Mesh(groutBaseGeo, groutBaseMat);
        groutBase.position.y = 0.01;
        this.boardGroup.add(groutBase);

        // Tiles: Aged Slate & Dark Granite
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const isDark = (r + c) % 2 === 0;
                const tileGeo = new THREE.BoxGeometry(ts * 0.94, 0.08, ts * 0.94);
                const noise = (Math.random() - 0.5) * 0.03;
                let baseHex = isDark ? 0x22262c : 0x383e47;
                
                const tileMat = new THREE.MeshStandardMaterial({ 
                    color: new THREE.Color(baseHex).addScalar(noise),
                    roughness: 0.65 + Math.random() * 0.2,
                    metalness: 0.05
                });
                
                const tile = new THREE.Mesh(tileGeo, tileMat);
                tile.position.x = (c - 3.5) * ts;
                tile.position.z = (r - 3.5) * ts;
                tile.position.y = 0.04;
                tile.receiveShadow = true;
                tile.castShadow = true;
                
                // ADD USERDATA FOR RAYCASTING
                tile.userData = { row: r, col: c, isTile: true };

                this.boardGroup.add(tile);
                this.tileMeshes.push(tile); // ADD TO TILEMESHES ARRAY
            }
        }
        
        // Subtle Tarnished Metallic Divider Line
        const lineGeo = new THREE.BoxGeometry(ts * 8.05, 0.02, 0.08);
        const lineMat = new THREE.MeshStandardMaterial({ 
            color: 0x332c1e, 
            roughness: 0.5,
            metalness: 0.6
        });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.z = 0;
        line.position.y = 0.081;
        this.boardGroup.add(line);
        
        // Weathered Iron Corner Posts
        const corners = [[-4, -4], [4, -4], [-4, 4], [4, 4]];
        corners.forEach(([cx, cz]) => {
            const pillarGeo = new THREE.BoxGeometry(0.2, 0.25, 0.2);
            const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1f2226, metalness: 0.7, roughness: 0.5 });
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.set(cx * ts, 0.1, cz * ts);
            pillar.castShadow = true;
            this.boardGroup.add(pillar);
        });
        
        this.scene.add(this.boardGroup);
    }

    createEnvironment() {
        // Dead Gnarled Trees instead of cartoonish pine trees
        const treePositions = [
            [-7.5, -5.8], [7.2, -6.0], [-7.2, 6.2], [7.5, 6.0],
            [-8.5, 0.2], [8.5, -0.4]
        ];
        
        treePositions.forEach(([tx, tz]) => {
            const tree = this.makeDeadTree();
            tree.position.set(tx, -0.52, tz);
            tree.scale.setScalar(0.7 + Math.random() * 0.4);
            tree.rotation.y = Math.random() * Math.PI * 2;
            this.scene.add(tree);
        });

        // Scattering small mossy rocks around the platform
        for (let i = 0; i < 18; i++) {
            const x = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;
            if (Math.abs(x) < 6.5 && Math.abs(z) < 6.5) continue;

            const rockGeo = new THREE.DodecahedronGeometry(0.15 + Math.random() * 0.2, 1);
            const rockMat = new THREE.MeshStandardMaterial({ color: 0x222622, roughness: 0.9 });
            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.set(x, -0.48, z);
            rock.rotation.set(Math.random(), Math.random(), Math.random());
            rock.castShadow = true;
            rock.receiveShadow = true;
            this.scene.add(rock);
        }
    }

    makeDeadTree() {
        const tree = new THREE.Group();
        const trunkGeo = new THREE.CylinderGeometry(0.08, 0.18, 1.8, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x1a1614, roughness: 0.95 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.9;
        trunk.castShadow = true;
        tree.add(trunk);

        // Low-poly dead branches
        for (let i = 0; i < 3; i++) {
            const branchGeo = new THREE.CylinderGeometry(0.03, 0.06, 0.8, 5);
            const branch = new THREE.Mesh(branchGeo, trunkMat);
            branch.position.y = 1.0 + i * 0.3;
            branch.rotation.z = (i % 2 === 0 ? 1 : -1) * (0.6 + Math.random() * 0.3);
            branch.rotation.y = Math.random() * Math.PI;
            branch.castShadow = true;
            tree.add(branch);
        }
        return tree;
    }

    createParticles() {
        // Faint atmospheric dust / cold ash drifting in air
        const count = 35;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 16;
            positions[i * 3 + 1] = Math.random() * 3.0 + 0.2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
        }
        
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const mat = new THREE.PointsMaterial({
            color: 0x7c8c9e,
            size: 0.04,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.dust = new THREE.Points(geo, mat);
        this.dust.userData = { positions, count };
        this.scene.add(this.dust);
    }
        
    placeHero(hero, row, col, isEnemy = false) {
        const mesh = HeroFactory.createMesh(hero, isEnemy);
        const ts = this.tileSize;
        mesh.position.x = (col - 3.5) * ts;
        mesh.position.z = (row - 3.5) * ts;
        mesh.position.y = 0.08;
        
        // Face direction
        if (!isEnemy) {
            mesh.rotation.y = Math.PI;
        } else {
            mesh.rotation.y = 0;
        }
        
        // ADD to existing userData, don't REPLACE it
        mesh.userData.hero = hero;
        mesh.userData.row = row;
        mesh.userData.col = col;
        // animator, healthBar, updateAnimation are already set by HeroFactory
        
        this.scene.add(mesh);
        
        if (isEnemy) {
            this.enemyMeshes.push(mesh);
        } else {
            this.heroMeshes.push(mesh);
        }
        
        hero.mesh = mesh;
        return mesh;
    }
    
    clearHeroes() {
        this.heroMeshes.forEach(m => this.scene.remove(m));
        this.enemyMeshes.forEach(m => this.scene.remove(m));
        this.heroMeshes = [];
        this.enemyMeshes = [];
    }
    
    clearEnemies() {
        this.enemyMeshes.forEach(m => this.scene.remove(m));
        this.enemyMeshes = [];
    }
    
    removeHero(row, col) {
        for (let i = this.heroMeshes.length - 1; i >= 0; i--) {
            const m = this.heroMeshes[i];
            if (m.userData.hero && m.userData.hero.row === row && m.userData.hero.col === col) {
                this.scene.remove(m);
                this.heroMeshes.splice(i, 1);
                return;
            }
        }
    }
    
    removeHeroMesh(mesh) {
        const idx = this.heroMeshes.indexOf(mesh);
        if (idx >= 0) {
            this.scene.remove(mesh);
            this.heroMeshes.splice(idx, 1);
        }
    }
    
    updateHeroPositions(heroes, enemies) {
        const dt = Math.min(this.clock.getDelta(), 0.1);
        
        const updateMeshUnit = (mesh, unit) => {
            if (!unit) return;

            // 3D Health Bar
            if (mesh.userData.healthBar3D && unit.hp !== undefined && unit.maxHp) {
                HealthBar3D.update(
                    mesh.userData.healthBar3D,
                    unit.hp || 0,
                    unit.maxHp || 1,
                    unit.mana || 0,
                    unit.maxMana || 1,
                    this.camera
                );
            }

            // 2D Health Bar (backup)
            if (mesh.userData.healthBar) {
                const pct = Math.max(0, unit.hp / unit.maxHp);
                mesh.userData.healthBar.scale.x = Math.max(0.01, pct);
                mesh.userData.healthBar.material.color.setHex(
                    pct > 0.5 ? 0x27ae60 : pct > 0.25 ? 0xd35400 : 0xc0392b
                );
            }

            // Death
            if (!unit.alive && !mesh.userData.dead) {
                mesh.userData.dead = true;
                if (mesh.userData.animator) {
                    mesh.userData.animator.play('die');
                    setTimeout(() => {
                        if (mesh.parent) this.scene.remove(mesh);
                    }, 850);
                } else {
                    this.scene.remove(mesh);
                }
            }
        };

        // Update all meshes
        this.heroMeshes.forEach(mesh => {
            if (mesh?.userData?.hero) updateMeshUnit(mesh, mesh.userData.hero);
        });

        for (let i = this.enemyMeshes.length - 1; i >= 0; i--) {
            const mesh = this.enemyMeshes[i];
            if (mesh?.userData?.hero) updateMeshUnit(mesh, mesh.userData.hero);
            if (mesh?.userData?.dead) this.enemyMeshes.splice(i, 1);
        }

        // Dust particles
        if (this.dust) {
            const pos = this.dust.userData.positions;
            for (let i = 0; i < this.dust.userData.count; i++) {
                pos[i * 3 + 1] -= 0.0015;
                if (pos[i * 3 + 1] < 0.2) pos[i * 3 + 1] = 3.2;
            }
            this.dust.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    highlightTile(row, col) {
        this.clearHighlight();
        const geo = new THREE.BoxGeometry(this.tileSize * 0.94, 0.01, this.tileSize * 0.94);
        // Soft amber rune glow instead of bright neon green
        const mat = new THREE.MeshBasicMaterial({ color: 0xc8963e, transparent: true, opacity: 0.35, depthTest: false });
        this.highlightMesh = new THREE.Mesh(geo, mat);
        this.highlightMesh.position.x = (col - 3.5) * this.tileSize;
        this.highlightMesh.position.z = (row - 3.5) * this.tileSize;
        this.highlightMesh.position.y = 0.085;
        this.scene.add(this.highlightMesh);
    }
    
    clearHighlight() {
        if (this.highlightMesh) {
            this.scene.remove(this.highlightMesh);
            this.highlightMesh = null;
        }
    }
    
    render() {
        const dt = Math.min(this.clock.getDelta(), 0.1);
        
        [...this.heroMeshes, ...this.enemyMeshes].forEach(mesh => {
            if (mesh?.userData?.animator) {
                mesh.userData.animator.update(dt);
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }

    // Find and remove mesh by hero reference
    removeHeroMeshByHero(hero) {
        for (let i = this.heroMeshes.length - 1; i >= 0; i--) {
            const mesh = this.heroMeshes[i];
            if (mesh.userData.hero === hero) {
                this.scene.remove(mesh);
                this.heroMeshes.splice(i, 1);
                return;
            }
        }
    }
}