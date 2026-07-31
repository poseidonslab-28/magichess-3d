// js/models/heroes/Shade.js
class ShadeModel {
    static create(hero = { star: 1 }) {
        const root = new THREE.Group();
        root.name = "ShadeHero";

        // === VOID / ASSASSIN MATERIALS ===
        const mats = {
            // Deep, light-absorbing charcoal for cowl and suit
            voidCloth: new THREE.MeshStandardMaterial({ color: 0x111114, metalness: 0.1, roughness: 0.95 }),
            // Smooth, structured black metal/leather for the mask
            mask: new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0.6, roughness: 0.4 }),
            // Vibrant, tattered purple scarf
            scarf: new THREE.MeshStandardMaterial({ color: 0x4a0066, emissive: 0x220033, metalness: 0.1, roughness: 0.8 }),
            // Dead, pale grey skin
            skin: new THREE.MeshStandardMaterial({ color: 0x8a8c91, metalness: 0.0, roughness: 0.7 }),
            // Piercing magenta/pink pupil-less eyes
            eyeGlow: new THREE.MeshStandardMaterial({ 
                color: 0xff33cc, emissive: 0xff00aa, emissiveIntensity: 2.5, roughness: 0.1 
            }),
            // Dark gunmetal for weapon hilts
            darkMetal: new THREE.MeshStandardMaterial({ color: 0x222225, metalness: 0.8, roughness: 0.5 }),
            // Glowing purple void blades
            bladeGlow: new THREE.MeshStandardMaterial({ 
                color: 0xbb33ff, emissive: 0x7700cc, emissiveIntensity: 2.0, transparent: true, opacity: 0.9 
            }),
            // Small void particles
            particle: new THREE.MeshBasicMaterial({ color: 0xdd66ff, transparent: true, opacity: 0.8 })
        };

        // Fallback shadow base
        if (typeof M !== 'undefined' && M.parts && M.parts.shadow) {
            root.add(M.parts.shadow());
        }

        const joints = {};

        // --- ROOT / PELVIS ---
        // Stance is crouched, stealthy
        const pelvis = new THREE.Group();
        pelvis.position.y = 0.35; 
        root.add(pelvis);
        joints.pelvis = pelvis;

        // Slim assassin waist
        const pelvisGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.12, 8);
        const pelvisMesh = new THREE.Mesh(pelvisGeo, mats.voidCloth);
        pelvisMesh.castShadow = true;
        
        // Faint purple stitching/belt details
        const beltGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.02, 8);
        const belt = new THREE.Mesh(beltGeo, mats.scarf);
        belt.position.y = 0.03;

        pelvis.add(pelvisMesh, belt);

        // --- TORSO / CHEST ---
        const torso = new THREE.Group();
        pelvis.add(torso);
        joints.torso = torso;

        // Skin-tight dark grey suit
        const chestGeo = new THREE.CylinderGeometry(0.11, 0.1, 0.28, 8);
        const chest = new THREE.Mesh(chestGeo, mats.voidCloth);
        chest.position.y = 0.2;
        chest.castShadow = true;

        // Purple stitching/harness crossed over chest
        const harnessGeo = new THREE.BoxGeometry(0.02, 0.3, 0.23);
        const harness1 = new THREE.Mesh(harnessGeo, mats.scarf);
        harness1.position.set(0, 0.2, 0);
        harness1.rotation.z = -0.4;
        
        const harness2 = new THREE.Mesh(harnessGeo, mats.scarf);
        harness2.position.set(0, 0.2, 0);
        harness2.rotation.z = 0.4;

        torso.add(chest, harness1, harness2);

        // --- HEAD, MASK, & COWL ---
        const neck = new THREE.Group();
        neck.position.y = 0.35;
        torso.add(neck);
        joints.head = neck;

        // Pale Face
        const headGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const head = new THREE.Mesh(headGeo, mats.skin);
        head.position.y = 0.08;
        head.castShadow = true;
        neck.add(head);

        // Smooth Black Mask (covers lower half of face)
        const maskGeo = new THREE.CylinderGeometry(0.085, 0.07, 0.1, 16, 1, false, -Math.PI/2, Math.PI);
        const mask = new THREE.Mesh(maskGeo, mats.mask);
        mask.position.set(0, 0.05, 0.01);
        mask.rotation.y = Math.PI;
        
        const maskPointGeo = new THREE.ConeGeometry(0.04, 0.08, 4);
        const maskPoint = new THREE.Mesh(maskPointGeo, mats.mask);
        maskPoint.position.set(0, 0.03, 0.08);
        maskPoint.rotation.x = -0.4;

        neck.add(mask, maskPoint);

        // Piercing Magenta Eyes
        const eyeGeo = new THREE.SphereGeometry(0.012, 8, 8);
        const eyeL = new THREE.Mesh(eyeGeo, mats.eyeGlow);
        eyeL.position.set(-0.03, 0.1, 0.075);
        // Slanted angry brow effect via scaling
        eyeL.scale.set(1.5, 0.5, 1);
        eyeL.rotation.z = 0.2;

        const eyeR = new THREE.Mesh(eyeGeo, mats.eyeGlow);
        eyeR.position.set(0.03, 0.1, 0.075);
        eyeR.scale.set(1.5, 0.5, 1);
        eyeR.rotation.z = -0.2;

        neck.add(eyeL, eyeR);

        // Deep Charcoal Cowl (Hood)
        const hoodGroup = new THREE.Group();
        neck.add(hoodGroup);

        const hoodGeo = new THREE.SphereGeometry(0.1, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65);
        const hood = new THREE.Mesh(hoodGeo, mats.voidCloth);
        hood.position.set(0, 0.09, -0.01);
        
        // Pointed hood back
        const hoodBackGeo = new THREE.ConeGeometry(0.08, 0.18, 8);
        const hoodBack = new THREE.Mesh(hoodBackGeo, mats.voidCloth);
        hoodBack.position.set(0, 0.05, -0.08);
        hoodBack.rotation.x = -0.8;

        // Draped fabric framing the face
        const drapeGeo = new THREE.CylinderGeometry(0.1, 0.11, 0.12, 16, 1, true, 0, Math.PI);
        const drape = new THREE.Mesh(drapeGeo, mats.voidCloth);
        drape.position.set(0, 0.02, 0);
        drape.rotation.y = Math.PI;

        hoodGroup.add(hood, hoodBack, drape);

        // --- TATTERED FLOATING SCARF ---
        const scarfGroup = new THREE.Group();
        scarfGroup.position.y = 0.01;
        neck.add(scarfGroup);
        joints.scarf = scarfGroup;

        // Wrapped part around neck
        const wrapGeo = new THREE.TorusGeometry(0.09, 0.03, 8, 16);
        const wrap = new THREE.Mesh(wrapGeo, mats.scarf);
        wrap.rotation.x = Math.PI / 2 + 0.2;

        // Floating trailing tail
        const tailCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.08, 0, 0),
            new THREE.Vector3(0.15, -0.05, -0.1),
            new THREE.Vector3(0.25, -0.02, -0.2),
            new THREE.Vector3(0.4, 0.05, -0.25)
        ]);
        const tailGeo = new THREE.TubeGeometry(tailCurve, 12, 0.025, 6, false);
        const tail = new THREE.Mesh(tailGeo, mats.scarf);
        
        scarfGroup.add(wrap, tail);

        // --- ARMS & REVERSE-GRIP DAGGERS ---
        const createArm = (side) => {
            const shoulder = new THREE.Group();
            shoulder.position.set(side * 0.14, 0.25, 0);

            const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.16, 8), mats.voidCloth);
            upperArm.position.y = -0.08;
            shoulder.add(upperArm);

            const elbow = new THREE.Group();
            elbow.position.y = -0.16;
            shoulder.add(elbow);

            const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.16, 8), mats.voidCloth);
            forearm.position.y = -0.08;
            elbow.add(forearm);

            const hand = new THREE.Group();
            hand.position.y = -0.16;
            elbow.add(hand);

            const glove = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.03), mats.mask);
            hand.add(glove);

            // Void Dagger (Reverse Grip)
            const dagger = new THREE.Group();
            // Pointing back and up
            dagger.position.set(0, -0.02, 0);
            dagger.rotation.x = Math.PI - 0.2; 
            
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8), mats.darkMetal);
            
            // Curved purple blade framing the back of the head
            const bladeCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0.04, 0),
                new THREE.Vector3(0, 0.12, side * 0.02),
                new THREE.Vector3(0, 0.22, side * 0.08),
                new THREE.Vector3(0, 0.3, side * 0.15)
            ]);
            // Tapered tube to mimic a curved blade
            const bladeGeo = new THREE.TubeGeometry(bladeCurve, 8, 0.015, 4, false);
            const blade = new THREE.Mesh(bladeGeo, mats.bladeGlow);

            dagger.add(hilt, blade);
            hand.add(dagger);

            return { shoulder, elbow, hand };
        };

        const armL = createArm(1);
        const armR = createArm(-1);
        torso.add(armL.shoulder, armR.shoulder);

        joints.armL = armL.shoulder;
        joints.forearmL = armL.elbow;
        joints.armR = armR.shoulder;
        joints.forearmR = armR.elbow;

        // Pose: Stealthy, holding blades behind back
        joints.armL.rotation.set(-0.3, 0, 0.3);
        joints.forearmL.rotation.set(-0.8, 0, 0);
        
        joints.armR.rotation.set(-0.3, 0, -0.3);
        joints.forearmR.rotation.set(-0.8, 0, 0);

        // --- LEGS ---
        const createLeg = (side) => {
            const hip = new THREE.Group();
            hip.position.set(side * 0.07, 0, 0);

            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.18, 8), mats.voidCloth);
            thigh.position.y = -0.09;
            hip.add(thigh);

            const calfJoint = new THREE.Group();
            calfJoint.position.y = -0.18;
            hip.add(calfJoint);

            const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.18, 8), mats.voidCloth);
            calf.position.y = -0.09;
            
            const foot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.08), mats.mask);
            foot.position.set(0, -0.16, 0.02);

            calfJoint.add(calf, foot);

            return { hip, calf: calfJoint };
        };

        const legL = createLeg(1);
        const legR = createLeg(-1);
        pelvis.add(legL.hip, legR.hip);

        joints.thighL = legL.hip;
        joints.calfL = legL.calf;
        joints.thighR = legR.hip;
        joints.calfR = legR.calf;

        // Crouched stance
        joints.thighL.rotation.x = -0.4;
        joints.calfL.rotation.x = 0.4;
        joints.thighR.rotation.x = -0.2;
        joints.calfR.rotation.x = 0.2;
        joints.thighL.position.y += 0.02;

        // --- VOID PARTICLES ---
        const particleGroup = new THREE.Group();
        root.add(particleGroup);
        const particles = [];
        const particleCount = 15;
        const pGeo = new THREE.SphereGeometry(0.008, 4, 4);
        
        for (let i = 0; i < particleCount; i++) {
            const p = new THREE.Mesh(pGeo, mats.particle);
            // Random start positions around the hero
            p.userData = {
                x: (Math.random() - 0.5) * 0.8,
                y: Math.random() * 0.8,
                z: (Math.random() - 0.5) * 0.8,
                speed: 0.2 + Math.random() * 0.5,
                wobble: Math.random() * Math.PI * 2
            };
            particleGroup.add(p);
            particles.push(p);
        }

        // --- STAR RANK RING ---
        if (hero && hero.star >= 2) {
            const starColor = hero.star >= 3 ? mats.bladeGlow : new THREE.MeshStandardMaterial({ color: 0x8844aa, metalness: 0.2, roughness: 0.6 });
            const ringGeo = new THREE.RingGeometry(0.36, 0.4, 24);
            const starRing = new THREE.Mesh(ringGeo, starColor);
            starRing.position.y = 0.02;
            starRing.rotation.x = -Math.PI / 2;
            root.add(starRing);
        }

        // === VOID ANIMATION LOOP ===
        root.userData.joints = joints;
        root.userData.updateAnimation = (time) => {
            // Unnatural hovering/breathing
            joints.pelvis.position.y = 0.35 + Math.sin(time * 2) * 0.015;
            joints.torso.rotation.y = Math.sin(time * 1.5) * 0.05;

            // Intense glowing pulse on blades and eyes
            mats.bladeGlow.emissiveIntensity = 2.0 + Math.sin(time * 5) * 0.8;
            mats.eyeGlow.emissiveIntensity = 2.5 + Math.cos(time * 4) * 0.5;

            // Scarf floats impossibly like it's underwater
            joints.scarf.rotation.z = Math.sin(time * 1.2) * 0.1;
            joints.scarf.rotation.y = Math.cos(time * 0.8) * 0.1;

            // Update void particles (floating upwards and disappearing/reappearing)
            particles.forEach(p => {
                p.userData.y += p.userData.speed * 0.01;
                p.userData.wobble += 0.05;
                
                // Drift slightly left and right
                const driftX = Math.sin(p.userData.wobble) * 0.02;
                const driftZ = Math.cos(p.userData.wobble) * 0.02;

                p.position.set(
                    p.userData.x + driftX, 
                    p.userData.y, 
                    p.userData.z + driftZ
                );

                // Reset to bottom if it floats too high
                if (p.userData.y > 1.0) {
                    p.userData.y = -0.1;
                    p.userData.x = (Math.random() - 0.5) * 0.8;
                    p.userData.z = (Math.random() - 0.5) * 0.8;
                }
            });
        };

        return root;
    }
}