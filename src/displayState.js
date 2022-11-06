import { canvas } from './simulationPage/canvas/canvas.js';
import { massObjectState } from './massObjectState.js';
import { imageGenerator } from './simulationPage/imageGenerator/imageGenerator.js';

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

        // update rotation info if camera changed
        if(animation.cameraChanged) {

        }

        // update positions

        // check if in-frame
        updateIsInFrame();

        // if in frame, update rotation info = renders new image data if needed
        updateRotationInfo();

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

    const updateIsInFrame = () => {
        const massObjects = massObjectState.getObjects();

        for(const massObject of massObjects) {
            if(massObject.name === "Earth") {
                massObject.visualInfo.isInFrame = true;
            }
        }
    }

    const updateRotationInfo = () => {
        const massObjects = massObjectState.getObjects();

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
                    });
                }

            }
        }
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