import { displayState } from "./displayState.js";
import MassObject from "./massObject.js";
import { imageGenerator } from "./simulationPage/imageGenerator/imageGenerator.js";
import { vectorCalculator } from "./simulationPage/vectorCalculator/vectorCalculator.js";

export const massObjectState = (() => {

    let massObjects = [];

    const addObject = (object) => {
        if ( object instanceof MassObject) {
            massObjects.push(object);
        } else {
            throw Error('Added mass object is not a valid MassObject.');
        }
    };

    const removeObject = (name) => {
        if( massObjects.filter(obj => obj.name == name).length > 0 ) {
            massObjects = massObjects.filter(obj => obj.name != name);
        } else {
            throw Error(`Could not find ${name} so it was not removed.`);
        }
    }

    const listObjects = () => {
        console.log(massObjects);
    }

    const getObjects = () => {
        return massObjects;
    }

    const getObjectByName = (name) => {
        let desiredMassObject;
        
        for (const massObject of massObjects) { 
            if (massObject.name === name) {
                desiredMassObject = massObject;
                break;
            }
        }

        return desiredMassObject;
    }

    const setObjectState = (massObjectArray) => {
        massObjects = [...massObjectArray];
    }


    const updatePositions = (timeStep) => {

    }


    const projectZoomShiftPositions = () => {
        for (const massObject of massObjects) {

            let moImageWidth = 0;
            let moImageHeight = 0;
            
            if (massObject.visualInfo.currentImageBitmap) {
                moImageWidth = massObject.visualInfo.currentImageBitmap.width;
                moImageHeight = massObject.visualInfo.currentImageBitmap.height;
            }
            
            massObject.projected2DPosition = vectorCalculator.projectScaleZoomShiftVectorOntoCameraPlane(massObject.position, moImageWidth, moImageHeight);
        }
    }

    const subtractCOMmovement = () => {
        let totalMass = 0;
        let COMposition = [0,0,0];
 
        for (const massObject of massObjects) {
            totalMass += massObject.mass;
            COMposition = vectorCalculator.addVectors(COMposition, vectorCalculator.multiplyVectorByScalar(massObject.position, massObject.mass))
        }
        COMposition = vectorCalculator.multiplyVectorByScalar(COMposition, 1/totalMass);

        // subtract from all positions in the simulation
        for (const massObject of massObjects) {
            massObject.position = vectorCalculator.subtractSecondVector(massObject.position, COMposition);
        }
    }

    const centerPositions = (centerName) => {

        let centerVector;

        const centerNameMap = {
            'Origin': [0,0,0]
        }

        if(centerName in centerNameMap) {

            centerVector = centerNameMap[centerName];

        } else if (getObjectByName(centerName)) {

            centerVector = getObjectByName(centerName).position;

        } else {
            console.log(`Could not find desired center: ${centerName}`);

            centerVector = [0,0,0];

        }

        // express all positions as if coming from the centerVector
        for(const massObject of massObjects) {
            massObject.position = vectorCalculator.subtractSecondVector(massObject.position, centerVector);
        }


    }


    const updateIsInFrame = () => {
        const cameraDist = displayState.getCameraPosition().distance;
        const cameraDistSquared = cameraDist * cameraDist;

        for(const massObject of massObjects) {
            let moDistSquared = 0;

            for(let i = 0; i < massObject.position.length; i++) {
                moDistSquared += massObject.position[i] * massObject.position[i]
            }

            if( moDistSquared < cameraDistSquared) {
                massObject.visualInfo.isInFrame = true;
            }
            
        }
    }

    const updateRotationInfo = () => {

        for(const massObject of massObjects) {
            if (massObject.visualInfo.isInFrame) {

                massObject.rotationInfo.elapsedFrames += 1;

                if (massObject.rotationInfo.elapsedFrames > massObject.rotationInfo.framesWithoutRotation) {
                    massObject.rotationInfo.currentAngle += massObject.rotationInfo.nextAngleStep;
                    massObject.rotationInfo.elapsedFrames = 0;

                    // update planet image
                    massObject.visualInfo.nextFrameImageData = imageGenerator.getNextFrameImageData(massObject.name)
                    .then(newImageData => {
                        massObject.visualInfo.currentImageData = newImageData;
                        massObject.visualInfo.nextFrameImageData = null;
                        massObject.visualInfo.nextFrameImageBitmap = createImageBitmap(newImageData);
                        return massObject.visualInfo.nextFrameImageBitmap;
                    })
                    .then(bitmap => {
                        massObject.visualInfo.currentImageBitmap = bitmap;
                        massObject.visualInfo.nextFrameImageBitmap = null;
                    })
                    .catch(err => console.log(`Error while updating mass object image: ${err}`));
                }

            }
        }
    }
 
   

    return {
        listObjects,
        getObjects,
        getObjectByName,
        addObject,
        removeObject,
        setObjectState,
        updatePositions,
        subtractCOMmovement,
        centerPositions,
        updateIsInFrame,
        updateRotationInfo,
        projectZoomShiftPositions
    };

})();