// js/ui/ShopUI.js
class ShopUI {
    constructor(game) {
        this.game = game;
        this.previewItems = [];
        this.animId = null;

        // SINGLE shared offscreen WebGL renderer (prevents context thrashing & lag)
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = 130;
        this.offscreenCanvas.height = 130;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.offscreenCanvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(130, 130);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.3;

        // Event listener bindings
        const btnOpen = document.getElementById('btn-open-shop');
        if (btnOpen) btnOpen.onclick = () => this.open();

        const btnClose = document.getElementById('btn-close-shop');
        if (btnClose) btnClose.onclick = () => this.close();

        // Fixed duplicate assignment bug
        const btnReroll = document.getElementById('btn-reroll-modal');
        if (btnReroll) {
            btnReroll.onclick = () => {
                if (this.game.rerollShop()) {
                    this.render(this.game.shop);
                }
            };
        }
    }

    open() {
        const modal = document.getElementById('shop-modal');
        if (modal) modal.style.display = 'flex';
        
        this.game.refreshShop();
        this.render(this.game.shop);
        this.startLoop();
    }

    close() {
        const modal = document.getElementById('shop-modal');
        if (modal) modal.style.display = 'none';

        this.stopLoop();
        this.clearPreviews();
    }

    startLoop() {
        if (this.animId) return;

        const loop = () => {
            this.updateAndRenderPreviews();
            this.animId = requestAnimationFrame(loop);
        };
        this.animId = requestAnimationFrame(loop);
    }

    stopLoop() {
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
    }

    updateAndRenderPreviews() {
        const now = Date.now();

        for (let i = 0; i < this.previewItems.length; i++) {
            const item = this.previewItems[i];
            if (!item.canvas2d.isConnected) continue;

            // Idle animations
            item.mesh.rotation.y += 0.008;
            item.mesh.position.y = -0.34 + Math.sin(now * 0.003) * 0.03;
            item.glow.material.opacity = 0.2 + Math.sin(now * 0.004) * 0.1;

            // Render to offscreen canvas and blit directly to 2D card canvas
            this.renderer.render(item.scene, item.camera);
            item.ctx2d.clearRect(0, 0, 130, 130);
            item.ctx2d.drawImage(this.offscreenCanvas, 0, 0);
        }
    }

    clearPreviews() {
        this.previewItems.forEach(item => {
            item.scene.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(m => m.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            });
        });

        this.previewItems = [];
    }

    render(shop) {
        const container = document.getElementById('shop-heroes');
        if (!container) return;

        container.innerHTML = '';
        this.clearPreviews();

        const goldEl = document.getElementById('modal-gold');
        if (goldEl && this.game.economy) goldEl.textContent = this.game.economy.gold;

        shop.forEach((h, i) => {
            const card = document.createElement('div');

            // Empty / Sold slot
            if (!h) {
                card.className = 'shop-card shop-card-sold';
                card.textContent = 'SOLD';
                container.appendChild(card);
                return;
            }

            // Card layout
            card.className = 'shop-card';
            card.style.cssText = `
                width: 130px; height: 200px;
                background: linear-gradient(180deg, rgba(30,20,15,0.95), rgba(20,15,10,0.95));
                border: 2px solid #8B6914; border-radius: 12px; cursor: pointer;
                display: flex; flex-direction: column; align-items: center;
                transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; 
                overflow: hidden;
            `;

            // 2D Target canvas for 3D preview
            const previewCanvas = document.createElement('canvas');
            previewCanvas.width = 130;
            previewCanvas.height = 130;
            previewCanvas.style.borderRadius = '8px 8px 0 0';
            card.appendChild(previewCanvas);

            // Info text section
            const info = document.createElement('div');
            info.style.cssText = `
                flex:1; width:100%; padding:6px;
                display:flex; flex-direction:column; align-items:center;
                justify-content:center; gap:3px;
            `;
            info.innerHTML = `
                <div style="color:#FFD700;font-weight:bold;font-size:11px;">${h.name}</div>
                <div style="display:flex;gap:3px;justify-content:center;">
                    ${h.traits.map((t, j) => 
                        `<canvas class="shop-syn-${h.id}-${j}" width="18" height="18" style="border-radius:3px;"></canvas>`
                    ).join('')}
                </div>
                <div style="background:#FFD700;color:#1a1a0a;padding:2px 12px;border-radius:8px;font-weight:bold;font-size:10px;">${h.cost} GOLD</div>
            `;
            card.appendChild(info);

            // Hover interactions
            card.onmouseenter = () => {
                card.style.borderColor = '#FFD700';
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 10px 25px rgba(255,215,0,0.3)';
            };
            card.onmouseleave = () => {
                card.style.borderColor = '#8B6914';
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'none';
            };

            card.onclick = () => {
                if (this.game.buyHero(i)) {
                    this.render(this.game.shop);
                    if (this.game.updateUI) this.game.updateUI();
                    if (this.game.renderBoard) this.game.renderBoard();
                    if (this.game.benchUI) this.game.benchUI.render(this.game.bench);
                }
            };

            container.appendChild(card);

            // Setup 3D preview scene metadata
            this.createMiniPreview(previewCanvas, h);

            // Render trait icons
            h.traits.forEach((t, j) => {
                const iconCanvas = card.querySelector(`.shop-syn-${h.id}-${j}`);
                if (iconCanvas && typeof SynergyIcons !== 'undefined') {
                    SynergyIcons.renderIcon(iconCanvas, t, 18);
                }
            });
        });
    }

    createMiniPreview(canvas2d, hero) {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1510);

        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 15);
        camera.position.set(0, 0.5, 1.8);
        camera.lookAt(0, 0.1, 0);

        // Pedestal Base
        const platformGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.12, 16);
        const platformMat = new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.3, metalness: 0.7 });
        const platform = new THREE.Mesh(platformGeo, platformMat);
        platform.position.y = -0.45;
        scene.add(platform);

        const ringGeo = new THREE.TorusGeometry(0.36, 0.02, 8, 24);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            roughness: 0.2,
            metalness: 0.9,
            emissive: 0xFFD700,
            emissiveIntensity: 0.3
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = -0.38;
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);

        // Rarity Glow
        const rarityColors = { 1: 0xa0aab0, 2: 0x38ef7d, 3: 0x00d2ff, 4: 0xd04ed6, 5: 0xffe066 };
        const glowColor = rarityColors[hero.cost] || 0xFFD700;
        const glowGeo = new THREE.CylinderGeometry(0.38, 0.5, 0.04, 16);
        const glowMat = new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.3, depthWrite: false });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.y = -0.48;
        scene.add(glow);

        // Lighting
        scene.add(new THREE.AmbientLight(0x8899aa, 0.9));
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
        keyLight.position.set(2, 3, 2);
        scene.add(keyLight);

        // Hero Mesh
        const mesh = HeroModels.create({ data: hero, star: hero.star || 1 });
        mesh.position.y = -0.34;

        const scaleMap = { tank: 0.55, warrior: 0.6, assassin: 0.7, support: 0.7 };
        mesh.scale.setScalar(scaleMap[hero.traits[0]] || 0.65);
        scene.add(mesh);

        // Register preview for batch rendering in the single loop
        this.previewItems.push({
            scene,
            camera,
            mesh,
            glow,
            canvas2d,
            ctx2d: canvas2d.getContext('2d')
        });
    }
}