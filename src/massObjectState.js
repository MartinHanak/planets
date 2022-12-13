import { displayState } from "./displayState.js";
import MassObject from "./massObject.js";
import { imageGenerator } from "./simulationPage/imageGenerator/imageGenerator.js";
import { vectorCalculator } from "./simulationPage/vectorCalculator/vectorCalculator.js";
import { cameraController } from "./simulationPage/canvas/cameraController.js";

export const massObjectState = (() => {

    let massObjects = [];

    let positionDifference = [];
    let distancesSquared = [];
    let forces = [];

    const addObject = (object) => {
        try{
            const massObject = new MassObject(object.name,object.mass,object.position[0], object.position[1], object.position[2],object.velocity[0], object.velocity[1], object.velocity[2]);

            massObjects.push(massObject);
            cameraController.updateCenterSelect();
        } catch {
            console.log("Added mass object is not valid.")
        }
    };

    const removeObject = (name) => {
        if( massObjects.filter(obj => obj.name == name).length > 0 ) {
            massObjects = massObjects.filter(obj => obj.name != name);
        } else {
            throw Error(`Could not find ${name} so it was not removed.`);
        }
    }
 
    const reset = () => {
        massObjects = [];

        positionDifference = [];
        distancesSquared = [];
        forces = [];
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

    // timestep given in days
    const updatePositions = (timeStep) => {

        const timeStepSeconds = timeStep * 24 * 60 * 60;

        // initialize forces = only if it is the first timestep
        if(forces.length === 0) {
            console.log("First forces counted")
            updateForces();
            updateTotalForces();
        }

        // mid-step velocity v(t + dt/2)
        for(let i = 0; i < massObjects.length; i++) {
            massObjects[i].velocity = vectorCalculator.addVectors(massObjects[i].velocity, 
                                       vectorCalculator.multiplyVectorByScalar(massObjects[i].force, timeStepSeconds / (2 * massObjects[i].mass)));
        }

        // new position x(t + dt)
        for(let i = 0; i < massObjects.length; i++) {
            massObjects[i].position = vectorCalculator.addVectors(massObjects[i].position,
                                    vectorCalculator.multiplyVectorByScalar(massObjects[i].velocity, timeStepSeconds));
        }

        // update forces
        updateForces();
        updateTotalForces();

        // update velocity to v(t + dt) from v(t + dt/2)
        for(let i = 0; i < massObjects.length; i++) {
            massObjects[i].velocity = vectorCalculator.addVectors(massObjects[i].velocity, 
                                       vectorCalculator.multiplyVectorByScalar(massObjects[i].force, timeStepSeconds / (2 * massObjects[i].mass)));
        }

    }

    const resetForces = () => {
        forces = [];
    }

    const updateForces = () => {

        const gravitationConstant = 6.6743e-11;

        // initialize if not already
        if(forces.length === 0) {
            for(let i = 0; i < massObjects.length; i++) {
                forces[i] = [];
                positionDifference[i] = [];
                distancesSquared[i] = [];
            }

        }

        for(let i = 0; i < massObjects.length; i++) {
            for(let j = (i + 1); j < massObjects.length; j++ ) {
                positionDifference[i][j] = vectorCalculator.subtractSecondVector(massObjects[i].position, massObjects[j].position);
                distancesSquared[i][j] = vectorCalculator.scalarProduct(positionDifference[i][j], positionDifference[i][j]);

                let prefactor = gravitationConstant * massObjects[i].mass * massObjects[j].mass
                                * Math.pow(distancesSquared[i][j],-1.5);

                forces[i][j] = vectorCalculator.multiplyVectorByScalar(positionDifference[i][j], prefactor);

            }
        }

        // fill in the rest of forces
        for(let i = 0; i < massObjects.length; i++) {
            for(let j = 0; j < (i+1); j++ ) {
                if ( i === j) {
                    forces[i][j] = [0,0,0];
                }
                if ( j < i) {
                    forces[i][j] = vectorCalculator.multiplyVectorByScalar(forces[j][i], -1);
                }

            }
        }
    }

    const updateTotalForces = () => {
        // initialize to 0 vector
        for(let i = 0; i < massObjects.length; i++) {
            massObjects[i].force = [0,0,0];
        }

        for(let i = 0; i < massObjects.length; i++) {
            for(let j = 0; j < massObjects.length; j++) {
                massObjects[i].force = vectorCalculator.addVectors(massObjects[i].force, forces[j][i]);
            }
        }


    }


    const projectZoomShiftPositions = () => {
        for (const massObject of massObjects) {

            let moImageWidth = 0;
            let moImageHeight = 0;
            
            if (massObject.visualInfo.currentImageBitmap) {
                moImageWidth = massObject.visualInfo.currentImageBitmap.width;
                moImageHeight = massObject.visualInfo.currentImageBitmap.height;
            }
            
            // input 0 image dim. here, change in render method
            massObject.projected2DPosition = vectorCalculator.projectScaleZoomShiftVectorOntoCameraPlane(massObject.position, 0, 0);
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

        // assume COM movement subtraction => origin and barycenter is the same
        const centerNameMap = {
            'Origin': [0,0,0],
            'Barycenter' : [0,0,0]
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
        const cameraDist = displayState.getCameraPosition().distance / displayState.getCameraPosition().zoom;
        const cameraDistSquared = cameraDist * cameraDist;

        for(const massObject of massObjects) {

            if(massObject.name == 'Sun') {
                massObject.visualInfo.isInFrame = true;
            } else {

                let moDistSquared = 0;

                for(let i = 0; i < massObject.position.length; i++) {
                    moDistSquared += massObject.position[i] * massObject.position[i]
                }


                if(( moDistSquared < cameraDistSquared && moDistSquared > cameraDistSquared / 32 ) || (moDistSquared < 0.001)) {
                    massObject.visualInfo.isInFrame = true;
                } else {
                    massObject.visualInfo.isInFrame = false;
                }

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
 
   const orderByCameraDist = (cameraPOVvector) => {
        for(const massObject of massObjects) {
            massObject.visualInfo.distanceFromCameraPOV = vectorCalculator.scalarProduct(massObject.position, cameraPOVvector);
        }
        
        massObjects.sort((firstMO, secondMO) => {
            if(firstMO.visualInfo.distanceFromCameraPOV < secondMO.visualInfo.distanceFromCameraPOV) {
                return 1;
            }

            if (firstMO.visualInfo.distanceFromCameraPOV > secondMO.visualInfo.distanceFromCameraPOV) {
                return -1;
            }

            return 0;
        });

        
   }

   const updateValue = (MOname, vectorName, vectorComponentIndex, newValue) => {
        const massObject = getObjectByName(MOname);
        if(massObject) {
            // mass is scalar quantity
            if(vectorName == 'mass') {
                massObject[vectorName] = newValue;
            } else {
                massObject[vectorName][vectorComponentIndex] = newValue;
            }
        } else {
            console.log(`Mass object ${MOname} could not be found.`)
        }
   }

   const updateTrajectories = () => {
        for(const massObject of massObjects) {
            if(massObject.visualInfo.displayTrajectory) {
                massObject.trajectory.push(massObject.position);
            }
        }
   }

   const resetTrajectories = () => {
        for(const massObject of massObjects) {
            massObject.trajectory = [];
        }
   }


    return {
        listObjects,
        getObjects,
        getObjectByName,
        addObject,
        removeObject,
        reset,
        setObjectState,
        updatePositions,
        subtractCOMmovement,
        centerPositions,
        updateIsInFrame,
        updateRotationInfo,
        projectZoomShiftPositions,
        orderByCameraDist,
        updateValue,
        updateTrajectories,
        resetForces,
        resetTrajectories
    };

})();