import MassObject from "./massObject.js";

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

    const updateRotationInfo = () => {
        for (const massObject of massObjects) {
            massObject.updateRotationInfo();
        }
    }

    return {
        listObjects,
        getObjects,
        getObjectByName,
        addObject,
        removeObject,
        setObjectState
    };

})();