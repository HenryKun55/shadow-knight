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
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(
            0,
            620,
            this.game.worldBounds.width,
            this.game.worldBounds.height - 620
        );

        // --- Render Entities ---
        for (const entity of this.game.entities.values()) {
            const sprite = entity.getComponent('Sprite');
            if (sprite) {
                this.drawSprite(ctx, entity);
                if (this.game.debugMode) this.drawDebugInfo(ctx, entity);
            }
        }
    }

    drawSprite(ctx, entity) {
        const sprite = entity.getComponent('Sprite');
        const position = entity.getComponent('Position');
        const enemy = entity.getComponent('Enemy');
        const boss = entity.getComponent('Boss');
        
        if (!sprite.visible) return;

        ctx.save();
        ctx.globalAlpha = sprite.alpha;
        ctx.translate(
            position.x + sprite.shakeEffect.x,
            position.y + sprite.shakeEffect.y
        );

        // Check if this is a dead enemy and handle corpse rendering
        const isDead = (enemy && enemy.isDead()) || (boss && boss.isDead());
        if (isDead) {
            this.drawDeadEnemy(ctx, entity, sprite, enemy || boss);
            ctx.restore();
            return;
        }

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

        ctx.restore();
    }

    drawDeadEnemy(ctx, entity, sprite, target) {
        const deathProgress = target.deathTime / target.deathAnimationDuration;
        const isCorpse = target.isCorpse;
        const isRagdoll = target.isRagdoll;
        const velocity = entity.getComponent('Velocity');
        const position = entity.getComponent('Position');
        
        // Temporary debug log to find the issue
        if (target.constructor.name === 'Boss') {
            console.log(`Boss death state: isCorpse=${isCorpse}, isRagdoll=${isRagdoll}, deathProgress=${deathProgress.toFixed(2)}`);
        }
        
        ctx.save();
        
        if (isCorpse && !isRagdoll) {
            // Final corpse state - lying down with final rotation
            ctx.globalAlpha = 0.8;
            
            // Apply final rotation to make enemy lie down
            ctx.rotate(target.finalRotation);
            
            // Adjust position for rotated sprite
            const rotatedOffsetX = target.corpseDirection > 0 ? sprite.offsetX : sprite.offsetX;
            const rotatedOffsetY = target.corpseDirection > 0 ? sprite.offsetY - sprite.width/2 : sprite.offsetY + sprite.width/2;
            
            // Draw corpse with darker color (no shadow needed - the dark corpse is clear enough)
            ctx.fillStyle = '#333'; // Dark corpse color
            ctx.fillRect(rotatedOffsetX, rotatedOffsetY, sprite.width, sprite.height);
        } else if (isRagdoll) {
            // Ragdoll physics active - show rotation and impact
            const rotationAngle = Math.atan2(velocity?.y || 0, velocity?.x || 1) * 0.3; // Subtle rotation based on velocity
            const impactScale = Math.abs(velocity?.y || 0) > 100 ? 1.1 : 1.0; // Slight squash on high velocity
            
            ctx.rotate(rotationAngle);
            ctx.scale(impactScale, 1 / impactScale);
            ctx.globalAlpha = Math.max(0.7, 1 - deathProgress * 0.3);
            
            // Color based on impact
            let color = sprite.color;
            if (Math.abs(velocity?.y || 0) > 50) {
                color = '#666'; // Gray during impact
            } else if (deathProgress > 0.5) {
                color = '#444'; // Darker as time passes
            }
            
            ctx.fillStyle = color;
            ctx.fillRect(sprite.offsetX, sprite.offsetY, sprite.width, sprite.height);
        } else {
            // FORCE RAGDOLL FOR BOSS - TEMPORARY FIX
            if (target.constructor.name === 'Boss' && !target.isRagdoll) {
                console.log('FORCING Boss to ragdoll mode!');
                target.isRagdoll = true;
                target.bounces = 0;
            }
            
            // Regular death animation (should not be used for Boss anymore)
            const scaleY = Math.max(0.3, 1 - (deathProgress * 0.7));
            const alpha = Math.max(0.4, 1 - (deathProgress * 0.6));
            const darkenFactor = deathProgress;
            
            ctx.scale(1, scaleY);
            ctx.globalAlpha = alpha;
            
            let color = sprite.color;
            if (darkenFactor > 0.2) {
                color = darkenFactor > 0.6 ? '#333' : '#666';
            }
            
            ctx.fillStyle = color;
            ctx.fillRect(sprite.offsetX, sprite.offsetY / scaleY, sprite.width, sprite.height);
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
            const bounds = collision.getBounds(position, sprite, entity);
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
