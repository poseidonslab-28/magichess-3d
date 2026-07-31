// js/anim/WindAnimator.js
class WindAnimator extends HeroAnimator {
    /**
     * ARCHER IDLE STANCE
     * Profile stance: Left shoulder pointed forward, bow held extended, draw hand ready near chest.
     */
    idle(t) {
        const breath = Math.sin(t * 2.5) * 0.015;

        // Profile turned stance (Left shoulder pointing toward enemy target)
        this._set('torso', 'rotation', 'y', -0.4);
        this._set('torso', 'position', 'y', breath);
        this._set('head', 'rotation', 'y', 0.4); // Head locked forward on target

        // Stable staggered footing
        this._set('thighL', 'rotation', 'x', -0.2);
        this._set('calfL', 'rotation', 'x', 0.25);
        this._set('thighR', 'rotation', 'x', 0.2);
        this._set('calfR', 'rotation', 'x', 0.15);

        // Bow Arm (L): Extended forward pointing at target
        this._set('armL', 'rotation', 'x', -1.2);
        this._set('armL', 'rotation', 'y', 0.4);
        this._set('forearmL', 'rotation', 'x', -0.15);

        // Draw Arm (R): Hand resting near chest, ready on string
        this._set('armR', 'rotation', 'x', -0.4 + breath);
        this._set('armR', 'rotation', 'z', 0.2);
        this._set('forearmR', 'rotation', 'x', -1.2);

        if (this.joints.cape) {
            this._set('cape', 'rotation', 'x', 0.12 + Math.sin(t * 2.0) * 0.05);
        }
    }

    /**
     * LIGHT RUN
     * Fast low-profile dash with bow swept out to the side.
     */
    run(t) {
        const cycle = Math.sin(t * 14);
        const doubleCycle = Math.sin(t * 28);

        this._set('torso', 'rotation', 'x', 0.32);
        this._set('torso', 'rotation', 'y', cycle * 0.12);
        this._set('pelvis', 'position', 'y', Math.abs(cycle) * 0.08);

        // Agile leg strides
        this._set('thighL', 'rotation', 'x', cycle * 0.85);
        this._set('calfL', 'rotation', 'x', cycle > 0 ? cycle * 1.0 : 0.1);
        this._set('thighR', 'rotation', 'x', -cycle * 0.85);
        this._set('calfR', 'rotation', 'x', cycle < 0 ? -cycle * 1.0 : 0.1);

        // Bow held low to clear terrain
        this._set('armL', 'rotation', 'x', -0.3);
        this._set('armL', 'rotation', 'z', -0.5);
        this._set('armR', 'rotation', 'x', cycle * 0.5);

        if (this.joints.cape) {
            this._set('cape', 'rotation', 'x', 0.45 + doubleCycle * 0.15);
        }
    }

    /**
     * BOW SHOT ANIMATION
     * - Phase 1 (0-45%): Draw string back to ear, elbow flares out, body leans into tension.
     * - Phase 2 (45-60%): String releases, right hand snaps backward past ear, bow arm recoils.
     * - Phase 3 (60-100%): Follow-through and return to stance.
     */
    attack(t) {
        const duration = 0.55;
        const p = Math.min(t / duration, 1.0);

        if (p < 0.45) {
            // === 1. DRAW STRING BACK TO EAR (Tension) ===
            const ep = (p / 0.45) ** 2;

            // Torso turns back under heavy bow tension
            this._set('torso', 'rotation', 'y', THREE.MathUtils.lerp(-0.4, -0.65, ep));
            this._set('torso', 'rotation', 'x', -0.1 * ep);
            this._set('head', 'rotation', 'y', THREE.MathUtils.lerp(0.4, 0.65, ep)); // Head tracks target

            // Bow Arm (L): Locked straight forward at target
            this._set('armL', 'rotation', 'x', THREE.MathUtils.lerp(-1.2, -1.35, ep));
            this._set('armL', 'rotation', 'y', THREE.MathUtils.lerp(0.4, 0.65, ep));
            this._set('forearmL', 'rotation', 'x', -0.05);

            // Draw Arm (R): Pulls string back to cheek/ear, elbow flares back
            this._set('armR', 'rotation', 'x', THREE.MathUtils.lerp(-0.4, -0.7, ep));
            this._set('armR', 'rotation', 'y', -0.6 * ep);
            this._set('armR', 'rotation', 'z', THREE.MathUtils.lerp(0.2, 0.4, ep));
            this._set('forearmR', 'rotation', 'x', THREE.MathUtils.lerp(-1.2, -1.7, ep)); // Tight bend

        } else if (p < 0.60) {
            // === 2. RELEASE SNAP & RECOIL ===
            const ep = 1 - (1 - (p - 0.45) / 0.15) ** 3; // Fast snap

            // Torso snaps forward from release
            this._set('torso', 'rotation', 'y', THREE.MathUtils.lerp(-0.65, -0.25, ep));
            this._set('torso', 'rotation', 'x', THREE.MathUtils.lerp(-0.1, 0.15, ep));
            this._set('head', 'rotation', 'y', THREE.MathUtils.lerp(0.65, 0.25, ep));

            // Bow Arm (L) recoils from bow jump
            this._set('armL', 'rotation', 'x', THREE.MathUtils.lerp(-1.35, -1.0, ep));
            this._set('armL', 'rotation', 'y', THREE.MathUtils.lerp(0.65, 0.25, ep));

            // Draw Arm (R) hand flicks backward past cheek as string releases
            this._set('armR', 'rotation', 'x', THREE.MathUtils.lerp(-0.7, -0.2, ep));
            this._set('armR', 'rotation', 'y', THREE.MathUtils.lerp(-0.6, -1.1, ep));
            this._set('forearmR', 'rotation', 'x', THREE.MathUtils.lerp(-1.7, -0.4, ep));

        } else {
            // === 3. FOLLOW-THROUGH & RETURN TO IDLE ===
            const ep = ((p - 0.60) / 0.40) ** 2;

            this._set('torso', 'rotation', 'y', THREE.MathUtils.lerp(-0.25, -0.4, ep));
            this._set('torso', 'rotation', 'x', THREE.MathUtils.lerp(0.15, 0, ep));
            this._set('head', 'rotation', 'y', THREE.MathUtils.lerp(0.25, 0.4, ep));

            this._set('armL', 'rotation', 'x', THREE.MathUtils.lerp(-1.0, -1.2, ep));
            this._set('armL', 'rotation', 'y', THREE.MathUtils.lerp(0.25, 0.4, ep));

            this._set('armR', 'rotation', 'x', THREE.MathUtils.lerp(-0.2, -0.4, ep));
            this._set('armR', 'rotation', 'y', THREE.MathUtils.lerp(-1.1, 0, ep));
            this._set('armR', 'rotation', 'z', THREE.MathUtils.lerp(0.4, 0.2, ep));
            this._set('forearmR', 'rotation', 'x', THREE.MathUtils.lerp(-0.4, -1.2, ep));
        }

        if (p >= 1.0) this.play('idle');
    }

    /**
     * DEFEAT COLLAPSE
     */
    die(t) {
        const p = Math.min(t / 0.75, 1.0);
        const ep = p ** 2;

        this._set('torso', 'rotation', 'y', THREE.MathUtils.lerp(-0.4, -1.1, ep));
        this._set('torso', 'rotation', 'x', -0.6 * ep);
        this._set('pelvis', 'position', 'y', -0.38 * ep);
        this._set('pelvis', 'position', 'z', -0.3 * ep);

        this._set('armL', 'rotation', 'z', -0.8 * ep);
        this._set('armR', 'rotation', 'z', 0.8 * ep);
        this._set('head', 'rotation', 'x', 0.4 * ep);
    }
}