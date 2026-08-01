// js/systems/VFXRenderer.js
class VFXRenderer {
    constructor(scene) {
        this.scene = scene;
        this.activeEffects = [];

        // Shared Geometry Cache
        this.unitSphere = new THREE.SphereGeometry(1, 12, 12);
        this.unitCone = new THREE.ConeGeometry(1, 1, 10);
        this.unitBox = new THREE.BoxGeometry(1, 1, 1);
        this.unitCylinder = new THREE.CylinderGeometry(1, 1, 1, 10);
        this.unitTorus = new THREE.TorusGeometry(1, 0.25, 10, 24);
        this.unitPlane = new THREE.PlaneGeometry(1, 1);

        this.unitGeometries = new Set([
            this.unitSphere,
            this.unitCone,
            this.unitBox,
            this.unitCylinder,
            this.unitTorus,
            this.unitPlane
        ]);
    }

    update(dt) {
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            effect.life -= dt;
            if (effect.life <= 0) {
                effect.cleanup();
                this.activeEffects.splice(i, 1);
            } else {
                effect.update(dt);
            }
        }
    }

    disposeObject(obj) {
        if (!obj) return;
        if (obj.geometry && !this.unitGeometries.has(obj.geometry)) {
            obj.geometry.dispose();
        }
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(m => m.dispose());
            } else {
                obj.material.dispose();
            }
        }
        if (obj.children) {
            [...obj.children].forEach(child => this.disposeObject(child));
        }
    }

    // --- FLOATING TEXT ---
    createFloatingText(position, text, type = 'damage') {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        let fontColor = '#ffffff';
        let strokeColor = '#880000';
        let fontSize = 55;
        let scale = 2.6;
        let isCrit = false;

        switch (type) {
            case 'crit':
                fontColor = '#ffdd00';
                strokeColor = '#880000';
                fontSize = 65;
                scale = 3.0;
                isCrit = true;
                break;
            case 'heal':
                fontColor = '#44ff77';
                fontSize = 58;
                scale = 2.8;
                break;
            case 'damage':
            default:
                fontColor = '#ffffff';
                fontSize = 55;
                scale = 2.6;
                break;
        }

        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 20;
        ctx.strokeText(String(text), 512, 256);
        ctx.fillStyle = fontColor;
        ctx.fillText(String(text), 512, 256);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;

        const spriteMat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });

        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.copy(position);
        sprite.position.y += 0.3;
        sprite.scale.set(scale, scale * 0.5, 1);
        sprite.renderOrder = 999;
        sprite.frustumCulled = false;

        this.scene.add(sprite);

        const duration = isCrit ? 1.25 : 1.0;
        const startY = sprite.position.y;

        const effect = {
            group: sprite,
            life: duration,
            time: 0,
            update: (dt) => {
                effect.time += dt;
                const progress = effect.time / duration;
                sprite.position.y = startY + progress * 2.0;
                if (progress > 0.5) {
                    spriteMat.opacity = 1 - (progress - 0.5) / 0.5;
                }
            },
            cleanup: () => {
                this.scene.remove(sprite);
                texture.dispose();
                spriteMat.dispose();
            }
        };

        this.activeEffects.push(effect);
        return effect;
    }

    // --- PROJECTILES ---
    createProjectile(from, to, type, color = 0xffdd44) {
        const group = new THREE.Group();

        switch (type) {
            case 'arrow':
                this.makeArrow(group, color);
                break;
            case 'fireball':
                this.makeFireball(group);
                break;
            case 'iceShard':
                this.makeIceShard(group);
                break;
            case 'magicBolt':
            default:
                this.makeMagicBolt(group, color);
                break;
        }

        group.position.copy(from);
        this.scene.add(group);

        const startPos = from.clone();
        const endPos = to.clone();
        const distance = startPos.distanceTo(endPos);
        const duration = Math.max(0.2, distance * 0.08);

        const getPosAt = (t) => {
            const pos = new THREE.Vector3().lerpVectors(startPos, endPos, Math.min(t, 1));
            const arc = Math.sin(Math.min(t, 1) * Math.PI) * Math.min(1.2, distance * 0.2);
            pos.y += arc;
            return pos;
        };

        const effect = {
            group,
            life: duration,
            time: 0,
            duration,
            hit: false,
            update: (dt) => {
                effect.time += dt;
                const t = effect.time / effect.duration;
                if (t <= 1.0) {
                    const currentPos = getPosAt(t);
                    const nextPos = getPosAt(t + 0.02);
                    group.position.copy(currentPos);
                    group.lookAt(nextPos);
                }
                if (t >= 1.0 && !effect.hit) {
                    effect.hit = true;
                    group.visible = false;
                    this.createImpact(endPos, type, { color });
                    effect.life = 0;
                }
            },
            cleanup: () => {
                this.scene.remove(group);
                this.disposeObject(group);
            }
        };

        this.activeEffects.push(effect);
        return effect;
    }

    // --- IMPACT ROUTER (with options) ---
    createImpact(position, type, options = {}) {
        const { scale = 1, color = 0xffdd44, duration = 500 } = options;

        switch (type) {
            case 'arrow': this.arrowImpact(position); break;
            case 'fireball': this.fireExplosion(position); break;
            case 'iceShard': this.iceShatter(position); break;
            case 'magicBolt': this.magicImpact(position, color); break;
            case 'slash': this.slashEffect(position); break;
            case 'heal': this.healEffect(position); break;
            case 'frostNova': this.frostNova(position, scale, color, duration); break;
            case 'iceSpike': this.iceSpike(position, scale, color, duration); break;
            case 'iceBurst': this.iceBurst(position, scale, color, duration); break;
            case 'freezePrison': this.freezePrison(position, scale, color, duration); break;
            case 'flash': this.flash(position, scale, duration); break;
            default: break;
        }
    }

    // --- PROJECTILE BUILDERS ---
    makeArrow(group, color) {
        const shaftMat = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 0.6 });
        const shaft = new THREE.Mesh(this.unitCylinder, shaftMat);
        shaft.scale.set(0.018, 1.2, 0.018);
        shaft.rotation.x = Math.PI / 2;
        group.add(shaft);

        const tipMat = new THREE.MeshStandardMaterial({ color: 0xD0D0D0, metalness: 0.8, roughness: 0.2 });
        const tip = new THREE.Mesh(this.unitCone, tipMat);
        tip.scale.set(0.035, 0.2, 0.035);
        tip.position.z = 0.65;
        tip.rotation.x = Math.PI / 2;
        group.add(tip);

        const fletchMat = new THREE.MeshStandardMaterial({ color: 0xCC2222, side: THREE.DoubleSide, roughness: 0.4 });
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const fletch = new THREE.Mesh(this.unitPlane, fletchMat);
            fletch.scale.set(0.12, 0.25, 1);
            fletch.rotation.x = Math.PI / 2;
            fletch.rotation.z = angle;
            const offset = 0.035;
            fletch.position.x = Math.cos(angle) * offset;
            fletch.position.y = Math.sin(angle) * offset;
            fletch.position.z = -0.45;
            group.add(fletch);
        }
    }

    makeFireball(group) {
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const core = new THREE.Mesh(this.unitSphere, coreMat);
        core.scale.setScalar(0.18);
        group.add(core);

        const innerGlowMat = new THREE.MeshBasicMaterial({ color: 0xff4400, blending: THREE.AdditiveBlending });
        const innerGlow = new THREE.Mesh(this.unitSphere, innerGlowMat);
        innerGlow.scale.setScalar(0.28);
        group.add(innerGlow);

        const outerGlowMat = new THREE.MeshBasicMaterial({
            color: 0xffa000,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const outerGlow = new THREE.Mesh(this.unitSphere, outerGlowMat);
        outerGlow.scale.setScalar(0.45);
        group.add(outerGlow);

        const trailMat = new THREE.MeshBasicMaterial({
            color: 0xff5500,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        for (let i = 0; i < 8; i++) {
            const particle = new THREE.Mesh(this.unitSphere, trailMat);
            particle.scale.setScalar(0.18 * (1 - i * 0.11));
            particle.position.z = -i * 0.08;
            group.add(particle);
        }
    }

    makeIceShard(group) {
        const shardMat = new THREE.MeshStandardMaterial({
            color: 0x88d0ff,
            emissive: 0x2288ee,
            emissiveIntensity: 0.8,
            roughness: 0.1,
            metalness: 0.4
        });
        const shard = new THREE.Mesh(this.unitCone, shardMat);
        shard.scale.set(0.12, 0.65, 0.12);
        shard.rotation.x = Math.PI / 2;
        group.add(shard);

        const frostMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        for (let i = 0; i < 6; i++) {
            const frost = new THREE.Mesh(this.unitSphere, frostMat);
            frost.scale.setScalar(0.06);
            frost.position.set((Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.12, -i * 0.1);
            group.add(frost);
        }
    }

    makeMagicBolt(group, color) {
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            blending: THREE.AdditiveBlending
        });
        const core = new THREE.Mesh(this.unitSphere, coreMat);
        core.scale.setScalar(0.14);
        group.add(core);

        const auraMat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const aura = new THREE.Mesh(this.unitSphere, auraMat);
        aura.scale.setScalar(0.28);
        group.add(aura);

        const trail = new THREE.Mesh(this.unitCylinder, auraMat);
        trail.scale.set(0.08, 0.45, 0.08);
        trail.position.z = -0.22;
        trail.rotation.x = Math.PI / 2;
        group.add(trail);
    }

    // --- EXISTING IMPACT METHODS ---

    arrowImpact(pos) {
        const sparkMatBase = new THREE.MeshBasicMaterial({
            color: 0xffea00,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        for (let i = 0; i < 12; i++) {
            const sparkMat = sparkMatBase.clone();
            const spark = new THREE.Mesh(this.unitSphere, sparkMat);
            spark.position.copy(pos);
            spark.scale.setScalar(0.08);
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.5 + Math.random() * 3.5;
            this.scene.add(spark);
            const effect = {
                group: spark,
                life: 0.3,
                time: 0,
                update: (dt) => {
                    effect.time += dt;
                    const progress = effect.time / 0.3;
                    spark.position.x += Math.cos(angle) * speed * dt;
                    spark.position.y += Math.sin(angle) * speed * dt + (1 - progress) * 1.8 * dt;
                    spark.position.z += (Math.random() - 0.5) * speed * dt;
                    spark.scale.setScalar(0.08 * (1 - progress));
                    sparkMat.opacity = 1 - progress;
                },
                cleanup: () => {
                    this.scene.remove(spark);
                    this.disposeObject(spark);
                }
            };
            this.activeEffects.push(effect);
        }
    }

    fireExplosion(pos) {
        // Core Flash
        const flashMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const flash = new THREE.Mesh(this.unitSphere, flashMat);
        flash.position.copy(pos);
        flash.scale.setScalar(0.8);
        this.scene.add(flash);
        this.activeEffects.push({
            group: flash,
            life: 0.15,
            time: 0,
            update: (dt) => {
                flash.userData.time = (flash.userData.time || 0) + dt;
                const t = flash.userData.time / 0.15;
                flash.scale.setScalar(0.8 + t * 1.2);
                flashMat.opacity = 1 - t;
            },
            cleanup: () => {
                this.scene.remove(flash);
                this.disposeObject(flash);
            }
        });

        // Shockwave Ring
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xff3300,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const ring = new THREE.Mesh(this.unitTorus, ringMat);
        ring.position.copy(pos);
        ring.rotation.x = Math.PI / 2;
        this.scene.add(ring);
        this.activeEffects.push({
            group: ring,
            life: 0.4,
            time: 0,
            update: (dt) => {
                ring.userData.time = (ring.userData.time || 0) + dt;
                const t = ring.userData.time / 0.4;
                ring.scale.setScalar(0.3 + t * 2.5);
                ringMat.opacity = 1 - t;
            },
            cleanup: () => {
                this.scene.remove(ring);
                this.disposeObject(ring);
            }
        });

        // Burst Flames
        const flameMatBase = new THREE.MeshBasicMaterial({
            color: 0xff7700,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        for (let i = 0; i < 18; i++) {
            const flameMat = flameMatBase.clone();
            const flame = new THREE.Mesh(this.unitSphere, flameMat);
            flame.position.copy(pos);
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.0 + Math.random() * 4.0;
            const lifeSpan = 0.35 + Math.random() * 0.3;
            this.scene.add(flame);
            this.activeEffects.push({
                group: flame,
                life: lifeSpan,
                time: 0,
                update: (dt) => {
                    flame.userData.time = (flame.userData.time || 0) + dt;
                    const t = flame.userData.time / lifeSpan;
                    flame.position.x += Math.cos(angle) * speed * dt;
                    flame.position.y += speed * 0.7 * dt;
                    flame.position.z += Math.sin(angle) * speed * dt;
                    flame.scale.setScalar(0.22 * (1 - t));
                    flameMat.opacity = 1 - t;
                },
                cleanup: () => {
                    this.scene.remove(flame);
                    this.disposeObject(flame);
                }
            });
        }
    }

    iceShatter(pos) {
        const iceMatBase = new THREE.MeshStandardMaterial({
            color: 0xaaddff,
            emissive: 0x44aaff,
            emissiveIntensity: 0.8,
            transparent: true
        });
        for (let i = 0; i < 14; i++) {
            const iceMat = iceMatBase.clone();
            const shard = new THREE.Mesh(this.unitBox, iceMat);
            shard.position.copy(pos);
            shard.scale.set(0.08, 0.22, 0.08);
            shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.0 + Math.random() * 4.0;
            this.scene.add(shard);
            this.activeEffects.push({
                group: shard,
                life: 0.5,
                time: 0,
                update: (dt) => {
                    shard.userData.time = (shard.userData.time || 0) + dt;
                    const t = shard.userData.time / 0.5;
                    shard.position.x += Math.cos(angle) * speed * dt;
                    shard.position.y += (1 - t * 2.2) * speed * dt;
                    shard.position.z += Math.sin(angle) * speed * dt;
                    shard.rotation.x += dt * 10;
                    shard.rotation.y += dt * 10;
                    iceMat.opacity = 1 - t;
                },
                cleanup: () => {
                    this.scene.remove(shard);
                    this.disposeObject(shard);
                }
            });
        }
    }

    magicImpact(pos, color) {
        const mat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const ring = new THREE.Mesh(this.unitTorus, mat);
        ring.position.copy(pos);
        ring.rotation.x = Math.PI / 2;
        this.scene.add(ring);
        this.activeEffects.push({
            group: ring,
            life: 0.35,
            time: 0,
            update: (dt) => {
                ring.userData.time = (ring.userData.time || 0) + dt;
                const t = ring.userData.time / 0.35;
                ring.scale.setScalar(0.2 + t * 2.0);
                mat.opacity = 1 - t;
            },
            cleanup: () => {
                this.scene.remove(ring);
                this.disposeObject(ring);
            }
        });

        const speckMatBase = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        for (let i = 0; i < 10; i++) {
            const speckMat = speckMatBase.clone();
            const speck = new THREE.Mesh(this.unitSphere, speckMat);
            speck.position.copy(pos);
            speck.scale.setScalar(0.08);
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.0;
            this.scene.add(speck);
            this.activeEffects.push({
                group: speck,
                life: 0.3,
                time: 0,
                update: (dt) => {
                    speck.userData.time = (speck.userData.time || 0) + dt;
                    const t = speck.userData.time / 0.3;
                    speck.position.x += Math.cos(angle) * speed * dt;
                    speck.position.y += Math.sin(angle) * speed * dt;
                    speck.position.z += (Math.random() - 0.5) * speed * dt;
                    speck.scale.setScalar(0.08 * (1 - t));
                    speckMat.opacity = 1 - t;
                },
                cleanup: () => {
                    this.scene.remove(speck);
                    this.disposeObject(speck);
                }
            });
        }
    }

    slashEffect(pos) {
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false
        });
        const slash = new THREE.Mesh(this.unitPlane, mat);
        slash.position.copy(pos);
        slash.position.y += 0.5;
        slash.scale.set(1.5, 5.0, 1); // MASSIVE - 1.5 wide, 5 tall
        slash.rotation.z = (Math.random() - 0.5) * 0.8;
        slash.renderOrder = 9999;
        slash.frustumCulled = false;
        this.scene.add(slash);

        const lifeSpan = 0.35;
        this.activeEffects.push({
            group: slash,
            life: lifeSpan,
            time: 0,
            update: (dt) => {
                slash.userData.time = (slash.userData.time || 0) + dt;
                const t = slash.userData.time / lifeSpan;
                slash.scale.x = 1.5 + t * 3.0; // Expand outward
                slash.scale.y = 5.0 + t * 2.0;
                mat.opacity = 1 - t;
            },
            cleanup: () => {
                this.scene.remove(slash);
                mat.dispose();
            }
        });
    }

    healEffect(pos) {
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x33ff66,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const ring = new THREE.Mesh(this.unitTorus, ringMat);
        ring.position.copy(pos);
        ring.rotation.x = Math.PI / 2;
        this.scene.add(ring);
        this.activeEffects.push({
            group: ring,
            life: 0.6,
            time: 0,
            update: (dt) => {
                ring.userData.time = (ring.userData.time || 0) + dt;
                const t = ring.userData.time / 0.6;
                ring.scale.setScalar(0.2 + t * 1.5);
                ringMat.opacity = 1 - t;
            },
            cleanup: () => {
                this.scene.remove(ring);
                this.disposeObject(ring);
            }
        });

        const matBase = new THREE.MeshBasicMaterial({
            color: 0x66ff88,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        for (let i = 0; i < 16; i++) {
            const mat = matBase.clone();
            const sparkle = new THREE.Mesh(this.unitSphere, mat);
            sparkle.position.copy(pos);
            sparkle.position.y += Math.random() * 0.3;
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.2;
            this.scene.add(sparkle);
            this.activeEffects.push({
                group: sparkle,
                life: 0.85,
                time: 0,
                update: (dt) => {
                    sparkle.userData.time = (sparkle.userData.time || 0) + dt;
                    const t = sparkle.userData.time / 0.85;
                    sparkle.position.x += Math.cos(angle) * speed * dt;
                    sparkle.position.y += dt * 2.0;
                    sparkle.position.z += Math.sin(angle) * speed * dt;
                    sparkle.scale.setScalar(0.08 * (1 - t));
                    mat.opacity = 1 - t;
                },
                cleanup: () => {
                    this.scene.remove(sparkle);
                    this.disposeObject(sparkle);
                }
            });
        }
    }

    // ========================================================
    //  NEW EFFECTS (FROST ULTIMATE)
    // ========================================================

    frostNova(pos, scale = 1, color = 0x88ddff, duration = 600) {
        // Core flash
        const flashMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const flash = new THREE.Mesh(this.unitSphere, flashMat);
        flash.position.copy(pos);
        flash.scale.setScalar(0.6 * scale);
        this.scene.add(flash);

        this.activeEffects.push({
            group: flash,
            life: 0.15,
            time: 0,
            update: (dt) => {
                flash.userData.time = (flash.userData.time || 0) + dt;
                const t = flash.userData.time / 0.15;
                flash.scale.setScalar((0.6 + t * 1.5) * scale);
                flashMat.opacity = 1 - t;
            },
            cleanup: () => {
                this.scene.remove(flash);
                this.disposeObject(flash);
            }
        });

        // Outer ring
        const ringMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const ring = new THREE.Mesh(this.unitTorus, ringMat);
        ring.position.copy(pos);
        ring.rotation.x = Math.PI / 2;
        this.scene.add(ring);

        const lifeSec = duration / 1000;
        this.activeEffects.push({
            group: ring,
            life: lifeSec,
            time: 0,
            update: (dt) => {
                ring.userData.time = (ring.userData.time || 0) + dt;
                const t = ring.userData.time / lifeSec;
                const ringScale = 0.3 + t * 2.5 * scale;
                ring.scale.setScalar(ringScale);
                ringMat.opacity = 1 - t;
            },
            cleanup: () => {
                this.scene.remove(ring);
                this.disposeObject(ring);
            }
        });

        // Inner ring
        const innerRingMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const innerRing = new THREE.Mesh(this.unitTorus, innerRingMat);
        innerRing.position.copy(pos);
        innerRing.rotation.x = Math.PI / 2;
        this.scene.add(innerRing);

        this.activeEffects.push({
            group: innerRing,
            life: lifeSec * 0.7,
            time: 0,
            update: (dt) => {
                innerRing.userData.time = (innerRing.userData.time || 0) + dt;
                const t = innerRing.userData.time / (lifeSec * 0.7);
                const ringScale = 0.15 + t * 1.8 * scale;
                innerRing.scale.setScalar(ringScale);
                innerRingMat.opacity = 0.7 * (1 - t);
            },
            cleanup: () => {
                this.scene.remove(innerRing);
                this.disposeObject(innerRing);
            }
        });
    }

    iceSpike(pos, scale = 1, color = 0xaaddff, duration = 400) {
        const spikeMat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: 0x4488ff,
            emissiveIntensity: 0.6,
            transparent: true,
            roughness: 0.2,
            metalness: 0.3
        });

        const lifeSec = duration / 1000;
        const count = Math.floor(5 + 7 * scale);
        for (let i = 0; i < count; i++) {
            const spike = new THREE.Mesh(this.unitCone, spikeMat);
            spike.position.copy(pos);
            spike.position.x += (Math.random() - 0.5) * 0.3 * scale;
            spike.position.z += (Math.random() - 0.5) * 0.3 * scale;
            spike.position.y += 0.1;
            spike.scale.set(
                0.04 + Math.random() * 0.08 * scale,
                0.2 + Math.random() * 0.4 * scale,
                0.04 + Math.random() * 0.08 * scale
            );
            spike.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            this.scene.add(spike);
            const speedY = 1.5 + Math.random() * 3;

            this.activeEffects.push({
                group: spike,
                life: lifeSec,
                time: 0,
                update: (dt) => {
                    spike.userData.time = (spike.userData.time || 0) + dt;
                    const t = spike.userData.time / lifeSec;
                    spike.position.y += speedY * dt * (1 - t * 0.8);
                    spike.rotation.x += dt * 8;
                    spike.rotation.y += dt * 6;
                    spikeMat.opacity = 1 - t;
                },
                cleanup: () => {
                    this.scene.remove(spike);
                    this.disposeObject(spike);
                }
            });
        }
    }

    iceBurst(pos, scale = 1, color = 0x88ddff, duration = 200) {
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const burst = new THREE.Mesh(this.unitSphere, mat);
        burst.position.copy(pos);
        burst.scale.setScalar(0.1 * scale);
        this.scene.add(burst);

        const lifeSec = duration / 1000;
        this.activeEffects.push({
            group: burst,
            life: lifeSec,
            time: 0,
            update: (dt) => {
                burst.userData.time = (burst.userData.time || 0) + dt;
                const t = burst.userData.time / lifeSec;
                burst.scale.setScalar((0.1 + t * 1.2) * scale);
                mat.opacity = 1 - t;
            },
            cleanup: () => {
                this.scene.remove(burst);
                this.disposeObject(burst);
            }
        });

        const shardMat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            transparent: true
        });
        for (let i = 0; i < 8; i++) {
            const shard = new THREE.Mesh(this.unitBox, shardMat);
            shard.position.copy(pos);
            shard.scale.set(0.02 * scale, 0.1 * scale, 0.02 * scale);
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            this.scene.add(shard);
            this.activeEffects.push({
                group: shard,
                life: 0.3,
                time: 0,
                update: (dt) => {
                    shard.userData.time = (shard.userData.time || 0) + dt;
                    const t = shard.userData.time / 0.3;
                    shard.position.x += Math.cos(angle) * speed * dt;
                    shard.position.y += speed * dt;
                    shard.position.z += Math.sin(angle) * speed * dt;
                    shard.rotation.x += dt * 12;
                    shard.rotation.y += dt * 8;
                    shardMat.opacity = 1 - t;
                },
                cleanup: () => {
                    this.scene.remove(shard);
                    this.disposeObject(shard);
                }
            });
        }
    }

    freezePrison(pos, scale = 1, color = 0x88ddff, duration = 1200) {
        const prisonMat = new THREE.MeshStandardMaterial({
            color: 0x88ddff,
            emissive: 0x4488ff,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,
            metalness: 0.2
        });
        const prison = new THREE.Mesh(this.unitBox, prisonMat);
        prison.position.copy(pos);
        prison.position.y += 0.4 * scale;
        prison.scale.set(0.5 * scale, 0.6 * scale, 0.5 * scale);
        this.scene.add(prison);

        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x88ddff,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const glow = new THREE.Mesh(this.unitSphere, glowMat);
        glow.position.copy(pos);
        glow.position.y += 0.4 * scale;
        glow.scale.setScalar(0.45 * scale);
        this.scene.add(glow);

        const lifeSec = duration / 1000;
        this.activeEffects.push({
            group: new THREE.Group(),
            life: lifeSec,
            time: 0,
            children: [prison, glow],
            update: (dt) => {
                this.activeEffects[this.activeEffects.length - 1].time += dt;
                const t = this.activeEffects[this.activeEffects.length - 1].time / lifeSec;
                if (t > 0.8) {
                    const fade = 1 - (t - 0.8) / 0.2;
                    prisonMat.opacity = 0.7 * fade;
                    glowMat.opacity = 0.3 * fade;
                }
            },
            cleanup: () => {
                this.scene.remove(prison);
                this.scene.remove(glow);
                this.disposeObject(prison);
                this.disposeObject(glow);
            }
        });
    }

    flash(pos, scale = 1, duration = 150) {
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const flash = new THREE.Mesh(this.unitSphere, mat);
        flash.position.copy(pos);
        flash.scale.setScalar(0.5 * scale);
        this.scene.add(flash);

        const lifeSec = duration / 1000;
        this.activeEffects.push({
            group: flash,
            life: lifeSec,
            time: 0,
            update: (dt) => {
                flash.userData.time = (flash.userData.time || 0) + dt;
                const t = flash.userData.time / lifeSec;
                flash.scale.setScalar((0.5 + t * 2.0) * scale);
                mat.opacity = 1 - t;
            },
            cleanup: () => {
                this.scene.remove(flash);
                this.disposeObject(flash);
            }
        });
    }
}