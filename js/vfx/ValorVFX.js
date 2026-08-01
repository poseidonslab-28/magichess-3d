// js/vfx/ValorVFX.js
class ValorVFX {
    static fireBoostEffect(vfx, pos, options = {}) {
        const scale = options.scale || 1.5;
        const colors = [0xff2200, 0xff6600, 0xffaa00, 0xffdd00, 0xffffff];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false });
            const streak = new THREE.Mesh(vfx.unitPlane, mat);
            streak.position.copy(pos); streak.position.y += 0.3;
            streak.scale.set(0.1 * scale, 2.0 * scale, 1); streak.rotation.z = angle;
            streak.renderOrder = 9999; streak.frustumCulled = false; vfx.scene.add(streak);
            const speed = 3 + Math.random() * 4;
            vfx.addEffect({
                group: streak, life: 0.35, time: 0,
                update: (dt) => { streak.userData.time = (streak.userData.time || 0) + dt; const t = streak.userData.time / 0.35; streak.position.x += Math.cos(angle) * speed * dt * scale; streak.position.y += 0.5 * dt * scale; streak.position.z += Math.sin(angle) * speed * dt * scale; streak.scale.y = (2.0 + t * 1.5) * scale; mat.opacity = 1 - t; },
                cleanup: () => { vfx.scene.remove(streak); mat.dispose(); }
            });
        }
        // Center flash
        const fm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false });
        const flash = new THREE.Mesh(vfx.unitSphere, fm); flash.position.copy(pos); flash.position.y += 0.3; flash.scale.setScalar(0.2 * scale); flash.renderOrder = 9999; vfx.scene.add(flash);
        vfx.addEffect({
            group: flash, life: 0.2, time: 0,
            update: (dt) => { flash.userData.time = (flash.userData.time || 0) + dt; const t = flash.userData.time / 0.2; flash.scale.setScalar((0.2 + t * 1.5) * scale); fm.opacity = 1 - t; },
            cleanup: () => { vfx.scene.remove(flash); fm.dispose(); }
        });
    }

    static holyStrikeEffect(vfx, pos, options = {}) {
        const scale = options.scale || 2.0;
        const colors = options.colors || [0xff0000, 0xff6600, 0xffaa00, 0xffdd00, 0xffffff];
        for (let i = 0; i < 2; i++) {
            const mat = new THREE.MeshBasicMaterial({ color: colors[i], side: THREE.DoubleSide, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false });
            const slash = new THREE.Mesh(vfx.unitPlane, mat);
            slash.position.copy(pos); slash.position.y += 0.6;
            slash.scale.set(2.5 * scale, 6.0 * scale, 1); slash.rotation.z = i === 0 ? -0.4 : 0.5;
            slash.renderOrder = 9999; slash.frustumCulled = false; vfx.scene.add(slash);
            vfx.addEffect({
                group: slash, life: 0.4, time: 0,
                update: (dt) => { slash.userData.time = (slash.userData.time || 0) + dt; const t = slash.userData.time / 0.4; slash.scale.x = (2.5 + t * 4.0) * scale; mat.opacity = 1 - t; },
                cleanup: () => { vfx.scene.remove(slash); mat.dispose(); }
            });
        }
        for (let i = 0; i < 20; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false });
            const spark = new THREE.Mesh(vfx.unitSphere, mat);
            spark.position.copy(pos); spark.position.y += 0.5; spark.scale.setScalar(0.1 * scale);
            spark.renderOrder = 9999; spark.frustumCulled = false; vfx.scene.add(spark);
            const angle = Math.random() * Math.PI * 2, speed = 3 + Math.random() * 6;
            vfx.addEffect({
                group: spark, life: 0.4 + Math.random() * 0.3, time: 0,
                update: (dt) => { spark.userData.time = (spark.userData.time || 0) + dt; const t = spark.userData.time / 0.5; spark.position.x += Math.cos(angle) * speed * dt * scale; spark.position.y += (speed * 0.6) * dt * scale; spark.position.z += Math.sin(angle) * speed * dt * scale; spark.scale.setScalar(0.1 * scale * (1 - t)); mat.opacity = 1 - t; },
                cleanup: () => { vfx.scene.remove(spark); mat.dispose(); }
            });
        }
    }
}