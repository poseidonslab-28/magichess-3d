// js/models/heroes/Valor.js
class ValorModel {
    static create(hero = { star: 1 }) {
        const root = new THREE.Group();
        root.name = "ValorHero";

        // === PBR MATERIAL PALETTE (Matching the Iron Knight Art) ===
        const mats = {
            steelBlue: new THREE.MeshStandardMaterial({ color: 0x22354d, metalness: 0.85, roughness: 0.25 }), // Battle-worn Blue Steel
            steelDark: new THREE.MeshStandardMaterial({ color: 0x141e2b, metalness: 0.9, roughness: 0.35 }), // Dark Steel Trim
            silver: new THREE.MeshStandardMaterial({ color: 0xc4ceb8, metalness: 0.95, roughness: 0.2 }),   // Blade / Accents
            gold: new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.3 }),    // Lion Emblem / Trim
            leather: new THREE.MeshStandardMaterial({ color: 0x3d2314, metalness: 0.05, roughness: 0.85 }),
            skin: new THREE.MeshStandardMaterial({ color: 0xdfa585, metalness: 0.0, roughness: 0.6 }),
            hair: new THREE.MeshStandardMaterial({ color: 0x2b1d14, metalness: 0.1, roughness: 0.8 }),
            crimsonCape: new THREE.MeshStandardMaterial({ color: 0x660808, roughness: 0.95, side: THREE.DoubleSide }), // Tattered Cape
            eyeGlow: new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00a2ff, emissiveIntensity: 2.2, roughness: 0.1 }),
            underSuit: new THREE.MeshStandardMaterial({ color: 0x181820, roughness: 0.8 })
        };

        // Base Shadow
        root.add(M.parts.shadow());

        // === JOINT DICTIONARY FOR ANIMATION ===
        const joints = {};

        // --- ROOT / PELVIS ---
        const pelvis = new THREE.Group();
        pelvis.position.y = 0.45;
        root.add(pelvis);
        joints.pelvis = pelvis;

        // Faulds / Pelvis Armor
        const pelvisMesh = M.parts.box(0.32, 0.14, 0.22, mats.steelDark);
        pelvisMesh.position.y = 0.02;

        const belt = M.parts.box(0.34, 0.06, 0.24, mats.leather);
        belt.position.y = 0.06;
        const buckle = M.parts.box(0.08, 0.08, 0.26, mats.gold);
        buckle.position.y = 0.06;
        pelvis.add(pelvisMesh, belt, buckle);

        // --- TORSO & CHEST ---
        const torso = new THREE.Group();
        pelvis.add(torso);
        joints.torso = torso;

        // Cuirass / Chestplate
        const chestGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.34, 6);
        const chestMesh = new THREE.Mesh(chestGeo, mats.steelBlue);
        chestMesh.position.y = 0.22;
        chestMesh.castShadow = true;
        chestMesh.receiveShadow = true;

        // Gorget Collar
        const gorget = M.parts.cylinder(0.16, 0.18, 0.08, mats.steelDark);
        gorget.position.y = 0.38;

        // Gold Brooch Pin (Cape Fastener)
        const brooch = M.parts.sphere(0.04, mats.gold);
        brooch.position.set(-0.12, 0.34, 0.12);

        torso.add(chestMesh, gorget, brooch);

        // --- TATTERED CRIMSON CAPE ---
        const capeGroup = new THREE.Group();
        capeGroup.position.set(0, 0.36, -0.12);
        torso.add(capeGroup);
        joints.cape = capeGroup;

        // Main draped cloth
        const capeGeo = new THREE.PlaneGeometry(0.42, 0.72, 4, 6);
        capeGeo.translate(0, -0.36, 0);
        const capeMesh = new THREE.Mesh(capeGeo, mats.crimsonCape);
        capeMesh.rotation.x = 0.18;
        capeMesh.castShadow = true;

        // Tattered cape shreds
        const shredL = M.parts.pivotBox(0.1, 0.3, 0.01, mats.crimsonCape, -0.12, -0.65, -0.02);
        shredL.rotation.z = 0.1;
        const shredR = M.parts.pivotBox(0.12, 0.25, 0.01, mats.crimsonCape, 0.1, -0.6, -0.02);
        shredR.rotation.z = -0.15;

        capeGroup.add(capeMesh, shredL, shredR);

        // --- HEAD & T-VISOR HELMET ---
        const neck = new THREE.Group();
        neck.position.y = 0.40;
        torso.add(neck);
        joints.head = neck;

        // Face & Skin inside helmet
        const headMesh = M.parts.sphere(0.125, mats.skin);
        headMesh.position.y = 0.06;
        
        // Brown Hair visible underneath helmet back
        const hair = M.parts.sphere(0.13, mats.hair);
        hair.position.set(0, 0.08, -0.02);

        // Piercing Blue Glowing Eyes
        const eyeL = M.parts.box(0.02, 0.012, 0.01, mats.eyeGlow);
        eyeL.position.set(-0.035, 0.07, 0.115);
        const eyeR = M.parts.box(0.02, 0.012, 0.01, mats.eyeGlow);
        eyeR.position.set(0.035, 0.07, 0.115);

        // Steel Barbute / T-Visor Helmet Outer Shell
        const helmetDome = M.parts.sphere(0.142, mats.steelBlue, { topOnly: true });
        helmetDome.position.y = 0.08;

        const helmetCheekL = M.parts.box(0.04, 0.1, 0.08, mats.steelBlue);
        helmetCheekL.position.set(-0.09, 0.05, 0.07);
        const helmetCheekR = M.parts.box(0.04, 0.1, 0.08, mats.steelBlue);
        helmetCheekR.position.set(0.09, 0.05, 0.07);

        const helmetBrow = M.parts.box(0.2, 0.04, 0.06, mats.steelDark);
        helmetBrow.position.set(0, 0.1, 0.09);

        const noseGuard = M.parts.box(0.025, 0.08, 0.04, mats.steelDark);
        noseGuard.position.set(0, 0.05, 0.12);

        // Golden Crest ornament on brow
        const helmetCrest = M.parts.box(0.04, 0.05, 0.02, mats.gold);
        helmetCrest.position.set(0, 0.13, 0.11);

        neck.add(headMesh, hair, eyeL, eyeR, helmetDome, helmetCheekL, helmetCheekR, helmetBrow, noseGuard, helmetCrest);

        // --- LEGS & GREAVES ---
        const createLeg = (isLeft) => {
            const side = isLeft ? 1 : -1;
            const hip = new THREE.Group();
            hip.position.set(side * 0.12, 0, 0);

            // Thigh (Cuisses)
            const thigh = M.parts.pivotBox(0.13, 0.24, 0.13, mats.underSuit, 0, -0.12, 0);
            hip.add(thigh);

            // Knee Guard (Poleyn)
            const knee = M.parts.box(0.09, 0.09, 0.05, mats.gold);
            knee.position.set(0, -0.21, 0.06);
            thigh.add(knee);

            // Calf & Boot (Greaves & Sabatons)
            const calfJoint = new THREE.Group();
            calfJoint.position.y = -0.22;
            thigh.add(calfJoint);

            const boot = M.parts.pivotBox(0.14, 0.22, 0.16, mats.steelBlue, 0, -0.11, 0.01);
            const bootToe = M.parts.box(0.14, 0.06, 0.06, mats.steelDark);
            bootToe.position.set(0, -0.19, 0.07);
            boot.add(bootToe);

            calfJoint.add(boot);

            return { hip, calf: calfJoint };
        };

        const legL = createLeg(true);
        const legR = createLeg(false);
        pelvis.add(legL.hip, legR.hip);

        joints.thighL = legL.hip;
        joints.calfL = legL.calf;
        joints.thighR = legR.hip;
        joints.calfR = legR.calf;

        // --- ARMS & PAULDRONS ---
        const createArm = (isLeft) => {
            const side = isLeft ? 1 : -1;
            const shoulder = new THREE.Group();
            shoulder.position.set(side * 0.22, 0.32, 0);

            // Layered Heavy Pauldron
            const pauldron = M.parts.sphere(0.12, mats.steelBlue, { topOnly: true });
            pauldron.scale.set(1.15, 0.95, 1.15);
            pauldron.position.set(side * 0.02, 0.03, 0);

            const pauldronTrim = M.parts.ring(0.12, 0.015, mats.gold);
            pauldronTrim.position.set(side * 0.02, 0.01, 0);

            shoulder.add(pauldron, pauldronTrim);

            // Upper Arm
            const upperArm = M.parts.pivotBox(0.09, 0.2, 0.09, mats.underSuit, 0, -0.1, 0);
            shoulder.add(upperArm);

            // Forearm (Vambrace)
            const elbow = new THREE.Group();
            elbow.position.y = -0.18;
            upperArm.add(elbow);

            const forearm = M.parts.pivotBox(0.105, 0.18, 0.105, mats.steelBlue, 0, -0.09, 0);
            elbow.add(forearm);

            // Hand
            const hand = new THREE.Group();
            hand.position.y = -0.18;
            elbow.add(hand);

            const gauntlet = M.parts.sphere(0.055, mats.leather);
            hand.add(gauntlet);

            return { shoulder, elbow, hand };
        };

        const armL = createArm(true);
        const armR = createArm(false);
        torso.add(armL.shoulder, armR.shoulder);

        joints.armL = armL.shoulder;
        joints.forearmL = armL.elbow;
        joints.handL = armL.hand;

        joints.armR = armR.shoulder;
        joints.forearmR = armR.elbow;
        joints.handR = armR.hand;

        // === BATTERED KITE SHIELD WITH GOLDEN LION EMBLEM (Left Hand) ===
        const shieldGroup = new THREE.Group();
        shieldGroup.position.set(0.06, -0.02, 0.06);
        shieldGroup.rotation.set(0, -Math.PI / 2.5, 0.1);

        // Kite Shield Base
        const shieldBody = M.parts.box(0.32, 0.48, 0.04, mats.steelBlue);
        const shieldPoint = M.parts.cone(0.225, 0.22, mats.steelBlue);
        shieldPoint.rotation.z = Math.PI;
        shieldPoint.position.y = -0.32;
        
        // Gold Shield Border
        const shieldBorderTop = M.parts.box(0.34, 0.03, 0.05, mats.gold);
        shieldBorderTop.position.y = 0.23;

        // Golden Lion Emblem Assembly
        const lionHead = M.parts.box(0.1, 0.1, 0.03, mats.gold);
        lionHead.position.set(0, 0.05, 0.025);
        
        const lionMane = M.parts.sphere(0.08, mats.gold);
        lionMane.position.set(0, 0.06, 0.02);

        const lionJaw = M.parts.box(0.06, 0.06, 0.03, mats.gold);
        lionJaw.position.set(0, -0.02, 0.025);

        const lionCrown = M.parts.box(0.08, 0.03, 0.03, mats.gold);
        lionCrown.position.set(0, 0.12, 0.025);

        // Battle Scar Cuts across shield
        const scar1 = M.parts.box(0.015, 0.28, 0.06, mats.steelDark);
        scar1.rotation.z = 0.5;
        scar1.position.set(-0.04, 0, 0);

        shieldGroup.add(shieldBody, shieldPoint, shieldBorderTop, lionHead, lionMane, lionJaw, lionCrown, scar1);
        armL.hand.add(shieldGroup);

        // === BROADSWORD (Right Hand) ===
        const swordGroup = new THREE.Group();
        swordGroup.rotation.x = Math.PI / 2;

        // Double-edged Steel Blade
        const bladeGeo = new THREE.CylinderGeometry(0.005, 0.03, 0.72, 4);
        bladeGeo.translate(0, 0.36, 0);
        const blade = new THREE.Mesh(bladeGeo, mats.silver);
        blade.scale.set(0.25, 1, 1);
        blade.castShadow = true;

        // Fuller (Blade Groove)
        const fuller = M.parts.box(0.008, 0.5, 0.012, mats.steelDark);
        fuller.position.y = 0.32;

        // Guard & Grip
        const guard = M.parts.box(0.2, 0.035, 0.04, mats.gold);
        guard.position.y = 0.02;

        const handle = M.parts.cylinder(0.02, 0.02, 0.14, mats.leather);
        handle.position.y = -0.07;

        const pommel = M.parts.sphere(0.04, mats.gold);
        pommel.position.y = -0.15;

        swordGroup.add(blade, fuller, guard, handle, pommel);
        armR.hand.add(swordGroup);

        // Pose Adjustments for Ready Combat Stance
        joints.armL.rotation.set(0.4, 0.3, -0.2);  // Shield forward stance
        joints.forearmL.rotation.x = -0.4;

        joints.armR.rotation.set(-0.2, -0.1, 0.3); // Sword lowered & ready
        joints.forearmR.rotation.x = -0.2;

        // === STAR RANK RING (Golden Knight Aura) ===
        if (hero.star >= 2) {
            const starColor = hero.star >= 3 ? mats.gold : mats.silver;
            const starRing = M.parts.ring(0.36, 0.02, starColor);
            starRing.position.y = 0.02;
            root.add(starRing);
        }

        // Attach Joint References and Procedural Idle Animator
        root.userData.joints = joints;
        root.userData.updateAnimation = (time) => {
            const breath = Math.sin(time * 2.0) * 0.025;
            joints.torso.position.y = breath;
            joints.head.rotation.y = Math.sin(time * 1.2) * 0.03;
            joints.cape.rotation.x = 0.18 + Math.sin(time * 2.5) * 0.04;

            // Subtle stance sway
            joints.armL.rotation.z = -0.2 + Math.sin(time * 2.0) * 0.015;
            joints.armR.rotation.z = 0.3 - Math.sin(time * 2.0) * 0.015;
        };

        root.userData.joints = joints;
        
        // Instantiate Animator Controller
        const animator = new HeroAnimator(joints);
        root.userData.animator = animator;

        // Update loop called every frame
        root.userData.updateAnimation = (dt) => {
            animator.update(dt);
        };

        return root;
    }
}