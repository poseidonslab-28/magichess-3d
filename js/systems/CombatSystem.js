// js/systems/CombatSystem.js
class CombatSystem {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.timer = 0;
        this.maxTime = 30000;
        this.teamA = [];
        this.teamB = [];
        this.vfx = null; // Set by Game.js
        this.tileSize = 1.3; // Grid tile spacing
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
            h.bx = 0;
            h.by = 0;
            // col and row are already set from board placement
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
            // 1. Handle Dead Units
            if (!h.alive) {
                if (!h._dying) {
                    h._dying = true;
                    this.playAnim(h, 'die');
                }
                continue;
            }

            // 2. Crowd Control / Stun
            if (h.stunTimer > 0) {
                h.stunTimer -= delta;
                continue;
            }

            // 3. Busy State Lock (Attacking or Casting Skill)
            if (h.state === 'attacking' || h.state === 'casting') {
                continue;
            }

            // 4. Handle Tile Interpolation (Moving between tiles)
            if (h.state === 'moving') {
                const step = (delta / 1000) * 2.5; // Walk speed: 2.5 tiles per sec
                h.moveProgress += step;

                const startWorld = this.tileToWorld(h.startTile.col, h.startTile.row);
                const endWorld = this.tileToWorld(h.targetTile.col, h.targetTile.row);

                if (h.mesh) {
                    h.mesh.position.lerpVectors(startWorld, endWorld, Math.min(h.moveProgress, 1));
                }

                // Reached destination tile
                if (h.moveProgress >= 1) {
                    h.col = h.targetTile.col;
                    h.row = h.targetTile.row;
                    this.snapToTile(h, h.col, h.row);
                    h.state = 'idle';
                    this.playAnim(h, 'idle');
                }
                continue;
            }

            // 5. Find Target
            const target = this.findTarget(h);
            if (!target) continue;

            const gridDist = this.getGridDistance(h, target);
            const inRange = gridDist <= h.range;

            // Face Target Tile
            this.faceTarget(h, target);

            // 6. Cast Skill if Mana Full
            if (h.mana >= h.maxMana) {
                // Check if any enemy is within skill range (range + 2 for most skills)
                const skillRange = h.range + 2;
                const enemiesInRange = this.getEnemiesInRange(h, skillRange);

                if (enemiesInRange.length > 0) {
                    h.mana = 0;
                    this.castSkill(h, target);
                }
                // If no enemy in range, keep mana full until enemy gets closer
            }

            // 7. In Range -> Attack Target
            if (inRange) {
                h.atkTimer += delta;
                const attackCooldown = 1000 / h.spd;

                if (h.atkTimer >= attackCooldown) {
                    h.atkTimer = 0;
                    this.performAttack(h, target);
                }
            }
            // 8. Out of Range -> Step to Next Tile
            else {
                this.stepToward(h, target);
            }
        }

        // Check Win/Loss
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
        const skill = attacker.data.skill || {};
        const vfxConfig = skill.vfx?.attack || {};
        const impactDelay = isRanged ? 250 : 150;
        const totalAnimDuration = 550;

        console.log(`${attacker.data.name} attacking! VFX:`, !!this.vfx, 'Config:', vfxConfig); // DEBUG

        setTimeout(() => {
            if (!attacker.alive || !defender.alive) return;

            const dmg = defender.takeDmg(attacker.atk);
            attacker.mana = Math.min(attacker.mana + 15, attacker.maxMana);

            console.log(`Damage: ${dmg}, Creating VFX at defender pos`); // DEBUG

        if (this.vfx) {
            const to = this.getPos(defender).clone();
            to.y += 1.5; // Higher above model
            
            // Create BIG slash
            this.vfx.createImpact(to, 'slash', { color: 0xffffff, scale: 3.0 });
            
            // Damage number way above
            const textPos = to.clone();
            textPos.y += 1.5;
            this.vfx.createFloatingText(textPos, dmg, 'damage');
        }
        }, impactDelay);

        setTimeout(() => {
            if (attacker.state === 'attacking') {
                attacker.state = 'idle';
                this.playAnim(attacker, 'idle');
            }
        }, totalAnimDuration);
    }

    castSkill(hero, target) {
        hero.state = 'casting';
        this.playAnim(hero, 'skill');

        const skill = hero.data.skill;
        if (!skill) return;

        const impactDelay = 300;
        const totalAnimDuration = 800;

        setTimeout(() => {
            if (!hero.alive) return;

            const heroPos = this.getPos(hero).clone();
            const enemies = (this.teamA.includes(hero) ? this.teamB : this.teamA).filter(e => e.alive);
            const allies = (this.teamA.includes(hero) ? this.teamA : this.teamB).filter(a => a.alive);

            // Route to correct executor
            switch (skill.type) {
                case 'aoe':
                    this.executeAOESkill(hero, enemies, heroPos, skill);
                    break;
                case 'projectile':
                    this.executeProjectileSkill(hero, enemies, heroPos, skill);
                    break;
                case 'heal':
                    this.executeHealSkill(hero, allies, heroPos, skill);
                    break;
                case 'self':
                    this.executeSelfBuff(hero, skill);
                    break;
                case 'execute':
                    this.executeExecuteSkill(hero, enemies, heroPos, skill);
                    break;
                case 'chain':
                    this.executeChainSkill(hero, enemies, heroPos, skill);
                    break;
                case 'single':
                default:
                    this.executeSingleTargetSkill(hero, target, heroPos, skill);
                    break;
            }
        }, impactDelay);

        setTimeout(() => {
            if (hero.state === 'casting') {
                hero.state = 'idle';
                this.playAnim(hero, 'idle');
            }
        }, totalAnimDuration);
    }

    executeSelfBuff(hero, skill) {
        if (skill.effect === 'shield') {
            hero.hp = Math.min(hero.hp + (skill.value || 300), hero.maxHp * 1.5);
        }
        if (skill.effect === 'reflect') {
            hero._reflectDmg = skill.value || 30;
        }

        if (this.vfx && skill.vfx) {
            const hPos = this.getPos(hero).clone();
            hPos.y += 0.8;
            this.vfx.createImpact(hPos, 'heal', skill.vfx.color || 0xffaa44);
            this.vfx.createFloatingText(hPos, skill.value || 300, 'heal');
        }
    }

    executeExecuteSkill(hero, enemies, heroPos, skill) {
        // Find lowest HP enemy
        const target = enemies.sort((a, b) => a.hp - b.hp)[0];
        if (!target) return;

        const multiplier = target.hp / target.maxHp < 0.3 ? (skill.multiplier || 4) : (skill.multiplier || 2.5);
        const dmg = target.takeDmg(hero.atk * multiplier);

        if (this.vfx && skill.vfx) {
            const tPos = this.getPos(target).clone();
            tPos.y += 0.8;
            this.vfx.createImpact(tPos, 'slash', { color: 0xff0000 });
            this.vfx.createFloatingText(tPos, dmg, 'crit');
        }
    }

    executeChainSkill(hero, enemies, heroPos, skill) {
        const chainCount = skill.chains || 3;
        const targets = enemies.slice(0, chainCount);

        targets.forEach((e, i) => {
            if (!e.alive) return;
            const dmg = e.takeDmg(hero.atk * (skill.multiplier || 2) * (1 - i * 0.15));

            if (this.vfx && skill.vfx) {
                const to = this.getPos(e).clone();
                to.y += 0.8;
                setTimeout(() => {
                    if (e.alive) {
                        this.vfx.createImpact(to, 'magicBolt', { color: 0xffdd44 });
                        this.vfx.createFloatingText(to, dmg, 'damage');
                    }
                }, i * 100);
            }
        });
    }

    // ============ SKILL EXECUTORS ============

    // In executeSingleTargetSkill, add fallback:
    executeSingleTargetSkill(hero, target, heroPos, skill) {
        if (!target || !target.alive) return;

        const dmg = target.takeDmg(hero.atk * (skill.multiplier || 1.8));
        this.applyEffect(target, skill.effect, skill.stunDuration);

        if (this.vfx) {
            const tPos = this.getPos(target).clone();
            tPos.y += 0.8;
            // Use skill.vfx if available, otherwise defaults
            const impact = skill.vfx?.impact || 'slash';
            const color = skill.vfx?.color || 0xffdd44;
            this.vfx.createImpact(tPos, impact, { color });
            this.vfx.createFloatingText(tPos, dmg, 'damage');
        }
    }

    executeAOESkill(hero, enemies, heroPos, skill) {
        const radius = skill.aoeRadius || 2.5;

        // Camera shake
        if (this.game?.cameraShake) this.game.cameraShake(0.6, 400);

        // Center VFX
        if (this.vfx && skill.vfx) {
            this.vfx.createImpact(heroPos, skill.vfx.impact || 'fireExplosion', skill.vfx.color);
        }

        // Hit enemies in range
        const targets = enemies.filter(e => this.getGridDistance(hero, e) <= radius);
        targets.forEach((e, i) => {
            setTimeout(() => {
                if (!e.alive) return;
                const dmg = e.takeDmg(hero.atk * (skill.multiplier || 2.0));
                this.applyEffect(e, skill.effect, skill.stunDuration);

                if (this.vfx) {
                    const ePos = this.getPos(e).clone();
                    ePos.y += 0.8;
                    this.vfx.createFloatingText(ePos, dmg, 'crit');
                }
            }, i * 60);
        });
    }

    executeProjectileSkill(hero, enemies, heroPos, skill) {
        const targets = skill.targetsAll ? enemies : enemies.slice(0, 1);

        targets.forEach((e, i) => {
            if (!e.alive) return;
            const dmg = e.takeDmg(hero.atk * (skill.multiplier || 1.5));
            this.applyEffect(e, skill.effect, skill.stunDuration);

            if (this.vfx && skill.vfx) {
                const from = heroPos.clone();
                from.y += 1.2;
                const to = this.getPos(e).clone();
                to.y += 0.8;

                this.vfx.createProjectile(from, to, skill.vfx.projectile || 'magicBolt', skill.vfx.color);

                setTimeout(() => {
                    if (e.alive && this.vfx) {
                        this.vfx.createFloatingText(to, dmg, 'damage');
                    }
                }, 200);
            }
        });
    }

    executeHealSkill(hero, allies, heroPos, skill) {
        allies.forEach((a, i) => {
            if (!a.alive) return;
            const healAmt = skill.healAmount || 200;
            a.heal(healAmt);

            if (this.vfx && skill.vfx) {
                const aPos = this.getPos(a).clone();
                aPos.y += 0.8;
                this.vfx.createImpact(aPos, skill.vfx.impact || 'heal', skill.vfx.color);
                this.vfx.createFloatingText(aPos, healAmt, 'heal');
            }
        });
    }

    // ============ EFFECT APPLIER ============

    applyEffect(target, effect, duration = 1500) {
        switch (effect) {
            case 'freeze':
            case 'stun':
                target.stunTimer = duration;
                break;
            case 'burn':
                // Could add burn damage over time
                break;
            case 'bleed':
                // Could add bleed damage over time
                break;
        }
    }

    // --- GRID MOVEMENT & TILE PATHING ---

    stepToward(hero, target) {
        const dx = Math.sign(target.col - hero.col);
        const dz = Math.sign(target.row - hero.row);

        let nextCol = hero.col + dx;
        let nextRow = hero.row + dz;

        if (Math.abs(target.col - hero.col) > Math.abs(target.row - hero.row)) {
            nextRow = hero.row;
        } else {
            nextCol = hero.col;
        }

        // Try primary direction
        if (this.isTileOccupied(nextCol, nextRow, hero)) {
            // Try alternate
            if (nextCol !== hero.col && !this.isTileOccupied(hero.col, nextRow, hero)) {
                nextCol = hero.col;
            } else if (nextRow !== hero.row && !this.isTileOccupied(nextCol, hero.row, hero)) {
                nextRow = hero.row;
            } else {
                return; // Blocked
            }
        }

        // Keep on correct side
        const isPlayer = this.teamA.includes(hero);
        if (isPlayer && nextRow < 4) nextRow = hero.row;
        if (!isPlayer && nextRow > 3) nextRow = hero.row;
        if (nextCol < 0 || nextCol > 7) nextCol = hero.col;
        if (nextRow < 0 || nextRow > 7) nextRow = hero.row;

        hero.startTile = { col: hero.col, row: hero.row };
        hero.targetTile = { col: nextCol, row: nextRow };
        hero.moveProgress = 0;
        hero.state = 'moving';

        this.playAnim(hero, 'run');
    }

    isTileOccupied(col, row, excludeHero = null) {
        return [...this.teamA, ...this.teamB].some(u => {
            if (u === excludeHero) return false;
            if (!u.alive) return false;
            if (u.col === col && u.row === row) return true;
            if (u.state === 'moving' && u.targetTile.col === col && u.targetTile.row === row) return true;
            return false;
        });
    }

    getGridDistance(unitA, unitB) {
        const dCol = Math.abs(unitA.col - unitB.col);
        const dRow = Math.abs(unitA.row - unitB.row);
        return Math.max(dCol, dRow);
    }

    tileToWorld(col, row) {
        const ts = this.tileSize;
        return new THREE.Vector3(
            (col - 3.5) * ts,
            0.08,
            (row - 3.5) * ts
        );
    }

    snapToTile(hero, col, row) {
        hero.col = col;
        hero.row = row;
        if (hero.mesh) {
            const pos = this.tileToWorld(col, row);
            hero.mesh.position.x = pos.x;
            hero.mesh.position.z = pos.z;
        }
    }

    faceTarget(hero, target) {
        if (!hero.mesh) return;
        const hPos = this.getPos(hero);
        const tPos = target.mesh ? this.getPos(target) : this.tileToWorld(target.col, target.row);

        const dx = tPos.x - hPos.x;
        const dz = tPos.z - hPos.z;
        if (Math.hypot(dx, dz) > 0.001) {
            hero.mesh.rotation.y = Math.atan2(dx, dz);
        }
    }

    playAnim(hero, animName) {
        if (hero.mesh && hero.mesh.userData.animator) {
            hero.mesh.userData.animator.play(animName);
        }
    }

    findTarget(h) {
        const enemies = (this.teamA.includes(h) ? this.teamB : this.teamA).filter(e => e.alive);
        let best = null, bestDist = Infinity;

        for (const e of enemies) {
            const d = this.getGridDistance(h, e);
            if (d < bestDist) {
                bestDist = d;
                best = e;
            }
        }
        return best;
    }

    getPos(h) {
        if (h.mesh) return h.mesh.position.clone();
        return this.tileToWorld(h.col, h.row);
    }

    getEnemiesInRange(hero, range) {
        const enemies = this.teamA.includes(hero) ? this.teamB : this.teamA;
        return enemies.filter(e => {
            if (!e.alive) return false;
            return this.getGridDistance(hero, e) <= range;
        });
    }
}