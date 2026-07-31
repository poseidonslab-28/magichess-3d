// js/anim/HeroAnimator.js
class HeroAnimator {
    constructor(joints) {
        this.joints = joints;
        this.restPose = {};

        for (const [name, joint] of Object.entries(joints)) {
            if (!joint) continue;
            this.restPose[name] = {
                rotation: joint.rotation.clone(),
                position: joint.position.clone()
            };
        }

        this.currentState = 'idle';
        this.time = 0;
        this.transitionTime = 0;
        this.transitionDuration = 0.12;
        this.previousPose = {};
    }

    _set(jointName, prop, axis, val) {
        if (this.joints[jointName]) {
            this.joints[jointName][prop][axis] += val;
        }
    }

    play(state, forceReset = false) {
        if (this.currentState === state && !forceReset) return;

        // Capture current pose for cross-fading
        this.previousPose = {};
        for (const [name, joint] of Object.entries(this.joints)) {
            if (!joint) continue;
            this.previousPose[name] = {
                rotation: joint.rotation.clone(),
                position: joint.position.clone()
            };
        }

        this.currentState = state;
        this.time = 0;
        this.transitionTime = 0;
    }

    update(dt) {
        this.time += dt;
        this.transitionTime += dt;

        // Reset joints to base rest pose first
        for (const [name, joint] of Object.entries(this.joints)) {
            if (!joint || !this.restPose[name]) continue;
            joint.rotation.copy(this.restPose[name].rotation);
            joint.position.copy(this.restPose[name].position);
        }

        // Execute subclass procedural state logic
        this.animate(this.currentState, this.time);

        // Cross-fade blend from previous state (Rotation AND Position)
        if (this.transitionTime < this.transitionDuration) {
            const alpha = this.transitionTime / this.transitionDuration;
            for (const [name, joint] of Object.entries(this.joints)) {
                if (joint && this.previousPose[name]) {
                    // Interpolate Rotations
                    joint.rotation.x = THREE.MathUtils.lerp(this.previousPose[name].rotation.x, joint.rotation.x, alpha);
                    joint.rotation.y = THREE.MathUtils.lerp(this.previousPose[name].rotation.y, joint.rotation.y, alpha);
                    joint.rotation.z = THREE.MathUtils.lerp(this.previousPose[name].rotation.z, joint.rotation.z, alpha);

                    // Interpolate Positions (Fixes hip/pelvis snapping)
                    joint.position.x = THREE.MathUtils.lerp(this.previousPose[name].position.x, joint.position.x, alpha);
                    joint.position.y = THREE.MathUtils.lerp(this.previousPose[name].position.y, joint.position.y, alpha);
                    joint.position.z = THREE.MathUtils.lerp(this.previousPose[name].position.z, joint.position.z, alpha);
                }
            }
        }
    }

    // Override in subclass
    animate(state, t) {
        switch(state) {
            case 'idle': this.idle(t); break;
            case 'run': this.run(t); break;
            case 'attack': this.attack(t); break;
            case 'skill': this.skill(t); break; // NEW
            case 'die': this.die(t); break;
        }
    }

    idle(t) {}
    run(t) {}
    attack(t) { if (this.time > 0.6) this.play('idle'); }
    die(t) {}
    skill(t) {
        this.attack(t); // Fallback to attack
    }
}