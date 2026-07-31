// js/ui/HealthBar3D.js
class HealthBar3D {
    // Shared geometries across all health bars to minimize GPU memory footprint
    static bgGeo = null;
    static hpBarGeo = null;
    static manaBarGeo = null;
    static borderGeo = null;

    // Temporary math objects to prevent garbage collection frame hitches
    static _tempQuatParent = new THREE.Quaternion();
    static _tempQuatCam = new THREE.Quaternion();
    static _tempVecPos = new THREE.Vector3();

    static _initGeometries() {
        if (this.bgGeo) return;

        const bgWidth = 0.85;
        const bgHeight = 0.16;
        const barWidth = 0.80;

        // Background panel geometry (centered)
        this.bgGeo = new THREE.PlaneGeometry(bgWidth, bgHeight);

        // Health bar geometry shifted so x = 0 is at the left edge
        this.hpBarGeo = new THREE.PlaneGeometry(barWidth, 0.055);
        this.hpBarGeo.translate(barWidth / 2, 0, 0);

        // Mana bar geometry shifted so x = 0 is at the left edge
        this.manaBarGeo = new THREE.PlaneGeometry(barWidth, 0.03);
        this.manaBarGeo.translate(barWidth / 2, 0, 0);

        // Border outline
        this.borderGeo = new THREE.EdgesGeometry(this.bgGeo);
    }

    static create() {
        this._initGeometries();

        const group = new THREE.Group();
        group.renderOrder = 9999;

        // Background panel
        const bgMat = new THREE.MeshBasicMaterial({
            color: 0x050508,
            transparent: true,
            opacity: 0.85,
            depthTest: false,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        const bg = new THREE.Mesh(this.bgGeo, bgMat);
        bg.renderOrder = 9999;
        group.add(bg);

        // Vibrant Health Bar (transparent: true enables renderOrder layering)
        const hpBarMat = new THREE.MeshBasicMaterial({
            color: 0x00e676,
            transparent: true,
            opacity: 1.0,
            depthTest: false,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        const hpBar = new THREE.Mesh(this.hpBarGeo, hpBarMat);
        hpBar.position.set(-0.40, 0.028, 0.001);
        hpBar.renderOrder = 10000;
        group.add(hpBar);

        // Vibrant Mana Bar (transparent: true enables renderOrder layering)
        const manaBarMat = new THREE.MeshBasicMaterial({
            color: 0x00e5ff,
            transparent: true,
            opacity: 1.0,
            depthTest: false,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        const manaBar = new THREE.Mesh(this.manaBarGeo, manaBarMat);
        manaBar.position.set(-0.40, -0.035, 0.001);
        manaBar.renderOrder = 10000;
        group.add(manaBar);

        // High-visibility frame border
        const borderMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            depthTest: false,
            depthWrite: false
        });
        const border = new THREE.LineSegments(this.borderGeo, borderMat);
        border.position.z = 0.002;
        border.renderOrder = 10001;
        group.add(border);

        group.userData = {
            hpBar,
            manaBar,
            bg,
            border,
            billboard: true
        };

        return group;
    }

    static update(group, hp, maxHp, mana, maxMana, camera) {
        if (!group || !group.userData) return;

        const data = group.userData;
        if (!data.hpBar || !data.manaBar) return;

        // Ensure valid numerical bounds
        const safeHp = Math.max(0, hp ?? 0);
        const safeMaxHp = Math.max(1, maxHp ?? 1);
        const safeMana = Math.max(0, mana ?? 0);
        const safeMaxMana = Math.max(1, maxMana ?? 1);

        const hpPct = Math.max(0, Math.min(1, safeHp / safeMaxHp));
        const manaPct = Math.max(0, Math.min(1, safeMana / safeMaxMana));

        // Hide health bar completely if unit is dead
        if (hpPct <= 0) {
            group.visible = false;
            return;
        }
        group.visible = true;

        // Native left-pivot scaling
        data.hpBar.scale.x = hpPct;

        // Dynamic health color transitions
        if (hpPct > 0.5) {
            data.hpBar.material.color.setHex(0x00e676); // Emerald Green
        } else if (hpPct > 0.25) {
            data.hpBar.material.color.setHex(0xffb300); // Amber
        } else {
            data.hpBar.material.color.setHex(0xff1744); // Bright Red
        }

        // Mana bar scaling
        data.manaBar.scale.x = manaPct;

        // Mana full highlight
        if (manaPct >= 1) {
            data.manaBar.material.color.setHex(0xe040fb); // Neon Magenta when ready
        } else {
            data.manaBar.material.color.setHex(0x00e5ff); // Cyan
        }

        // --- FIXED BILLBOARD ANGLE LOGIC ---
        if (camera && data.billboard) {
            if (group.parent) {
                // Cancel out parent character rotation so UI stays flat toward the screen
                group.parent.getWorldQuaternion(this._tempQuatParent).invert();
                camera.getWorldQuaternion(this._tempQuatCam);
                group.quaternion.copy(this._tempQuatParent).multiply(this._tempQuatCam);
            } else {
                group.quaternion.copy(camera.quaternion);
            }

            // Distance scaling to keep UI legible at further camera angles
            group.getWorldPosition(this._tempVecPos);
            const dist = camera.position.distanceTo(this._tempVecPos);
            const baseScale = Math.max(0.8, dist * 0.1);
            group.scale.setScalar(baseScale);
        }
    }

    /**
     * Cleans up instance materials to prevent GPU memory leaks on unit removal.
     */
    static dispose(group) {
        if (!group) return;

        group.traverse((child) => {
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        if (group.parent) {
            group.parent.remove(group);
        }
    }
}