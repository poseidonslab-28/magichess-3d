// js/vfx/WindVFX.js
class WindVFX {
    static windArrowEffect(vfx, pos, options = {}) {
        const scale = options.scale || 1.5;
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const rm = new THREE.MeshBasicMaterial({ color: 0x88ff44, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false });
                const ring = new THREE.Mesh(vfx.unitTorus, rm);
                ring.position.copy(pos); ring.position.y += 0.1 + i * 0.2; ring.rotation.x = Math.PI / 2;
                ring.scale.setScalar(0.2 * scale); ring.renderOrder = 9999; vfx.scene.add(ring);
                vfx.addEffect({
                    group: ring, life: 0.5, time: 0,
                    update: (dt) => { ring.userData.time = (ring.userData.time || 0) + dt; const t = ring.userData.time / 0.5; ring.scale.setScalar((0.2 + t * 3.5 + i * 0.5) * scale); rm.opacity = 1 - t; },
                    cleanup: () => { vfx.scene.remove(ring); rm.dispose(); }
                });
            }, i * 80);
        }
        for (let i = 0; i < 15; i++) {
            const mat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xffffff : 0x88ff44, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false });
            const particle = new THREE.Mesh(vfx.unitPlane, mat);
            particle.position.copy(pos); particle.position.y += 0.3;
            particle.scale.set(0.04 * scale, 0.12 * scale, 1); particle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            particle.renderOrder = 9999; vfx.scene.add(particle);
            const angle = Math.random() * Math.PI * 2, speed = 3 + Math.random() * 5;
            vfx.addEffect({
                group: particle, life: 0.5, time: 0,
                update: (dt) => { particle.userData.time = (particle.userData.time || 0) + dt; const t = particle.userData.time / 0.5; particle.position.x += Math.cos(angle) * speed * dt * scale; particle.position.y += speed * 0.5 * dt * scale; particle.position.z += Math.sin(angle) * speed * dt * scale; particle.rotation.z += dt * 10; mat.opacity = 1 - t; },
                cleanup: () => { vfx.scene.remove(particle); mat.dispose(); }
            });
        }
    }
}