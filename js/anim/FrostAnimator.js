// js/anim/FrostAnimator.js
class FrostAnimator extends HeroAnimator {
    /**
     * ARCANE HOVER / FLOATING STANCE
     * High-amplitude float wave with rhythmic floating spell-weaving.
     */
    idle(t) {
        // High floating wave (readable from above)
        const float = Math.sin(t * 2.2) * 0.12 + 0.15;
        const tiltRoll = Math.sin(t * 1.1) * 0.08;

        // Core Hover Elevation (Body handles elevation; Pelvis stays attached)
        this._set('body', 'position', 'y', float);
        this._set('pelvis', 'position', 'y', 0);
        this._set('torso', 'rotation', 'x', 0.12 + Math.sin(t * 2.2) * 0.05);
        this._set('torso', 'rotation', 'z', tiltRoll);

        // Head tracking
        this._set('head', 'rotation', 'y', Math.sin(t * 1.5) * 0.12);
        this._set('head', 'rotation', 'x', -0.08 + Math.cos(t * 1.8) * 0.06);

        // Staff Levitation (Subtle sway relative to hand anchor)
        this._set('staffGroup', 'rotation', 'z', 0.35 + Math.sin(t * 1.8) * 0.1);
        this._set('staffGroup', 'rotation', 'x', Math.cos(t * 1.5) * 0.12);
        this._set('staffGroup', 'position', 'y', Math.sin(t * 2.2) * 0.02);

        // Arms & Spellcasting Hand
        this._set('armL', 'rotation', 'x', -0.6 + Math.sin(t * 2.2) * 0.08);
        this._set('armL', 'rotation', 'z', 0);
        this._set('armR', 'rotation', 'x', -0.8 + Math.cos(t * 3.0) * 0.2);
        this._set('armR', 'rotation', 'z', 0.4 + Math.sin(t * 2.5) * 0.15);
        this._set('forearmR', 'rotation', 'x', -1.0 + Math.sin(t * 3.0) * 0.25);

        // Dangling leg dynamics (Clears any lingering Z rotation)
        this._set('thighL', 'rotation', 'x', 0.15 + tiltRoll);
        this._set('thighL', 'rotation', 'z', 0);
        this._set('calfL', 'rotation', 'x', 0.25);
        
        this._set('thighR', 'rotation', 'x', -0.1 - tiltRoll);
        this._set('thighR', 'rotation', 'z', 0);
        this._set('calfR', 'rotation', 'x', 0.35);
    }

    /**
     * HIGH-SPEED ARCANE GLIDE
     * Aggressive forward jet-flight pose with trailing legs and staff lead.
     */
    run(t) {
        const bounce = Math.sin(t * 10.0) * 0.08;

        // Heavy forward tilt for speed feel
        this._set('body', 'position', 'y', 0.22 + bounce);
        this._set('pelvis', 'position', 'y', 0);
        this._set('torso', 'rotation', 'x', 0.55);

        // Streamlined trailing legs
        this._set('thighL', 'rotation', 'x', 0.6);
        this._set('thighL', 'rotation', 'z', 0);
        this._set('calfL', 'rotation', 'x', 0.4);
        this._set('thighR', 'rotation', 'x', 0.45);
        this._set('thighR', 'rotation', 'z', 0);
        this._set('calfR', 'rotation', 'x', 0.6);

        // Head looking straight ahead
        this._set('head', 'rotation', 'x', -0.45);

        // Staff thrust forward like a spearhead
        this._set('staffGroup', 'position', 'y', 0);
        this._set('staffGroup', 'rotation', 'z', -0.4);
        this._set('staffGroup', 'rotation', 'x', 0.6);
        this._set('armL', 'rotation', 'x', -1.2);
        this._set('armL', 'rotation', 'z', 0);
        this._set('armR', 'rotation', 'x', 0.7);
        this._set('armR', 'rotation', 'z', 0.6);
    }

    /**
     * QUICK FROST BOLT (Basic Attack)
     * Rapid staff whip with immediate snap back.
     */
    attack(t) {
        const duration = 0.5;
        const p = Math.min(t / duration, 1.0);

        if (p < 0.35) {
            // === WINDUP: Pull back staff & body ===
            const ep = (p / 0.35) ** 2;

            this._set('body', 'position', 'y', 0.15 + 0.2 * ep);
            this._set('pelvis', 'position', 'y', 0);
            this._set('torso', 'rotation', 'x', -0.4 * ep);
            this._set('torso', 'rotation', 'y', -0.3 * ep);

            this._set('armL', 'rotation', 'x', -1.6 * ep);
            this._set('staffGroup', 'rotation', 'z', -0.6 * ep);
            this._set('armR', 'rotation', 'x', 0.4 * ep);
            this._set('head', 'rotation', 'x', 0);
        } else if (p < 0.65) {
            // === SNAP WHIP / RELEASE ===
            const subP = (p - 0.35) / 0.3;
            const ep = 1 - Math.pow(1 - subP, 3);

            this._set('body', 'position', 'y', THREE.MathUtils.lerp(0.35, 0.05, ep));
            this._set('torso', 'rotation', 'x', THREE.MathUtils.lerp(-0.4, 0.6, ep));
            this._set('torso', 'rotation', 'y', THREE.MathUtils.lerp(-0.3, 0.4, ep));

            this._set('armL', 'rotation', 'x', THREE.MathUtils.lerp(-1.6, 0.3, ep));
            this._set('staffGroup', 'rotation', 'z', THREE.MathUtils.lerp(-0.6, 0.8, ep));
            this._set('armR', 'rotation', 'x', THREE.MathUtils.lerp(0.4, -1.2, ep));
            this._set('head', 'rotation', 'x', 0.25 * ep);
        } else {
            // === RECOVER ===
            const subP = (p - 0.65) / 0.35;
            const ep = subP * subP;

            this._set('body', 'position', 'y', THREE.MathUtils.lerp(0.05, 0.15, ep));
            this._set('torso', 'rotation', 'x', THREE.MathUtils.lerp(0.6, 0.12, ep));
            this._set('torso', 'rotation', 'y', THREE.MathUtils.lerp(0.4, 0, ep));

            this._set('armL', 'rotation', 'x', THREE.MathUtils.lerp(0.3, -0.6, ep));
            this._set('staffGroup', 'rotation', 'z', THREE.MathUtils.lerp(0.8, 0.35, ep));
            this._set('armR', 'rotation', 'x', THREE.MathUtils.lerp(-1.2, -0.8, ep));
            this._set('head', 'rotation', 'x', THREE.MathUtils.lerp(0.25, -0.08, ep));
        }

        if (p >= 1.0) this.play('idle');
    }

    /**
     * ULTIMATE SKILL: GLACIAL NOVA / FROST SHOCKWAVE
     * High elevation -> Explosive staff ground slam -> Massive energy recoil.
     */
/**
 * ULTIMATE SKILL: GLACIAL NOVA / FROST SHOCKWAVE
 * High elevation -> Explosive staff ground slam -> Massive energy recoil.
 * (Flat hierarchy version: uses only body, head, armL, armR, staffGroup)
 */
    skill(t) {
        const duration = 1.0;
        const p = Math.min(t / duration, 1.0);

        if (p < 0.35) {
            // === PHASE 1: HIGH ASCENT & ENERGY CHARGE (0% - 35%) ===
            const ep = Math.pow(p / 0.35, 3);

            // Float way up
            this._set('body', 'position', 'y', 0.85 * ep);
            // Arch back (lean backward)
            this._set('body', 'rotation', 'x', -0.7 * ep);
            this._set('body', 'rotation', 'z', 0); // keep stable

            // Arms & staff raise overhead
            this._set('armL', 'rotation', 'x', -2.4 * ep);
            this._set('armL', 'rotation', 'z', -0.5 * ep);
            this._set('staffGroup', 'rotation', 'z', -0.8 * ep);

            this._set('armR', 'rotation', 'x', -2.2 * ep);
            this._set('armR', 'rotation', 'z', 0.6 * ep); // palm up

            // Head tilts up to watch the sky
            this._set('head', 'rotation', 'x', -0.5 * ep);

        } else if (p < 0.55) {
            // === PHASE 2: VIOLENT IMPACT SLAM (35% - 55%) ===
            const subP = (p - 0.35) / 0.2;
            const ep = 1 - Math.pow(1 - subP, 4);

            // Slam down onto the tile (but keep Y above ground to avoid clipping)
            this._set('body', 'position', 'y', THREE.MathUtils.lerp(0.85, 0.05, ep));
            // Crush forward (lean into the slam)
            this._set('body', 'rotation', 'x', THREE.MathUtils.lerp(-0.7, 0.85, ep));
            this._set('body', 'rotation', 'z', 0);

            // Thrust staff hard into the ground
            this._set('armL', 'rotation', 'x', THREE.MathUtils.lerp(-2.4, 0.4, ep));
            this._set('armL', 'rotation', 'z', THREE.MathUtils.lerp(-0.5, 0, ep));
            this._set('staffGroup', 'rotation', 'z', THREE.MathUtils.lerp(-0.8, 1.1, ep));

            // Right arm thrusts down too
            this._set('armR', 'rotation', 'x', THREE.MathUtils.lerp(-2.2, 0.8, ep));
            this._set('armR', 'rotation', 'z', THREE.MathUtils.lerp(0.6, 0, ep));

            // Head snaps forward to look at impact point
            this._set('head', 'rotation', 'x', THREE.MathUtils.lerp(-0.5, 0.5, ep));

        } else if (p < 0.75) {
            // === PHASE 3: FROST EXPLOSION RECOIL (55% - 75%) ===
            const subP = (p - 0.55) / 0.2;
            const ep = Math.sin(subP * Math.PI * 0.5);

            // Pop back up into a hover
            this._set('body', 'position', 'y', THREE.MathUtils.lerp(0.05, 0.4, ep));
            // Lean back from the blast
            this._set('body', 'rotation', 'x', THREE.MathUtils.lerp(0.85, -0.2, ep));
            this._set('body', 'rotation', 'z', 0);

            // Fling arms out wide to release the shockwave
            this._set('armL', 'rotation', 'z', THREE.MathUtils.lerp(0, -1.2, ep));
            this._set('armL', 'rotation', 'x', 0.4 * (1 - ep)); // relax arm x
            this._set('armR', 'rotation', 'z', THREE.MathUtils.lerp(0, 1.2, ep));
            this._set('armR', 'rotation', 'x', 0.8 * (1 - ep));

            // Head settles back
            this._set('head', 'rotation', 'x', THREE.MathUtils.lerp(0.5, -0.3, ep));

        } else {
            // === PHASE 4: FLOATING RESTORATION (75% - 100%) ===
            const subP = (p - 0.75) / 0.25;
            const ep = subP * subP;

            // Float back to idle height
            this._set('body', 'position', 'y', THREE.MathUtils.lerp(0.4, 0.15, ep));
            this._set('body', 'rotation', 'x', THREE.MathUtils.lerp(-0.2, 0.12, ep));
            this._set('body', 'rotation', 'z', 0);

            // Arms return to idle stance
            this._set('armL', 'rotation', 'x', THREE.MathUtils.lerp(0.4, -0.6, ep));
            this._set('armL', 'rotation', 'z', THREE.MathUtils.lerp(-1.2, 0, ep));
            this._set('staffGroup', 'rotation', 'z', THREE.MathUtils.lerp(1.1, 0.35, ep));

            this._set('armR', 'rotation', 'x', THREE.MathUtils.lerp(0.8, -0.8, ep));
            this._set('armR', 'rotation', 'z', THREE.MathUtils.lerp(1.2, 0, ep));

            // Head returns to neutral
            this._set('head', 'rotation', 'x', THREE.MathUtils.lerp(-0.3, -0.08, ep));
        }

        if (p >= 1.0) this.play('idle');
    }

    /**
     * ARCANE SHATTER / DEATH
     * Magic explodes outward — spins out of hover and collapses flat onto tile.
     */
    die(t) {
        const p = Math.min(t / 0.9, 1.0);
        const ep = p * p;

        // Fall gracefully onto ground grid without clipping underneath
        this._set('body', 'position', 'y', THREE.MathUtils.lerp(0.2, 0.08, ep));
        this._set('pelvis', 'position', 'y', 0);

        this._set('body', 'rotation', 'y', Math.PI * 1.5 * ep);
        this._set('body', 'rotation', 'x', -Math.PI / 2 * ep);

        this._set('head', 'rotation', 'x', 0.4 * ep);
        this._set('staffGroup', 'rotation', 'z', 1.8 * ep);
        this._set('armL', 'rotation', 'z', -0.8 * ep);
        this._set('armR', 'rotation', 'z', 0.8 * ep);
    }
}