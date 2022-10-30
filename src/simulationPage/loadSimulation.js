import { canvas } from './canvas/canvas.js';
import { displayState } from '../displayState.js';
import { defaultMassObjects, defaultDisplayState } from '../defaultStates.js';

export default function loadSimulation() {
    const main = document.querySelector('main');

    main.replaceChildren();

    let localMassObjects = localStorage.getItem("massObjects");
    let localDisplayState = localStorage.getItem("displayState")

    if (!(localMassObjects && localDisplayState)) {
        localMassObjects = [...defaultMassObjects];
        localDisplayState = [...defaultDisplayState];
    }

    canvas.createCanvas();

    displayState.startAnimation();
    
}

