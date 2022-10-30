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

    const setObjectState = (massObjectArray) => {
        massObjects = [...massObjectArray];
    }

    return {
        listObjects,
        getObjects,
        addObject,
        removeObject,
        setObjectState
    };

})();