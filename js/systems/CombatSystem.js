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
        const impactDelay = isRanged ? 250 : 200;
        const totalAnimDuration = 600;

        setTimeout(() => {
            if (!attacker.alive || !defender.alive) return;

            const dmg = defender.takeDmg(attacker.atk);
            attacker.mana = Math.min(attacker.mana + 15, attacker.maxMana);

            if (this.vfx) {
                const from = this.getPos(attacker).clone();
                from.y += 1.2;
                const to = this.getPos(defender).clone();
                to.y += 0.8;

                if (isRanged) {
                    this.vfx.createProjectile(from, to, 'magicBolt', 0xff44ff);
                    setTimeout(() => {
                        if (defender.alive && this.vfx) {
                            this.vfx.createFloatingText(to, dmg, 'damage');
                        }
                    }, 150);
                } else {
                    this.vfx.createImpact(to, 'slash');
                    this.vfx.createFloatingText(to, dmg, 'damage');
                }
            }
        }, impactDelay);

        setTimeout(() => {
            if (attacker.state === 'attacking') {
                attacker.state = 'idle';
                this.playAnim(attacker, 'idle');
            }
        }, totalAnimDuration);
    }

    // ================================================================
    // CAST SKILL - Handles AOE, Melee, and Ranged projectile skills
    // ================================================================
    castSkill(hero, target) {
        hero.state = 'casting';
        this.playAnim(hero, 'skill');

        const skill = hero.data.skill;
        const isMelee = hero.range <= 1;
        const isAoe = skill?.aoeRadius && skill.aoeRadius > 0;
        const impactDelay = isMelee ? 400 : 250;
        const totalAnimDuration = 800;

        setTimeout(() => {
            if (!hero.alive) return;

            const heroPos = this.getPos(hero).clone();
            const enemies = (this.teamA.includes(hero) ? this.teamB : this.teamA).filter(e => e.alive);

            // ==========================================
            // CASE 1: AOE SKILL (Frost's Glacial Nova, etc.)
            // ==========================================
            if (isAoe) {
                const radius = skill.aoeRadius || 2.5;

                // Camera shake
                if (this.game?.cameraShake) {
                    this.game.cameraShake(0.8, 450);
                }

                // VFX explosion at epicenter
                if (this.vfx) {
                    const effectType = skill.effect === 'freeze' ? 'frostNova' : 'fireExplosion';
                    const effectColor = skill.effect === 'freeze' ? 0x88ddff : 0xff4400;
                    this.vfx.createImpact(heroPos, effectType, { scale: radius * 1.5, color: effectColor, duration: 600 });
                    this.vfx.createImpact(heroPos, 'flash', { scale: 1.5, duration: 150 });

                    // Ice-based AOE: extra spikes and shards
                    if (skill.effect === 'freeze') {
                        // Ice spikes cascading outward
                        for (let i = 0; i < 12; i++) {
                            const angle = (i / 12) * Math.PI * 2;
                            const dist = 0.8 + Math.random() * radius * 0.9;
                            const spikePos = heroPos.clone();
                            spikePos.x += Math.cos(angle) * dist;
                            spikePos.z += Math.sin(angle) * dist;
                            spikePos.y += 0.1;

                            setTimeout(() => {
                                if (this.vfx && hero.alive) {
                                    this.vfx.createImpact(spikePos, 'iceSpike', {
                                        scale: 0.4 + Math.random() * 0.6,
                                        color: 0xaaddff,
                                        duration: 400
                                    });
                                }
                            }, 50 + i * 30);
                        }

                        // Falling ice shards (post-blast)
                        for (let i = 0; i < 20; i++) {
                            const angle = Math.random() * Math.PI * 2;
                            const dist = 0.5 + Math.random() * radius * 1.2;
                            const shardPos = heroPos.clone();
                            shardPos.x += Math.cos(angle) * dist;
                            shardPos.z += Math.sin(angle) * dist;
                            shardPos.y += 0.5 + Math.random() * 1.5;

                            setTimeout(() => {
                                if (this.vfx && hero.alive) {
                                    this.vfx.createImpact(shardPos, 'iceShard', {
                                        scale: 0.2 + Math.random() * 0.3,
                                        color: 0xccffff,
                                        duration: 300
                                    });
                                }
                            }, 300 + i * 40);
                        }
                    }
                }

                // Damage application (staggered)
                const targets = enemies.filter(e => this.getGridDistance(hero, e) <= radius);
                targets.forEach((e, index) => {
                    setTimeout(() => {
                        if (!e.alive) return;
                        const dmg = e.takeDmg(hero.atk * (skill.multiplier || 2.0));

                        if (skill.effect === 'freeze' || skill.effect === 'stun') {
                            e.stunTimer = skill.stunDuration || 1500;
                            if (this.vfx) {
                                const ePos = this.getPos(e).clone();
                                ePos.y += 0.5;
                                this.vfx.createImpact(ePos, 'freezePrison', { scale: 0.8, color: 0x88ddff, duration: 1200 });
                            }
                        }

                        if (this.vfx) {
                            const ePos = this.getPos(e).clone();
                            ePos.y += 0.8;
                            this.vfx.createImpact(ePos, 'iceBurst', { scale: 0.8, color: 0xffffff, duration: 200 });
                            this.vfx.createFloatingText(ePos, dmg, 'crit');
                        }
                    }, 150 + index * 50);
                });
            }

            // ==========================================
            // CASE 2: MELEE SKILL (Single target)
            // ==========================================
            else if (isMelee) {
                if (target && target.alive) {
                    const dmg = target.takeDmg(hero.atk * (skill.multiplier || 1.8));
                    
                    if (skill.effect === 'stun' || skill.effect === 'freeze') {
                        target.stunTimer = 1500;
                    }

                    if (this.vfx) {
                        const tPos = this.getPos(target).clone();
                        tPos.y += 0.8;
                        this.vfx.createImpact(tPos, 'slash');
                        this.vfx.createFloatingText(tPos, dmg, 'damage');
                    }
                }
            }

            // ==========================================
            // CASE 3: RANGED PROJECTILE SKILL (default)
            // ==========================================
            else {
                enemies.forEach(e => {
                    const dmg = e.takeDmg(hero.atk * (skill.multiplier || 1.5));
                    if (skill.effect === 'freeze') e.stunTimer = 1500;

                    if (this.vfx) {
                        const from = heroPos.clone();
                        from.y += 1.2;
                        const to = this.getPos(e).clone();
                        to.y += 0.8;

                        let proj = 'magicBolt';
                        if (skill.effect === 'burn') proj = 'fireball';
                        if (skill.effect === 'freeze') proj = 'iceShard';

                        this.vfx.createProjectile(from, to, proj, 0xffaa00);

                        setTimeout(() => {
                            if (e.alive && this.vfx) {
                                this.vfx.createFloatingText(to, dmg, 'crit');
                            }
                        }, 200);
                    }
                });
            }
        }, impactDelay);

        // Unlock unit state after skill animation completes
        setTimeout(() => {
            if (hero.state === 'casting') {
                hero.state = 'idle';
                this.playAnim(hero, 'idle');
            }
        }, totalAnimDuration);
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