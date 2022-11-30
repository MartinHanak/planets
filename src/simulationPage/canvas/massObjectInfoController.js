import { displayState } from "../../displayState.js";
import { massObjectState } from "../../massObjectState.js";
import { imageGenerator } from "../imageGenerator/imageGenerator.js";

export const massObjectInfoController = (() => {

    const controllerContainer = document.createElement('div');
    controllerContainer.classList.add('mass-object-info-controller');

    const createMOButton = document.createElement('button');
    createMOButton.textContent = "Add Object";

    const createMODiv = initializeCreateMODiv();

    controllerContainer.replaceChildren(createMOButton,createMODiv);

    let displayedNames = [];

    function initializeCreateMODiv() {
        const container = document.createElement('div');
        container.classList.add('create-planet');
        container.classList.add('hidden');

        // outside button controlls display
        createMOButton.addEventListener('click',() => {
            container.classList.toggle('hidden');
        })

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Enter name...'

        const line = document.createElement('hr');

        // use existing methods, copy result to remove all event listeners
        const position = createVectorDiv([0,0,149597870691],'position','Default');
        const velocity = createVectorDiv([0,-30000,0],'velocity','Default');
        const mass = createVectorDiv([6e24], 'mass','Default');

        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Confirm';
        
        // event listener
        confirmButton.addEventListener('click', (e) => {
            //displayState.stopAnimation();
            massObjectState.resetForces();
            let errorMessages = [];

            const inputFields = container.querySelectorAll('input');
            const nameInput = inputFields[0];
            
            const posXInput = inputFields[1];
            const posYInput = inputFields[2];
            const posZInput = inputFields[3];

            const velXInput = inputFields[4];
            const velYInput = inputFields[5];
            const velZInput = inputFields[6];

            const massInput = inputFields[7];


            // check name
            // unique, only letters utf-8, trim input
            let name = nameInput.value.trim();
            // allow: letters, numbers, -, _, space
            const nameRegExp = /^[\p{L}\p{N}\-_\s]+$/iu;
            if(name.match(nameRegExp) === null) {
                errorMessages.push('Only letters, numbers and -, _ characters are allowed in the mass object name.');
            }

            // check if name unique
            const massObjects = massObjectState.getObjects();
            for(const massObject of massObjects) {
               if(massObject.name.toUpperCase() === name.toUpperCase())  {
                errorMessages.push('The chosen name is not unique.');
                break;
               }
            }
 

            // position, velocity, mass:
            // valid numbers, multiply by unit Multiplier
            // convert to SI units
            const posMulti = 1.495978707e11;
            const velMulti = 1000;
            const massMulti = 5.97219e24;

            const position = [Number(posXInput.value) * posMulti, Number(posYInput.value) * posMulti, Number(posZInput.value) * posMulti];
            const velocity = [Number(velXInput.value) * velMulti, Number(velYInput.value) * velMulti, Number(velZInput.value) * velMulti];
            const mass = Number(massInput.value) * massMulti;
            
            for(const posComponent of position) {
                if(isNaN(posComponent)) {
                    errorMessages.push('Input position is not a proper number.');
                    break;
                }
            }
            for(const velComponent of velocity) {
                if(isNaN(velComponent)) {
                    errorMessages.push('Input velocity is not a proper number.');
                    break;
                }
            }
            if(isNaN(mass)) {
                errorMessages.push('Input mass is not a proper number.');
            }

            console.log(nameInput.value);

            if(errorMessages.length === 0) {
                // add new MO
                console.log('Creating new MO');
                massObjectState.addObject({name,mass,position,velocity});

                const massObject = massObjectState.getObjectByName(name);

                if(massObject) {
                    // initialize new MO texture
                    // initialize texture image 
                    const images = displayState.getStaticImages();
                    const textureImage = images["DefaultTexture"];

                    let tempCanvas = document.createElement('canvas');
                    tempCanvas.width = textureImage.naturalWidth;
                    tempCanvas.height = textureImage.naturalHeight;
                    let tempctx = tempCanvas.getContext('2d');
                    tempctx.drawImage(textureImage,0,0);
                    massObject.visualInfo.textureImageData = tempctx.getImageData(0,0,tempCanvas.width,tempCanvas.height);

                    // update image data
                    // generate bitmap
                    imageGenerator.updateCurrentImageData()
                    .then(results => {
                        imageGenerator.updateCurrentImageBitmap();
                    })
                    .catch(err => console.log(err));

                }
                // generate new frame

                // reset values of add object div
                controllerContainer.replaceChild(initializeCreateMODiv(), container) ;  
            } else {
                // display error
                for(const error of errorMessages) {
                    console.log(error);
                }
            }
        })
    
        container.replaceChildren(nameInput,line,position,velocity,mass,confirmButton);

        return container;
    }

    const displayDetails = () => {

        for(const name of displayedNames) {
            const massObject = massObjectState.getObjectByName(name);
            if (massObject) {
                 controllerContainer.appendChild(createDetailsDiv(massObject))
            } else {
                console.log(`Mass object ${name} could not be found.`);
            }
        }

    }

    const getDOMelement = () => {
        return controllerContainer;
    }

    const createDetailsDiv = (massObject) => {
        const container = document.createElement('div');
        container.classList.add('planet-details');
        container.id = `${massObject.name}-planet-details`;

        const name = document.createElement('h3');
        name.textContent = massObject.name;

        const line = document.createElement('hr');

        const position = createVectorDiv(massObject.position,'position',massObject.name);
        const velocity = createVectorDiv(massObject.velocity,'velocity',massObject.name);
        const mass = createVectorDiv([massObject.mass], 'mass',massObject.name);

    
        container.replaceChildren(name,line,position,velocity,mass);

        return container;
    }

    function createVectorDiv (vector, name, MOname) {
        const container = document.createElement('div');
        container.classList.add(`${name}-column`);

        const [convertedVector,units,unitMultiplier,componentNames] = convertUnits(vector,name);

        convertedVector.forEach((component, index) => {
            // div for all elements on one line
            const lineContainer = document.createElement('div');

            // name span
            const nameSpan = document.createElement('span');
            nameSpan.textContent = componentNames[index];

            // value inside input
            // round up the number
            const valueInput = document.createElement('input');
            valueInput.value = Number.parseFloat(component).toFixed(2);

            // units span
            const unitsSpan = document.createElement('span');
            unitsSpan.innerText = units;

            // event listener for all inputs

            valueInput.addEventListener('focus', (e) => {
                displayState.stopAnimation();
            });

            valueInput.addEventListener('change', (e) => {
                console.log("value changed")
                const newValue = Number(e.target.value);
                if(!isNaN(newValue)) {
                    massObjectState.updateValue(MOname, name, index, newValue * unitMultiplier);
                    displayState.createNextFrameWithoutMoving();
                    updateMODetails();
                }
            })

            lineContainer.replaceChildren(nameSpan,valueInput,unitsSpan);
            container.appendChild(lineContainer);
        });





        return container;
    }

    // converts SI units to more readable form
    function convertUnits (vector, name) {

        let result = [...vector];
        let units = '';
        let unitMultiplier = 1.0;
        let componentNames = [];

        if(name == 'position') {
            result.forEach( (value, index ) => {
                result[index] = value / (1.495978707e11);
            })  // from m to AU
            unitMultiplier = 1.495978707e11;
            units = 'AU';
            componentNames = ['x', 'y', 'z'];
        } else if (name == 'velocity') {
            result.forEach( (value, index ) => {
                result[index] = value / (1000);
            })  // from m/s to km/s
            unitMultiplier = 1000;
            units = 'km/s';
            componentNames = ['vx', 'vy', 'vz'];
        } else if (name == 'mass') {
            result.forEach( (value, index ) => {
                result[index] = value / (5.97219e24);
            })  // from kg to Earth Mass
            unitMultiplier = 5.97219e24;
            units = 'M';
            componentNames = ['m'];
        } else {
            console.log('Units for desired vector not found');
            return [vector,'', 1,''];
        }

        return [result,units,unitMultiplier,componentNames];

    }

    const toggleMODetails = (name) => {
        if (displayedNames.includes(name)) {
            // remove from array
            displayedNames = displayedNames.filter(nameValue => nameValue !== name);

            // remove details div
            document.getElementById(`${name}-planet-details`).remove();

        } else {
            // add to array
            displayedNames.push(name);

            // add details div
            controllerContainer.appendChild(createDetailsDiv(massObjectState.getObjectByName(name)));
        }
    }

    const updateMODetails = () => {
        for(const name of displayedNames) {
            const massObject = massObjectState.getObjectByName(name);
            const detailsDiv = controllerContainer.querySelector(`#${massObject.name}-planet-details`);

            if(massObject && detailsDiv) {
                // position
                const positionColumn = detailsDiv.querySelector('.position-column');
                const posInputs = positionColumn.querySelectorAll('input');
                const [convertedPos,posUnits,posUniMult,posCompNames] = convertUnits(massObject.position,'position'); 

                posInputs.forEach((input, index) => {
                    input.value = convertedPos[index].toFixed(2);
                })

                // velocity
                const velocityColumn = detailsDiv.querySelector('.velocity-column');
                const velInputs = velocityColumn.querySelectorAll('input');
                const [convertedVel,velUnits,velUniMult,velCompNames] = convertUnits(massObject.velocity,'velocity'); 

                velInputs.forEach((input,index) => {
                    input.value = convertedVel[index].toFixed(2);
                })


            } else {
                console.log(`${name} not found among mass objects.`);
            }
        }
    }



    return {
        getDOMelement,
        displayDetails,
        toggleMODetails,
        updateMODetails
    }
})();