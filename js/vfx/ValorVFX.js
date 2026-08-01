// js/vfx/ValorVFX.js
class ValorVFX {
    // =========================================================================
    // 1. FIRE BOOST EFFECT (EXTREME OVERCHARGED BUFF)
    // =========================================================================
    static fireBoostEffect(vfx, pos, options = {}) {
        const scale = options.scale || 1.8;
        const colors = options.colors || [0xff0000, 0xff4400, 0xffaa00, 0xffee00, 0xffffff];

        // --- 1. Dual Staggered Ground Shockwaves ---
        [0, 0.08].forEach((delay, idx) => {
            const shockMat = new THREE.MeshBasicMaterial({
                color: colors[idx === 0 ? 4 : 2],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const shock = new THREE.Mesh(vfx.unitPlane, shockMat);
            shock.position.copy(pos);
            shock.position.y += 0.05 + idx * 0.02;
            shock.rotation.x = -Math.PI / 2;
            shock.scale.setScalar(0.1 * scale);
            shock.renderOrder = 9999;
            vfx.scene.add(shock);

            vfx.addEffect({
                life: 0.4, time: -delay,
                update: (dt, elapsed, progress) => {
                    if (progress < 0) return;
                    const expand = (0.1 + progress * (5.5 - idx * 1.5)) * scale;
                    shock.scale.setScalar(expand);
                    shockMat.opacity = Math.pow(1 - progress, 2.0);
                },
                cleanup: () => { vfx.scene.remove(shock); shockMat.dispose(); }
            });
        });

        // --- 2. Radial Sunburst Spikes (Horizontal Explosion) ---
        const spikeCount = 12;
        for (let i = 0; i < spikeCount; i++) {
            const angle = (i / spikeCount) * Math.PI * 2;
            const spikeMat = new THREE.MeshBasicMaterial({
                color: colors[i % colors.length],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const spike = new THREE.Mesh(vfx.unitPlane, spikeMat);
            spike.position.copy(pos);
            spike.position.y += 0.3 * scale;
            spike.rotation.y = angle;
            spike.rotation.x = Math.PI / 2;
            spike.scale.set(0.2 * scale, 3.0 * scale, 1);
            spike.renderOrder = 9999;
            vfx.scene.add(spike);

            vfx.addEffect({
                life: 0.3, time: 0,
                update: (dt, elapsed, progress) => {
                    spike.scale.x = (0.2 + progress * 0.8) * scale;
                    spike.scale.y = (3.0 + progress * 4.0) * scale;
                    spike.position.x = pos.x + Math.sin(angle) * progress * 2.0 * scale;
                    spike.position.z = pos.z + Math.cos(angle) * progress * 2.0 * scale;
                    spikeMat.opacity = Math.pow(1 - progress, 1.5);
                },
                cleanup: () => { vfx.scene.remove(spike); spikeMat.dispose(); }
            });
        }

        // --- 3. Dense Rotating 3D Volcanic Energy Pillar ---
        for (let i = 0; i < 6; i++) {
            const pillarMat = new THREE.MeshBasicMaterial({
                color: colors[i % colors.length],
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            });
            const pillar = new THREE.Mesh(vfx.unitPlane, pillarMat);
            pillar.position.copy(pos);
            pillar.position.y += 2.0 * scale;
            pillar.rotation.y = (i * Math.PI) / 6;
            pillar.scale.set(0.8 * scale, 6.0 * scale, 1);
            pillar.renderOrder = 9999;
            vfx.scene.add(pillar);

            vfx.addEffect({
                life: 0.45, time: 0,
                update: (dt, elapsed, progress) => {
                    pillar.rotation.y += dt * 8.0; // Violent spin
                    pillar.position.y += dt * 4.0 * scale;
                    pillar.scale.x = (0.8 + Math.sin(progress * Math.PI) * 1.5) * scale;
                    pillar.scale.y = (6.0 + progress * 3.0) * scale;
                    pillarMat.opacity = 1 - progress;
                },
                cleanup: () => { vfx.scene.remove(pillar); pillarMat.dispose(); }
            });
        }

        // --- 4. Helical Swirling Vortex Particles ---
        const swirlCount = 20;
        for (let i = 0; i < swirlCount; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const particleMat = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const p = new THREE.Mesh(vfx.unitSphere, particleMat);
            const baseAngle = (i / swirlCount) * Math.PI * 2;
            const radius = (0.8 + Math.random() * 0.6) * scale;
            p.renderOrder = 9999;
            vfx.scene.add(p);

            vfx.addEffect({
                life: 0.5, time: 0,
                update: (dt, elapsed, progress) => {
                    const currentAngle = baseAngle + progress * Math.PI * 6.0; // 3 full spins
                    p.position.x = pos.x + Math.cos(currentAngle) * radius * (1 - progress * 0.5);
                    p.position.z = pos.z + Math.sin(currentAngle) * radius * (1 - progress * 0.5);
                    p.position.y = pos.y + progress * 6.0 * scale;

                    const size = (0.25 * (1 - progress)) * scale;
                    p.scale.setScalar(size);
                    particleMat.opacity = 1 - progress;
                },
                cleanup: () => { vfx.scene.remove(p); particleMat.dispose(); }
            });
        }

        // --- 5. Blinding Supernova Core Flash ---
        const flashMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const flash = new THREE.Mesh(vfx.unitSphere, flashMat);
        flash.position.copy(pos);
        flash.position.y += 0.8 * scale;
        flash.scale.setScalar(0.4 * scale);
        flash.renderOrder = 10000;
        vfx.scene.add(flash);

        vfx.addEffect({
            life: 0.25, time: 0,
            update: (dt, elapsed, progress) => {
                flash.scale.setScalar((0.4 + progress * 4.5) * scale);
                flashMat.opacity = Math.pow(1 - progress, 2);
            },
            cleanup: () => { vfx.scene.remove(flash); flashMat.dispose(); }
        });
    }

    // =========================================================================
    // 2. HOLY STRIKE EFFECT (DIVINE APOCALYPTIC IMPACT)
    // =========================================================================
    static holyStrikeEffect(vfx, pos, options = {}) {
        const scale = options.scale || 2.5;
        const colors = options.colors || [0xff0033, 0xff6600, 0xffcc00, 0xffff66, 0xffffff];

        // --- 1. Heavens-to-Earth Beam of Judgment ---
        for (let i = 0; i < 3; i++) {
            const beamMat = new THREE.MeshBasicMaterial({
                color: colors[4 - i],
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            });
            const beam = new THREE.Mesh(vfx.unitPlane, beamMat);
            beam.position.copy(pos);
            beam.position.y += 8.0 * scale;
            beam.rotation.y = (i * Math.PI) / 3;
            beam.scale.set((1.2 - i * 0.3) * scale, 16.0 * scale, 1);
            beam.renderOrder = 10000;
            vfx.scene.add(beam);

            vfx.addEffect({
                life: 0.3, time: 0,
                update: (dt, elapsed, progress) => {
                    beam.scale.x = ((1.2 - i * 0.3) + progress * 3.0) * scale;
                    beamMat.opacity = Math.pow(1 - progress, 2.5);
                },
                cleanup: () => { vfx.scene.remove(beam); beamMat.dispose(); }
            });
        }

        // --- 2. Spinning Quad Cross-Slash Blades ---
        const slashRotations = [-0.6, 0.6, 0, Math.PI / 2];
        slashRotations.forEach((rotZ, idx) => {
            const slashMat = new THREE.MeshBasicMaterial({
                color: colors[idx % colors.length],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const slash = new THREE.Mesh(vfx.unitPlane, slashMat);
            slash.position.copy(pos);
            slash.position.y += 1.0 * scale;
            slash.rotation.z = rotZ;
            slash.rotation.y = idx * (Math.PI / 4);
            slash.scale.set(1.5 * scale, 7.0 * scale, 1);
            slash.renderOrder = 9999;
            vfx.scene.add(slash);

            vfx.addEffect({
                life: 0.4, time: 0,
                update: (dt, elapsed, progress) => {
                    slash.rotation.y += dt * 12.0; // Insane rotation velocity
                    slash.scale.x = (1.5 + progress * 7.0) * scale;
                    slash.scale.y = (7.0 + progress * 3.0) * scale;
                    slashMat.opacity = Math.pow(1 - progress, 1.8);
                },
                cleanup: () => { vfx.scene.remove(slash); slashMat.dispose(); }
            });
        });

        // --- 3. Triple Cascade Shockwave Rings ---
        [0, 0.05, 0.1].forEach((delay, ringIdx) => {
            const shockMat = new THREE.MeshBasicMaterial({
                color: colors[ringIdx * 2],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const shockwave = new THREE.Mesh(vfx.unitPlane, shockMat);
            shockwave.position.copy(pos);
            shockwave.position.y += 0.08 + ringIdx * 0.03;
            shockwave.rotation.x = -Math.PI / 2;
            shockwave.scale.setScalar(0.2 * scale);
            shockwave.renderOrder = 9999;
            vfx.scene.add(shockwave);

            vfx.addEffect({
                life: 0.45, time: -delay,
                update: (dt, elapsed, progress) => {
                    if (progress < 0) return;
                    shockwave.scale.setScalar((0.2 + progress * (7.0 - ringIdx * 1.5)) * scale);
                    shockMat.opacity = Math.pow(1 - progress, 2);
                },
                cleanup: () => { vfx.scene.remove(shockwave); shockMat.dispose(); }
            });
        });

        // --- 4. Explosive Debris with Gravity + Ground Bounce ---
        const debrisCount = 36;
        for (let i = 0; i < debrisCount; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const sparkMat = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const spark = new THREE.Mesh(vfx.unitSphere, sparkMat);
            spark.position.copy(pos);
            spark.position.y += 0.5 * scale;

            const angle = Math.random() * Math.PI * 2;
            const speed = (5.0 + Math.random() * 10.0) * scale;
            let vy = (6.0 + Math.random() * 8.0) * scale;
            const gravity = 28.0 * scale;
            let bounces = 0;
            const life = 0.45 + Math.random() * 0.35;

            spark.scale.setScalar((0.18 + Math.random() * 0.12) * scale);
            spark.renderOrder = 9999;
            vfx.scene.add(spark);

            vfx.addEffect({
                life, time: 0,
                update: (dt, elapsed, progress) => {
                    vy -= gravity * dt;
                    spark.position.x += Math.cos(angle) * speed * dt;
                    spark.position.z += Math.sin(angle) * speed * dt;
                    spark.position.y += vy * dt;

                    // Ground Bounce physics
                    if (spark.position.y < pos.y + 0.08 && bounces < 2) {
                        spark.position.y = pos.y + 0.08;
                        vy = -vy * 0.45; // Energy loss on bounce
                        bounces++;
                    }

                    const fade = 1 - progress;
                    spark.scale.setScalar((0.22 * scale) * fade);
                    sparkMat.opacity = fade;
                },
                cleanup: () => { vfx.scene.remove(spark); sparkMat.dispose(); }
            });
        }

        // --- 5. Screen-Clearing Impact Burst Spheres ---
        for (let i = 0; i < 2; i++) {
            const orbMat = new THREE.MeshBasicMaterial({
                color: colors[4 - i * 2],
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const orb = new THREE.Mesh(vfx.unitSphere, orbMat);
            orb.position.copy(pos);
            orb.position.y += 1.2 * scale;
            orb.scale.setScalar(0.5 * scale);
            orb.renderOrder = 10001;
            vfx.scene.add(orb);

            vfx.addEffect({
                life: 0.25 + i * 0.1, time: 0,
                update: (dt, elapsed, progress) => {
                    orb.scale.setScalar((0.5 + progress * (5.0 + i * 2.0)) * scale);
                    orbMat.opacity = Math.pow(1 - progress, 2);
                },
                cleanup: () => { vfx.scene.remove(orb); orbMat.dispose(); }
            });
        }
    }
}