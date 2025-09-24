// --- COMPLETE AND UNABRIDGED FILE ---

export class RenderSystem {
    constructor() {
        this.game = null;
        this.bgImage = new Image();
        this.bgImage.src =
            'https://placehold.co/1920x1080/1a1a2e/ffffff?text=Background';
        this.bgLoaded = false;
        this.bgImage.onload = () => { this.bgLoaded = true; };
        this.bgImage.onerror = () => { console.warn('Background image failed to load, using solid color fallback.'); this.bgLoaded = false; };
    }

    render(ctx) {
        // --- Draw Ground ---
        ctx.fillStyle = '#333';
        ctx.fillRect(
            0,
            620,
            this.game.worldBounds.width,
            this.game.worldBounds.height - 620
        );

        // --- Render Entities ---
        const entities = this.game.getEntitiesWithComponent('Sprite');
        entities.forEach((entity) => {
            this.drawSprite(ctx, entity);
            if (this.game.debugMode) this.drawDebugInfo(ctx, entity);
        });
    }

    drawSprite(ctx, entity) {
        const sprite = entity.getComponent('Sprite');
        const position = entity.getComponent('Position');
        if (!sprite.visible) return;

        ctx.save();
        ctx.globalAlpha = sprite.alpha;
        ctx.translate(
            position.x + sprite.shakeEffect.x,
            position.y + sprite.shakeEffect.y
        );

        if (sprite.flipX) ctx.scale(-1, 1);

        // Draw the main sprite or colored rectangle
        if (sprite.color) {
            ctx.fillStyle = sprite.color;
            ctx.fillRect(sprite.offsetX, sprite.offsetY, sprite.width, sprite.height);
        } else {
            const anim = sprite.animations.get(sprite.animationName) || {
                frames: [0],
            };
            const frameIndex = anim.frames[sprite.currentFrame];
            const sx = frameIndex * sprite.frameWidth;

            ctx.drawImage(
                sprite.image,
                sx,
                0,
                sprite.frameWidth,
                sprite.frameHeight,
                sprite.offsetX,
                sprite.offsetY,
                sprite.width,
                sprite.height
            );
        }

        // Draw flash effect if active
        if (sprite.flashDuration > 0 && sprite.flashColor) {
            ctx.save();
            ctx.globalAlpha = (sprite.flashDuration / 500); // Assuming initial flash duration is 500ms
            ctx.fillStyle = sprite.flashColor;
            ctx.fillRect(sprite.offsetX, sprite.offsetY, sprite.width, sprite.height);
            ctx.restore();
        }

        ctx.restore();
    }

    drawDebugInfo(ctx, entity) {
        const position = entity.getComponent('Position');
        if (!position) return;

        ctx.fillStyle = 'white';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';

        // Draw Collision Box
        const collision = entity.getComponent('Collision');
        const sprite = entity.getComponent('Sprite');
        if (collision && sprite) {
            const bounds = collision.getBounds(position, sprite);
            ctx.strokeStyle = '#00ff00'; // Green for collision boxes
            ctx.lineWidth = 1;
            ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        }

        // Check which type of entity it is
        const player = entity.getComponent('Player');
        const boss = entity.getComponent('Boss');
        const enemy = entity.getComponent('Enemy');

        if (player) {
            // --- PLAYER DEBUG INFO ---
            const velocity = entity.getComponent('Velocity');
            const x = position.x + 20;
            const y = position.y - 60;
            let state = 'Idle';
            if (player.isDashing) state = 'Dashing';
            else if (player.isAttacking)
                state = `Attacking (Combo ${player.comboCount})`;
            else if (player.isParrying) state = 'Parrying';
            else if (velocity && Math.abs(velocity.x) > 1) state = 'Running';

            ctx.fillText(`State: ${state}`, x, y);
            if (velocity)
                ctx.fillText(
                    `Vel: {x: ${velocity.x.toFixed(1)}, y: ${velocity.y.toFixed(1)}}`,
                    x,
                    y + 15
                );
            ctx.fillText(
                `HP: ${player.health.toFixed(0)}/${player.maxHealth}`,
                x,
                y + 30
            );
            ctx.fillText(
                `Stamina: ${player.stamina.toFixed(0)}/${player.maxStamina}`,
                x,
                y + 45
            );
        } else if (boss) {
            // --- BOSS DEBUG INFO ---
            const x = position.x + 50;
            const y = position.y - 80;

            ctx.fillStyle = '#ff6b6b'; // Red for boss info
            ctx.fillText(`--- BOSS: ${boss.name} ---`, x, y);
            ctx.fillText(`State: ${boss.state.toUpperCase()}`, x, y + 15);
            ctx.fillText(
                `Health: ${boss.health.toFixed(0)} / ${boss.maxHealth}`,
                x,
                y + 30
            );
            ctx.fillText(`Phase: ${boss.phase}`, x, y + 45);
            ctx.fillText(
                `Attack: ${boss.currentAttackPattern || 'None'}`,
                x,
                y + 60
            );
            ctx.fillText(
                `State Timer: ${boss.stateTimer.toFixed(0)}ms`,
                x,
                y + 75
            );

            const nextAttack =
                boss.lastAttackTime + boss.attackCooldown - Date.now();
            ctx.fillText(
                `Next Attack In: ${Math.max(0, nextAttack).toFixed(0)}ms`,
                x,
                y + 90
            );
        } else if (enemy) {
            // --- ENEMY DEBUG INFO ---
            const x = position.x + 20;
            const y = position.y - 40;

            ctx.fillStyle = '#ffa502'; // Orange for enemy info
            ctx.fillText(`State: ${enemy.state}`, x, y);
            ctx.fillText(
                `Health: ${enemy.health.toFixed(0)} / ${enemy.maxHealth}`,
                x,
                y + 15
            );
        }
    }
}
