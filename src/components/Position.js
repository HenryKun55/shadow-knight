/* ===================================
   POSITION COMPONENT - SHADOW KNIGHT
   ===================================
   Position component for spatial coordinates and movement tracking.
*/

export class Position {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
    }
    
    update() {
        this.prevX = this.x;
        this.prevY = this.y;
    }
    
    set(x, y) {
        this.x = x;
        this.y = y;
    }
    
    add(x, y) {
        this.x += x;
        this.y += y;
    }
    
    distanceTo(otherPosition) {
        const dx = this.x - otherPosition.x;
        const dy = this.y - otherPosition.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    directionTo(otherPosition) {
        const dx = otherPosition.x - this.x;
        const dy = otherPosition.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return { x: 0, y: 0 };
        
        return {
            x: dx / distance,
            y: dy / distance
        };
    }
}