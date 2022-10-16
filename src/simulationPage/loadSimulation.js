import { canvas } from './canvas/canvas.js';
import { displayState } from '../displayState.js';

export default function loadSimulation() {
    const main = document.querySelector('main');

    main.replaceChildren();

    canvas.createCanvas();

    displayState.startAnimation();
    
}