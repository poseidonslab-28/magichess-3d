// js/anim/ValorAnimator.js
class ValorAnimator extends HeroAnimator {

    idle(t) {
        const breath = Math.sin(t * 3.0);
        const shift = Math.sin(t * 1.2); // Slow weight shift between feet

        // Body breathing & subtle hip sway
        this._set('pelvis', 'position', 'y', -0.05 + breath * 0.012);
        this._set('pelvis', 'rotation', 'z', shift * 0.03);
        this._set('torso', 'rotation', 'x', 0.12 + breath * 0.02);
        this._set('torso', 'rotation', 'y', shift * 0.05);

        // Staggered combat stance
        this._set('thighL', 'rotation', 'x', -0.22 + shift * 0.03);
        this._set('calfL', 'rotation', 'x', 0.32);
        this._set('thighR', 'rotation', 'x', 0.18 - shift * 0.03);
        this._set('calfR', 'rotation', 'x', 0.28);

        // Guard Arms (Sword ready, Shield braced)
        this._set('armR', 'rotation', 'x', -0.65 + breath * 0.03);
        this._set('armR', 'rotation', 'z', 0.22);
        this._set('forearmR', 'rotation', 'x', -0.9 + breath * 0.04);

        this._set('armL', 'rotation', 'x', -0.45);
        this._set('armL', 'rotation', 'y', 0.2);
        this._set('forearmL', 'rotation', 'x', -0.6);

        // Head looking sharp, cape reacting to breath & wind
        this._set('head', 'rotation', 'x', -0.08 - breath * 0.02);
        this._set('head', 'rotation', 'y', -shift * 0.05);
        this._set('cape', 'rotation', 'x', 0.18 + Math.sin(t * 2.2) * 0.08);
        this._set('cape', 'rotation', 'z', Math.cos(t * 1.5) * 0.05);
    }

    run(t) {
        const speed = 13;
        const cycle = Math.sin(t * speed);
        const doubleCycle = Math.sin(t * speed * 2);

        // Heavy running bounce (dip on step, rise on push-off)
        this._set('pelvis', 'position', 'y', Math.abs(cycle) * 0.14 - 0.04);
        this._set('torso', 'rotation', 'x', 0.32 + Math.abs(cycle) * 0.05);
        this._set('torso', 'rotation', 'y', cycle * 0.22);
        this._set('torso', 'rotation', 'z', -cycle * 0.06);

        // High-stride leg mechanics with knee flexion
        this._set('thighL', 'rotation', 'x', cycle * 0.95);
        this._set('calfL', 'rotation', 'x', cycle > 0 ? cycle * 1.3 : 0.15);

        this._set('thighR', 'rotation', 'x', -cycle * 0.95);
        this._set('calfR', 'rotation', 'x', cycle < 0 ? -cycle * 1.3 : 0.15);

        // Sword arm counter-pumping back with blade trailing
        this._set('armR', 'rotation', 'x', -0.8 + cycle * 0.35);
        this._set('armR', 'rotation', 'z', 0.2);
        this._set('forearmR', 'rotation', 'x', -0.7 + doubleCycle * 0.15);

        // Shield arm aggressive forward drive
        this._set('armL', 'rotation', 'x', -cycle * 0.75);
        this._set('forearmL', 'rotation', 'x', -0.8);

        // Head stabilization & violent cape flutter
        this._set('head', 'rotation', 'x', -0.15);
        this._set('head', 'rotation', 'y', -cycle * 0.1);
        this._set('cape', 'rotation', 'x', 0.65 + doubleCycle * 0.22);
    }

    attack(t) {
        const p = Math.min(t / 0.55, 1);

        if (p < 0.3) {
            // WIND-UP: Pull sword back
            const ep = (p / 0.3) ** 2;
            this._set('torso', 'rotation', 'y', -0.8 * ep);
            this._set('armR', 'rotation', 'x', -2.0 * ep);
            this._set('armR', 'rotation', 'z', 0.6 * ep);
            this._set('forearmR', 'rotation', 'x', -1.0 * ep);
            this._set('pelvis', 'position', 'z', -0.15 * ep);
        } else if (p < 0.5) {
            // SLASH: Explosive forward swing
            const ep = 1 - (1 - (p - 0.3) / 0.2) ** 3;
            this._set('torso', 'rotation', 'y', THREE.MathUtils.lerp(-0.8, 0.6, ep));
            this._set('armR', 'rotation', 'x', THREE.MathUtils.lerp(-2.0, 0.8, ep));
            this._set('armR', 'rotation', 'y', THREE.MathUtils.lerp(0, -0.6, ep));
            this._set('pelvis', 'position', 'z', THREE.MathUtils.lerp(-0.15, 0.2, ep));
            this._set('cape', 'rotation', 'x', 0.5 * ep);
        } else {
            // RECOVER
            const ep = ((p - 0.5) / 0.5) ** 2;
            this._set('torso', 'rotation', 'y', THREE.MathUtils.lerp(0.6, 0, ep));
            this._set('armR', 'rotation', 'x', THREE.MathUtils.lerp(0.8, -0.6, ep));
            this._set('armR', 'rotation', 'y', THREE.MathUtils.lerp(-0.6, 0, ep));
            this._set('pelvis', 'position', 'z', THREE.MathUtils.lerp(0.2, 0, ep));
        }

        if (p >= 1) this.play('idle');
    }

    skill(t) {
        const p = Math.min(t / 0.85, 1); // 0.85s Heavy Ground Shatter Slam

        if (p < 0.38) {
            // === 1. HIGH JUMP & TWO-HANDED RAISE (Massive Wind-up) ===
            const ep = (p / 0.38) ** 2;

            this._set('pelvis', 'position', 'y', 0.35 * ep); // Leaps into air
            this._set('pelvis', 'position', 'z', -0.15 * ep);
            this._set('torso', 'rotation', 'x', -0.45 * ep); // Arches back

            // Legs tuck in air
            this._set('thighL', 'rotation', 'x', -0.5 * ep);
            this._set('calfL', 'rotation', 'x', 0.9 * ep);
            this._set('thighR', 'rotation', 'x', -0.3 * ep);
            this._set('calfR', 'rotation', 'x', 0.7 * ep);

            // Raising blade high overhead
            this._set('armR', 'rotation', 'x', -3.0 * ep);
            this._set('armR', 'rotation', 'z', 0.4 * ep);
            this._set('forearmR', 'rotation', 'x', -1.2 * ep);

            // Shield raised high beside head
            this._set('armL', 'rotation', 'x', -2.2 * ep);
            this._set('armL', 'rotation', 'z', -0.5 * ep);

            this._set('head', 'rotation', 'x', 0.3 * ep); // Look up at blade
            this._set('cape', 'rotation', 'x', -0.3 * ep);

        } else if (p < 0.58) {
            // === 2. VIOLENT GROUND SLAM & STOMP ===
            const ep = 1 - Math.pow(1 - (p - 0.38) / 0.2, 4); // Quartic Snap

            // Deep impact squat on the ground
            this._set('pelvis', 'position', 'y', THREE.MathUtils.lerp(0.35, -0.32, ep));
            this._set('pelvis', 'position', 'z', THREE.MathUtils.lerp(-0.15, 0.5, ep));
            this._set('torso', 'rotation', 'x', THREE.MathUtils.lerp(-0.45, 0.65, ep));

            // Wide heavy impact leg flex
            this._set('thighL', 'rotation', 'x', THREE.MathUtils.lerp(-0.5, -0.8, ep));
            this._set('calfL', 'rotation', 'x', THREE.MathUtils.lerp(0.9, 1.2, ep));
            this._set('thighR', 'rotation', 'x', THREE.MathUtils.lerp(-0.3, 0.4, ep));
            this._set('calfR', 'rotation', 'x', THREE.MathUtils.lerp(0.7, 0.9, ep));

            // Sword slams straight into ground in front
            this._set('armR', 'rotation', 'x', THREE.MathUtils.lerp(-3.0, 1.2, ep));
            this._set('armR', 'rotation', 'z', THREE.MathUtils.lerp(0.4, 0, ep));
            this._set('forearmR', 'rotation', 'x', THREE.MathUtils.lerp(-1.2, -0.1, ep));

            // Shield braced back behind
            this._set('armL', 'rotation', 'x', THREE.MathUtils.lerp(-2.2, 0.5, ep));

            this._set('head', 'rotation', 'x', -0.4 * ep); // Head tucks on impact
            this._set('cape', 'rotation', 'x', 1.2 * ep); // Cape flies forward

        } else if (p < 0.68) {
            // === 3. IMPACT TREMOR / HOLD (Micro-shake at peak contact) ===
            const shake = Math.sin((p - 0.58) * 120) * 0.03;

            this._set('pelvis', 'position', 'y', -0.32 + shake);
            this._set('torso', 'rotation', 'x', 0.65 + shake);
            this._set('armR', 'rotation', 'x', 1.2 + shake);

        } else {
            // === 4. RECOVERY (Stand up from deep squat) ===
            const ep = ((p - 0.68) / 0.17) ** 2;

            this._set('pelvis', 'position', 'y', THREE.MathUtils.lerp(-0.32, 0, ep));
            this._set('pelvis', 'position', 'z', THREE.MathUtils.lerp(0.5, 0, ep));
            this._set('torso', 'rotation', 'x', THREE.MathUtils.lerp(0.65, 0, ep));

            this._set('thighL', 'rotation', 'x', THREE.MathUtils.lerp(-0.8, -0.22, ep));
            this._set('calfL', 'rotation', 'x', THREE.MathUtils.lerp(1.2, 0.32, ep));

            this._set('armR', 'rotation', 'x', THREE.MathUtils.lerp(1.2, -0.65, ep));
            this._set('forearmR', 'rotation', 'x', THREE.MathUtils.lerp(-0.1, -0.9, ep));
            this._set('armL', 'rotation', 'x', THREE.MathUtils.lerp(0.5, -0.45, ep));
        }

        if (p >= 1) this.play('idle');
    }

    die(t) {
        const p = Math.min(t / 0.9, 1);

        if (p < 0.25) {
            // === 1. CHEST IMPACT RECOIL ===
            const ep = 1 - (1 - p / 0.25) ** 2;

            this._set('torso', 'rotation', 'x', -0.65 * ep);
            this._set('head', 'rotation', 'x', -0.6 * ep);
            this._set('pelvis', 'position', 'z', -0.3 * ep);

            // Arms drop open wide in shock
            this._set('armL', 'rotation', 'z', -1.1 * ep);
            this._set('armR', 'rotation', 'z', 1.1 * ep);
            this._set('forearmR', 'rotation', 'x', -0.2);

        } else {
            // === 2. KNEES BUCKLE & GROUND COLLAPSE ===
            const ep = ((p - 0.25) / 0.75) ** 2;

            this._set('torso', 'rotation', 'x', THREE.MathUtils.lerp(-0.65, 0.3, ep));
            this._set('head', 'rotation', 'x', THREE.MathUtils.lerp(-0.6, 0.5, ep));

            // Pelvis drops and tilts sideways/forward onto knees
            this._set('pelvis', 'position', 'y', THREE.MathUtils.lerp(0, -0.44, ep));
            this._set('pelvis', 'position', 'z', THREE.MathUtils.lerp(-0.3, 0.2, ep));
            this._set('pelvis', 'rotation', 'x', THREE.MathUtils.lerp(0, 1.2, ep));

            // Knees bend completely under body
            this._set('thighL', 'rotation', 'x', THREE.MathUtils.lerp(-0.22, -1.2, ep));
            this._set('calfL', 'rotation', 'x', THREE.MathUtils.lerp(0.32, 1.5, ep));
            this._set('thighR', 'rotation', 'x', THREE.MathUtils.lerp(0.18, -1.1, ep));
            this._set('calfR', 'rotation', 'x', THREE.MathUtils.lerp(0.28, 1.4, ep));

            // Limp arms on ground
            this._set('armL', 'rotation', 'x', THREE.MathUtils.lerp(0, 0.8, ep));
            this._set('armR', 'rotation', 'x', THREE.MathUtils.lerp(0, 0.8, ep));
            this._set('cape', 'rotation', 'x', THREE.MathUtils.lerp(0.18, 0, ep));
        }
    }
}