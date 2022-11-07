import { canvas } from './simulationPage/canvas/canvas.js';
import { massObjectState } from './massObjectState.js';
import { imageGenerator } from './simulationPage/imageGenerator/imageGenerator.js';

export const displayState = (() => {

    const cameraPosition = {
        center: [1.5e11,0,0],
        basisVectors: [[-0.5,-0.5,0.707106781],[-0.707106781,0.707106781,0],[-0.5,-0.5,-0.707106781]],
        zoom: 1.0,
        distance: 1.5e11
    }

    const animation = {
        run: 'no',
        startTime: 0,
        speed: 1.0,
        timeStep: 1.0,
        stepsPerFrame: 1.0,
        cameraChanged: false
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

        // clear canvas
        canvas.clearCanvas();

        // draw axis
        canvas.drawAxis();

        // update positions
        massObjectState.updatePositions(animation.timeStep);

        // subtract motion of Center Of Mass (COM)
        massObjectState.subtractCOMmovement();

        // center positions around chosen vector
        massObjectState.centerPositions('Origin');

        // project and zoom onto camera plane
        massObjectState.projectZoomShiftPositions();

        // project positions onto plane
        //massObjectState.project2DPositions();

        // apply zoom, check what planets are in frame
        //massObjectState.applyZoom(cameraPosition.zoom);

        // check if in-frame
        massObjectState.updateIsInFrame();

        // update rotation info and projected positions if camera changed
        if(animation.cameraChanged) {

        }

        // if in frame, update rotation info = renders new image data if needed
        //massObjectState.updateRotationInfo();

        //  if in frame, render new positions
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