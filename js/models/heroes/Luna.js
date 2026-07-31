// js/models/heroes/Luna.js
class LunaModel {
    static create(hero = { star: 1 }) {
        const root = new THREE.Group();
        root.name = "LunaHero";

        // === ETHEREAL / CELESTIAL MATERIALS ===
        const mats = {
            // Flowing cream silk robes
            robe: new THREE.MeshStandardMaterial({ color: 0xfffcf2, metalness: 0.1, roughness: 0.7 }),
            // Intricate gold trim and armor accents
            gold: new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.3 }),
            // Warm, pale skin tone
            skin: new THREE.MeshStandardMaterial({ color: 0xffdfc4, metalness: 0.0, roughness: 0.4 }),
            // Cascading, slightly luminous golden hair
            hair: new THREE.MeshStandardMaterial({ color: 0xffe57f, emissive: 0x332200, roughness: 0.6 }),
            // Glowing amber eyes
            eyeGlow: new THREE.MeshStandardMaterial({ 
                color: 0xffaa00, emissive: 0xff7700, emissiveIntensity: 2.0, roughness: 0.2 
            }),
            // Radiant golden halo
            halo: new THREE.MeshStandardMaterial({ 
                color: 0xffea00, emissive: 0xffaa00, emissiveIntensity: 2.5, metalness: 1.0, roughness: 0.1 
            }),
            // Glowing heart-shaped crystal
            crystal: new THREE.MeshStandardMaterial({ 
                color: 0xfff5cc, emissive: 0xffcc00, emissiveIntensity: 1.5, transparent: true, opacity: 0.8, metalness: 0.5, roughness: 0.1 
            }),
            // Soft, pearlescent white/gold feathers for wings
            feather: new THREE.MeshStandardMaterial({ 
                color: 0xffffff, emissive: 0x111100, roughness: 0.8, side: THREE.DoubleSide 
            })
        };

        // Fallback shadow base
        if (typeof M !== 'undefined' && M.parts && M.parts.shadow) {
            root.add(M.parts.shadow());
        }

        const joints = {};

        // --- ROOT / PELVIS ---
        const pelvis = new THREE.Group();
        pelvis.position.y = 0.5; // Floats slightly higher
        root.add(pelvis);
        joints.pelvis = pelvis;

        // Flowing skirt/robes
        const skirtGeo = new THREE.CylinderGeometry(0.12, 0.25, 0.35, 12, 1, false);
        const skirt = new THREE.Mesh(skirtGeo, mats.robe);
        skirt.position.y = -0.15;
        skirt.castShadow = true;
        
        // Gold trim on skirt
        const skirtTrimGeo = new THREE.CylinderGeometry(0.252, 0.252, 0.04, 12);
        const skirtTrim = new THREE.Mesh(skirtTrimGeo, mats.gold);
        skirtTrim.position.y = -0.31;
        
        pelvis.add(skirt, skirtTrim);

        // --- TORSO / CHEST ---
        const torso = new THREE.Group();
        pelvis.add(torso);
        joints.torso = torso;

        // Elegant bodice
        const chestGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.25, 12);
        const chest = new THREE.Mesh(chestGeo, mats.robe);
        chest.position.y = 0.12;
        chest.castShadow = true;

        // Gold filigree/neckline armor (as seen in portrait)
        const collarGeo = new THREE.CylinderGeometry(0.105, 0.11, 0.1, 12);
        const collar = new THREE.Mesh(collarGeo, mats.gold);
        collar.position.y = 0.22;
        
        const chestStarGeo = new THREE.OctahedronGeometry(0.03, 0);
        const chestStar = new THREE.Mesh(chestStarGeo, mats.gold);
        chestStar.position.set(0, 0.15, 0.12);
        // Flatter chest piece design
        chestStar.scale.set(1, 1.5, 0.5);

        torso.add(chest, collar, chestStar);

        // --- WINGS (REQUESTED ADDITION) ---
        const createWing = (side) => {
            const wingGroup = new THREE.Group();
            wingGroup.position.set(side * 0.08, 0.15, -0.1);
            
            // Create a layered, elegant wing span
            const featherShapes = [
                { sX: 0.05, sY: 0.4, sZ: 0.02, pX: side * 0.15, pY: 0.1, rotZ: side * -0.5 },
                { sX: 0.04, sY: 0.35, sZ: 0.02, pX: side * 0.25, pY: 0.05, rotZ: side * -0.7 },
                { sX: 0.03, sY: 0.3, sZ: 0.02, pX: side * 0.35, pY: -0.05, rotZ: side * -0.9 },
                { sX: 0.03, sY: 0.25, sZ: 0.02, pX: side * 0.42, pY: -0.15, rotZ: side * -1.1 }
            ];

            featherShapes.forEach(f => {
                const fMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), mats.feather);
                fMesh.scale.set(f.sX, f.sY, f.sZ);
                fMesh.position.set(f.pX, f.pY, 0);
                fMesh.rotation.z = f.rotZ;
                wingGroup.add(fMesh);
            });

            return wingGroup;
        };

        const wingL = createWing(1);
        const wingR = createWing(-1);
        torso.add(wingL, wingR);
        joints.wingL = wingL;
        joints.wingR = wingR;

        // --- HEAD & HALO ---
        const neck = new THREE.Group();
        neck.position.y = 0.25;
        torso.add(neck);
        joints.head = neck;

        // Delicate face
        const headGeo = new THREE.SphereGeometry(0.09, 16, 16);
        const head = new THREE.Mesh(headGeo, mats.skin);
        head.position.y = 0.1;
        head.castShadow = true;
        neck.add(head);

        // Warm Amber Eyes
        const eyeGeo = new THREE.SphereGeometry(0.015, 8, 8);
        const eyeL = new THREE.Mesh(eyeGeo, mats.eyeGlow);
        eyeL.position.set(-0.035, 0.11, 0.08);
        const eyeR = new THREE.Mesh(eyeGeo, mats.eyeGlow);
        eyeR.position.set(0.035, 0.11, 0.08);
        neck.add(eyeL, eyeR);

        // Cascading Golden Hair
        const hairTopGeo = new THREE.SphereGeometry(0.095, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const hairTop = new THREE.Mesh(hairTopGeo, mats.hair);
        hairTop.position.y = 0.1;
        
        // Forehead star diadem
        const diadem = new THREE.Mesh(new THREE.OctahedronGeometry(0.015, 0), mats.gold);
        diadem.position.set(0, 0.14, 0.092);
        diadem.scale.set(1, 1.5, 0.5);

        // Wavy locks cascading down
        const lockGeo = new THREE.ConeGeometry(0.03, 0.25, 8);
        for (let i = -1; i <= 1; i += 2) {
            const lock = new THREE.Mesh(lockGeo, mats.hair);
            lock.position.set(i * 0.08, 0, -0.02);
            lock.rotation.z = i * 0.2;
            lock.rotation.x = 0.1;
            neck.add(lock);
        }

        const backHairGeo = new THREE.ConeGeometry(0.08, 0.3, 12);
        const backHair = new THREE.Mesh(backHairGeo, mats.hair);
        backHair.position.set(0, -0.05, -0.07);
        backHair.rotation.x = 0.2;

        neck.add(hairTop, diadem, backHair);

        // Starry Golden Halo
        const haloGroup = new THREE.Group();
        haloGroup.position.y = 0.28;
        haloGroup.rotation.x = -0.2;
        
        const ringGeo = new THREE.TorusGeometry(0.12, 0.008, 8, 24);
        const ring = new THREE.Mesh(ringGeo, mats.halo);
        ring.rotation.x = Math.PI / 2;
        haloGroup.add(ring);

        // Add the distinct pointy stars around the halo
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.015, 0), mats.halo);
            star.position.set(Math.cos(angle) * 0.12, 0, Math.sin(angle) * 0.12);
            star.scale.set(1, 1.5, 1);
            haloGroup.add(star);
        }
        
        neck.add(haloGroup);
        joints.halo = haloGroup;

        // --- ARMS & HANDS ---
        const createArm = (side) => {
            const shoulder = new THREE.Group();
            shoulder.position.set(side * 0.14, 0.2, 0);

            // Flowing sleeve
            const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.16, 8), mats.robe);
            upperArm.position.y = -0.08;
            shoulder.add(upperArm);

            const elbow = new THREE.Group();
            elbow.position.y = -0.16;
            shoulder.add(elbow);

            // Lower sleeve with gold trim
            const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.16, 8), mats.robe);
            forearm.position.y = -0.08;
            const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.02, 8), mats.gold);
            cuff.position.y = -0.15;
            elbow.add(forearm, cuff);

            const hand = new THREE.Group();
            hand.position.y = -0.18;
            elbow.add(hand);

            const handMesh = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), mats.skin);
            hand.add(handMesh);

            return { shoulder, elbow, hand };
        };

        const armL = createArm(1);
        const armR = createArm(-1);
        torso.add(armL.shoulder, armR.shoulder);

        joints.armL = armL.shoulder;
        joints.forearmL = armL.elbow;
        joints.handL = armL.hand;

        joints.armR = armR.shoulder;
        joints.forearmR = armR.elbow;
        joints.handR = armR.hand;

        // --- ORNATE HEART STAFF ---
        const staffGroup = new THREE.Group();
        staffGroup.position.set(0, 0, 0.05);
        
        // Golden Shaft
        const shaftGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.8, 8);
        const shaft = new THREE.Mesh(shaftGeo, mats.gold);
        
        // Ornate Heart Top
        const topGroup = new THREE.Group();
        topGroup.position.y = 0.45;
        
        // Constructing a heart crystal using two spheres and a cone
        const heartGroup = new THREE.Group();
        const sphereGeo = new THREE.SphereGeometry(0.04, 16, 16);
        const lSphere = new THREE.Mesh(sphereGeo, mats.crystal);
        lSphere.position.set(-0.025, 0.02, 0);
        const rSphere = new THREE.Mesh(sphereGeo, mats.crystal);
        rSphere.position.set(0.025, 0.02, 0);
        const coneGeo = new THREE.ConeGeometry(0.055, 0.08, 16);
        const bottomCone = new THREE.Mesh(coneGeo, mats.crystal);
        bottomCone.position.y = -0.015;
        bottomCone.rotation.x = Math.PI;
        
        heartGroup.add(lSphere, rSphere, bottomCone);
        heartGroup.scale.set(0.8, 0.8, 0.4);

        // Gold framing around the heart
        const frameGeo = new THREE.TorusGeometry(0.07, 0.008, 8, 24);
        const frame = new THREE.Mesh(frameGeo, mats.gold);
        frame.scale.set(1, 1.2, 1);
        
        topGroup.add(heartGroup, frame);
        staffGroup.add(shaft, topGroup);
        
        // Put staff in Right Hand
        armR.hand.add(staffGroup);

        // Peaceful welcoming stance
        joints.armL.rotation.set(0.2, 0, -0.3);
        joints.forearmL.rotation.x = -0.4;
        
        // Right arm holding staff
        joints.armR.rotation.set(0.5, 0.2, 0.2);
        joints.forearmR.rotation.x = -0.2;

        // --- STAR RANK RING ---
        if (hero && hero.star >= 2) {
            const starColor = hero.star >= 3 ? mats.gold : new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.4 });
            const ringGeo = new THREE.RingGeometry(0.36, 0.4, 24);
            const starRing = new THREE.Mesh(ringGeo, starColor);
            // Lowered slightly so it stays below her floating feet
            starRing.position.y = -0.45; 
            starRing.rotation.x = -Math.PI / 2;
            root.add(starRing);
        }

        // === ETHEREAL ANIMATION ===
        root.userData.joints = joints;
        root.userData.updateAnimation = (time) => {
            // Gentle hovering up and down
            joints.pelvis.position.y = 0.5 + Math.sin(time * 1.5) * 0.03;
            
            // Gentle majestic wing flap
            joints.wingL.rotation.y = Math.sin(time * 1.5) * 0.15 + 0.1;
            joints.wingR.rotation.y = -Math.sin(time * 1.5) * 0.15 - 0.1;

            // Halo slow rotation and pulsing
            joints.halo.rotation.z = time * 0.5;
            mats.halo.emissiveIntensity = 2.0 + Math.sin(time * 3) * 0.5;
            
            // Staff crystal pulse
            mats.crystal.emissiveIntensity = 1.2 + Math.sin(time * 2.5) * 0.4;

            // Subtle, calm breathing / arm sway
            joints.armL.rotation.z = -0.3 + Math.sin(time * 1.2) * 0.02;
        };

        return root;
    }
}