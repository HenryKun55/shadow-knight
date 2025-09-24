export class Entity {
    constructor(id = Entity.generateId()) {
        this.id = id;
        this.components = new Map();
        this.active = true;
    }
    
    static generateId() {
        return 'entity_' + Math.random().toString(36).substr(2, 9);
    }
    
    addComponent(name, component) {
        this.components.set(name, component);
        component.entity = this;
        return this;
    }
    
    getComponent(name) {
        return this.components.get(name);
    }
    
    hasComponent(name) {
        return this.components.has(name);
    }
    
    removeComponent(name) {
        const component = this.components.get(name);
        if (component) {
            component.entity = null;
            this.components.delete(name);
        }
        return this;
    }
    
    destroy() {
        this.active = false;
        this.components.clear();
    }
}