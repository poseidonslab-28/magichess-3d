// js/models/heroes/Frost.js
class FrostModel {
    static create(hero) {
        const root = new THREE.Group();
        root.name = "FrostHero";

        // === REALISTIC / DARK FANTASY MATERIALS ===
        const mats = {
            // Deep, worn velvet/indigo robe
            robe: new THREE.MeshStandardMaterial({ color: 0x1c1331, roughness: 0.95, metalness: 0.05 }),
            // Tarnished antique gold
            gold: new THREE.MeshStandardMaterial({ color: 0x8a7342, roughness: 0.6, metalness: 0.7 }),
            // Bright icy magic core
            iceGlow: new THREE.MeshStandardMaterial({ 
                color: 0x88ccff, roughness: 0.1, metalness: 0.2, 
                emissive: 0x0a44aa, emissiveIntensity: 1.5, transparent: true, opacity: 0.9 
            }),
            // Gnarled, dark, damp wood
            wood: new THREE.MeshStandardMaterial({ color: 0x1f1712, roughness: 0.95 }),
            // Pale, frostbitten, heavily aged skin
            skin: new THREE.MeshStandardMaterial({ color: 0x76899e, roughness: 0.8 }),
            // Coarse, frozen hair
            beard: new THREE.MeshStandardMaterial({ color: 0xcad4dd, roughness: 0.85 }),
            // Dark worn leather
            leather: new THREE.MeshStandardMaterial({ color: 0x1a120d, roughness: 0.9 }),
            // Ambient frost magic
            frostParticle: new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.5 })
        };

        // Fallback to M.shadow() if using your utility, or standard mesh
        if (typeof M !== 'undefined' && M.shadow) {
            root.add(M.shadow());
        }

        // === BODY / ROBES ===
        const body = new THREE.Group();
        body.position.y = 0.35;
        root.add(body);

        // Heavy, layered robes
        const robeGeo = new THREE.CylinderGeometry(0.14, 0.35, 0.7, 10);
        const robe = new THREE.Mesh(robeGeo, mats.robe);
        robe.position.y = -0.05;
        robe.castShadow = true;
        robe.receiveShadow = true;
        body.add(robe);

        // Robe mantle/shoulders
        const mantleGeo = new THREE.CylinderGeometry(0.16, 0.2, 0.2, 10);
        const mantle = new THREE.Mesh(mantleGeo, mats.robe);
        mantle.position.y = 0.25;
        mantle.castShadow = true;
        body.add(mantle);

        // Heavy antique gold trim at the bottom
        const trimGeo = new THREE.TorusGeometry(0.34, 0.025, 6, 16);
        const trim = new THREE.Mesh(trimGeo, mats.gold);
        trim.position.y = -0.38;
        trim.rotation.x = Math.PI / 2;
        body.add(trim);

        // Dark leather belt with tarnished buckle
        const beltGeo = new THREE.CylinderGeometry(0.24, 0.25, 0.05, 10);
        const belt = new THREE.Mesh(beltGeo, mats.leather);
        belt.position.y = 0.05;
        body.add(belt);
        
        const buckleGeo = new THREE.BoxGeometry(0.08, 0.08, 0.04);
        const buckle = new THREE.Mesh(buckleGeo, mats.gold);
        buckle.position.set(0, 0.05, 0.24);
        body.add(buckle);

        // === ARMS & HANDS ===
        const makeArm = (side) => {
            const g = new THREE.Group();
            g.position.set(side * 0.22, 0.2, 0);
            
            // Loose sleeve
            const sleeveGeo = new THREE.CylinderGeometry(0.06, 0.1, 0.35, 8);
            const sleeve = new THREE.Mesh(sleeveGeo, mats.robe);
            sleeve.position.y = -0.15;
            sleeve.rotation.z = side * 0.2;
            sleeve.castShadow = true;
            g.add(sleeve);
            
            // Frostbitten clawed hand
            const handGeo = new THREE.SphereGeometry(0.045, 6, 6);
            const hand = new THREE.Mesh(handGeo, mats.skin);
            hand.position.set(side * 0.05, -0.32, 0);
            g.add(hand);
            
            return g;
        };
        body.add(makeArm(1)); // Right arm
        
        const leftArm = makeArm(-1);
        leftArm.rotation.x = -0.3; // Raised slightly to hold staff
        body.add(leftArm);

        // === HEAD & FACE ===
        const head = new THREE.Group();
        head.position.y = 0.45;
        body.add(head);

        // Gaunt, angular face
        const faceGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.18, 8);
        const face = new THREE.Mesh(faceGeo, mats.skin);
        face.castShadow = true;
        head.add(face);

        // Pointed Elf Ears
        const earGeo = new THREE.ConeGeometry(0.03, 0.15, 4);
        earGeo.translate(0, 0.07, 0);
        
        const earR = new THREE.Mesh(earGeo, mats.skin);
        earR.position.set(0.1, 0, 0);
        earR.rotation.set(-0.2, 0, -1.2);
        head.add(earR);
        
        const earL = new THREE.Mesh(earGeo, mats.skin);
        earL.position.set(-0.1, 0, 0);
        earL.rotation.set(-0.2, 0, 1.2);
        head.add(earL);

        // Piercing, glowing pupilless eyes
        const eyeGeo = new THREE.SphereGeometry(0.022, 6, 6);
        const eyeR = new THREE.Mesh(eyeGeo, mats.iceGlow);
        eyeR.position.set(0.04, 0.03, 0.08);
        head.add(eyeR);
        
        const eyeL = new THREE.Mesh(eyeGeo, mats.iceGlow);
        eyeL.position.set(-0.04, 0.03, 0.08);
        head.add(eyeL);

        // Long, unkempt frozen beard
        const beardGroup = new THREE.Group();
        head.add(beardGroup);
        
        const beardMainGeo = new THREE.ConeGeometry(0.12, 0.4, 7);
        const beardMain = new THREE.Mesh(beardMainGeo, mats.beard);
        beardMain.position.set(0, -0.15, 0.09);
        beardMain.rotation.x = 0.15;
        beardGroup.add(beardMain);

        // Icicles hanging in the beard
        for(let i=0; i<4; i++) {
            const icicleGeo = new THREE.OctahedronGeometry(0.015 + Math.random()*0.01, 0);
            const icicle = new THREE.Mesh(icicleGeo, mats.iceGlow);
            icicle.scale.y = 2.5;
            icicle.position.set(
                (Math.random() - 0.5) * 0.15,
                -0.1 - Math.random() * 0.2,
                0.12 + Math.random() * 0.04
            );
            beardGroup.add(icicle);
        }

        // === WIZARD HAT ===
        const hatGroup = new THREE.Group();
        hatGroup.position.y = 0.1;
        head.add(hatGroup);

        // Wide, worn brim
        const brimGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.02, 12);
        const brim = new THREE.Mesh(brimGeo, mats.robe);
        brim.castShadow = true;
        hatGroup.add(brim);

        // Multi-segmented bent hat cone
        const hatBaseGeo = new THREE.CylinderGeometry(0.09, 0.12, 0.2, 8);
        const hatBase = new THREE.Mesh(hatBaseGeo, mats.robe);
        hatBase.position.y = 0.1;
        hatGroup.add(hatBase);
        
        const hatMidGeo = new THREE.CylinderGeometry(0.05, 0.09, 0.2, 8);
        const hatMid = new THREE.Mesh(hatMidGeo, mats.robe);
        hatMid.position.y = 0.28;
        hatMid.position.x = 0.02;
        hatMid.rotation.z = -0.15;
        hatGroup.add(hatMid);

        const hatTipGeo = new THREE.ConeGeometry(0.05, 0.2, 8);
        const hatTip = new THREE.Mesh(hatTipGeo, mats.robe);
        hatTip.position.y = 0.42;
        hatTip.position.x = 0.07;
        hatTip.rotation.z = -0.4;
        hatGroup.add(hatTip);

        // Ornate hat band & gem
        const bandGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.04, 8);
        const band = new THREE.Mesh(bandGeo, mats.gold);
        band.position.y = 0.03;
        hatGroup.add(band);
        
        const gemGeo = new THREE.OctahedronGeometry(0.03, 0);
        const gem = new THREE.Mesh(gemGeo, mats.iceGlow);
        gem.position.set(0, 0.03, 0.13);
        gem.scale.z = 0.5;
        hatGroup.add(gem);

        // === GNARLED ICE STAFF ===
        const staffGroup = new THREE.Group();
        // Positioned in his left hand
        staffGroup.position.set(-0.27, -0.05, 0.15);
        staffGroup.rotation.x = 0.1;
        staffGroup.rotation.z = -0.1;
        body.add(staffGroup);

        // Twisted wood pole
        const poleGeo = new THREE.CylinderGeometry(0.018, 0.025, 1.1, 5);
        const pole = new THREE.Mesh(poleGeo, mats.wood);
        pole.position.y = 0.2;
        pole.castShadow = true;
        staffGroup.add(pole);
        
        // Roots/vines grasping the crystal
        const rootGeo = new THREE.ConeGeometry(0.03, 0.15, 4);
        for(let i=0; i<3; i++) {
            const claw = new THREE.Mesh(rootGeo, mats.wood);
            claw.position.y = 0.75;
            claw.rotation.z = 0.2;
            claw.rotation.y = (i / 3) * Math.PI * 2;
            staffGroup.add(claw);
        }

        // Massive Jagged Ice Crystal
        const crystalGeo = new THREE.IcosahedronGeometry(0.12, 0);
        const crystal = new THREE.Mesh(crystalGeo, mats.iceGlow);
        crystal.position.y = 0.88;
        crystal.scale.set(1, 1.8, 1);
        staffGroup.add(crystal);

        // Ambient Snowflakes / Magic Runes
        const snowflakes = [];
        for (let i = 0; i < 4; i++) {
            const flakeGeo = new THREE.OctahedronGeometry(0.015, 0);
            const flake = new THREE.Mesh(flakeGeo, mats.frostParticle);
            flake.position.y = 0.85;
            flake.userData = { 
                angle: (i / 4) * Math.PI * 2, 
                radius: 0.18 + Math.random() * 0.05,
                speed: 1.5 + Math.random()
            };
            staffGroup.add(flake);
            snowflakes.push(flake);
        }

        // === FROST AURA GROUND RING ===
        const auraGeo = new THREE.RingGeometry(0.35, 0.42, 24);
        const aura = new THREE.Mesh(auraGeo, mats.frostParticle);
        aura.position.y = 0.02;
        aura.rotation.x = -Math.PI / 2;
        root.add(aura);

        // === STAR LEVEL INDICATOR ===
        if (hero && hero.star >= 2) {
            const starColor = hero.star === 3 ? mats.gold : new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.4, metalness: 0.8 });
            const ringGeo = new THREE.RingGeometry(0.45, 0.48, 16);
            const starRing = new THREE.Mesh(ringGeo, starColor);
            starRing.position.y = 0.03;
            starRing.rotation.x = -Math.PI / 2;
            root.add(starRing);
        }

        // === ANIMATION LOOP ===
        root.userData.updateAnimation = (time) => {
            // Idle breathing
            body.position.y = 0.35 + Math.sin(time * 2) * 0.01;
            
            // Staff hovers slightly in hand
            staffGroup.position.y = -0.05 + Math.sin(time * 3 + 1) * 0.02;
            
            // Crystal pulses glow
            mats.iceGlow.emissiveIntensity = 1.2 + Math.sin(time * 4) * 0.4;
            
            // Snowflakes orbit the crystal
            snowflakes.forEach(flake => {
                flake.userData.angle += flake.userData.speed * 0.016;
                flake.position.x = Math.cos(flake.userData.angle) * flake.userData.radius;
                flake.position.z = Math.sin(flake.userData.angle) * flake.userData.radius;
                flake.position.y = 0.88 + Math.sin(time * 2 + flake.userData.angle) * 0.05;
                flake.rotation.x += 0.02;
                flake.rotation.y += 0.03;
            });
            
            // Ground aura rotates slowly
            aura.rotation.z = time * 0.2;
        };
        
        leftArm.rotation.x = -0.3;
        body.add(leftArm);

        const rightArm = makeArm(1); // Store this!
        body.add(rightArm);

        root.userData.joints = {
            body: body,
            head: head,
            armL: leftArm,      // The left arm group
            armR: rightArm,     // Need to create rightArm reference
            staffGroup: staffGroup
        };

        return root;
    }
}