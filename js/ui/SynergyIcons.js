// js/ui/SynergyIcons.js
class SynergyIcons {
    static renderIcon(canvas, synergyId, size = 48) {
        const ctx = canvas.getContext('2d');
        canvas.width = size;
        canvas.height = size;
        ctx.clearRect(0, 0, size, size);

        const icons = {
            // CLASSES
            knight: SynergyIcons.drawKnight,
            mage: SynergyIcons.drawMage,
            archer: SynergyIcons.drawArcher,
            tank: SynergyIcons.drawTank,
            assassin: SynergyIcons.drawAssassin,
            support: SynergyIcons.drawSupport,
            warrior: SynergyIcons.drawWarrior,
            // ORIGINS
            human: SynergyIcons.drawHuman,
            elf: SynergyIcons.drawElf,
            demon: SynergyIcons.drawDemon,
            dragon: SynergyIcons.drawDragon,
            undead: SynergyIcons.drawUndead,
            beast: SynergyIcons.drawBeast,
            celestial: SynergyIcons.drawCelestial,
            void: SynergyIcons.drawVoid,
        };

        const drawer = icons[synergyId];
        if (drawer) {
            drawer(ctx, size);
        } else {
            // Fallback Badge
            SynergyIcons.drawBaseCircle(ctx, size, '#3a2e10', '#120f05', '#d4af37');
            ctx.fillStyle = '#FFD700';
            ctx.font = `600 ${size * 0.45}px system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((synergyId || '?').charAt(0).toUpperCase(), size / 2, size / 2);
        }
    }

    // ============ SHARED BADGE FRAME ============

    static drawBaseCircle(ctx, s, bgInner, bgOuter, borderColor, glowColor = null) {
        const cx = s / 2, cy = s / 2;
        const r = s * 0.44;

        ctx.save();

        // Optional Outer Glow
        if (glowColor) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = s * 0.15;
        }

        // Base Circle
        const bgGrad = ctx.createRadialGradient(cx, cy - r * 0.3, r * 0.1, cx, cy, r);
        bgGrad.addColorStop(0, bgInner);
        bgGrad.addColorStop(1, bgOuter);

        ctx.fillStyle = bgGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Metallic/Glow Border Ring
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = Math.max(1.5, s * 0.04);
        ctx.stroke();

        // Inner Bevel Ring
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = Math.max(1, s * 0.02);
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    // ============ CLASS ICONS ============

    static drawKnight(ctx, s) {
        const cx = s / 2, cy = s / 2, r = s * 0.38;
        SynergyIcons.drawBaseCircle(ctx, s, '#2b4c7e', '#0f1c30', '#7bb0ff', 'rgba(123, 176, 255, 0.4)');

        ctx.save();
        // Cross Swords
        ctx.strokeStyle = '#d8e5f8';
        ctx.lineWidth = s * 0.04;
        for (let angle of [-Math.PI / 4, Math.PI / 4]) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, -r * 0.7);
            ctx.lineTo(0, r * 0.7);
            ctx.stroke();
            // Guard
            ctx.strokeStyle = '#f0c040';
            ctx.beginPath();
            ctx.moveTo(-r * 0.25, -r * 0.3);
            ctx.lineTo(r * 0.25, -r * 0.3);
            ctx.stroke();
            ctx.restore();
        }

        // Knight Shield Emblem
        ctx.fillStyle = '#1c3150';
        ctx.strokeStyle = '#f0c040';
        ctx.lineWidth = s * 0.03;
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 0.5);
        ctx.lineTo(cx + r * 0.4, cy - r * 0.3);
        ctx.lineTo(cx + r * 0.35, cy + r * 0.2);
        ctx.quadraticCurveTo(cx, cy + r * 0.65, cx - r * 0.35, cy + r * 0.2);
        ctx.lineTo(cx - r * 0.4, cy - r * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shield Center Chevron
        ctx.fillStyle = '#f0c040';
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 0.2);
        ctx.lineTo(cx + r * 0.15, cy);
        ctx.lineTo(cx, cy + r * 0.25);
        ctx.lineTo(cx - r * 0.15, cy);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    static drawMage(ctx, s) {
        const cx = s / 2, cy = s / 2, r = s * 0.38;
        SynergyIcons.drawBaseCircle(ctx, s, '#4a157d', '#17052c', '#c16eff', 'rgba(193, 110, 255, 0.5)');

        ctx.save();
        // Arcane Orbit Rings
        ctx.strokeStyle = 'rgba(193, 110, 255, 0.4)';
        ctx.lineWidth = s * 0.025;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 0.8, r * 0.3, Math.PI / 4, 0, Math.PI * 2);
        ctx.ellipse(cx, cy, r * 0.8, r * 0.3, -Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();

        // Floating Gem Crystal
        const gemGrad = ctx.createLinearGradient(cx, cy - r * 0.6, cx, cy + r * 0.6);
        gemGrad.addColorStop(0, '#ffffff');
        gemGrad.addColorStop(0.5, '#b84dff');
        gemGrad.addColorStop(1, '#4d0080');

        ctx.fillStyle = gemGrad;
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 0.6);
        ctx.lineTo(cx + r * 0.3, cy);
        ctx.lineTo(cx, cy + r * 0.6);
        ctx.lineTo(cx - r * 0.3, cy);
        ctx.closePath();
        ctx.fill();

        // Inner Facet
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 0.6);
        ctx.lineTo(cx + r * 0.3, cy);
        ctx.lineTo(cx, cy + r * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    static drawArcher(ctx, s) {
        const cx = s / 2, cy = s / 2, r = s * 0.38;
        SynergyIcons.drawBaseCircle(ctx, s, '#1c4d25', '#081c0c', '#52d66b', 'rgba(82, 214, 107, 0.4)');

        ctx.save();
        // Modern Composite Bow
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = s * 0.05;
        ctx.beginPath();
        ctx.arc(cx - r * 0.2, cy, r * 0.75, -Math.PI * 0.42, Math.PI * 0.42);
        ctx.stroke();

        // Bowstring
        ctx.strokeStyle = '#e6e6e6';
        ctx.lineWidth = s * 0.015;
        const bx = cx - r * 0.2 + Math.cos(-Math.PI * 0.42) * r * 0.75;
        const by1 = cy + Math.sin(-Math.PI * 0.42) * r * 0.75;
        const by2 = cy + Math.sin(Math.PI * 0.42) * r * 0.75;
        ctx.beginPath();
        ctx.moveTo(bx, by1);
        ctx.lineTo(cx + r * 0.3, cy);
        ctx.lineTo(bx, by2);
        ctx.stroke();

        // Arrow Shaft & Broadhead Point
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = s * 0.035;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.5, cy);
        ctx.lineTo(cx + r * 0.6, cy);
        ctx.stroke();

        ctx.fillStyle = '#52d66b';
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.75, cy);
        ctx.lineTo(cx + r * 0.45, cy - r * 0.18);
        ctx.lineTo(cx + r * 0.52, cy);
        ctx.lineTo(cx + r * 0.45, cy + r * 0.18);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    static drawTank(ctx, s) {
        const cx = s / 2, cy = s / 2, r = s * 0.38;
        SynergyIcons.drawBaseCircle(ctx, s, '#3a4454', '#151921', '#a0b0c8', 'rgba(160, 176, 200, 0.3)');

        ctx.save();
        // Heavy Tower Shield
        ctx.fillStyle = '#222831';
        ctx.strokeStyle = '#c5d3e8';
        ctx.lineWidth = s * 0.04;

        ctx.beginPath();
        ctx.moveTo(cx - r * 0.5, cy - r * 0.6);
        ctx.lineTo(cx + r * 0.5, cy - r * 0.6);
        ctx.lineTo(cx + r * 0.45, cy + r * 0.2);
        ctx.lineTo(cx, cy + r * 0.7);
        ctx.lineTo(cx - r * 0.45, cy + r * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Reinforcement Plates & Boss
        ctx.fillStyle = '#3a4454';
        ctx.beginPath();
        ctx.rect(cx - r * 0.35, cy - r * 0.45, r * 0.7, r * 0.3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f0c040';
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.05, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    static drawAssassin(ctx, s) {
        const cx = s / 2, cy = s / 2, r = s * 0.38;
        SynergyIcons.drawBaseCircle(ctx, s, '#4a0d1b', '#1a0308', '#ff3b69', 'rgba(255, 59, 105, 0.4)');

        ctx.save();
        // Twin Shadow Blades
        for (let side of [-1, 1]) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(side, 1);
            ctx.rotate(Math.PI * 0.15);

            // Blade Path
            ctx.fillStyle = '#e6e6e6';
            ctx.beginPath();
            ctx.moveTo(0, -r * 0.75);
            ctx.quadraticCurveTo(r * 0.2, -r * 0.2, r * 0.1, r * 0.3);
            ctx.lineTo(0, r * 0.1);
            ctx.closePath();
            ctx.fill();

            // Edge Highlight
            ctx.strokeStyle = '#ff3b69';
            ctx.lineWidth = s * 0.025;
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }

    static drawSupport(ctx, s) {
        const cx = s / 2, cy = s / 2, r = s * 0.38;
        SynergyIcons.drawBaseCircle(ctx, s, '#52430e', '#1c1602', '#ffe169', 'rgba(255, 225, 105, 0.5)');

        ctx.save();
        // Radiant Wings behind Cross
        ctx.fillStyle = 'rgba(255, 225, 105, 0.3)';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.3, cy - r * 0.1, r * 0.4, r * 0.18, -Math.PI / 4, 0, Math.PI * 2);
        ctx.ellipse(cx + r * 0.3, cy - r * 0.1, r * 0.4, r * 0.18, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Holy Cross Emblem
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffe169';
        ctx.lineWidth = s * 0.02;

        const w = r * 0.22, h = r * 0.65;
        // Vertical Bar
        ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h, w, h * 2, s * 0.02); ctx.fill(); ctx.stroke();
        // Horizontal Bar
        ctx.beginPath(); ctx.roundRect(cx - h * 0.7, cy - w / 2 - r * 0.1, h * 1.4, w, s * 0.02); ctx.fill(); ctx.stroke();

        // Central Energy Core
        ctx.fillStyle = '#ffe169';
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.1, r * 0.16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    static drawWarrior(ctx, s) {
        const cx = s / 2, cy = s / 2, r = s * 0.38;
        SynergyIcons.drawBaseCircle(ctx, s, '#541711', '#1e0604', '#ff5242', 'rgba(255, 82, 66, 0.4)');

        ctx.save();
        // Double-Headed Battleaxe
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-Math.PI / 4);

        // Handle
        ctx.strokeStyle = '#8a5229';
        ctx.lineWidth = s * 0.05;
        ctx.beginPath(); ctx.moveTo(0, -r * 0.8); ctx.lineTo(0, r * 0.8); ctx.stroke();

        // Axe Blades
        ctx.fillStyle = '#c5cfd6';
        ctx.strokeStyle = '#ff5242';
        ctx.lineWidth = s * 0.025;

        ctx.beginPath();
        // Left Blade
        ctx.moveTo(0, -r * 0.5);
        ctx.quadraticCurveTo(-r * 0.6, -r * 0.7, -r * 0.6, 0);
        ctx.quadraticCurveTo(-r * 0.6, r * 0.7, 0, r * 0.5);
        // Right Blade
        ctx.quadraticCurveTo(r * 0.6, r * 0.7, r * 0.6, 0);
        ctx.quadraticCurveTo(r * 0.6, -r * 0.7, 0, -r * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
        ctx.restore();
    }

    // ============ ORIGIN ICONS ============

    static drawHuman(ctx, s) {
        const cx = s / 2, cy = s / 2, r = s * 0.38;
        SynergyIcons.drawBaseCircle(ctx, s, '#523f13', '#1c1403', '#fada5e', 'rgba(250, 218, 94, 0.4)');

        ctx.save();
        // Imperial Crown
        const crownGrad = ctx.createLinearGradient(cx, cy - r * 0.4, cx, cy + r * 0.3);
        crownGrad.addColorStop(0, '#fff2a1');
        crownGrad.addColorStop(1, '#d4af37');

        ctx.fillStyle = crownGrad;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = s * 0.02;

        ctx.beginPath();
        ctx.moveTo(cx - r * 0.6, cy + r * 0.3);
        ctx.lineTo(cx - r * 0.65, cy - r * 0.2);
        ctx.lineTo(cx - r * 0.3, cy + r * 0.05);
        ctx.lineTo(cx, cy - r * 0.45);
        ctx.lineTo(cx + r * 0.3, cy + r * 0.05);
        ctx.lineTo(cx + r * 0.65, cy - r * 0.2);
        ctx.lineTo(cx + r * 0.6, cy + r * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Crown Jewels
        ctx.fillStyle = '#ff2b55';
        for (let xOff of [-r * 0.4, 0, r * 0.4]) {
            ctx.beginPath();
            ctx.arc(cx + xOff, cy + r * 0.15, r * 0.07, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    static drawElf(ctx, s) {
        const cx = s / 2, cy = s / 2, r = s * 0.38;
        SynergyIcons.drawBaseCircle(ctx, s, '#0e473b', '#031a15', '#33f0c0', 'rgba(51, 240, 192, 0.4)');

        ctx.save();
        // Elegant Leaf Crest
        ctx.fillStyle = '#33f0c0';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = s * 0.02;

        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 0.7);
        ctx.quadraticCurveTo(cx + r * 0.6, cy - r * 0.2, cx, cy + r * 0.6);
        ctx.quadraticCurveTo(cx - r * 0.6, cy - r * 0.2, cx, cy - r * 0.7);
        ctx.fill();
        ctx.stroke();

        // Inner Veins
        ctx.strokeStyle = '#0e473b';
        ctx.lineWidth = s * 0.03;
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 0.5);
        ctx.lineTo(cx, cy + r * 0.4);
        ctx.moveTo(cx, cy - r * 0.1);
        ctx.lineTo(cx + r * 0.25, cy - r * 0.3);
        ctx.moveTo(cx, cy - r * 0.1);
        ctx.lineTo(cx - r * 0.25, cy - r * 0.3);
        ctx.stroke();
        ctx.restore();
    }

    static drawDemon(ctx, s) {
        const cx = s / 2, cy = s / 2, r = s * 0.38;
        SynergyIcons.drawBaseCircle(ctx, s, '#470b0b', '#1a0202', '#ff3333', 'rgba(255, 51, 51, 0.5)');

        ctx.save();
        // Curving Demon Horns
        ctx.fillStyle = '#1a0202';
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = s * 0.03;

        for (let side of [-1, 1]) {
            ctx.save();
            ctx.scale(side, 1);
            ctx.beginPath();
            ctx.moveTo(cx - r * 0.1, cy + r * 0.3);
            ctx.quadraticCurveTo(cx - r * 0.7, cy + r * 0.1, cx - r * 0.5, cy - r * 0.6);
            ctx.quadraticCurveTo(cx - r * 0.2, cy - r * 0.2, cx - r * 0.05, cy - r * 0.05);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        // Hellfire Core
        const fireGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.3);
        fireGrad.addColorStop(0, '#ffff55');
        fireGrad.addColorStop(0.6, '#ff3333');
        fireGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    static drawDragon(ctx, s) {
        const cx = s / 2, cy = s / 2, r = s * 0.38;
        SynergyIcons.drawBaseCircle(ctx, s, '#542908', '#210d01', '#ff9433', 'rgba(255, 148, 51, 0.4)');

        ctx.save();
        // Dragon Eye
        const eyeGrad = ctx.createLinearGradient(cx - r * 0.5, cy, cx + r * 0.5, cy);
        eyeGrad.addColorStop(0, '#ff3300');
        eyeGrad.addColorStop(0.5, '#ffcc00');
        eyeGrad.addColorStop(1, '#ff3300');

        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.65, cy);
        ctx.quadraticCurveTo(cx, cy - r * 0.5, cx + r * 0.65, cy);
        ctx.quadraticCurveTo(cx, cy + r * 0.5, cx - r * 0.65, cy);
        ctx.closePath();
        ctx.fill();

        // Slit Pupil
        ctx.fillStyle = '#0a0400';
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 0.1, r * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Specular Reflection
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - r * 0.12, cy - r * 0.12, r * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    static drawUndead(ctx, s) {
        const cx = s / 2, cy = s / 2, r = s * 0.38;
        SynergyIcons.drawBaseCircle(ctx, s, '#0a332c', '#021411', '#2bf0c2', 'rgba(43, 240, 194, 0.4)');

        ctx.save();
        // Stylized Skull
        ctx.fillStyle = '#dbe6e4';
        ctx.beginPath();
        // Cranium
        ctx.arc(cx, cy - r * 0.1, r * 0.45, Math.PI * 0.85, Math.PI * 2.15);
        // Jaw
        ctx.lineTo(cx + r * 0.25, cy + r * 0.45);
        ctx.lineTo(cx - r * 0.25, cy + r * 0.45);
        ctx.closePath();
        ctx.fill();

        // Ethereal Glow Sockets
        ctx.fillStyle = '#021411';
        ctx.beginPath();
        ctx.arc(cx - r * 0.18, cy - r * 0.08, r * 0.14, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.18, cy - r * 0.08, r * 0.14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2bf0c2';
        ctx.beginPath();
        ctx.arc(cx - r * 0.18, cy - r * 0.08, r * 0.06, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.18, cy - r * 0.08, r * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    static drawBeast(ctx, s) {
        const cx = s / 2, cy = s / 2, r = s * 0.38;
        SynergyIcons.drawBaseCircle(ctx, s, '#4a2306', '#1a0b01', '#ffaa33', 'rgba(255, 170, 51, 0.4)');

        ctx.save();
        // Triple Claw Slash Marks
        ctx.fillStyle = '#ffaa33';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = s * 0.015;

        for (let i = -1; i <= 1; i++) {
            ctx.save();
            ctx.translate(cx + i * r * 0.3, cy);
            ctx.rotate(i * 0.15 - Math.PI / 12);

            ctx.beginPath();
            ctx.moveTo(-r * 0.06, -r * 0.55);
            ctx.quadraticCurveTo(r * 0.08, 0, -r * 0.06, r * 0.55);
            ctx.quadraticCurveTo(0, 0, -r * 0.06, -r * 0.55);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }

    static drawCelestial(ctx, s) {
        const cx = s / 2, cy = s / 2, r = s * 0.38;
        SynergyIcons.drawBaseCircle(ctx, s, '#1c2854', '#070b1a', '#8fb3ff', 'rgba(143, 179, 255, 0.5)');

        ctx.save();
        // Luminous 8-Pointed Star
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#8fb3ff';
        ctx.shadowBlur = s * 0.1;

        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const dist = i % 2 === 0 ? r * 0.7 : r * 0.25;
            const x = cx + Math.cos(angle) * dist;
            const y = cy + Math.sin(angle) * dist;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Orbital Ring
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#8fb3ff';
        ctx.lineWidth = s * 0.025;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    static drawVoid(ctx, s) {
        const cx = s / 2, cy = s / 2, r = s * 0.38;
        SynergyIcons.drawBaseCircle(ctx, s, '#380947', '#12011a', '#e033ff', 'rgba(224, 51, 255, 0.5)');

        ctx.save();
        // Dimensional Void Vortex
        ctx.strokeStyle = '#e033ff';
        ctx.lineWidth = s * 0.035;

        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(cx, cy, (r * 0.7 * i) / 3, i * 0.8, i * 0.8 + Math.PI * 1.3);
            ctx.stroke();
        }

        // Void Singularity Core
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.25);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.5, '#e033ff');
        coreGrad.addColorStop(1, '#000000');

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}