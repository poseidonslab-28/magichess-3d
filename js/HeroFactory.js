// js/HeroFactory.js
class HeroFactory {
    
    static createMesh(hero, isEnemy = false) {
        const group = new THREE.Group();
        
        // Shadow
        const shadowGeo = new THREE.CircleGeometry(0.3, 16);
        const shadowMat = new THREE.MeshBasicMaterial({ 
            color: 0x000000, transparent: true, opacity: 0.4, depthWrite: false 
        });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.02;
        group.add(shadow);
        
        // Use the unique model for this hero
        const heroModel = HeroModels.create(hero);
        group.add(heroModel);
        
        // === ATTACH ANIMATOR ===
        if (heroModel.userData && heroModel.userData.joints) {
            const animator = new HeroAnimator(heroModel.userData.joints);
            group.userData.animator = animator;
            animator.play('idle');
            
            // Store update function
            group.userData.updateAnimation = (dt) => {
                animator.update(dt || 0.016);
            };
        }
        
        // Health bar reference
        heroModel.traverse(child => {
            if (child.userData && child.userData.healthBar) {
                group.userData.healthBar = child.userData.healthBar;
            }
        });
        
        // Face the right direction
        if (!isEnemy) {
            group.rotation.y = Math.PI;
        }
        
        group.userData.hero = hero;

        const animatorClasses = {
            'k1': ValorAnimator, 'k2': ValorAnimator, 'k3': ValorAnimator, 'k4': ValorAnimator,
            'm1': FrostAnimator, 'm2': FrostAnimator, 'm3': FrostAnimator, 'm4': FrostAnimator,
            'a1': WindAnimator, 'a2': WindAnimator, 'a3': WindAnimator,
            't1': ValorAnimator, 't2': ValorAnimator, 't3': ValorAnimator,
            'as1': ValorAnimator, 'as2': ValorAnimator, 'as3': ValorAnimator,
            's1': FrostAnimator, 's2': FrostAnimator,
            'w1': ValorAnimator, 'w2': ValorAnimator, 'w3': ValorAnimator,
            'd1': ValorAnimator, 'v1': FrostAnimator,
        };

        const AnimClass = animatorClasses[hero.data.id] || HeroAnimator;
        if (heroModel.userData && heroModel.userData.joints) {
            const animator = new AnimClass(heroModel.userData.joints);
            group.userData.animator = animator;
            animator.play('idle');
            group.userData.updateAnimation = (dt) => animator.update(dt || 0.016);
        }

        const healthBar = HealthBar3D.create();
        healthBar.position.y = 1.2; // Above hero's head
        group.add(healthBar);
        group.userData.healthBar3D = healthBar;

        return group;
    }
    
    static createBasicMesh(hero) {
        const group = new THREE.Group();
        const color = parseInt(hero.data.color.replace('#', '0x'));
        
        group.add(new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.25, 0.7, 8),
            new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 })
        ));
        group.add(new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xFFD5B8, roughness: 0.5 })
        ));
        
        group.userData.hero = hero;
        return group;
    }
}