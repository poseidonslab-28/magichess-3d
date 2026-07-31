// js/models/heroes/Fang.js
class FangModel {
    static create(hero = { star: 1 }) {
        const root = new THREE.Group();
        root.name = "FangHero";

        // === FERAL / BEAST MATERIALS ===
        const mats = {
            // Coarse, dark grey-brown fur
            fur: new THREE.MeshStandardMaterial({ color: 0x4a3b32, metalness: 0.1, roughness: 0.95 }),
            // Darker patches for mane and spine
            furDark: new THREE.MeshStandardMaterial({ color: 0x221a16, metalness: 0.05, roughness: 0.95 }),
            // Lighter underbelly/snout fur
            furLight: new THREE.MeshStandardMaterial({ color: 0x6e5c4f, metalness: 0.0, roughness: 0.9 }),
            // Worn, bloody leather wraps
            leather: new THREE.MeshStandardMaterial({ color: 0x3d281a, metalness: 0.1, roughness: 0.85 }),
            // Dark, oily leather for straps
            leatherDark: new THREE.MeshStandardMaterial({ color: 0x1f140d, metalness: 0.2, roughness: 0.8 }),
            // Weathered bone for the skull buckle
            bone: new THREE.MeshStandardMaterial({ color: 0xc4b7a1, metalness: 0.1, roughness: 0.7 }),
            // Razor-sharp black claws and nose
            blackKeratin: new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.6, roughness: 0.4 }),
            // Yellowed, sharp teeth
            tooth: new THREE.MeshStandardMaterial({ color: 0xd9d1b8, metalness: 0.0, roughness: 0.6 }),
            // Piercing amber-gold slit eyes
            eyeGlow: new THREE.MeshStandardMaterial({ 
                color: 0xffcc00, emissive: 0xb37700, emissiveIntensity: 2.0, roughness: 0.2 
            })
        };

        // Fallback shadow base
        if (typeof M !== 'undefined' && M.parts && M.parts.shadow) {
            root.add(M.parts.shadow());
        }

        const joints = {};

        // --- ROOT / PELVIS ---
        const pelvis = new THREE.Group();
        // Lower stance, hunched ready to pounce
        pelvis.position.y = 0.38; 
        root.add(pelvis);
        joints.pelvis = pelvis;

        // Narrower beast waist
        const pelvisGeo = new THREE.CylinderGeometry(0.12, 0.11, 0.15, 8);
        const pelvisMesh = new THREE.Mesh(pelvisGeo, mats.fur);
        pelvisMesh.castShadow = true;
        
        // Simple leather belt
        const beltGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.03, 8);
        const belt = new THREE.Mesh(beltGeo, mats.leatherDark);
        belt.position.y = 0.02;

        pelvis.add(pelvisMesh, belt);

        // --- TORSO / CHEST ---
        const torso = new THREE.Group();
        pelvis.add(torso);
        joints.torso = torso;

        // Broad, muscular chest
        const chestGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.3, 10);
        const chest = new THREE.Mesh(chestGeo, mats.fur);
        chest.position.y = 0.2;
        chest.castShadow = true;

        // Darker fur ridge down the back
        const spineGeo = new THREE.BoxGeometry(0.08, 0.3, 0.06);
        const spine = new THREE.Mesh(spineGeo, mats.furDark);
        spine.position.set(0, 0.2, -0.15);
        spine.rotation.x = 0.1;

        // Leather cross-strap
        const strapGeo = new THREE.BoxGeometry(0.04, 0.34, 0.38);
        const strap = new THREE.Mesh(strapGeo, mats.leatherDark);
        strap.position.set(0, 0.2, 0);
        strap.rotation.z = -0.5;

        // --- SKULL BUCKLE ---
        const buckleGroup = new THREE.Group();
        buckleGroup.position.set(0.08, 0.22, 0.17);
        buckleGroup.rotation.set(-0.2, 0.4, 0.2);
        
        // Skull base
        const skullGeo = new THREE.BoxGeometry(0.06, 0.08, 0.04);
        const skull = new THREE.Mesh(skullGeo, mats.bone);
        
        // Eye sockets (indents approximated by dark patches or hollows)
        const socketGeo = new THREE.BoxGeometry(0.02, 0.02, 0.01);
        const socketL = new THREE.Mesh(socketGeo, mats.leatherDark);
        socketL.position.set(-0.015, 0.01, 0.02);
        const socketR = new THREE.Mesh(socketGeo, mats.leatherDark);
        socketR.position.set(0.015, 0.01, 0.02);

        // Snout / Teeth of the skull
        const skullSnoutGeo = new THREE.BoxGeometry(0.04, 0.03, 0.02);
        const skullSnout = new THREE.Mesh(skullSnoutGeo, mats.bone);
        skullSnout.position.set(0, -0.04, 0.01);
        
        buckleGroup.add(skull, socketL, socketR, skullSnout);

        torso.add(chest, spine, strap, buckleGroup);

        // --- HEAD, MANE & SNOUT ---
        const neck = new THREE.Group();
        // Neck projects forward due to hunch
        neck.position.set(0, 0.38, 0.08); 
        torso.add(neck);
        joints.head = neck;

        // Base wolf head
        const headGeo = new THREE.SphereGeometry(0.1, 12, 12);
        const head = new THREE.Mesh(headGeo, mats.fur);
        head.castShadow = true;

        // Thick, wild dark mane (spiky fur chunks)
        for (let i = 0; i < 8; i++) {
            const maneTuft = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15, 4), mats.furDark);
            const angle = (i / 8) * Math.PI * 2;
            maneTuft.position.set(Math.cos(angle) * 0.08, 0, Math.sin(angle) * 0.08 - 0.05);
            maneTuft.rotation.x = -Math.PI / 2 + Math.random() * 0.5;
            maneTuft.rotation.z = Math.random() * 0.5 - 0.25;
            neck.add(maneTuft);
        }

        // Elongated Snout
        const snoutGeo = new THREE.CylinderGeometry(0.03, 0.05, 0.12, 8);
        const snout = new THREE.Mesh(snoutGeo, mats.furLight);
        snout.position.set(0, -0.02, 0.1);
        snout.rotation.x = Math.PI / 2;

        // Black wet nose tip
        const noseGeo = new THREE.BoxGeometry(0.03, 0.02, 0.02);
        const nose = new THREE.Mesh(noseGeo, mats.blackKeratin);
        nose.position.set(0, 0, 0.06);
        snout.add(nose);

        // Lower Jaw & Fangs
        const jawGeo = new THREE.BoxGeometry(0.06, 0.03, 0.1);
        const jaw = new THREE.Mesh(jawGeo, mats.furLight);
        jaw.position.set(0, -0.06, 0.08);
        jaw.rotation.x = 0.1;

        // Sharp fangs overlapping the lower jaw slightly
        const fangGeo = new THREE.ConeGeometry(0.008, 0.025, 4);
        const fangL = new THREE.Mesh(fangGeo, mats.tooth);
        fangL.position.set(-0.02, -0.01, 0.04);
        fangL.rotation.x = Math.PI;
        
        const fangR = new THREE.Mesh(fangGeo, mats.tooth);
        fangR.position.set(0.02, -0.01, 0.04);
        fangR.rotation.x = Math.PI;
        
        snout.add(fangL, fangR);

        // Pointed Wolf Ears
        const earGeo = new THREE.ConeGeometry(0.03, 0.08, 4);
        const earL = new THREE.Mesh(earGeo, mats.furDark);
        earL.position.set(-0.06, 0.08, -0.02);
        earL.rotation.set(-0.2, 0, 0.4);
        
        const earR = new THREE.Mesh(earGeo, mats.furDark);
        earR.position.set(0.06, 0.08, -0.02);
        earR.rotation.set(-0.2, 0, -0.4);

        // Amber-Gold Slit Eyes
        const eyeGroupL = new THREE.Group();
        eyeGroupL.position.set(-0.035, 0.03, 0.07);
        eyeGroupL.rotation.set(0, -0.2, 0.1);
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), mats.eyeGlow);
        // Slit pupil using a black sliver
        const pupilL = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.015, 0.015), mats.blackKeratin);
        pupilL.position.z = 0.005;
        eyeGroupL.add(eyeL, pupilL);

        const eyeGroupR = new THREE.Group();
        eyeGroupR.position.set(0.035, 0.03, 0.07);
        eyeGroupR.rotation.set(0, 0.2, -0.1);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), mats.eyeGlow);
        const pupilR = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.015, 0.015), mats.blackKeratin);
        pupilR.position.z = 0.005;
        eyeGroupR.add(eyeR, pupilR);

        neck.add(head, snout, jaw, earL, earR, eyeGroupL, eyeGroupR);

        // --- ARMS & CLAWS ---
        const createArm = (side) => {
            const shoulder = new THREE.Group();
            shoulder.position.set(side * 0.18, 0.28, 0);

            // Bulky, furry upper arm
            const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.2, 8), mats.fur);
            upperArm.position.y = -0.1;
            upperArm.castShadow = true;
            shoulder.add(upperArm);

            const elbow = new THREE.Group();
            elbow.position.y = -0.2;
            shoulder.add(elbow);

            // Leather-wrapped forearm
            const forearmGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.2, 8);
            const forearm = new THREE.Mesh(forearmGeo, mats.leather);
            forearm.position.y = -0.1;
            forearm.castShadow = true;
            
            // Messy wrap layers
            const wrap1 = new THREE.Mesh(new THREE.TorusGeometry(0.051, 0.005, 4, 8), mats.leatherDark);
            wrap1.position.y = -0.05;
            wrap1.rotation.x = 0.2;
            const wrap2 = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.005, 4, 8), mats.leatherDark);
            wrap2.position.y = -0.15;
            wrap2.rotation.x = -0.2;

            elbow.add(forearm, wrap1, wrap2);

            const hand = new THREE.Group();
            hand.position.y = -0.2;
            elbow.add(hand);

            // Feral paw/hand
            const paw = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.05), mats.furLight);
            paw.position.y = -0.04;
            hand.add(paw);

            // Razor-sharp claws
            for (let i = -1; i <= 1; i++) {
                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.06, 4), mats.blackKeratin);
                claw.position.set(i * 0.02, -0.1, 0.01);
                claw.rotation.x = 0.2; // Hooked slightly inward
                hand.add(claw);
            }

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

        // --- DIGITIGRADE LEGS ---
        const createLeg = (side) => {
            const hip = new THREE.Group();
            hip.position.set(side * 0.1, -0.05, 0);

            // Thigh (Angles Forward)
            const thighGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.2, 8);
            const thigh = new THREE.Mesh(thighGeo, mats.fur);
            thigh.position.set(0, -0.1, 0.05);
            thigh.rotation.x = 0.4;
            thigh.castShadow = true;
            hip.add(thigh);

            const knee = new THREE.Group();
            // Position knee at the end of the angled thigh
            knee.position.set(0, -0.18, 0.1);
            hip.add(knee);

            // Calf (Angles Backward strongly)
            const calfGeo = new THREE.CylinderGeometry(0.05, 0.03, 0.22, 8);
            const calf = new THREE.Mesh(calfGeo, mats.fur);
            calf.position.set(0, -0.1, -0.05);
            calf.rotation.x = -0.5;
            calf.castShadow = true;
            knee.add(calf);

            const ankle = new THREE.Group();
            ankle.position.set(0, -0.2, -0.1);
            knee.add(ankle);

            // Elongated Foot / Paw
            const footGeo = new THREE.BoxGeometry(0.06, 0.04, 0.12);
            const foot = new THREE.Mesh(footGeo, mats.furLight);
            foot.position.set(0, -0.02, 0.04);
            
            // Toe Claws
            for (let i = -1; i <= 1; i++) {
                const toeClaw = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.03, 4), mats.blackKeratin);
                toeClaw.position.set(i * 0.02, -0.02, 0.11);
                toeClaw.rotation.x = Math.PI / 2 + 0.2;
                ankle.add(toeClaw);
            }

            ankle.add(foot);

            return { hip, knee, ankle };
        };

        const legL = createLeg(1);
        const legR = createLeg(-1);
        pelvis.add(legL.hip, legR.hip);

        joints.thighL = legL.hip;
        joints.kneeL = legL.knee;
        joints.thighR = legR.hip;
        joints.kneeR = legR.knee;

        // --- POSE ADJUSTMENTS ---
        // Torso hunched over
        joints.torso.rotation.x = 0.4;
        
        // Head tilted up to look forward despite the hunch
        joints.head.rotation.x = -0.3;

        // Left arm raised in a menacing claw gesture (like portrait)
        joints.armL.rotation.set(0.6, 0.4, -0.3);
        joints.forearmL.rotation.set(-1.2, -0.2, 0);
        joints.handL.rotation.set(-0.4, 0, 0); // Hooked hand

        // Right arm low, ready to swing
        joints.armR.rotation.set(-0.2, 0, 0.3);
        joints.forearmR.rotation.set(-0.4, 0, 0);
        joints.handR.rotation.set(-0.2, 0, 0);

        // Leg spacing
        joints.thighL.rotation.z = -0.1;
        joints.thighR.rotation.z = 0.1;

        // === STAR RANK RING ===
        if (hero && hero.star >= 2) {
            const starColor = hero.star >= 3 ? mats.blackKeratin : new THREE.MeshStandardMaterial({ color: 0x884422, metalness: 0.2, roughness: 0.6 });
            const ringGeo = new THREE.RingGeometry(0.4, 0.45, 24);
            const starRing = new THREE.Mesh(ringGeo, starColor);
            // Lower ring to match digitigrade stance resting point
            starRing.position.y = -0.05; 
            starRing.rotation.x = -Math.PI / 2;
            root.add(starRing);
        }

        // === ANIMATION LOOP ===
        root.userData.joints = joints;
        root.userData.updateAnimation = (time) => {
            // Heavy, animalistic breathing
            const breathe = Math.sin(time * 2.5);
            joints.torso.scale.set(1 + breathe * 0.02, 1 + breathe * 0.02, 1 + breathe * 0.03);
            joints.torso.rotation.x = 0.4 + breathe * 0.02;

            // Head scanning side to side slightly
            joints.head.rotation.y = Math.sin(time * 1.2) * 0.15;
            
            // Raised claw trembles slightly with tension
            joints.armL.rotation.z = -0.3 + Math.sin(time * 8) * 0.01;

            // Tail/Spine subtle movement (simulated by swaying the pelvis slightly)
            joints.pelvis.position.y = 0.38 + Math.sin(time * 2.5) * 0.01;

            // Eyes flare aggressively
            mats.eyeGlow.emissiveIntensity = 1.8 + Math.sin(time * 3) * 0.6;
        };

        return root;
    }
}