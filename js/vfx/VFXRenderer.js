// js/vfx/VFXRenderer.js
class VFXRenderer extends VFXCore {
    constructor(scene) {
        super(scene);
    }

    createImpact(position, type, options = {}) {
        switch (type) {
            case 'fireBoost': ValorVFX.fireBoostEffect(this, position, options); break;
            case 'holyStrike': ValorVFX.holyStrikeEffect(this, position, options); break;
            case 'frostSigil': FrostVFX.frostSigilEffect(this, position, options); break;
            case 'glacialNova': FrostVFX.glacialNovaEffect(this, position, options); break;
            case 'moonlightHeal': LunaVFX.moonlightHealEffect(this, position, options); break;
            case 'slash': this.slashEffect(position); break;
            case 'arrow': this.arrowImpact(position); break;
            default: break;
        }
    }

    createProjectile(from, to, type, color = 0xffdd44) {
        const group = new THREE.Group();

        switch (type) {
            case 'windArrow': WindVFX.makeWindArrow(group); break;
            case 'arrow': this.makeArrow(group, color); break;
            case 'iceShard': this.makeIceShard(group); break;
            case 'fireball': this.makeFireball(group); break;
            case 'magicBolt':
            default: this.makeMagicBolt(group, color); break;
        }

        group.position.copy(from);
        this.scene.add(group);

        const startPos = from.clone();
        const endPos = to.clone();
        const distance = startPos.distanceTo(endPos);
        const duration = Math.max(0.5, distance * 0.15); // SLOWER - was 0.2, 0.08

        // STRAIGHT LINE - no arc
        const getPosAt = (t) => {
            return new THREE.Vector3().lerpVectors(startPos, endPos, Math.min(t, 1));
        };

        this.addEffect({
            group, life: duration + 0.1, time: 0, hit: false,
            update: (dt) => {
                const eff = this.activeEffects[this.activeEffects.length - 1];
                eff.time += dt;
                const t = eff.time / duration;

                if (t <= 1.0) {
                    // Straight line movement
                    group.position.copy(getPosAt(t));

                    // Face direction of travel
                    const nextPos = getPosAt(Math.min(t + 0.02, 1));
                    group.lookAt(nextPos);

                    // Slow spin for style
                    group.children.forEach(c => {
                        if (c !== group.children[0]) c.rotation.z += dt * 2;
                    });
                }

                if (t >= 1.0 && !eff.hit) {
                    eff.hit = true;
                    group.visible = false;
                    this.createImpact(endPos, type, { color });
                    eff.life = 0;
                }
            },
            cleanup: () => {
                this.scene.remove(group);
                this.disposeObject(group);
            }
        });
    }
}