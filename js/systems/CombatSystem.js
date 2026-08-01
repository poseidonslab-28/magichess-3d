// js/systems/CombatSystem.js
class CombatSystem {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.timer = 0;
        this.maxTime = 30000;
        this.teamA = [];
        this.teamB = [];
        this.vfx = null;
        this.tileSize = 1.3;
    }

    start(players, enemies) {
        this.teamA = players.filter(h => h.alive);
        this.teamB = enemies.filter(h => h.alive);
        [...this.teamA, ...this.teamB].forEach(h => {
            h.hp = h.maxHp;
            h.mana = h.data.mana?.start || 0;
            h.alive = true;
            h.atkTimer = 0;
            h._dying = false;
            h.stunTimer = 0;
            h.state = 'idle';
            h.moveProgress = 0;
            h.bx = 0; h.by = 0;
            this.snapToTile(h, h.col, h.row);
            this.playAnim(h, 'idle');
        });
        this.active = true;
        this.timer = 0;
    }

    update(time, delta) {
        if (!this.active) return;
        this.timer += delta;
        for (const h of [...this.teamA, ...this.teamB]) {
            if (!h.alive) { if (!h._dying) { h._dying = true; this.playAnim(h, 'die'); } continue; }
            if (h.stunTimer > 0) { h.stunTimer -= delta; continue; }
            if (h.state === 'attacking' || h.state === 'casting') continue;
            if (h.state === 'moving') {
                h.moveProgress += (delta / 1000) * 2.5;
                const start = this.tileToWorld(h.startTile.col, h.startTile.row);
                const end = this.tileToWorld(h.targetTile.col, h.targetTile.row);
                if (h.mesh) h.mesh.position.lerpVectors(start, end, Math.min(h.moveProgress, 1));
                if (h.moveProgress >= 1) {
                    h.col = h.targetTile.col; h.row = h.targetTile.row;
                    this.snapToTile(h, h.col, h.row);
                    h.state = 'idle'; this.playAnim(h, 'idle');
                }
                continue;
            }
            const target = this.findTarget(h);
            if (!target) continue;
            const dist = this.getGridDistance(h, target);
            this.faceTarget(h, target);

            if (h.mana >= h.maxMana && this.getEnemiesInRange(h, h.range + 2).length > 0) {
                h.mana = 0; this.castSkill(h, target);
            }
            if (dist <= h.range) {
                h.atkTimer += delta;
                if (h.atkTimer >= 1000 / h.spd) { h.atkTimer = 0; this.performAttack(h, target); }
            } else {
                this.stepToward(h, target);
            }
        }
        const aAlive = this.teamA.some(h => h.alive);
        const bAlive = this.teamB.some(h => h.alive);
        if (!aAlive || !bAlive || this.timer >= this.maxTime) {
            this.active = false;
            if (aAlive && !bAlive) this.game.onWin();
            else if (!aAlive && bAlive) this.game.onLose();
            else this.game.onDraw();
        }
    }

    performAttack(attacker, defender) {
        attacker.state = 'attacking';
        this.playAnim(attacker, 'attack');
        const isRanged = attacker.range > 1;
        const dmg = defender.takeDmg(attacker.atk);
        attacker.mana = Math.min(attacker.mana + 15, attacker.maxMana);
        const vfxConfig = attacker.data.skill?.vfx?.attack || {};

        setTimeout(() => {
            if (!attacker.alive || !defender.alive) return;
            if (this.vfx) {
                const to = this.getPos(defender).clone(); to.y += 1.0;
                if (isRanged) {
                    const from = this.getPos(attacker).clone(); from.y += 1.2;
                    this.vfx.createProjectile(from, to, vfxConfig.projectile || 'iceShard', vfxConfig.color || 0x88ccff);
                } else {
                    this.vfx.createImpact(to, 'fireBoost', { scale: 0.8 });
                }
                const tp = to.clone(); tp.y += 2.0;
                this.vfx.createFloatingText(tp, dmg, 'damage');
            }
        }, isRanged ? 250 : 150);

        setTimeout(() => { if (attacker.state === 'attacking') { attacker.state = 'idle'; this.playAnim(attacker, 'idle'); } }, 550);
    }

    castSkill(hero, target) {
        hero.state = 'casting';
        this.playAnim(hero, 'skill');
        const skill = hero.data.skill;
        if (!skill) return;

        setTimeout(() => {
            if (!hero.alive) return;
            const heroPos = this.getPos(hero).clone();
            const enemies = (this.teamA.includes(hero) ? this.teamB : this.teamA).filter(e => e.alive);
            const allies = (this.teamA.includes(hero) ? this.teamA : this.teamB).filter(a => a.alive);

            switch (skill.type) {
                case 'aoe': this.executeAOESkill(hero, enemies, heroPos, skill); break;
                case 'heal': this.executeHealSkill(hero, allies, heroPos, skill); break;
                case 'self': this.executeSelfBuff(hero, skill); break;
                case 'single':
                default: this.executeSingleTargetSkill(hero, target, heroPos, skill); break;
            }
        }, 300);

        setTimeout(() => { if (hero.state === 'casting') { hero.state = 'idle'; this.playAnim(hero, 'idle'); } }, 800);
    }

    executeSingleTargetSkill(hero, target, heroPos, skill) {
        if (!target || !target.alive) return;

        // If skill has a projectile type, shoot it
        if (skill.vfx?.skill?.projectile && hero.range > 1) {
            const dmg = target.takeDmg(hero.atk * (skill.multiplier || 1.8));

            if (this.vfx) {
                const from = heroPos.clone(); from.y += 1.0;
                const to = this.getPos(target).clone(); to.y += 0.8;
                this.vfx.createProjectile(from, to, skill.vfx.skill.projectile, 0x88ff44);

                setTimeout(() => {
                    if (target.alive) {
                        const tp = to.clone(); tp.y += 2.0;
                        this.vfx.createFloatingText(tp, dmg, 'crit');
                    }
                }, 250);
            }
            return;
        }

        // Default single target
        const dmg = target.takeDmg(hero.atk * (skill.multiplier || 1.8));
        this.applyEffect(target, skill.effect, skill.stunDuration);

        if (this.vfx) {
            const tPos = this.getPos(target).clone(); tPos.y += 0.8;
            const vfxType = skill.vfx?.skill?.type || 'slash';
            this.vfx.createImpact(tPos, vfxType, { colors: skill.vfx?.skill?.colors, scale: skill.vfx?.skill?.scale || 1.5 });
            const tp = tPos.clone(); tp.y += 2.0;
            this.vfx.createFloatingText(tp, dmg, skill.vfx?.skill?.textType || 'crit');
        }
    }

    executeAOESkill(hero, enemies, heroPos, skill) {
        const radius = skill.aoeRadius || 2.5;
        if (this.vfx && skill.vfx?.skill) {
            this.vfx.createImpact(heroPos, skill.vfx.skill.type || 'glacialNova', { colors: skill.vfx.skill.colors, scale: skill.vfx.skill.scale || 2.5 });
        }
        enemies.filter(e => this.getGridDistance(hero, e) <= radius).forEach((e, i) => {
            setTimeout(() => {
                if (!e.alive) return;
                const dmg = e.takeDmg(hero.atk * (skill.multiplier || 2.0));
                this.applyEffect(e, skill.effect, skill.stunDuration);
                if (this.vfx) { const ep = this.getPos(e).clone(); ep.y += 0.8; this.vfx.createFloatingText(ep, dmg, 'crit'); }
            }, i * 60);
        });
    }

    executeHealSkill(hero, allies, heroPos, skill) {
        // Find ally with lowest HP percentage
        const target = allies
            .filter(a => a.alive)
            .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];

        if (!target) return;

        const healAmt = skill.healAmount || 250;
        target.heal(healAmt);

        if (this.vfx) {
            const tPos = this.getPos(target).clone();
            tPos.y += 0.8;

            const vfxType = skill.vfx?.skill?.type || 'moonlightHeal';
            this.vfx.createImpact(tPos, vfxType, {
                colors: skill.vfx?.skill?.colors,
                scale: skill.vfx?.skill?.scale || 1.2
            });

            const tp = tPos.clone();
            tp.y += 2.0;
            this.vfx.createFloatingText(tp, healAmt, 'heal');
        }
    }

    executeSelfBuff(hero, skill) {
        if (skill.effect === 'shield') hero.hp = Math.min(hero.hp + (skill.value || 300), hero.maxHp * 1.5);
    }

    applyEffect(target, effect, duration = 1500) {
        if (effect === 'freeze' || effect === 'stun') target.stunTimer = duration;
    }

    stepToward(hero, target) {
        const dx = Math.sign(target.col - hero.col), dz = Math.sign(target.row - hero.row);
        let nc = hero.col + dx, nr = hero.row + dz;
        if (Math.abs(target.col - hero.col) > Math.abs(target.row - hero.row)) nr = hero.row; else nc = hero.col;
        if (this.isTileOccupied(nc, nr, hero)) {
            if (nc !== hero.col && !this.isTileOccupied(hero.col, nr, hero)) nc = hero.col;
            else if (nr !== hero.row && !this.isTileOccupied(nc, hero.row, hero)) nr = hero.row;
            else return;
        }
        const isPlayer = this.teamA.includes(hero);
        if (isPlayer && nr < 0) nr = hero.row;     // Can't go off the top edge
        if (!isPlayer && nr > 7) nr = hero.row;
        if (nc < 0 || nc > 7) nc = hero.col;
        if (nr < 0 || nr > 7) nr = hero.row;
        hero.startTile = { col: hero.col, row: hero.row };
        hero.targetTile = { col: nc, row: nr };
        hero.moveProgress = 0; hero.state = 'moving';
        this.playAnim(hero, 'run');
    }

    isTileOccupied(col, row, exclude = null) {
        return [...this.teamA, ...this.teamB].some(u => u !== exclude && u.alive && (u.col === col && u.row === row || (u.state === 'moving' && u.targetTile.col === col && u.targetTile.row === row)));
    }

    getGridDistance(a, b) { return Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row)); }

    tileToWorld(col, row) { const ts = this.tileSize; return new THREE.Vector3((col - 3.5) * ts, 0.08, (row - 3.5) * ts); }

    snapToTile(hero, col, row) { hero.col = col; hero.row = row; if (hero.mesh) { const p = this.tileToWorld(col, row); hero.mesh.position.x = p.x; hero.mesh.position.z = p.z; } }

    faceTarget(hero, target) {
        if (!hero.mesh) return;
        const hp = this.getPos(hero), tp = target.mesh ? this.getPos(target) : this.tileToWorld(target.col, target.row);
        const dx = tp.x - hp.x, dz = tp.z - hp.z;
        if (Math.hypot(dx, dz) > 0.001) hero.mesh.rotation.y = Math.atan2(dx, dz);
    }

    playAnim(hero, name) { if (hero.mesh?.userData?.animator) hero.mesh.userData.animator.play(name); }

    findTarget(h) {
        const enemies = (this.teamA.includes(h) ? this.teamB : this.teamA).filter(e => e.alive);
        let best = null, bd = Infinity;
        for (const e of enemies) { const d = this.getGridDistance(h, e); if (d < bd) { bd = d; best = e; } }
        return best;
    }

    getPos(h) { return h.mesh ? h.mesh.position.clone() : this.tileToWorld(h.col, h.row); }

    getEnemiesInRange(hero, range) {
        return (this.teamA.includes(hero) ? this.teamB : this.teamA).filter(e => e.alive && this.getGridDistance(hero, e) <= range);
    }
}