import { displayState } from "../../displayState.js";

export const simulationController = (() => {

    const controllerContainer = document.createElement('div');
    controllerContainer.classList.add('simulation-controller');


    const timestepLabel = document.createElement('label');
    timestepLabel.htmlFor = "timestep";
    timestepLabel.textContent = "Timestep"

    const timestepInput = document.createElement('input');
    timestepInput.type = "text";
    timestepInput.value = "1.0";

    const timestepUnitsSpan = document.createElement('span');
    timestepUnitsSpan.classList.add('units-span');
    timestepUnitsSpan.textContent = "days";


    const startButton = document.createElement('button');
    startButton.textContent = "Start Simulation";
    startButton.classList.add("start-button");

    controllerContainer.replaceChildren(timestepLabel,timestepInput, timestepUnitsSpan, startButton);

    // event listeners
    timestepInput.addEventListener('change', (e) => {
        console.log(`changed, current value: ${Number(e.target.value)}`)
        if (!isNaN(Number(e.target.value))) {
            displayState.updateTimestep(Number(e.target.value));
        } else {
            console.log("Input timestep value is not a number");
            e.target.value = "1.0";
        }
    });

    startButton.addEventListener('click', (e) => {
        startButton.classList.toggle("stop");
        displayState.toggleAnimation();
    });

    const getDOMelement = () => {
        return controllerContainer;
    }


    return {
        getDOMelement
    }
})();