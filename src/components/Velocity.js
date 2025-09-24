export class Velocity {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.maxSpeed = 1000;
    }
    
    set(x, y) {
        this.x = x;
        this.y = y;
        this.clamp();
    }
    
    add(x, y) {
        this.x += x;
        this.y += y;
        this.clamp();
    }
    
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }
    
    clamp() {
        const speed = Math.sqrt(this.x * this.x + this.y * this.y);
        if (speed > this.maxSpeed) {
            this.x = (this.x / speed) * this.maxSpeed;
            this.y = (this.y / speed) * this.maxSpeed;
        }
    }
    
    getSpeed() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    normalize() {
        const speed = this.getSpeed();
        if (speed > 0) {
            this.x /= speed;
            this.y /= speed;
        }
    }
    
    zero() {
        this.x = 0;
        this.y = 0;
    }
}