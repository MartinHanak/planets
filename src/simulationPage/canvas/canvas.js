import SimulationControl from "../classSimulationControl.js";

class Canvas extends SimulationControl {
    constructor() {
        super('canvas','main-canvas-display')
    }
}

const canvas = new Canvas();

export default canvas;