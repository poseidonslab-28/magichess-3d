// js/systems/SkillRenderer.js
class SkillRenderer {
    constructor(scene) {
        this.scene = scene;
    }

    playSkill(hero, enemies, allies) {
        const skill = hero.data.skill;
        if (!skill) return;
        
        // Charging particles around hero (subtle, hero stays normal size)
        const chargeColor = { fire: 0xff4400, ice: 0x88ccff, bleed: 0xff0000, lightning: 0xffdd00, heal: 0x44ff44, shield: 0xffaa44, pierce: 0xffff00 }[skill.effect] || 0xffffff;
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particle = this.scene.add.circle(
                hero.bx + Math.cos(angle) * 18,
                hero.by + Math.sin(angle) * 18,
                3, chargeColor, 0.8
            );
            particle.setDepth(200);
            this.scene.tweens.add({
                targets: particle,
                x: hero.bx + Math.cos(angle) * 40,
                y: hero.by + Math.sin(angle) * 40,
                alpha: 0, scale: 0.3,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
        
        // Skill name
        const nameTxt = this.scene.add.text(hero.bx, hero.by - 45, skill.name.toUpperCase(), {
            fontSize: '18px', color: '#FFD700', fontStyle: 'bold', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(300);
        this.scene.tweens.add({ 
            targets: nameTxt, y: nameTxt.y - 50, alpha: 0, scale: 1.8, 
            duration: 1500, ease: 'Power2', onComplete: () => nameTxt.destroy() 
        });
        
        // Route to animation
        switch(skill.effect) {
            case 'burn': this.fireFromAbove(enemies, hero, skill); break;
            case 'freeze': case 'slow': this.blizzardStrike(enemies, hero, skill); break;
            case 'bleed': this.bloodExecution(enemies, hero, skill); break;
            case 'pierce': this.holyLance(enemies, hero, skill); break;
            case 'heal': this.divineHealing(allies, hero, skill); break;
            case 'shield': this.energyShield(hero, skill); break;
            case 'lifesteal': this.soulDrain(enemies, hero, skill); break;
            case 'chain': this.thunderStorm(enemies, hero, skill); break;
            case 'execute': this.reaperStrike(enemies, hero, skill); break;
            case 'mark': this.huntersMark(enemies, hero, skill); break;
            case 'teleport': this.voidRift(enemies, hero, skill); break;
            case 'reflect': this.mirrorShield(hero, skill); break;
            default: this.arcaneBlast(enemies, hero, skill); break;
        }
        
        this.scene.cameras.main.shake(250, 0.008);
    }

    // ============ FIRE FROM ABOVE ============
    fireFromAbove(enemies, hero, skill) {
        enemies.filter(e => e.alive).forEach((e, i) => {
            setTimeout(() => {
                // Multiple fireballs raining down
                for (let j = 0; j < 3; j++) {
                    setTimeout(() => {
                        const startX = e.bx + (Math.random() - 0.5) * 60;
                        const fireball = this.scene.add.circle(startX, e.by - 100, 6 + j*2, 0xff4400, 0.9);
                        fireball.setStrokeStyle(2, 0xffaa00);
                        fireball.setDepth(300);
                        
                        // Glow
                        const glow = this.scene.add.circle(startX, e.by - 100, 12, 0xff6600, 0.3);
                        glow.setDepth(299);
                        
                        // Fall with trail
                        this.scene.tweens.add({
                            targets: [fireball, glow],
                            y: e.by + 5,
                            duration: 350 + j*50,
                            ease: 'Bounce.easeOut',
                            onComplete: () => {
                                // Impact explosion
                                for (let k = 0; k < 8; k++) {
                                    const spark = this.scene.add.circle(e.bx, e.by, 3, 0xff6600, 0.9);
                                    spark.setDepth(250);
                                    this.scene.tweens.add({
                                        targets: spark,
                                        x: e.bx + (Math.random()-0.5)*60,
                                        y: e.by + (Math.random()-0.5)*40 - 10,
                                        alpha: 0, scale: 2.5,
                                        duration: 400 + Math.random()*200,
                                        onComplete: () => spark.destroy()
                                    });
                                }
                                fireball.destroy();
                                glow.destroy();
                            }
                        });
                    }, j * 120);
                }
                
                const dmg = e.takeDmg(hero.atk * (skill.multiplier || 1.8));
                setTimeout(() => this.showBigDmg(e, dmg, '#ff4400'), 400);
            }, i * 150);
        });
    }

    // ============ BLIZZARD STRIKE ============
    blizzardStrike(enemies, hero, skill) {
        enemies.filter(e => e.alive).forEach((e, i) => {
            setTimeout(() => {
                // Ice storm from above
                for (let j = 0; j < 6; j++) {
                    setTimeout(() => {
                        const startX = e.bx + (Math.random() - 0.5) * 50;
                        const shard = this.scene.add.rectangle(startX, e.by - 80, 3, 10 + Math.random()*8, 0xaaddff, 0.9);
                        shard.setDepth(300);
                        shard.setAngle(Math.random() * 360);
                        
                        this.scene.tweens.add({
                            targets: shard,
                            y: e.by + 5,
                            angle: shard.angle + 180,
                            duration: 300,
                            ease: 'Power1',
                            onComplete: () => {
                                // Shatter on impact
                                for (let k = 0; k < 4; k++) {
                                    const fragment = this.scene.add.rectangle(e.bx, e.by, 2, 5, 0xaaddff, 0.7);
                                    fragment.setDepth(250);
                                    fragment.setAngle(Math.random() * 360);
                                    this.scene.tweens.add({
                                        targets: fragment,
                                        x: e.bx + (Math.random()-0.5)*40,
                                        y: e.by + (Math.random()-0.5)*30,
                                        alpha: 0, duration: 400,
                                        onComplete: () => fragment.destroy()
                                    });
                                }
                                shard.destroy();
                            }
                        });
                    }, j * 80);
                }
                
                // Freeze effect on target
                if (e.container) {
                    this.scene.tweens.add({ targets: e.container, alpha: 0.2, duration: 300, yoyo: true, repeat: 2 });
                }
                
                const dmg = e.takeDmg(hero.atk * (skill.multiplier || 1.5));
                setTimeout(() => this.showBigDmg(e, dmg, '#88ccff'), 400);
            }, i * 100);
        });
    }

    // ============ BLOOD EXECUTION ============
    bloodExecution(enemies, hero, skill) {
        const target = enemies.find(e => e.alive);
        if (!target) return;
        
        // Hero dashes to target
        const startX = hero.bx, startY = hero.by;
        if (hero.container) {
            this.scene.tweens.add({
                targets: hero.container,
                x: target.bx, y: target.by,
                duration: 100,
                onComplete: () => {
                    // Rapid slashes
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            const slash = this.scene.add.rectangle(target.bx, target.by, 4, 35, 0xff0000, 0.9);
                            slash.setDepth(250);
                            slash.setAngle(i * 60);
                            this.scene.tweens.add({ targets: slash, scaleX: 5, alpha: 0, duration: 250, onComplete: () => slash.destroy() });
                        }, i * 60);
                    }
                    
                    // Blood fountain
                    for (let i = 0; i < 15; i++) {
                        const blood = this.scene.add.circle(target.bx, target.by, 3, 0xcc0000, 0.8);
                        blood.setDepth(200);
                        this.scene.tweens.add({
                            targets: blood,
                            x: target.bx + (Math.random()-0.5)*70,
                            y: target.by - 20 - Math.random()*40,
                            alpha: 0, scale: 0.5,
                            duration: 600 + Math.random()*300,
                            onComplete: () => blood.destroy()
                        });
                    }
                    
                    // Return
                    this.scene.tweens.add({ targets: hero.container, x: startX, y: startY, duration: 200 });
                }
            });
        }
        
        const dmg = target.takeDmg(hero.atk * (skill.multiplier || 2.5));
        setTimeout(() => this.showBigDmg(target, dmg, '#ff0000'), 300);
    }

    // ============ HOLY LANCE ============
    holyLance(enemies, hero, skill) {
        const target = enemies.find(e => e.alive);
        if (!target) return;
        
        // Giant spear from above
        const spear = this.scene.add.rectangle(target.bx, target.by - 100, 4, 60, 0xffff00, 0.9);
        spear.setDepth(300);
        spear.setStrokeStyle(2, 0xffffff);
        
        this.scene.tweens.add({
            targets: spear,
            y: target.by,
            duration: 250,
            ease: 'Power3',
            onComplete: () => {
                // Impact shockwave
                for (let i = 0; i < 3; i++) {
                    const wave = this.scene.add.circle(target.bx, target.by, 5, 0xffff00, 0);
                    wave.setStrokeStyle(2, 0xffff00);
                    wave.setDepth(250);
                    this.scene.tweens.add({ targets: wave, radius: 25 + i*15, alpha: 0.5, duration: 300, onComplete: () => wave.destroy() });
                }
                spear.destroy();
            }
        });
        
        const dmg = target.takeDmg(hero.atk * (skill.multiplier || 2.5));
        setTimeout(() => this.showBigDmg(target, dmg, '#ffff00'), 300);
    }

    // ============ DIVINE HEALING ============
    divineHealing(allies, hero, skill) {
        // Light beam from above on each ally
        allies.filter(a => a.alive).forEach((a, i) => {
            setTimeout(() => {
                const heal = skill.value || 250;
                a.heal(heal);
                
                // Light pillar
                const beam = this.scene.add.rectangle(a.bx, a.by - 40, 20, 50, 0x44ff44, 0.2);
                beam.setDepth(149);
                this.scene.tweens.add({ targets: beam, alpha: 0, y: a.by, duration: 800, onComplete: () => beam.destroy() });
                
                // Sparkles rising
                for (let j = 0; j < 10; j++) {
                    const sparkle = this.scene.add.circle(a.bx + (Math.random()-0.5)*30, a.by, 2, 0x88ff88, 0.8);
                    sparkle.setDepth(200);
                    this.scene.tweens.add({
                        targets: sparkle,
                        y: sparkle.y - 30 - Math.random()*20,
                        x: sparkle.x + (Math.random()-0.5)*20,
                        alpha: 0, duration: 800,
                        onComplete: () => sparkle.destroy()
                    });
                }
                
                this.showBigDmg(a, heal, '#44ff44', '+');
            }, i * 200);
        });
    }

    // ============ ENERGY SHIELD ============
    energyShield(hero, skill) {
        const value = skill.value || 300;
        hero.hp = Math.min(hero.hp + value, hero.maxHp * 1.5);
        
        // Hexagonal shield layers
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const layer = this.scene.add.circle(hero.bx, hero.by, 15, 0xffaa44, 0);
                layer.setStrokeStyle(3, 0xffaa44);
                layer.setDepth(150);
                this.scene.tweens.add({ 
                    targets: layer, radius: 35 + i*5, alpha: 0.5,
                    duration: 400, yoyo: true,
                    onComplete: () => layer.destroy() 
                });
            }, i * 200);
        }
        
        this.showBigDmg(hero, value, '#ffaa44', '+');
    }

    // ============ SOUL DRAIN ============
    soulDrain(enemies, hero, skill) {
        const target = enemies.find(e => e.alive);
        if (!target) return;
        
        // Green beam connecting hero to target
        const beam = this.scene.add.rectangle((hero.bx+target.bx)/2, (hero.by+target.by)/2, 4, Math.hypot(target.bx-hero.bx, target.by-hero.by), 0x44ff44, 0.5);
        beam.setDepth(150);
        const angle = Math.atan2(target.by-hero.by, target.bx-hero.bx);
        beam.setAngle(angle * 180/Math.PI);
        
        // Particles flowing from target to hero
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const orb = this.scene.add.circle(target.bx, target.by, 3, 0x44ff44, 0.7);
                orb.setDepth(200);
                this.scene.tweens.add({
                    targets: orb,
                    x: hero.bx, y: hero.by,
                    alpha: 0, duration: 500,
                    onComplete: () => orb.destroy()
                });
            }, i * 80);
        }
        
        this.scene.tweens.add({ targets: beam, alpha: 0, duration: 800, onComplete: () => beam.destroy() });
        
        const dmg = target.takeDmg(hero.atk * (skill.multiplier || 2));
        const heal = Math.round(dmg * 0.5);
        hero.heal(heal);
        
        setTimeout(() => {
            this.showBigDmg(target, dmg, '#ff4444');
            this.showBigDmg(hero, heal, '#44ff44', '+');
        }, 300);
    }

    // ============ THUNDER STORM ============
    thunderStorm(enemies, hero, skill) {
        const targets = enemies.filter(e => e.alive).slice(0, skill.chains || 3);
        
        targets.forEach((e, i) => {
            setTimeout(() => {
                // Lightning strike from above
                for (let j = 0; j < 4; j++) {
                    const boltX = e.bx + (j - 1.5) * 8;
                    const bolt = this.scene.add.rectangle(boltX, e.by - 60, 2, 40, 0xffdd00, 0.9);
                    bolt.setDepth(300);
                    this.scene.tweens.add({
                        targets: bolt,
                        y: e.by, alpha: 0,
                        duration: 150 + j*30,
                        onComplete: () => bolt.destroy()
                    });
                }
                
                // Flash target white
                if (e.container) {
                    this.scene.tweens.add({ targets: e.container, alpha: 0.1, duration: 50, yoyo: true, repeat: 3 });
                }
                
                const dmg = e.takeDmg(hero.atk * (skill.multiplier || 2) * (1 - i * 0.15));
                this.showBigDmg(e, dmg, '#ffdd00');
            }, i * 120);
        });
    }

    // ============ REAPER STRIKE ============
    reaperStrike(enemies, hero, skill) {
        const target = enemies.filter(e => e.alive).sort((a, b) => a.hp - b.hp)[0];
        if (!target) return;
        
        // Giant scythe appears
        const scythe = this.scene.add.text(target.bx, target.by - 50, '🗡️', { fontSize: '40px' }).setOrigin(0.5).setDepth(300);
        this.scene.tweens.add({
            targets: scythe,
            y: target.by + 10,
            angle: 45,
            scale: 1.5,
            alpha: 0,
            duration: 500,
            ease: 'Power3',
            onComplete: () => scythe.destroy()
        });
        
        const multiplier = target.hp / target.maxHp < 0.3 ? 4 : 2.5;
        const dmg = target.takeDmg(hero.atk * multiplier);
        setTimeout(() => this.showBigDmg(target, dmg, '#ff0000'), 300);
    }

    // ============ HUNTER'S MARK ============
    huntersMark(enemies, hero, skill) {
        const target = enemies.find(e => e.alive);
        if (!target) return;
        
        // Crosshair appears
        const crosshair = this.scene.add.text(target.bx, target.by - 30, '🎯', { fontSize: '30px' }).setOrigin(0.5).setDepth(300);
        this.scene.tweens.add({ targets: crosshair, scale: 1.5, alpha: 0, duration: 800, onComplete: () => crosshair.destroy() });
        
        const dmg = target.takeDmg(hero.atk * (skill.multiplier || 2.5));
        this.showBigDmg(target, dmg, '#ff4444');
    }

    // ============ VOID RIFT ============
    voidRift(enemies, hero, skill) {
        // Purple portal at hero
        const portal = this.scene.add.circle(hero.bx, hero.by, 10, 0x8844ff, 0.5);
        portal.setDepth(150);
        this.scene.tweens.add({ targets: portal, radius: 30, alpha: 0, duration: 400, onComplete: () => portal.destroy() });
        
        enemies.filter(e => e.alive).forEach((e, i) => {
            setTimeout(() => {
                const dmg = e.takeDmg(hero.atk * (skill.multiplier || 2));
                
                // Void explosion on target
                const voidBurst = this.scene.add.circle(e.bx, e.by, 5, 0x8844ff, 0.8);
                voidBurst.setDepth(250);
                this.scene.tweens.add({ targets: voidBurst, radius: 30, alpha: 0, duration: 400, onComplete: () => voidBurst.destroy() });
                
                this.showBigDmg(e, dmg, '#8844ff');
            }, i * 100);
        });
    }

    // ============ MIRROR SHIELD ============
    mirrorShield(hero, skill) {
        // Spinning mirrors around hero
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const mirror = this.scene.add.rectangle(
                hero.bx + Math.cos(angle)*25,
                hero.by + Math.sin(angle)*25,
                3, 12, 0xaaddff, 0.6
            );
            mirror.setDepth(150);
            mirror.setAngle(angle * 180/Math.PI);
            this.scene.tweens.add({ targets: mirror, alpha: 0, duration: 1000, onComplete: () => mirror.destroy() });
        }
        
        const value = skill.value || 30;
        this.showBigDmg(hero, value, '#aaddff', 'Reflect ');
    }

    // ============ ARCANE BLAST (DEFAULT) ============
    arcaneBlast(enemies, hero, skill) {
        enemies.filter(e => e.alive).forEach((e, i) => {
            setTimeout(() => {
                // Arcane missiles
                for (let j = 0; j < 5; j++) {
                    const missile = this.scene.add.circle(hero.bx, hero.by, 3, 0xaa44ff, 0.8);
                    missile.setDepth(250);
                    this.scene.tweens.add({
                        targets: missile,
                        x: e.bx + (Math.random()-0.5)*20,
                        y: e.by + (Math.random()-0.5)*20,
                        alpha: 0, duration: 300,
                        onComplete: () => missile.destroy()
                    });
                }
                
                const dmg = e.takeDmg(hero.atk * (skill.multiplier || 1.5));
                this.showBigDmg(e, dmg, '#aa44ff');
            }, i * 80);
        });
    }

    // ============ BIG DAMAGE NUMBER ============
    showBigDmg(target, amount, color, prefix = '-') {
        const txt = this.scene.add.text(target.bx, target.by - 25, `${prefix}${amount}`, {
            fontSize: amount > 100 ? '22px' : '16px',
            color: color, fontStyle: 'bold',
            stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(300);
        this.scene.tweens.add({ 
            targets: txt, y: txt.y - 50, alpha: 0, scale: 1.5,
            duration: 900, ease: 'Power2',
            onComplete: () => txt.destroy() 
        });
    }
}