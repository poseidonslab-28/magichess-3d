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
        canvas.width = 1024; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        let fontColor = '#ffffff', strokeColor = '#880000', fontSize = 55, scale = 2.6, isCrit = false;
        switch (type) {
            case 'crit': fontColor = '#ffdd00'; fontSize = 65; scale = 3.0; isCrit = true; break;
            case 'heal': fontColor = '#44ff77'; fontSize = 58; scale = 2.8; break;
        }
        ctx.font = `bold ${fontSize}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeStyle = strokeColor; ctx.lineWidth = 20; ctx.strokeText(String(text), 512, 256);
        ctx.fillStyle = fontColor; ctx.fillText(String(text), 512, 256);
        const texture = new THREE.CanvasTexture(canvas); texture.minFilter = THREE.LinearFilter;
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.copy(position); sprite.position.y += 0.3;
        sprite.scale.set(scale, scale * 0.5, 1); sprite.renderOrder = 999; sprite.frustumCulled = false;
        this.scene.add(sprite);
        const duration = isCrit ? 1.25 : 1.0;
        const startY = sprite.position.y;
        this.addEffect({
            group: sprite, life: duration, time: 0,
            update: (dt) => {
                const eff = this.activeEffects[this.activeEffects.length - 1];
                eff.time += dt; const p = eff.time / duration;
                sprite.position.y = startY + p * 2.0;
                if (p > 0.5) spriteMat.opacity = 1 - (p - 0.5) / 0.5;
            },
            cleanup: () => { this.scene.remove(sprite); texture.dispose(); spriteMat.dispose(); }
        });
    }

    createProjectile(from, to, type, color = 0xffdd44) {
        const group = new THREE.Group();
        if (type === 'arrow' || type === 'windArrow') this.makeArrow(group, type === 'windArrow' ? 0x88ff44 : color);
        else if (type === 'fireball') this.makeFireball(group);
        else if (type === 'iceShard') this.makeIceShard(group);
        else this.makeMagicBolt(group, color);
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

    // Common effects
    slashEffect(pos, options = {}) {
        const scale = options.scale || 0.5;
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false });
        const slash = new THREE.Mesh(this.unitPlane, mat);
        slash.position.copy(pos); slash.position.y += 0.4;
        slash.scale.set(0.8 * scale, 2.5 * scale, 1); slash.rotation.z = (Math.random() - 0.5) * 0.6;
        slash.renderOrder = 9999; this.scene.add(slash);
        this.addEffect({
            group: slash, life: 0.2, time: 0,
            update: (dt) => { slash.userData.time = (slash.userData.time || 0) + dt; const t = slash.userData.time / 0.2; slash.scale.x = (0.8 + t) * scale; mat.opacity = 1 - t; },
            cleanup: () => { this.scene.remove(slash); mat.dispose(); }
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