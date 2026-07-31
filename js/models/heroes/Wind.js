// js/models/heroes/Wind.js
class WindModel {
    static create(hero = { star: 1 }) {
        const root = new THREE.Group();
        root.name = "WindHero";

        // === REALISTIC / DARK FANTASY MATERIALS ===
        const mats = {
            // Muted, heavy forest cloak
            tunic: new THREE.MeshStandardMaterial({ color: 0x1c2b1e, metalness: 0.05, roughness: 0.95 }), 
            // Darker draped cloth/cowl
            tunicDark: new THREE.MeshStandardMaterial({ color: 0x111c13, metalness: 0.02, roughness: 0.95 }), 
            // Coarse dark brown pants
            pants: new THREE.MeshStandardMaterial({ color: 0x1c1714, metalness: 0.0, roughness: 0.95 }),
            // Heavy scuffed leather
            boots: new THREE.MeshStandardMaterial({ color: 0x14100d, metalness: 0.1, roughness: 0.85 }),
            // Cured, thick strap leather
            leather: new THREE.MeshStandardMaterial({ color: 0x2b1e15, metalness: 0.15, roughness: 0.8 }),
            // Pale, realistic skin tone
            skin: new THREE.MeshStandardMaterial({ color: 0x9b7661, metalness: 0.0, roughness: 0.6 }),
            // Dark, almost black-green hair
            hair: new THREE.MeshStandardMaterial({ color: 0x0a140d, metalness: 0.1, roughness: 0.7 }), 
            // Carved, polished dark yew wood
            bowWood: new THREE.MeshStandardMaterial({ color: 0x24160d, metalness: 0.1, roughness: 0.6 }),
            bowString: new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.6 }),
            // Tarnished bronze / ancient brass
            bronze: new THREE.MeshStandardMaterial({ color: 0x5c4d3c, metalness: 0.8, roughness: 0.4 }),
            // Mottled grey/white real feathers
            feather: new THREE.MeshStandardMaterial({ color: 0xd9d4cf, metalness: 0.0, roughness: 0.9, side: THREE.DoubleSide }),
            arrowShaft: new THREE.MeshStandardMaterial({ color: 0x3d3024, roughness: 0.7 }),
            arrowTip: new THREE.MeshStandardMaterial({ color: 0x7a7a7a, metalness: 0.9, roughness: 0.3 }),
            // Piercing emerald eye glow
            eyeGlow: new THREE.MeshStandardMaterial({ 
                color: 0x66ff88, emissive: 0x119933, emissiveIntensity: 2.0, roughness: 0.1 
            })
        };

        // Fallback shadow base
        if (typeof M !== 'undefined' && M.parts && M.parts.shadow) {
            root.add(M.parts.shadow());
        }

        // === JOINT DICTIONARY FOR ANIMATION ===
        const joints = {};

        // --- ROOT / PELVIS ---
        const pelvis = new THREE.Group();
        pelvis.position.y = 0.42;
        root.add(pelvis);
        joints.pelvis = pelvis;

        const pelvisGeo = new THREE.CylinderGeometry(0.14, 0.15, 0.12, 10);
        const pelvisMesh = new THREE.Mesh(pelvisGeo, mats.tunicDark);
        pelvisMesh.position.y = 0.02;
        pelvisMesh.castShadow = true;
        
        // Detailed wide utility belt
        const beltGeo = new THREE.CylinderGeometry(0.145, 0.155, 0.06, 10);
        const belt = new THREE.Mesh(beltGeo, mats.leather);
        belt.position.y = 0.05;
        
        const buckleGeo = new THREE.BoxGeometry(0.08, 0.06, 0.04);
        const buckle = new THREE.Mesh(buckleGeo, mats.bronze);
        buckle.position.set(0, 0.05, 0.15);
        
        pelvis.add(pelvisMesh, belt, buckle);

        // --- TORSO & CHEST ---
        const torso = new THREE.Group();
        pelvis.add(torso);
        joints.torso = torso;

        // Layered heavy tunic
        const chestGeo = new THREE.CylinderGeometry(0.13, 0.14, 0.3, 10);
        const chestMesh = new THREE.Mesh(chestGeo, mats.tunic);
        chestMesh.position.y = 0.2;
        chestMesh.castShadow = true;
        
        // Detailed leather cross-strap
        const strapGeo = new THREE.BoxGeometry(0.06, 0.34, 0.28);
        const strap = new THREE.Mesh(strapGeo, mats.leather);
        strap.position.set(0, 0.2, 0);
        strap.rotation.z = -0.4;
        strap.rotation.y = 0.2;
        
        // Circular bronze leaf-clasp (as seen in reference)
        const claspGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8);
        const clasp = new THREE.Mesh(claspGeo, mats.bronze);
        clasp.position.set(0.05, 0.22, 0.13);
        clasp.rotation.x = Math.PI / 2;
        clasp.rotation.y = 0.4;

        // Draped Mantle/Shoulder Capelet
        const mantleGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.15, 12);
        const mantle = new THREE.Mesh(mantleGeo, mats.tunicDark);
        mantle.position.set(0, 0.28, -0.02);
        mantle.rotation.x = 0.1;
        mantle.castShadow = true;

        torso.add(chestMesh, strap, clasp, mantle);

        // --- QUIVER & ARROWS ---
        const quiverGroup = new THREE.Group();
        quiverGroup.position.set(0.12, 0.2, -0.15);
        quiverGroup.rotation.set(-0.25, 0, 0.35);
        torso.add(quiverGroup);
        joints.quiver = quiverGroup;

        // Textured dark leather quiver
        const quiverGeo = new THREE.CylinderGeometry(0.05, 0.035, 0.42, 8);
        const quiverBody = new THREE.Mesh(quiverGeo, mats.leather);
        quiverBody.castShadow = true;
        
        const quiverRimGeo = new THREE.TorusGeometry(0.052, 0.01, 8, 12);
        const quiverRim = new THREE.Mesh(quiverRimGeo, mats.bronze);
        quiverRim.position.y = 0.21;
        quiverRim.rotation.x = Math.PI / 2;
        
        quiverGroup.add(quiverBody, quiverRim);

        // Realistic Arrows
        for (let i = 0; i < 4; i++) {
            const arrowGroup = new THREE.Group();
            const angle = (i * Math.PI * 2) / 4;
            const r = 0.02;
            arrowGroup.position.set(Math.cos(angle) * r, 0.22 + Math.random() * 0.05, Math.sin(angle) * r);
            arrowGroup.rotation.set((Math.random()-0.5)*0.2, 0, (Math.random()-0.5)*0.2);

            const shaftGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.18, 4);
            const shaft = new THREE.Mesh(shaftGeo, mats.arrowShaft);
            
            // Angled fletchings
            const fletchingGeo = new THREE.BoxGeometry(0.002, 0.06, 0.025);
            const fletching1 = new THREE.Mesh(fletchingGeo, mats.feather);
            fletching1.position.set(0, 0.06, 0.012);
            fletching1.rotation.x = -0.1;
            
            const fletching2 = new THREE.Mesh(fletchingGeo, mats.feather);
            fletching2.position.set(0, 0.06, -0.012);
            fletching2.rotation.x = 0.1;

            arrowGroup.add(shaft, fletching1, fletching2);
            quiverGroup.add(arrowGroup);
        }

        // --- HEAD, HOOD & EARS ---
        const neck = new THREE.Group();
        neck.position.y = 0.38;
        torso.add(neck);
        joints.head = neck;

        // Sharper, gaunt face
        const headGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.15, 10);
        const headMesh = new THREE.Mesh(headGeo, mats.skin);
        headMesh.position.y = 0.06;
        headMesh.castShadow = true;
        neck.add(headMesh);

        // Piercing Glowing Eyes
        const eyeGeo = new THREE.SphereGeometry(0.012, 8, 8);
        const eyeL = new THREE.Mesh(eyeGeo, mats.eyeGlow);
        eyeL.position.set(-0.035, 0.08, 0.08);
        const eyeR = new THREE.Mesh(eyeGeo, mats.eyeGlow);
        eyeR.position.set(0.035, 0.08, 0.08);
        neck.add(eyeL, eyeR);

        // Pointed Elf Ears
        const earGeo = new THREE.ConeGeometry(0.02, 0.12, 4);
        earGeo.translate(0, 0.06, 0);
        
        for (let side of [-1, 1]) {
            const ear = new THREE.Mesh(earGeo, mats.skin);
            ear.position.set(side * 0.08, 0.05, -0.01);
            ear.rotation.set(0.2, 0, side * 0.8);
            ear.castShadow = true;
            neck.add(ear);
        }

        // Dark Hair Wisps & Ponytail
        const ponytailGeo = new THREE.ConeGeometry(0.04, 0.2, 5);
        const ponytail = new THREE.Mesh(ponytailGeo, mats.hair);
        ponytail.position.set(0, 0.05, -0.12);
        ponytail.rotation.x = -0.5;
        neck.add(ponytail);

        const wispGeo = new THREE.CylinderGeometry(0.008, 0.002, 0.12, 4);
        const wispL = new THREE.Mesh(wispGeo, mats.hair);
        wispL.position.set(-0.07, 0.02, 0.08);
        wispL.rotation.set(0, 0, 0.3);
        const wispR = new THREE.Mesh(wispGeo, mats.hair);
        wispR.position.set(0.07, 0.02, 0.08);
        wispR.rotation.set(0, 0, -0.3);
        neck.add(wispL, wispR);

        // Deep, heavy draped Hood
        const hoodGroup = new THREE.Group();
        neck.add(hoodGroup);

        const hoodDomeGeo = new THREE.SphereGeometry(0.125, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const hoodDome = new THREE.Mesh(hoodDomeGeo, mats.tunicDark);
        hoodDome.position.set(0, 0.07, -0.02);
        hoodDome.castShadow = true;
        
        // Hood peak/point in back
        const hoodPeakGeo = new THREE.ConeGeometry(0.06, 0.18, 8);
        const hoodPeak = new THREE.Mesh(hoodPeakGeo, mats.tunicDark);
        hoodPeak.position.set(0, 0.12, -0.12);
        hoodPeak.rotation.x = -1.2;

        hoodGroup.add(hoodDome, hoodPeak);

        // --- LEGS & BOOTS ---
        const createLeg = (side) => {
            const hip = new THREE.Group();
            hip.position.set(side * 0.08, 0, 0);

            // Coarse pants
            const thighGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.22, 8);
            const thigh = new THREE.Mesh(thighGeo, mats.pants);
            thigh.position.y = -0.11;
            thigh.castShadow = true;
            hip.add(thigh);

            const calfJoint = new THREE.Group();
            calfJoint.position.y = -0.22;
            hip.add(calfJoint);

            // Heavy leather boots
            const bootGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.22, 8);
            const boot = new THREE.Mesh(bootGeo, mats.boots);
            boot.position.y = -0.11;
            boot.castShadow = true;
            
            const bootCuffGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.05, 8);
            const cuff = new THREE.Mesh(bootCuffGeo, mats.leather);
            cuff.position.y = -0.02;
            
            const footGeo = new THREE.BoxGeometry(0.07, 0.05, 0.12);
            const foot = new THREE.Mesh(footGeo, mats.boots);
            foot.position.set(0, -0.2, 0.02);

            calfJoint.add(boot, cuff, foot);

            return { hip, calf: calfJoint };
        };

        const legL = createLeg(1);
        const legR = createLeg(-1);
        pelvis.add(legL.hip, legR.hip);

        joints.thighL = legL.hip;
        joints.calfL = legL.calf;
        joints.thighR = legR.hip;
        joints.calfR = legR.calf;

        // --- ARMS & HANDS ---
        const createArm = (side) => {
            const shoulder = new THREE.Group();
            shoulder.position.set(side * 0.17, 0.28, 0);

            const upperArmGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.18, 8);
            const upperArm = new THREE.Mesh(upperArmGeo, mats.tunic);
            upperArm.position.y = -0.09;
            upperArm.castShadow = true;
            shoulder.add(upperArm);

            const elbow = new THREE.Group();
            elbow.position.y = -0.18;
            shoulder.add(elbow);

            // Dark leather bracers
            const forearmGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.18, 8);
            const forearm = new THREE.Mesh(forearmGeo, mats.tunicDark);
            forearm.position.y = -0.09;
            forearm.castShadow = true;
            
            const bracerGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.14, 8);
            const bracer = new THREE.Mesh(bracerGeo, mats.leather);
            bracer.position.y = -0.09;

            elbow.add(forearm, bracer);

            const hand = new THREE.Group();
            hand.position.y = -0.18;
            elbow.add(hand);

            const handMeshGeo = new THREE.SphereGeometry(0.035, 8, 8);
            const handMesh = new THREE.Mesh(handMeshGeo, mats.skin);
            hand.add(handMesh);

            return { shoulder, elbow, hand };
        };

        const armL = createArm(1); // Left arm holds bow
        const armR = createArm(-1); // Right arm near quiver
        torso.add(armL.shoulder, armR.shoulder);

        joints.armL = armL.shoulder;
        joints.forearmL = armL.elbow;
        joints.handL = armL.hand;

        joints.armR = armR.shoulder;
        joints.forearmR = armR.elbow;
        joints.handR = armR.hand;

        // === 3D ORGANIC RECURVE BOW ===
        const bowGroup = new THREE.Group();
        // Positioned in left hand
        bowGroup.position.set(0, 0, 0.04);
        bowGroup.rotation.set(0.2, 0, -0.2);

        // Organic curve shape
        const bowCurvePoints = [
            new THREE.Vector3(0, 0.45, -0.12),
            new THREE.Vector3(0, 0.25, 0.06),
            new THREE.Vector3(0, 0, 0.08),
            new THREE.Vector3(0, -0.25, 0.06),
            new THREE.Vector3(0, -0.45, -0.12)
        ];
        const bowCurve = new THREE.CatmullRomCurve3(bowCurvePoints);
        const bowGeo = new THREE.TubeGeometry(bowCurve, 20, 0.018, 8, false);
        const bowMesh = new THREE.Mesh(bowGeo, mats.bowWood);
        bowMesh.castShadow = true;

        // Thick leather grip
        const gripGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.1, 8);
        const grip = new THREE.Mesh(gripGeo, mats.leather);
        grip.position.set(0, 0, 0.08);

        // Bronze carved tips
        const tipGeo = new THREE.ConeGeometry(0.02, 0.06, 6);
        const tipTop = new THREE.Mesh(tipGeo, mats.bronze);
        tipTop.position.set(0, 0.45, -0.12);
        tipTop.rotation.x = -0.5;
        
        const tipBottom = new THREE.Mesh(tipGeo, mats.bronze);
        tipBottom.position.set(0, -0.45, -0.12);
        tipBottom.rotation.x = Math.PI + 0.5;

        // Taut bowstring
        const stringGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0.44, -0.12),
            new THREE.Vector3(0, 0, -0.02), // Pulled slightly back
            new THREE.Vector3(0, -0.44, -0.12)
        ]);
        const stringLine = new THREE.Line(stringGeo, mats.bowString);

        bowGroup.add(bowMesh, grip, tipTop, tipBottom, stringLine);
        armL.hand.add(bowGroup);

        // Alert Archer Stance
        joints.armL.rotation.set(0.7, 0.3, -0.5);
        joints.forearmL.rotation.x = -0.4;
        
        joints.armR.rotation.set(0.3, 0, 0.4);
        joints.forearmR.rotation.x = -0.6;
        
        // Crouched legs
        joints.thighL.rotation.x = -0.2;
        joints.calfL.rotation.x = 0.2;
        joints.thighR.rotation.x = -0.1;
        joints.calfR.rotation.x = 0.1;

        // === STAR RANK RING ===
        if (hero && hero.star >= 2) {
            const starColor = hero.star >= 3 ? mats.bronze : new THREE.MeshStandardMaterial({ color: 0x6e8a72, metalness: 0.2, roughness: 0.6 });
            const ringGeo = new THREE.RingGeometry(0.36, 0.4, 24);
            const starRing = new THREE.Mesh(ringGeo, starColor);
            starRing.position.y = 0.02;
            starRing.rotation.x = -Math.PI / 2;
            root.add(starRing);
        }

        // === ANIMATION LOOP ===
        root.userData.joints = joints;
        root.userData.updateAnimation = (time) => {
            // Subtle, controlled breathing
            joints.torso.position.y = Math.sin(time * 1.8) * 0.015;
            
            // Scanning head movement
            joints.head.rotation.y = Math.sin(time * 1.2) * 0.06;
            
            // Arms hover slightly in ready position
            joints.armL.rotation.z = -0.5 + Math.sin(time * 1.8) * 0.01;
            joints.armR.rotation.z = 0.4 - Math.sin(time * 1.8) * 0.01;

            // Quiver subtly sways
            joints.quiver.rotation.z = 0.35 + Math.sin(time * 2.5) * 0.015;
        };

        return root;
    }
}