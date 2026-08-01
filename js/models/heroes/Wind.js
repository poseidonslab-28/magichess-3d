// js/models/heroes/Wind.js
class WindModel {
    static create(hero = { star: 1 }) {
        const root = new THREE.Group();
        root.name = "WindHero";

        const mats = {
            tunic: new THREE.MeshStandardMaterial({ color: 0x1c2b1e, roughness: 0.95 }),
            tunicDark: new THREE.MeshStandardMaterial({ color: 0x111c13, roughness: 0.95 }),
            pants: new THREE.MeshStandardMaterial({ color: 0x1c1714, roughness: 0.95 }),
            boots: new THREE.MeshStandardMaterial({ color: 0x14100d, roughness: 0.85 }),
            leather: new THREE.MeshStandardMaterial({ color: 0x2b1e15, roughness: 0.8 }),
            skin: new THREE.MeshStandardMaterial({ color: 0x9b7661, roughness: 0.6 }),
            hair: new THREE.MeshStandardMaterial({ color: 0x0a140d, roughness: 0.7 }),
            bowWood: new THREE.MeshStandardMaterial({ color: 0x24160d, roughness: 0.6 }),
            bowString: new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.6 }),
            bronze: new THREE.MeshStandardMaterial({ color: 0x5c4d3c, metalness: 0.8, roughness: 0.4 }),
            feather: new THREE.MeshStandardMaterial({ color: 0xd9d4cf, roughness: 0.9, side: THREE.DoubleSide }),
            arrowShaft: new THREE.MeshStandardMaterial({ color: 0x3d3024, roughness: 0.7 }),
            arrowTip: new THREE.MeshStandardMaterial({ color: 0x7a7a7a, metalness: 0.9, roughness: 0.3 }),
            eyeGlow: new THREE.MeshStandardMaterial({
                color: 0x66ff88, emissive: 0x119933, emissiveIntensity: 2.0, roughness: 0.1
            })
        };

        if (typeof M !== 'undefined' && M.parts && M.parts.shadow) {
            root.add(M.parts.shadow());
        }

        const joints = {};

        // --- PELVIS ---
        const pelvis = new THREE.Group();
        pelvis.position.y = 0.42;
        root.add(pelvis);
        joints.pelvis = pelvis;

        const pelvisGeo = new THREE.CylinderGeometry(0.12, 0.13, 0.1, 10);
        const pelvisMesh = new THREE.Mesh(pelvisGeo, mats.tunicDark);
        pelvisMesh.position.y = 0.02;
        pelvis.add(pelvisMesh);

        const beltGeo = new THREE.CylinderGeometry(0.13, 0.14, 0.05, 10);
        const belt = new THREE.Mesh(beltGeo, mats.leather);
        belt.position.y = 0.05;
        pelvis.add(belt);

        // --- TORSO (feminine silhouette) ---
        const torso = new THREE.Group();
        pelvis.add(torso);
        joints.torso = torso;

        const chestGeo = new THREE.CylinderGeometry(0.10, 0.13, 0.28, 10);
        const chestMesh = new THREE.Mesh(chestGeo, mats.tunic);
        chestMesh.position.y = 0.18;
        chestMesh.castShadow = true;

        const corsetGeo = new THREE.CylinderGeometry(0.11, 0.12, 0.08, 10);
        const corset = new THREE.Mesh(corsetGeo, mats.leather);
        corset.position.y = 0.12;

        const strapGeo = new THREE.BoxGeometry(0.04, 0.3, 0.22);
        const strap = new THREE.Mesh(strapGeo, mats.leather);
        strap.position.set(0, 0.18, 0);
        strap.rotation.z = -0.3;

        const mantleGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.12, 12);
        const mantle = new THREE.Mesh(mantleGeo, mats.tunicDark);
        mantle.position.set(0, 0.26, -0.02);

        torso.add(chestMesh, corset, strap, mantle);

        // --- QUIVER ---
        const quiverGroup = new THREE.Group();
        quiverGroup.position.set(0.1, 0.18, -0.14);
        quiverGroup.rotation.set(-0.25, 0, 0.35);
        torso.add(quiverGroup);
        joints.quiver = quiverGroup;

        const quiverBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.38, 8), mats.leather);
        const quiverRim = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.008, 8, 12), mats.bronze);
        quiverRim.position.y = 0.19;
        quiverRim.rotation.x = Math.PI / 2;
        quiverGroup.add(quiverBody, quiverRim);

        // --- HEAD & FACE (feminine) ---
        const neck = new THREE.Group();
        neck.position.y = 0.36;
        torso.add(neck);
        joints.head = neck;

        const headGeo = new THREE.CylinderGeometry(0.08, 0.065, 0.14, 10);
        const headMesh = new THREE.Mesh(headGeo, mats.skin);
        headMesh.position.y = 0.06;
        neck.add(headMesh);

        const eyeGeo = new THREE.SphereGeometry(0.014, 8, 8);
        neck.add(new THREE.Mesh(eyeGeo, mats.eyeGlow).translate(-0.035, 0.08, 0.07));
        neck.add(new THREE.Mesh(eyeGeo, mats.eyeGlow).translate(0.035, 0.08, 0.07));

        // Elf ears
        const earGeo = new THREE.ConeGeometry(0.018, 0.1, 4);
        earGeo.translate(0, 0.05, 0);
        for (let side of [-1, 1]) {
            const ear = new THREE.Mesh(earGeo, mats.skin);
            ear.position.set(side * 0.07, 0.05, -0.01);
            ear.rotation.set(0.2, 0, side * 0.8);
            neck.add(ear);
        }

        // === LONG FLOWING HAIR ===
        const hairGroup = new THREE.Group();
        neck.add(hairGroup);

        const hairBack = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.02, 0.4, 6), mats.hair);
        hairBack.position.set(0, 0.0, -0.1);
        hairBack.rotation.x = -0.3;
        hairGroup.add(hairBack);

        const hairLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.004, 0.35, 4), mats.hair);
        hairLeft.position.set(-0.06, -0.02, -0.06);
        hairLeft.rotation.set(0.2, 0, 0.3);
        hairGroup.add(hairLeft);

        const hairRight = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.004, 0.35, 4), mats.hair);
        hairRight.position.set(0.06, -0.02, -0.06);
        hairRight.rotation.set(0.2, 0, -0.3);
        hairGroup.add(hairRight);

        const frontL = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.002, 0.2, 4), mats.hair);
        frontL.position.set(-0.06, 0.04, 0.06);
        frontL.rotation.set(0.1, 0.3, 0.2);
        hairGroup.add(frontL);

        const frontR = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.002, 0.2, 4), mats.hair);
        frontR.position.set(0.06, 0.04, 0.06);
        frontR.rotation.set(0.1, -0.3, -0.2);
        hairGroup.add(frontR);

        const ponytail = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.35, 6), mats.hair);
        ponytail.position.set(0, -0.02, -0.15);
        ponytail.rotation.x = -0.6;
        hairGroup.add(ponytail);

        // Hood (pushed back)
        const hoodDome = new THREE.Mesh(
            new THREE.SphereGeometry(0.11, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
            mats.tunicDark
        );
        hoodDome.position.set(0, 0.08, -0.04);
        neck.add(hoodDome);

        // --- LEGS (visible, agile) ---
        const createLeg = (side) => {
            const hip = new THREE.Group();
            hip.position.set(side * 0.07, 0, 0);

            // Thigh - visible brown pants
            const thighGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.22, 8);
            const thigh = new THREE.Mesh(thighGeo, mats.pants);
            thigh.position.y = -0.11;
            thigh.castShadow = true;
            hip.add(thigh);

            const calfJoint = new THREE.Group();
            calfJoint.position.y = -0.22;
            hip.add(calfJoint);

            // Calf - slightly lighter to show shape
            const calfGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.2, 8);
            const calf = new THREE.Mesh(calfGeo, mats.pants);
            calf.position.y = -0.1;
            calf.castShadow = true;
            calfJoint.add(calf);

            // Knee pad
            const kneeGeo = new THREE.BoxGeometry(0.06, 0.04, 0.07);
            const knee = new THREE.Mesh(kneeGeo, mats.leather);
            knee.position.y = -0.02;
            calfJoint.add(knee);

            // Boot
            const bootGeo = new THREE.CylinderGeometry(0.052, 0.048, 0.18, 8);
            const boot = new THREE.Mesh(bootGeo, mats.boots);
            boot.position.y = -0.28;
            boot.castShadow = true;
            hip.add(boot);

            // Boot cuff
            const cuffGeo = new THREE.CylinderGeometry(0.06, 0.055, 0.04, 8);
            const cuff = new THREE.Mesh(cuffGeo, mats.leather);
            cuff.position.y = -0.2;
            hip.add(cuff);

            // FOOT (actual foot shape)
            const footGroup = new THREE.Group();
            footGroup.position.set(0, -0.35, 0.03);
            hip.add(footGroup);

            // Foot body
            const footGeo = new THREE.BoxGeometry(0.07, 0.05, 0.13);
            const foot = new THREE.Mesh(footGeo, mats.boots);
            foot.castShadow = true;
            footGroup.add(foot);

            // Toe cap
            const toeGeo = new THREE.BoxGeometry(0.06, 0.03, 0.04);
            const toe = new THREE.Mesh(toeGeo, mats.leather);
            toe.position.set(0, -0.01, 0.07);
            footGroup.add(toe);

            return { hip, calf: calfJoint };
        };

        const legL = createLeg(1);
        const legR = createLeg(-1);
        pelvis.add(legL.hip, legR.hip);
        joints.thighL = legL.hip; joints.calfL = legL.calf;
        joints.thighR = legR.hip; joints.calfR = legR.calf;

        // Spread legs slightly for archer stance
        legL.hip.position.x += 0.02;
        legL.hip.position.z -= 0.03;
        legR.hip.position.x -= 0.02;
        legR.hip.position.z += 0.03;

        // --- ARMS ---
        const createArm = (side) => {
            const shoulder = new THREE.Group();
            shoulder.position.set(side * 0.15, 0.28, 0);
            shoulder.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.16, 8), mats.tunic).translate(0, -0.08, 0));
            const elbow = new THREE.Group();
            elbow.position.y = -0.16;
            shoulder.add(elbow);
            elbow.add(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.16, 8), mats.tunicDark).translate(0, -0.08, 0));
            const hand = new THREE.Group();
            hand.position.y = -0.16;
            elbow.add(hand);
            hand.add(new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), mats.skin));
            return { shoulder, elbow, hand };
        };
        const armL = createArm(1), armR = createArm(-1);
        torso.add(armL.shoulder, armR.shoulder);
        joints.armL = armL.shoulder; joints.forearmL = armL.elbow; joints.handL = armL.hand;
        joints.armR = armR.shoulder; joints.forearmR = armR.elbow; joints.handR = armR.hand;

        // --- BOW ---
        const bowGroup = new THREE.Group();
        bowGroup.rotation.set(0.2, 0, -0.2);
        const bowCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.4, -0.1), new THREE.Vector3(0, 0.22, 0.05),
            new THREE.Vector3(0, 0, 0.07), new THREE.Vector3(0, -0.22, 0.05), new THREE.Vector3(0, -0.4, -0.1)
        ]);
        bowGroup.add(new THREE.Mesh(new THREE.TubeGeometry(bowCurve, 16, 0.015, 8, false), mats.bowWood));
        bowGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 8), mats.leather).translate(0, 0, 0.07));
        const stringLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.39, -0.1), new THREE.Vector3(0, 0, -0.01), new THREE.Vector3(0, -0.39, -0.1)]),
            mats.bowString
        );
        bowGroup.add(stringLine);
        armL.hand.add(bowGroup);

        // Stance
        joints.armL.rotation.set(0.7, 0.3, -0.5);
        joints.forearmL.rotation.x = -0.4;
        joints.armR.rotation.set(0.3, 0, 0.4);
        joints.forearmR.rotation.x = -0.6;

        // --- STAR RING ---
        if (hero && hero.star >= 2) {
            root.add(new THREE.Mesh(
                new THREE.RingGeometry(0.32, 0.36, 24),
                new THREE.MeshStandardMaterial({ color: hero.star >= 3 ? 0x5c4d3c : 0x6e8a72, metalness: 0.2, roughness: 0.6 })
            ).rotateX(-Math.PI / 2).translate(0, 0.02, 0));
        }

        // --- ANIMATION ---
        root.userData.joints = joints;
        root.userData.updateAnimation = (time) => {
            joints.torso.position.y = Math.sin(time * 1.8) * 0.015;
            joints.head.rotation.y = Math.sin(time * 1.2) * 0.06;
            joints.armL.rotation.z = -0.5 + Math.sin(time * 1.8) * 0.01;
            joints.armR.rotation.z = 0.4 - Math.sin(time * 1.8) * 0.01;
            joints.quiver.rotation.z = 0.35 + Math.sin(time * 2.5) * 0.015;
        };



        return root;
    }
}