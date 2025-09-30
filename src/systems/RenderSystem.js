/* ===================================
   RENDER SYSTEM - SHADOW KNIGHT
   ===================================
   Render system using centralized GameConfig for colors, dimensions, and debug.
   All visual constants and styling reference configuration.
*/

import { GameConfig } from '../config/GameConfig.js';

export class RenderSystem {
    constructor() {
        this.game = null;
        
        // Cache render configuration for performance
        this.colors = GameConfig.COLORS;
        this.worldBounds = GameConfig.WORLD.BOUNDS;
        this.debugConfig = GameConfig.DEBUG;
        
        // Background image using configuration
        this.bgImage = new Image();
        this.bgImage.src = GameConfig.ASSETS.BACKGROUND.PLACEHOLDER;
        this.bgLoaded = false;
        this.bgImage.onload = () => { this.bgLoaded = true; };
        this.bgImage.onerror = () => { 
            console.warn(GameConfig.ASSETS.BACKGROUND.ERROR_MESSAGE); 
            this.bgLoaded = false; 
        };
    }

    render(ctx) {
        // --- Draw Ground ---
        ctx.fillStyle = this.colors.WORLD.GROUND;
        const groundY = GameConfig.PHYSICS.COLLISION.GROUND_LEVEL;
        ctx.fillRect(
            0,
            groundY,
            this.worldBounds.width,
            this.worldBounds.height - groundY
        );

        // --- Draw Room Doors ---
        this.drawRoomDoors(ctx);
        
        // --- Draw Room Holes ---
        this.drawRoomHoles(ctx);
        
        // --- Draw Room Platforms ---
        this.drawRoomPlatforms(ctx);

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
            ctx.fillStyle = this.colors.ENEMY.CORPSE;
            ctx.fillRect(rotatedOffsetX, rotatedOffsetY, sprite.width, sprite.height);
        } else if (isRagdoll) {
            // Ragdoll physics active - show rotation and impact
            const rotationAngle = Math.atan2(velocity?.y || 0, velocity?.x || 1) * 0.3; // Subtle rotation based on velocity
            const impactScale = Math.abs(velocity?.y || 0) > 100 ? 1.1 : 1.0; // Slight squash on high velocity
            
            ctx.rotate(rotationAngle);
            ctx.scale(impactScale, 1 / impactScale);
            ctx.globalAlpha = Math.max(0.7, 1 - deathProgress * 0.3);
            
            // Color based on impact using configuration
            let color = sprite.color;
            const impactThreshold = GameConfig.PHYSICS.RAGDOLL.IMPACT_COLOR_THRESHOLD;
            if (Math.abs(velocity?.y || 0) > impactThreshold) {
                color = this.colors.ENEMY.IMPACT;
            } else if (deathProgress > 0.5) {
                color = this.colors.ENEMY.DEATH_FADE;
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
                color = darkenFactor > 0.6 ? this.colors.ENEMY.CORPSE : this.colors.ENEMY.IMPACT;
            }
            
            ctx.fillStyle = color;
            ctx.fillRect(sprite.offsetX, sprite.offsetY / scaleY, sprite.width, sprite.height);
        }
        
        ctx.restore();
    }

    drawDebugInfo(ctx, entity) {
        const position = entity.getComponent('Position');
        if (!position) return;

        ctx.fillStyle = this.debugConfig.TEXT.COLOR;
        ctx.font = this.debugConfig.TEXT.FONT;
        ctx.textAlign = this.debugConfig.TEXT.ALIGN;

        // Draw Collision Box
        const collision = entity.getComponent('Collision');
        const sprite = entity.getComponent('Sprite');
        if (collision && sprite) {
            const bounds = collision.getBounds(position, sprite, entity);
            ctx.strokeStyle = this.debugConfig.COLORS.COLLISION_BOX;
            ctx.lineWidth = this.debugConfig.LINE_WIDTH;
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
                `World Pos: (${Math.round(position.x)}, ${Math.round(position.y)})`,
                x,
                y + 30
            );
            
            // Room-relative position info
            const roomTransitionSystem = this.game.getSystem('RoomTransitionSystem');
            if (roomTransitionSystem) {
                const currentRoom = roomTransitionSystem.getCurrentRoomData();
                ctx.fillText(
                    `Room: ${currentRoom.id} (${currentRoom.name})`,
                    x,
                    y + 45
                );
                ctx.fillText(
                    `Room Pixel: (${Math.round(position.x)}, ${Math.round(position.y)})`,
                    x,
                    y + 60
                );
            }
            ctx.fillText(
                `HP: ${player.health.toFixed(0)}/${player.maxHealth}`,
                x,
                y + 75
            );
            ctx.fillText(
                `Stamina: ${player.stamina.toFixed(0)}/${player.maxStamina}`,
                x,
                y + 90
            );
        } else if (boss) {
            // --- BOSS DEBUG INFO ---
            const x = position.x + 50;
            const y = position.y - 80;

            ctx.fillStyle = this.debugConfig.COLORS.BOSS_INFO;
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

            ctx.fillStyle = this.debugConfig.COLORS.ENEMY_INFO;
            ctx.fillText(`State: ${enemy.state}`, x, y);
            ctx.fillText(
                `Health: ${enemy.health.toFixed(0)} / ${enemy.maxHealth}`,
                x,
                y + 15
            );
        }
    }

    drawRoomHoles(ctx) {
        const roomTransitionSystem = this.game.getSystem('RoomTransitionSystem');
        if (!roomTransitionSystem) return;

        const currentRoomId = roomTransitionSystem.currentRoom;
        const rooms = roomTransitionSystem.rooms;

        // Removed old hole rendering system to prevent duplicates
        
        // Draw holes defined directly in current room
        const currentRoom = rooms[currentRoomId];
        if (currentRoom && currentRoom.holes) {
            currentRoom.holes.forEach(hole => {
                const holeX = hole.x;
                const holeY = hole.y;
                const holeRadius = hole.radius;
                
                // Draw hole based on type
                ctx.save();
                
                if (hole.type === 'climb_up') {
                    // Draw very visible climb hole - bright and obvious
                    const gradient = ctx.createRadialGradient(holeX, holeY, 0, holeX, holeY, holeRadius);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); // Bright white center
                    gradient.addColorStop(0.3, 'rgba(255, 255, 100, 0.8)'); // Bright yellow
                    gradient.addColorStop(0.7, 'rgba(100, 150, 255, 0.6)'); // Blue middle
                    gradient.addColorStop(1, 'rgba(50, 100, 200, 0.4)'); // Blue edge
                    
                    // Draw the full circle hole
                    ctx.beginPath();
                    ctx.arc(holeX, holeY, holeRadius, 0, 2 * Math.PI);
                    ctx.fillStyle = gradient;
                    ctx.fill();
                    
                    // Add very bright pulsing border
                    const time = Date.now() * 0.005;
                    const pulse = 0.5 + 0.5 * Math.sin(time);
                    ctx.strokeStyle = `rgba(255, 255, 0, ${0.8 + pulse * 0.2})`;
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc(holeX, holeY, holeRadius - 2, 0, 2 * Math.PI);
                    ctx.stroke();
                    
                    // Add inner bright ring
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + pulse * 0.4})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(holeX, holeY, holeRadius * 0.5, 0, 2 * Math.PI);
                    ctx.stroke();
                } else {
                    // Draw hole in ground (downward hole) - subtle crater style
                    const gradient = ctx.createRadialGradient(holeX, holeY, 0, holeX, holeY, holeRadius);
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)'); // Dark center
                    gradient.addColorStop(0.5, 'rgba(40, 30, 20, 0.6)'); // Brown middle
                    gradient.addColorStop(1, 'rgba(80, 60, 40, 0.2)'); // Subtle edge
                    
                    // Draw subtle circular depression
                    ctx.beginPath();
                    ctx.arc(holeX, holeY, holeRadius, 0, 2 * Math.PI);
                    ctx.fillStyle = gradient;
                    ctx.fill();
                    
                    // Add very subtle rim
                    ctx.strokeStyle = 'rgba(60, 40, 20, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(holeX, holeY, holeRadius - 1, 0, 2 * Math.PI);
                    ctx.stroke();
                }
                
                ctx.restore();

                // Debug: Draw collision area in debug mode
                if (this.game.debugMode) {
                    ctx.strokeStyle = this.debugConfig.COLORS.DOOR_COLLISION;
                    ctx.lineWidth = this.debugConfig.DOOR_LINE_WIDTH;
                    ctx.beginPath();
                    ctx.arc(holeX, holeY, holeRadius, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    // Label the hole
                    ctx.fillStyle = this.debugConfig.TEXT.COLOR;
                    ctx.font = this.debugConfig.TEXT.FONT;
                    ctx.fillText(`Hole to Room ${hole.toRoom}`, holeX - 50, holeY - holeRadius - 10);
                    
                    // Show hole position
                    ctx.fillText(`Hole: (${Math.round(holeX)}, ${Math.round(holeY)})`, holeX - 50, holeY - holeRadius - 25);
                }
            });
        }
    }

    drawRoomDoors(ctx) {
        const roomTransitionSystem = this.game.getSystem('RoomTransitionSystem');
        if (!roomTransitionSystem || !roomTransitionSystem.getCurrentRoomDoors) return;

        const doors = roomTransitionSystem.getCurrentRoomDoors();
        if (!doors.length) return;

        doors.forEach(door => {
            // Draw door frame using configuration
            ctx.fillStyle = this.colors.WORLD.DOOR_FRAME;
            ctx.fillRect(door.x, door.y, door.width, door.height);

            // Draw door interior using configuration
            const doorPadding = GameConfig.WORLD.DOOR.INTERIOR_PADDING;
            ctx.fillStyle = this.colors.WORLD.DOOR_INTERIOR;
            ctx.fillRect(
                door.x + doorPadding, 
                door.y + doorPadding, 
                door.width - doorPadding * 2, 
                door.height - doorPadding * 2
            );

            // Debug: Draw collision box in debug mode
            if (this.game.debugMode) {
                ctx.strokeStyle = this.debugConfig.COLORS.DOOR_COLLISION;
                ctx.lineWidth = this.debugConfig.DOOR_LINE_WIDTH;
                ctx.strokeRect(door.x, door.y, door.width, door.height);
                
                // Label the door
                ctx.fillStyle = this.debugConfig.TEXT.COLOR;
                ctx.font = this.debugConfig.TEXT.FONT;
                ctx.fillText(`Door to Room ${door.toRoom}`, door.x, door.y - 10);
                
                // Show room info
                const currentRoomId = roomTransitionSystem.currentRoom;
                const currentRoom = roomTransitionSystem.rooms[currentRoomId];
                ctx.fillText(`Current: Room ${currentRoomId} (${currentRoom.startX}-${currentRoom.endX})`, door.x, door.y - 25);
                
                // Show player position for debugging
                const player = this.game.getEntitiesWithComponent('Player')[0];
                if (player) {
                    const playerPos = player.getComponent('Position');
                    ctx.fillText(`Player: (${Math.round(playerPos.x)}, ${Math.round(playerPos.y)})`, door.x, door.y - 40);
                }
            }
        });
    }

    drawRoomPlatforms(ctx) {
        const roomTransitionSystem = this.game.getSystem('RoomTransitionSystem');
        if (!roomTransitionSystem) return;

        const currentRoomId = roomTransitionSystem.currentRoom;
        const currentRoom = roomTransitionSystem.rooms[currentRoomId];
        
        if (!currentRoom || !currentRoom.platforms) return;

        currentRoom.platforms.forEach(platform => {
            // Draw platform with stone/metal texture
            ctx.save();
            
            // Platform base color (stone-like)
            ctx.fillStyle = GameConfig.ROOMS.PLATFORMS.BASE_COLOR;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Add highlight on top edge
            ctx.fillStyle = GameConfig.ROOMS.PLATFORMS.HIGHLIGHT_COLOR;
            ctx.fillRect(platform.x, platform.y, platform.width, GameConfig.ROOMS.PLATFORMS.HIGHLIGHT_HEIGHT);
            
            // Add shadow on bottom edge
            ctx.fillStyle = GameConfig.ROOMS.PLATFORMS.SHADOW_COLOR;
            ctx.fillRect(platform.x, platform.y + platform.height - GameConfig.ROOMS.PLATFORMS.SHADOW_HEIGHT, platform.width, GameConfig.ROOMS.PLATFORMS.SHADOW_HEIGHT);
            
            // Add subtle texture lines
            ctx.strokeStyle = GameConfig.ROOMS.PLATFORMS.TEXTURE_COLOR;
            ctx.lineWidth = 1;
            for (let i = 0; i < platform.width; i += GameConfig.ROOMS.PLATFORMS.TEXTURE_SPACING) {
                ctx.beginPath();
                ctx.moveTo(platform.x + i, platform.y);
                ctx.lineTo(platform.x + i, platform.y + platform.height);
                ctx.stroke();
            }
            
            ctx.restore();

            // Debug: Draw collision box in debug mode
            if (this.game.debugMode) {
                ctx.strokeStyle = this.debugConfig.COLORS.COLLISION;
                ctx.lineWidth = this.debugConfig.LINE_WIDTH;
                ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
                
                // Label the platform
                ctx.fillStyle = this.debugConfig.TEXT.COLOR;
                ctx.font = this.debugConfig.TEXT.FONT;
                ctx.fillText(`Platform (${platform.x}, ${platform.y})`, platform.x, platform.y - 5);
            }
        });
    }
}
