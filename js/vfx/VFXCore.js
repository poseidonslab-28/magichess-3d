// js/vfx/VFXCore.js
class VFXCore {
    constructor(scene) {
        this.scene = scene;
        this.activeEffects = [];
        this.unitSphere = new THREE.SphereGeometry(1, 12, 12);
        this.unitCone = new THREE.ConeGeometry(1, 1, 10);
        this.unitBox = new THREE.BoxGeometry(1, 1, 1);
        this.unitCylinder = new THREE.CylinderGeometry(1, 1, 1, 10);
        this.unitTorus = new THREE.TorusGeometry(1, 0.25, 10, 24);
        this.unitPlane = new THREE.PlaneGeometry(1, 1);
        this.unitGeometries = new Set([
            this.unitSphere, this.unitCone, this.unitBox,
            this.unitCylinder, this.unitTorus, this.unitPlane
        ]);
    }

    update(dt) {
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const e = this.activeEffects[i];
            e.life -= dt;
            if (e.life <= 0) { e.cleanup(); this.activeEffects.splice(i, 1); }
            else e.update(dt);
        }
    }

    addEffect(effect) { this.activeEffects.push(effect); }

    disposeObject(obj) {
        if (!obj) return;
        if (obj.geometry && !this.unitGeometries.has(obj.geometry)) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
        }
        if (obj.children) [...obj.children].forEach(c => this.disposeObject(c));
    }

    createFloatingText(position, text, type = 'damage') {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        let fontColor = '#ffffff', strokeColor = '#000000', fontSize = 80, scale = 4.0;

        switch (type) {
            case 'crit':
                fontColor = '#ffdd00'; strokeColor = '#660000';
                fontSize = 100; scale = 5.0; break;
            case 'heal':
                fontColor = '#44ff77'; strokeColor = '#003311';
                fontSize = 75; scale = 3.5; break;
            default:
                fontColor = '#ffffff'; strokeColor = '#000000';
                fontSize = 80; scale = 4.0; break;
        }

        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 16; ctx.strokeText(String(text), 256, 128);
        ctx.lineWidth = 8; ctx.strokeText(String(text), 256, 128);
        ctx.fillStyle = fontColor;
        ctx.fillText(String(text), 256, 128);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;

        const spriteMat = new THREE.SpriteMaterial({
            map: texture, transparent: true, depthTest: false, depthWrite: false,
        });

        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.copy(position);
        sprite.position.y += 0.5;
        sprite.scale.set(scale, scale * 0.5, 1);
        sprite.renderOrder = 999;
        sprite.frustumCulled = false;
        this.scene.add(sprite);

        const startY = sprite.position.y;
        const riseHeight = 1.2;
        const riseDuration = 0.8;   // SLOWER rise
        const pauseDuration = 1.3;  // LONGER pause
        const fadeDuration = 1.0;   // SLOWER fade
        const totalDuration = riseDuration + pauseDuration + fadeDuration;

        this.addEffect({
            group: sprite, life: totalDuration, time: 0,
            update: (dt) => {
                const eff = this.activeEffects[this.activeEffects.length - 1];
                eff.time += dt;
                const elapsed = eff.time;

                if (elapsed < riseDuration) {
                    const p = elapsed / riseDuration;
                    sprite.position.y = startY + p * riseHeight;
                } else if (elapsed < riseDuration + pauseDuration) {
                    sprite.position.y = startY + riseHeight;
                } else {
                    const p = (elapsed - riseDuration - pauseDuration) / fadeDuration;
                    sprite.position.y = startY + riseHeight + p * 0.2;
                    spriteMat.opacity = 1 - p;
                }
            },
            cleanup: () => {
                this.scene.remove(sprite);
                texture.dispose();
                spriteMat.dispose();
            }
        });
    }

    createProjectile(from, to, type, color = 0xffdd44) {
        const group = new THREE.Group();
        
        if (type === 'windArrow') {
            this.makeWindArrow(group);  // Special wind arrow
        } else if (type === 'arrow') {
            this.makeArrow(group, color);
        } else if (type === 'fireball') {
            this.makeFireball(group);
        } else if (type === 'iceShard') {
            this.makeIceShard(group);
        } else {
            this.makeMagicBolt(group, color);
        }
        
        group.position.copy(from);
        this.scene.add(group);
        group.position.copy(from); this.scene.add(group);
        const startPos = from.clone(), endPos = to.clone();
        const distance = startPos.distanceTo(endPos);
        const duration = Math.max(0.2, distance * 0.08);
        const getPosAt = (t) => {
            const pos = new THREE.Vector3().lerpVectors(startPos, endPos, Math.min(t, 1));
            pos.y += Math.sin(Math.min(t, 1) * Math.PI) * Math.min(1.2, distance * 0.2);
            return pos;
        };
        this.addEffect({
            group, life: duration, time: 0, hit: false,
            update: (dt) => {
                const eff = this.activeEffects[this.activeEffects.length - 1];
                eff.time += dt; const t = eff.time / duration;
                if (t <= 1.0) { group.position.copy(getPosAt(t)); group.lookAt(getPosAt(t + 0.02)); }
                if (t >= 1.0 && !eff.hit) { eff.hit = true; group.visible = false; this.createImpact(endPos, type, { color }); eff.life = 0; }
            },
            cleanup: () => { this.scene.remove(group); this.disposeObject(group); }
        });
    }

    slashEffect(pos, options = {}) {
        const scale = options.scale || 0.2;
        const coreColor = options.color || 0xffffff;
        const glowColor = options.glowColor || 0xffdd44;
        const angle = options.angle !== undefined ? options.angle : (Math.random() - 0.5) * 0.8;

        const group = new THREE.Group();
        group.position.copy(pos);
        group.position.y += 0.3;
        group.rotation.z = angle;
        group.renderOrder = 9999;

        // 1. Thick white core slash
        const coreMat = new THREE.MeshBasicMaterial({
            color: coreColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false
        });
        const coreMesh = new THREE.Mesh(this.unitPlane, coreMat);
        coreMesh.scale.set(0.4 * scale, 3.5 * scale, 1);
        group.add(coreMesh);

        // 2. Colored glow around it
        const glowMat = new THREE.MeshBasicMaterial({
            color: glowColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false
        });
        const glowMesh = new THREE.Mesh(this.unitPlane, glowMat);
        glowMesh.scale.set(1.0 * scale, 4.0 * scale, 1);
        glowMesh.position.z -= 0.01;
        group.add(glowMesh);

        this.scene.add(group);

        // 3. Sparks
        const sparks = [];
        for (let i = 0; i < 6; i++) {
            const sparkMat = new THREE.MeshBasicMaterial({
                color: i % 2 === 0 ? 0xffffff : glowColor,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                depthWrite: false
            });
            const spark = new THREE.Mesh(this.unitSphere, sparkMat);
            spark.position.copy(pos);
            spark.position.y += 0.6;
            spark.scale.setScalar(0.08 * scale);
            spark.renderOrder = 9999;
            this.scene.add(spark);
            const sparkAngle = angle + (Math.random() - 0.5) * 1.5;
            const speed = (2.0 + Math.random() * 3.0) * scale;
            sparks.push({ mesh: spark, mat: sparkMat, angle: sparkAngle, speed });
        }

        // SLOWER fade - 0.3 seconds instead of 0.16
        this.addEffect({
            life: 0.3, time: 0,
            update: (dt, elapsed, progress) => {
                // Slower expand
                const expand = 1.0 + progress * 1.5;
                coreMesh.scale.x = (0.4 * expand) * scale;
                glowMesh.scale.x = (1.0 * expand) * scale;

                // Linear fade (slower than pow)
                const fade = 1 - progress;
                coreMat.opacity = fade;
                glowMat.opacity = fade * 0.7;

                sparks.forEach(s => {
                    s.mesh.position.x += Math.cos(s.angle) * s.speed * dt;
                    s.mesh.position.y += Math.sin(s.angle) * s.speed * dt;
                    s.mesh.scale.setScalar((0.08 * scale) * fade);
                    s.mat.opacity = fade;
                });
            },
            cleanup: () => {
                this.scene.remove(group);
                coreMat.dispose();
                glowMat.dispose();
                sparks.forEach(s => {
                    this.scene.remove(s.mesh);
                    s.mat.dispose();
                });
            }
        });
    }

    arrowImpact(pos) {
        const m = new THREE.MeshBasicMaterial({ color: 0xffea00, transparent: true, blending: THREE.AdditiveBlending });
        for (let i = 0; i < 8; i++) {
            const s = new THREE.Mesh(this.unitSphere, m.clone()); s.position.copy(pos); s.scale.setScalar(0.06); this.scene.add(s);
            const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 2;
            this.addEffect({
                group: s, life: 0.25, time: 0,
                update: (dt) => { s.userData.time = (s.userData.time || 0) + dt; const t = s.userData.time / 0.25; s.position.x += Math.cos(a) * sp * dt; s.position.y += sp * dt; s.scale.setScalar(0.06 * (1 - t)); m.opacity = 1 - t; },
                cleanup: () => { this.scene.remove(s); m.dispose(); }
            });
        }
    }

    // Projectile builders
    makeArrow(group, color) {
        const shaft = new THREE.Mesh(this.unitCylinder, new THREE.MeshStandardMaterial({ color: 0x5C4033 }));
        shaft.scale.set(0.018, 1.2, 0.018); shaft.rotation.x = Math.PI / 2; group.add(shaft);
        const tip = new THREE.Mesh(this.unitCone, new THREE.MeshStandardMaterial({ color: 0xD0D0D0, metalness: 0.8 }));
        tip.scale.set(0.035, 0.2, 0.035); tip.position.z = 0.65; tip.rotation.x = Math.PI / 2; group.add(tip);
    }

    makeFireball(group) {
        const c = new THREE.Mesh(this.unitSphere, new THREE.MeshBasicMaterial({ color: 0xff4400 })); c.scale.setScalar(0.18); group.add(c);
        const g = new THREE.Mesh(this.unitSphere, new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); g.scale.setScalar(0.28); group.add(g);
    }

    makeIceShard(group) {
        const s = new THREE.Mesh(this.unitCone, new THREE.MeshStandardMaterial({ color: 0x88d0ff, emissive: 0x2288ee, emissiveIntensity: 0.8, roughness: 0.1, metalness: 0.4 }));
        s.scale.set(0.12, 0.65, 0.12); s.rotation.x = Math.PI / 2; group.add(s);
    }

    makeMagicBolt(group, color) {
        const c = new THREE.Mesh(this.unitSphere, new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending })); c.scale.setScalar(0.14); group.add(c);
    }
}