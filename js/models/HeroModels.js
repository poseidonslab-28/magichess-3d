// js/models/HeroModels.js
class HeroModels {
    static create(hero) {
        const models = {
            'k1': ValorModel,
            'm1': FrostModel,
            'a1': WindModel,
            't1': IronModel,
            's1': LunaModel,    // ADD THIS
            'as1': ShadeModel,
            'w1': FangModel,
        };
        
        const Model = models[hero.data.id];
        if (Model) return Model.create(hero);
        
        // Fallback
        return HeroFactory.createBasicMesh(hero);
    }
}