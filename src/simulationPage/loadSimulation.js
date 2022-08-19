import simulationControls from './simulationControls.js'

export default function loadSimulation() {
    const main = document.querySelector('main');

    main.replaceChildren(...simulationControls.map(control => control.getDomElement()));
    
}