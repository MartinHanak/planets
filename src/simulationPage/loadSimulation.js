import { canvas } from './canvas/canvas.js';
import { displayState } from '../displayState.js';
import { defaultMassObjects, defaultDisplayState } from '../defaultStates.js';
import { massObjectState } from '../massObjectState.js';
import loadImportSelection from '../importPage/loadImportSelection.js';

export default function loadSimulation() {
    const main = document.querySelector('main');

    main.replaceChildren();

    let localMassObjects = JSON.parse(localStorage.getItem("massObjects"));
    let localDisplayState = JSON.parse(localStorage.getItem("displayState"));

    // if any import error AND no saved local state
    if (!(localMassObjects && localDisplayState)) {

        // display two buttons: import again OR load default values
        const errorContainer = document.createElement('div');
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Error occurred during data import and no recent data is saved in the local storage."   
        const solutionMessage = document.createElement('p');
        solutionMessage.textContent = "Do you want to try importing data again or load default values?";

        
        const importButton = document.createElement('button');
        importButton.textContent = "Import again";

        const defaultButton = document.createElement('button');
        defaultButton.textContent = "Load default";

        errorContainer.replaceChildren(errorMessage,solutionMessage, importButton, defaultButton);
        main.appendChild(errorContainer);


        // event handlers

        importButton.addEventListener('click', (e) => {
            errorContainer.remove();
            loadImportSelection();
        });

        defaultButton.addEventListener('click', (e) => {
            localMassObjects = [...defaultMassObjects];
            localDisplayState = [...defaultDisplayState];
            errorContainer.remove();
            initializeSimulation();
        });

    } else {

        initializeSimulation()
    }
    //displayState.startAnimation();


    function initializeSimulation() {
        // reset previous
        massObjectState.reset();

        // add new ones
        //console.log(localMassObjects);
        localMassObjects.forEach(obj => massObjectState.addObject(obj));
        //massObjectState.listObjects();

        canvas.createCanvas();

        canvas.createCanvasControllers();
    
        displayState.createNextFrameWithoutMoving();

    }
    
}

