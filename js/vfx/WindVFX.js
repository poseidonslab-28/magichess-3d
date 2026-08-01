// js/vfx/WindVFX.js
class WindVFX {

    // =========================================================================
    // 1. GIANT WIND LANCE MODEL BUILDER
    // =========================================================================
    static makeWindArrow(group, options = {}) {
        const scale = options.scale || 1.0;
        const mainColor = options.color || 0x44ff88;
        const glowColor = options.glowColor || 0xbbffdd;

        // --- A. Massive Piercing Shaft ---
        const shaftMat = new THREE.MeshStandardMaterial({
            color: mainColor,
            emissive: mainColor,
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.8
        });
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.08 * scale, 4.5 * scale, 16), shaftMat);
        shaft.rotation.x = Math.PI / 2; // Point along +Z
        group.add(shaft);

        // --- B. Colossal Crystal Arrowhead ---
        const headMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: glowColor,
            emissiveIntensity: 1.5,
            roughness: 0.1
        });
        const head = new THREE.Mesh(new THREE.ConeGeometry(0.45 * scale, 1.8 * scale, 16), headMat);
        head.position.z = 2.8 * scale;
        head.rotation.x = Math.PI / 2;
        group.add(head);

        // --- C. Cross-Blade Arrowhead Wings ---
        for (let i = 0; i < 4; i++) {
            const bladeMat = new THREE.MeshBasicMaterial({
                color: mainColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending
            });
            const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.5 * scale, 1.5 * scale), bladeMat);
            blade.position.z = 2.2 * scale;
            blade.rotation.x = Math.PI / 2;
            blade.rotation.z = (i * Math.PI) / 2;
            group.add(blade);
        }

        // --- D. Aerodynamic Gale Fletchings (Back Fins) ---
        for (let i = 0; i < 3; i++) {
            const finMat = new THREE.MeshBasicMaterial({
                color: mainColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.75,
                blending: THREE.AdditiveBlending
            });
            const fin = new THREE.Mesh(new THREE.PlaneGeometry(0.6 * scale, 1.2 * scale), finMat);
            fin.position.z = -2.0 * scale;
            fin.rotation.x = Math.PI / 3;
            fin.rotation.z = (i * Math.PI * 2) / 3;
            group.add(fin);
        }

        // --- E. Spiraling Vortex Energy Ribbons ---
        for (let i = 0; i < 8; i++) {
            const ribbonMat = new THREE.MeshBasicMaterial({
                color: glowColor,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const ribbon = new THREE.Mesh(new THREE.TorusGeometry((0.35 + (i % 2) * 0.15) * scale, 0.02 * scale, 8, 24), ribbonMat);
            ribbon.position.z = -1.8 * scale + i * 0.55 * scale;
            ribbon.rotation.x = Math.PI / 2;
            ribbon.rotation.y = i * 0.5;
            group.add(ribbon);
        }

        // --- F. Sonic Shockwave Rings Around Shaft ---
        for (let i = 0; i < 3; i++) {
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(new THREE.RingGeometry(0.3 * scale, 0.6 * scale, 24), ringMat);
            ring.position.z = 0.5 * scale + i * 1.0 * scale;
            group.add(ring);
        }
    }

    // =========================================================================
    // 2. STRAIGHT INSTANT PIERCING BEAM EFFECT (NO SLOW BULLET)
    // =========================================================================
    static straightWindArrowEffect(vfx, startPos, endPos, options = {}) {
        const scale = options.scale || 1.8;
        const duration = options.duration || 0.28;

        // Container Group
        const arrowGroup = new THREE.Group();
        this.makeWindArrow(arrowGroup, { scale });

        // Position & Orient straight toward target line
        arrowGroup.position.copy(startPos);
        arrowGroup.lookAt(endPos);

        const distance = startPos.distanceTo(endPos);
        // Midpoint alignment for long straight beam stretch
        arrowGroup.position.lerp(endPos, 0.5);
        arrowGroup.scale.set(1, 1, distance / (5.0 * scale)); // Stretch to span full distance instantly

        vfx.scene.add(arrowGroup);

        // --- Ground Air Pressure Shockwave ---
        const groundRingMat = new THREE.MeshBasicMaterial({
            color: 0x88ffaa,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const groundRing = new THREE.Mesh(vfx.unitPlane, groundRingMat);
        groundRing.position.copy(endPos);
        groundRing.position.y += 0.05;
        groundRing.rotation.x = -Math.PI / 2;
        groundRing.scale.setScalar(0.5 * scale);
        vfx.scene.add(groundRing);

        // --- Instant Burst Particles ---
        const sparkCount = 18;
        const sparks = [];
        for (let i = 0; i < sparkCount; i++) {
            const sparkMat = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.4 ? 0xffffff : 0x44ff88,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const spark = new THREE.Mesh(vfx.unitSphere, sparkMat);
            spark.position.copy(endPos);
            
            const angle = Math.random() * Math.PI * 2;
            const speed = (4.0 + Math.random() * 8.0) * scale;
            sparks.push({ mesh: spark, mat: sparkMat, angle, speed });
            vfx.scene.add(spark);
        }

        // --- Animation Lifecycle ---
        vfx.addEffect({
            life: duration, time: 0,
            update: (dt, elapsed, progress) => {
                // High velocity forward spin & pulse expand
                arrowGroup.rotation.z += dt * 25.0; 
                arrowGroup.scale.x = (1.0 + progress * 1.5) * scale;
                arrowGroup.scale.y = (1.0 + progress * 1.5) * scale;

                const fade = Math.pow(1 - progress, 2);

                // Fade materials inside group
                arrowGroup.traverse((child) => {
                    if (child.material) {
                        child.material.transparent = true;
                        child.material.opacity = fade;
                    }
                });

                // Expand ground shockwave
                groundRing.scale.setScalar((0.5 + progress * 6.0) * scale);
                groundRingMat.opacity = fade;

                // Animate outward wind explosion
                sparks.forEach(s => {
                    s.mesh.position.x += Math.cos(s.angle) * s.speed * dt;
                    s.mesh.position.z += Math.sin(s.angle) * s.speed * dt;
                    s.mesh.position.y += dt * 2.0;
                    s.mesh.scale.setScalar((0.18 * scale) * fade);
                    s.mat.opacity = fade;
                });
            },
            cleanup: () => {
                vfx.scene.remove(arrowGroup);
                vfx.scene.remove(groundRing);
                groundRingMat.dispose();

                arrowGroup.traverse((child) => {
                    if (child.material) child.material.dispose();
                });

                sparks.forEach(s => {
                    vfx.scene.remove(s.mesh);
                    s.mat.dispose();
                });
            }
        });
    }
}