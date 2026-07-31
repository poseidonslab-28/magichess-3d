// js/models/heroes/Iron.js
class IronModel {
    static create(hero = { star: 1 }) {
        const root = new THREE.Group();
        root.name = "IronHero";

        // === REALISTIC / DARK FANTASY TANK MATERIALS ===
        const mats = {
            // Heavily worn, scarred dark grey iron
            armor: new THREE.MeshStandardMaterial({ color: 0x2b2e31, metalness: 0.8, roughness: 0.65 }),
            // Darker, dirtier iron for joints and under-plates
            armorDark: new THREE.MeshStandardMaterial({ color: 0x1a1c1e, metalness: 0.7, roughness: 0.8 }),
            // Gritty, porous stone for the hammer head
            stone: new THREE.MeshStandardMaterial({ color: 0x3d3b38, metalness: 0.1, roughness: 0.95 }),
            // Tarnished iron bands and chains
            chain: new THREE.MeshStandardMaterial({ color: 0x222426, metalness: 0.9, roughness: 0.5 }),
            // Dark, oiled heavy leather
            leather: new THREE.MeshStandardMaterial({ color: 0x14100c, metalness: 0.1, roughness: 0.9 }),
            // Gritty, scarred skin tone
            skin: new THREE.MeshStandardMaterial({ color: 0x826454, metalness: 0.0, roughness: 0.8 }),
            // Dull, menacing red glow
            eyeGlow: new THREE.MeshStandardMaterial({ 
                color: 0xff3311, emissive: 0xb31100, emissiveIntensity: 2.0, roughness: 0.2 
            }),
            // Rusted bronze/brass for rivets
            rivet: new THREE.MeshStandardMaterial({ color: 0x544030, metalness: 0.8, roughness: 0.5 })
        };

        // Fallback shadow base
        if (typeof M !== 'undefined' && M.parts && M.parts.shadow) {
            root.add(M.parts.shadow());
        }

        const joints = {};

        // --- ROOT / PELVIS ---
        // Stance: wide apart, immovable
        const pelvis = new THREE.Group();
        pelvis.position.y = 0.45;
        root.add(pelvis);
        joints.pelvis = pelvis;

        // Heavy armored fauld (skirt armor)
        const pelvisGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.2, 8);
        const pelvisMesh = new THREE.Mesh(pelvisGeo, mats.armor);
        pelvisMesh.castShadow = true;
        
        // Thick Iron Chain Belt (Wrapped twice)
        const chainBeltGroup = new THREE.Group();
        const chainGeo1 = new THREE.TorusGeometry(0.26, 0.035, 8, 20);
        const belt1 = new THREE.Mesh(chainGeo1, mats.chain);
        belt1.position.y = 0.05;
        belt1.rotation.x = Math.PI / 2 + 0.1;

        const chainGeo2 = new THREE.TorusGeometry(0.25, 0.035, 8, 20);
        const belt2 = new THREE.Mesh(chainGeo2, mats.chain);
        belt2.position.y = -0.02;
        belt2.rotation.x = Math.PI / 2 - 0.1;
        
        chainBeltGroup.add(belt1, belt2);
        pelvis.add(pelvisMesh, chainBeltGroup);

        // --- TORSO / CHEST ---
        const torso = new THREE.Group();
        pelvis.add(torso);
        joints.torso = torso;

        // Massive barrel chest breastplate
        const chestGeo = new THREE.BoxGeometry(0.45, 0.35, 0.32);
        const chestMesh = new THREE.Mesh(chestGeo, mats.armor);
        chestMesh.position.y = 0.25;
        chestMesh.castShadow = true;

        // Front layered armor plate
        const frontPlateGeo = new THREE.BoxGeometry(0.35, 0.28, 0.08);
        const frontPlate = new THREE.Mesh(frontPlateGeo, mats.armorDark);
        frontPlate.position.set(0, 0.22, 0.15);
        frontPlate.castShadow = true;

        // Giant rivets on the chest
        for (let x of [-0.12, 0.12]) {
            for (let y of [0.15, 0.3]) {
                const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), mats.rivet);
                rivet.position.set(x, y, 0.18);
                torso.add(rivet);
            }
        }

        // Heavy neck chain (as seen in portrait)
        const neckChainGeo = new THREE.TorusGeometry(0.2, 0.04, 8, 16);
        const neckChain = new THREE.Mesh(neckChainGeo, mats.chain);
        neckChain.position.set(0, 0.42, 0.05);
        neckChain.rotation.x = 1.2;
        
        torso.add(chestMesh, frontPlate, neckChain);

        // --- HEAD & HELMET ---
        const neck = new THREE.Group();
        neck.position.y = 0.48;
        torso.add(neck);
        joints.head = neck;

        // Exposed gritty square jaw & mouth
        const jawGeo = new THREE.BoxGeometry(0.16, 0.1, 0.16);
        const jaw = new THREE.Mesh(jawGeo, mats.skin);
        jaw.position.y = -0.02;
        neck.add(jaw);

        // Deep-set red glowing eyes
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.02), mats.eyeGlow);
        eyeL.position.set(-0.05, 0.05, 0.09);
        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.02), mats.eyeGlow);
        eyeR.position.set(0.05, 0.05, 0.09);
        neck.add(eyeL, eyeR);

        // Enclosed Heavy Helmet
        const helmGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.22, 8);
        const helm = new THREE.Mesh(helmGeo, mats.armor);
        helm.position.y = 0.08;
        helm.castShadow = true;

        // Aggressive nose guard / face plate
        const faceGuardGeo = new THREE.BoxGeometry(0.06, 0.18, 0.08);
        const faceGuard = new THREE.Mesh(faceGuardGeo, mats.armor);
        faceGuard.position.set(0, 0.05, 0.12);
        
        // Eyebrow heavy ridge
        const browGeo = new THREE.BoxGeometry(0.22, 0.05, 0.06);
        const brow = new THREE.Mesh(browGeo, mats.armorDark);
        brow.position.set(0, 0.1, 0.13);

        // Forward-curving Horns (using TubeGeometry for a menacing curve)
        const createHorn = (side) => {
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(side * 0.08, 0.06, 0.05),
                new THREE.Vector3(side * 0.1, 0.12, 0.15) // Curves up and forward
            ]);
            const hornGeo = new THREE.TubeGeometry(curve, 12, 0.04, 8, false);
            // Taper the tube by scaling
            const horn = new THREE.Mesh(hornGeo, mats.armorDark);
            horn.position.set(side * 0.12, 0.05, 0);
            
            // Add a sharp tip
            const tipGeo = new THREE.ConeGeometry(0.04, 0.08, 8);
            const tip = new THREE.Mesh(tipGeo, mats.armorDark);
            tip.position.set(side * 0.1, 0.15, 0.17);
            tip.rotation.x = 0.8;
            tip.rotation.z = side * -0.3;

            const group = new THREE.Group();
            group.add(horn, tip);
            return group;
        };

        const hornL = createHorn(-1);
        const hornR = createHorn(1);

        neck.add(helm, faceGuard, brow, hornL, hornR);

        // --- MASSIVE PAULDRONS (SHOULDERS) ---
        const createPauldron = (side) => {
            const p = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12, 0, Math.PI, 0, Math.PI), mats.armorDark);
            p.position.set(side * 0.26, 0.38, 0);
            p.rotation.z = side * -Math.PI / 2;
            p.rotation.x = -Math.PI / 2;
            p.castShadow = true;
            return p;
        };
        torso.add(createPauldron(1), createPauldron(-1));

        // --- ARMS ---
        const createArm = (side) => {
            const shoulder = new THREE.Group();
            shoulder.position.set(side * 0.26, 0.32, 0);

            // Bulky upper arm
            const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.25, 8), mats.leather);
            upperArm.position.y = -0.12;
            upperArm.castShadow = true;
            shoulder.add(upperArm);

            const elbow = new THREE.Group();
            elbow.position.y = -0.25;
            shoulder.add(elbow);

            // Heavy gauntlet/forearm
            const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.22, 8), mats.armor);
            forearm.position.y = -0.11;
            forearm.castShadow = true;
            elbow.add(forearm);

            const hand = new THREE.Group();
            hand.position.y = -0.22;
            elbow.add(hand);

            const fist = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), mats.armorDark);
            hand.add(fist);

            return { shoulder, elbow, hand };
        };

        const armL = createArm(1);
        const armR = createArm(-1);
        torso.add(armL.shoulder, armR.shoulder);

        joints.armL = armL.shoulder;
        joints.forearmL = armL.elbow;
        joints.armR = armR.shoulder;
        joints.forearmR = armR.elbow;

        // --- LEGS & BOOTS ---
        const createLeg = (side) => {
            const hip = new THREE.Group();
            // Wide stance
            hip.position.set(side * 0.16, -0.05, 0);

            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.28, 8), mats.leather);
            thigh.position.y = -0.14;
            thigh.castShadow = true;
            hip.add(thigh);

            // Iron Thigh Plate
            const thighPlate = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.28), mats.armor);
            thighPlate.position.y = -0.14;
            hip.add(thighPlate);

            const calfJoint = new THREE.Group();
            calfJoint.position.y = -0.28;
            hip.add(calfJoint);

            // Immense Iron Sabatons (Boots)
            const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.25, 8), mats.armorDark);
            boot.position.y = -0.12;
            boot.castShadow = true;
            
            const foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.32), mats.armor);
            foot.position.set(0, -0.22, 0.05);
            foot.castShadow = true;

            calfJoint.add(boot, foot);

            return { hip, calf: calfJoint };
        };

        const legL = createLeg(1);
        const legR = createLeg(-1);
        pelvis.add(legL.hip, legR.hip);

        joints.thighL = legL.hip;
        joints.thighR = legR.hip;

        // --- TWO-HANDED WAR HAMMER ---
        // Hammer rests heavily on the ground
        const hammerGroup = new THREE.Group();
        hammerGroup.position.set(0, -0.45, 0.4); 
        hammerGroup.rotation.x = -0.1;
        root.add(hammerGroup);

        // Thick Iron Handle
        const haft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), mats.armorDark);
        haft.position.y = 0.6;
        haft.castShadow = true;
        hammerGroup.add(haft);
        
        // Massive Stone Block Head
        const headGeo = new THREE.BoxGeometry(0.35, 0.25, 0.55);
        const hammerHead = new THREE.Mesh(headGeo, mats.stone);
        hammerHead.position.y = 1.15;
        hammerHead.castShadow = true;
        hammerGroup.add(hammerHead);

        // Iron Bands wrapping the stone
        const band1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.08), mats.armor);
        band1.position.set(0, 1.15, 0.15);
        const band2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.08), mats.armor);
        band2.position.set(0, 1.15, -0.15);
        
        const rivetGeo = new THREE.SphereGeometry(0.025, 6, 6);
        for (let x of [-0.19, 0.19]) {
            const r1 = new THREE.Mesh(rivetGeo, mats.rivet);
            r1.position.set(x, 1.15, 0.15);
            const r2 = new THREE.Mesh(rivetGeo, mats.rivet);
            r2.position.set(x, 1.15, -0.15);
            hammerGroup.add(r1, r2);
        }

        hammerGroup.add(band1, band2);

        // Pose Arms to rest on the hammer handle
        joints.armL.rotation.set(0.6, 0.2, -0.2);
        joints.forearmL.rotation.x = -0.3;
        joints.armR.rotation.set(0.6, -0.2, 0.2);
        joints.forearmR.rotation.x = -0.3;

        // Wide Stance Adjustments
        joints.thighL.rotation.z = -0.1;
        joints.thighL.rotation.y = 0.15;
        joints.thighR.rotation.z = 0.1;
        joints.thighR.rotation.y = -0.15;

        // === STAR RANK RING ===
        if (hero && hero.star >= 2) {
            const starColor = hero.star >= 3 ? mats.rivet : new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8, roughness: 0.4 });
            const ringGeo = new THREE.RingGeometry(0.48, 0.55, 24);
            const starRing = new THREE.Mesh(ringGeo, starColor);
            starRing.position.y = 0.02;
            starRing.rotation.x = -Math.PI / 2;
            root.add(starRing);
        }

        // === HEAVY IDLE ANIMATION ===
        root.userData.joints = joints;
        root.userData.updateAnimation = (time) => {
            // Immovable object: Very slow, incredibly subtle breathing
            joints.torso.position.y = Math.sin(time * 1.0) * 0.005;
            joints.head.position.y = 0.48 + Math.sin(time * 1.0 + 0.5) * 0.002;
            
            // Slow glowing eye pulse
            mats.eyeGlow.emissiveIntensity = 1.8 + Math.sin(time * 2) * 0.4;
        };

        return root;
    }
}