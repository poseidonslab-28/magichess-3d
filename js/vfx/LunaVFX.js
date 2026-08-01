// js/vfx/LunaVFX.js
class LunaVFX {
    static moonlightHealEffect(vfx, pos, options = {}) {
        const scale = options.scale || 1.2;
        const bm = new THREE.MeshBasicMaterial({ color: 0xfffde8, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false });
        const beam = new THREE.Mesh(vfx.unitCylinder, bm);
        beam.position.copy(pos); beam.position.y += 2.5; beam.scale.set(0.5 * scale, 5.0, 0.5 * scale); beam.renderOrder = 9998; vfx.scene.add(beam);
        const cm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false });
        const core = new THREE.Mesh(vfx.unitCylinder, cm);
        core.position.copy(pos); core.position.y += 2.5; core.scale.set(0.15 * scale, 5.0, 0.15 * scale); core.renderOrder = 9999; vfx.scene.add(core);
        vfx.addEffect({
            group: new THREE.Group(), life: 1.0, time: 0, children: [beam, core],
            update: (dt) => { const t = (vfx.activeEffects[vfx.activeEffects.length - 1].time || 0) / 1.0; bm.opacity = 0.5 * (1 - t); cm.opacity = 0.8 * (1 - t); },
            cleanup: () => { vfx.scene.remove(beam); bm.dispose(); vfx.scene.remove(core); cm.dispose(); }
        });
        for (let i = 0; i < 15; i++) {
            const mat = new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false });
            const sp = new THREE.Mesh(vfx.unitSphere, mat);
            sp.position.copy(pos); sp.position.x += (Math.random() - 0.5) * 0.6 * scale; sp.position.z += (Math.random() - 0.5) * 0.6 * scale; sp.position.y += 0.1;
            sp.scale.setScalar(0.04 * scale); sp.renderOrder = 9999; vfx.scene.add(sp);
            vfx.addEffect({
                group: sp, life: 1.2, time: 0,
                update: (dt) => { sp.userData.time = (sp.userData.time || 0) + dt; const t = sp.userData.time / 1.2; sp.position.y += 1.5 * dt * scale; mat.opacity = 0.7 * (1 - t); },
                cleanup: () => { vfx.scene.remove(sp); mat.dispose(); }
            });
        }
    }
}