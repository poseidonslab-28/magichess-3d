// js/vfx/FrostVFX.js
class FrostVFX {
    static frostSigilEffect(vfx, pos, options = {}) {
        const scale = options.scale || 2.0;
        for (let i = 0; i < 20; i++) {
            const sx = pos.x + (Math.random() - 0.5) * 2.0 * scale;
            const sz = pos.z + (Math.random() - 0.5) * 2.0 * scale;
            const sy = pos.y + 2.5 + Math.random() * 2.0;
            const mat = new THREE.MeshStandardMaterial({ color: 0xccffff, emissive: 0x66aaff, emissiveIntensity: 1.0, roughness: 0.02, metalness: 0.5, transparent: true, opacity: 0.95 });
            const shard = new THREE.Mesh(vfx.unitCone, mat);
            shard.position.set(sx, sy, sz); shard.rotation.x = Math.PI;
            shard.scale.set(0.08 * scale, 0.5 * scale, 0.08 * scale);
            shard.renderOrder = 9999; vfx.scene.add(shard);
            const fallSpeed = 5 + Math.random() * 6, targetY = pos.y + 0.05;
            vfx.addEffect({
                group: shard, life: 0.5, time: 0,
                update: (dt) => { shard.userData.time = (shard.userData.time || 0) + dt; const t = shard.userData.time / 0.5; shard.position.y -= fallSpeed * dt * scale; if (shard.position.y <= targetY) { shard.position.y = targetY; mat.opacity = Math.max(0, 1 - (t - 0.3) / 0.7); shard.scale.y *= 0.2; } },
                cleanup: () => { vfx.scene.remove(shard); mat.dispose(); }
            });
        }
    }

    static glacialNovaEffect(vfx, pos, options = {}) {
        const scale = options.scale || 2.5;
        const colors = options.colors || [0xffffff, 0xaaddff, 0x88ccff, 0x4488cc];
        for (let i = 0; i < 15; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8, transparent: true, opacity: 0.9, roughness: 0.1, metalness: 0.3, depthTest: false, depthWrite: false });
            const crystal = new THREE.Mesh(vfx.unitCone, mat);
            crystal.position.copy(pos); crystal.position.y += 0.3;
            crystal.scale.set(0.08 * scale, 0.4 * scale, 0.08 * scale);
            crystal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            crystal.renderOrder = 9999; vfx.scene.add(crystal);
            const angle = Math.random() * Math.PI * 2, speed = 2 + Math.random() * 5;
            vfx.addEffect({
                group: crystal, life: 0.5, time: 0,
                update: (dt) => { crystal.userData.time = (crystal.userData.time || 0) + dt; const t = crystal.userData.time / 0.5; crystal.position.x += Math.cos(angle) * speed * dt * scale; crystal.position.y += speed * 0.4 * dt * scale; crystal.position.z += Math.sin(angle) * speed * dt * scale; crystal.rotation.x += dt * 8; crystal.rotation.y += dt * 6; mat.opacity = 1 - t; },
                cleanup: () => { vfx.scene.remove(crystal); mat.dispose(); }
            });
        }
    }
}