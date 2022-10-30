import { canvas } from './simulationPage/canvas/canvas.js';

export const displayState = (() => {

    const cameraPosition = {
        center: [10,0,0],
        basisVectors: [[-0.5,-0.5,0.707106781],[-0.707106781,0.707106781,0],[-0.5,-0.5,-0.707106781]]
    }

    const animation = {
        run: 'no',
        startTime: 0,
        speed: 1.0,
        timeStep: 1.0,
        stepsPerFrame: 10.0,
    }

    const staticImages = {};
    const currentImageData = {};

    const getCameraPosition = () => {
        return cameraPosition;
    }

    const getAnimationSettings = () => {
        return animation;
    }

    const setDisplayState = (cameraPos, animationSettings) => {
        cameraPosition = {...cameraPos};
        animation = {...animationSettings};
    }

    const startAnimation = () => {
        animation.startTime = Date.now();
        animation.run = 'yes';
        window.requestAnimationFrame(createNextFrame);
    }

    const stopAnimation = () => {
        animation.run = 'no';
        animation.startTime = 0;
    }

    const createNextFrame = (timeStamp) => {
        // check fps
        // console.log(timeStamp);

        // update positions

        // render new positions
        canvas.renderMassObjects();

        // request another one 
        if (animation.run == 'yes') {
            window.requestAnimationFrame(createNextFrame);
        }
    }

    // input = array of objects {Earth: imgObjEarth, ...}
    const updateStaticImages = (namedImgObjects) => {
        for (const name in namedImgObjects) {
            staticImages[name] = namedImgObjects[name];
        }
    }

    const getStaticImages = () => {
        return staticImages;
    }

    const updateCurrentImageData = (namedImgData) => {
        for (const name in namedImgData) {
            currentImageData[name] = namedImgData[name];
        }
    }
    
    const getCurrentImageData = () => {
        return currentImageData;
    }

    return {
        getCameraPosition,
        getAnimationSettings,
        setDisplayState,
        startAnimation,
        stopAnimation,
        updateStaticImages,
        getStaticImages,
        updateCurrentImageData,
        getCurrentImageData
    }


})();