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
            case 'windArrow': WindVFX.windArrowEffect(this, position, options); break;
            case 'moonlightHeal': LunaVFX.moonlightHealEffect(this, position, options); break;
            case 'slash': this.slashEffect(position); break;
            case 'arrow': this.arrowImpact(position); break;
            default: break;
        }
    }
}