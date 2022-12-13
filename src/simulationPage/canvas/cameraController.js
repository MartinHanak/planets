import { displayState } from "../../displayState.js";
import { massObjectState } from "../../massObjectState.js";
import { imageGenerator } from "../imageGenerator/imageGenerator.js";
massObjectState

export const cameraController = (() => {

    const controllerContainer = document.createElement('div');
    controllerContainer.classList.add('camera-controller');

    // controlls position = 2x angle and zoom/distance
    const zoomLabel = document.createElement('label');
    zoomLabel.htmlFor = "zoom";
    zoomLabel.textContent = "Zoom";
    const zoomInput = document.createElement('input');
    zoomInput.type = "range";
    zoomInput.id = "zoom";
    zoomInput.name = "zoom";
    zoomInput.min = -0.5;
    zoomInput.max = 3.0;
    zoomInput.step = 0.1;
    zoomInput.value = 0.0;

    const positionLabel = document.createElement('label');
    positionLabel.htmlFor = "Position";
    positionLabel.textContent = "Position";
    const horizontalPositionInput = document.createElement('input');
    horizontalPositionInput.type = "range";
    horizontalPositionInput.min = 0;
    horizontalPositionInput.max = 360;
    horizontalPositionInput.step = 1;
    horizontalPositionInput.value = 45;
    horizontalPositionInput.id = "horizontal";
    horizontalPositionInput.name = "horizontal";
    const verticalPositionInput = document.createElement('input');
    verticalPositionInput.type = "range";
    verticalPositionInput.min = 0;
    verticalPositionInput.max = 180;
    verticalPositionInput.step = 1;
    verticalPositionInput.value = 135;
    verticalPositionInput.id = "vertical";
    verticalPositionInput.name = "vertical";

    const centerLabel = document.createElement('label');
    centerLabel.textContent = "Center"
    const centerSelect = document.createElement('select');

    controllerContainer.replaceChildren(zoomLabel,zoomInput,positionLabel,horizontalPositionInput,verticalPositionInput,centerLabel,centerSelect);

    // event listeners
    horizontalPositionInput.addEventListener('input', (e) => {
        displayState.updateCameraPosition(e.target.value, displayState.getCameraPosition().verticalAngle);

        // if no animation running, request one frame
        if(displayState.getAnimationSettings().run == false) {
            displayState.createNextFrameWithoutMoving();
        }

        // update planet images? = maybe only on "change event"???
        imageGenerator.updateCurrentImageData()
        .then(results =>{
            imageGenerator.updateCurrentImageBitmap();
        })

    })

    verticalPositionInput.addEventListener('input', (e) =>{
        displayState.updateCameraPosition(displayState.getCameraPosition().horizontalAngle, e.target.value);

         // if no animation running, request one frame
         if(displayState.getAnimationSettings().run == false) {
            displayState.createNextFrameWithoutMoving();
        }

        // update planet images? = maybe only on "change event"???
        imageGenerator.updateCurrentImageData()
        .then(results =>{
            imageGenerator.updateCurrentImageBitmap();
        })
    })
    
    zoomInput.addEventListener('input', (e) => {
        displayState.updateCameraZoom(1/Math.exp(e.target.value));

        // if no animation running, request one frame
         if(displayState.getAnimationSettings().run == false) {
            displayState.createNextFrameWithoutMoving();
        }

        // update planet images? = maybe only on "change event"???
        imageGenerator.updateCurrentImageData()
        .then(results =>{
            imageGenerator.updateCurrentImageBitmap();
        })
    })

    centerSelect.addEventListener('change', (e) => {
        displayState.updateCameraCenter(e.target.value);
        massObjectState.resetTrajectories();

        if(!displayState.getAnimationSettings().run) {
            displayState.createNextFrameWithoutMoving();
        }
    })

    // export functions
    const updateCenterSelect = () => {
        let optionsElementArray = [];

        const options = ['Barycenter'];
        const newMassObjects = massObjectState.getObjects();
        for(const massObject of newMassObjects) {
            options.push(massObject.name);
        }

        for(const option of options) {
            const optionElement = document.createElement('option')
            optionElement.value = option;
            optionElement.textContent = option;
            optionsElementArray.push(optionElement);
        }

        centerSelect.replaceChildren(...optionsElementArray);
    }


    const getDOMelement = () => {
        return controllerContainer;
    }

    const updateCameraControllers = () => {
        updateCenterSelect();

        let newHorizontalValue = displayState.getCameraPosition().horizontalAngle;
        let newVerticalValue = displayState.getCameraPosition().verticalAngle;

        horizontalPositionInput.value = newHorizontalValue;
        verticalPositionInput.value = newVerticalValue;

    }

    return {
        getDOMelement,
        updateCenterSelect,
        updateCameraControllers
    }
})();