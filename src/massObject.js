export default class MassObject {
    constructor(name,mass,x,y,z,vx,vy,vz) {
        this.name = name;
        this.mass = mass;
        this.position = [x,y,z];
        this.velocity = [vx,vy,vz];
    }
}
