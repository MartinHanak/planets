import { canvas } from './simulationPage/canvas/canvas.js';
import { massObjectState } from './massObjectState.js';
import { imageGenerator } from './simulationPage/imageGenerator/imageGenerator.js';
import { massObjectInfoController } from './simulationPage/canvas/massObjectInfoController.js';

export const displayState = (() => {

    const cameraPosition = {
        center: 'Barycenter',
        basisVectors: [[-0.5,-0.5,0.707106781],[-0.707106781,0.707106781,0],[-0.5,-0.5,-0.707106781]],
        zoom: 1.0,
        verticalAngle: 135,
        horizontalAngle: 45,
        distance: 3e11,
    }

    const animation = {
        run: false,
        startTime: 0,
        speed: 1.0,
        timeStep: 0.1,
        stepsPerFrame: 1.0,
        cameraChanged: false,
        frameCounter: 0
    }

    const staticImages = {};
    const currentImageData = {};

    const getCameraPosition = () => {
        return cameraPosition;
    }

    const setDisplayState = (cameraPos, animationSettings) => {
        cameraPosition = {...cameraPos};
        animation = {...animationSettings};
    }

    const startAnimation = () => {
        animation.startTime = Date.now();
        animation.run = true;
        massObjectInfoController.updateMODetails();
        window.requestAnimationFrame(createNextFrame);
    }

    const stopAnimation = () => {
        animation.run = false;
        animation.startTime = 0;
        massObjectInfoController.updateMODetails();
    }

    const toggleAnimation = () => {
        massObjectInfoController.updateMODetails();
        if (animation.run) {
            animation.run = false;
        } else {
            animation.run = true;
            createNextFrame();
        }
    }

    const createNextFrame = (timeStamp, move = true) => {
        // check fps
        //  console.log(timeStamp);

        // clear canvas
        canvas.clearCanvas();

        // draw axis
        canvas.drawAxis();

        if(move) {
            // update positions
            massObjectState.updatePositions(animation.timeStep);
        

            // subtract motion of Center Of Mass (COM)
            massObjectState.subtractCOMmovement();

        }

         // center positions around chosen vector
         massObjectState.centerPositions(cameraPosition.center);

        // project and zoom onto camera plane
        massObjectState.projectZoomShiftPositions();

        // project positions onto plane
        //massObjectState.project2DPositions();

        // apply zoom, check what planets are in frame
        //massObjectState.applyZoom(cameraPosition.zoom);

        // check if in-frame
        massObjectState.updateIsInFrame();

        // if in frame, update rotation info = renders new image data if needed
        //massObjectState.updateRotationInfo();

        //  if in frame, render new positions
        canvas.renderMassObjects();

        // render trajectory
        canvas.renderTrajectories();

        // update frame counter
        animation.frameCounter += 1;

        if(move) {
            // update MO every 60 frames
            if(animation.frameCounter % 60 === 0) {
                massObjectInfoController.updateMODetails();
            }

            // update trajectory every 30 frames
            if(animation.frameCounter % 60 === 0) {
                massObjectState.updateTrajectories();
            }
        }

        // request another one 
        if (animation.run == true) {
            window.requestAnimationFrame(createNextFrame);
        }
    }

    const createNextFrameWithoutMoving = (timeStamp) => {
        createNextFrame(timeStamp,false);
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


    const updateCameraPosition = (horizontalAngle, verticalAngle) => {
        cameraPosition.horizontalAngle = horizontalAngle;
        cameraPosition.verticalAngle = verticalAngle;
        cameraPosition.basisVectors = convertAnglesToBasisVectors(horizontalAngle, verticalAngle);
    }

    const updateCameraZoom = (zoomValue) => {
        cameraPosition.zoom = zoomValue;
    }

    const convertAnglesToBasisVectors = (horizontalAngle, verticalAngle) => {
        // angle horizontalAngle = 0 and verticalAngle = 0 corresponds to  top-down view
        // camera angles in this situations are: u_x = [-1, 0, 0], u_y = [0,1,0], u_z = [0, 0, -1 ]
        // rotate around y-axis by verticalAngle
        // then rotate around z-axis by horizontalAngle

        /*
        let vecX = [-1.0, 0, 0];
        let vecY = [0, 1.0, 0];
        let vecZ = [0, 0, -1.0];

        // rotation around y-axis
        let vertCos = Math.cos(verticalAngle * Math.PI / 180);
        let vertSin = Math.sin(verticalAngle * Math.PI / 180);

        vecX = [-vertCos, 0, vertSin];
        vecZ = [-vertSin, 0, - vertCos];

        // rotation aroun z-axis

        */

        let vertCos = Math.cos(-verticalAngle * Math.PI / 180);
        let vertSin = Math.sin(-verticalAngle * Math.PI / 180);

        let horCos = Math.cos(horizontalAngle * Math.PI / 180);
        let horSin = Math.sin(horizontalAngle * Math.PI / 180);

        let vecX = [horCos * vertCos,  horSin * vertCos, -vertSin];
        let vecY = [-horSin, horCos, 0];
        let vecZ = [horCos * vertSin,  horSin * vertSin, vertCos];

        return [vecX, vecY, vecZ];
    }

    const getAnimationState = () => {
        return animation;
    }

    const getAnimationSettings = () => {
        return animation;
    }

    const updateTimestep = (timestep) => {
        animation.timeStep = timestep;
    }

    const updateCameraCenter = (centerName) => {
        cameraPosition.center = centerName;
    }

    return {
        createNextFrame,
        getCameraPosition,
        setDisplayState,
        startAnimation,
        stopAnimation,
        toggleAnimation,
        updateStaticImages,
        getStaticImages,
        updateCurrentImageData,
        getCurrentImageData,
        updateCameraPosition,
        updateCameraZoom,
        updateTimestep,
        getAnimationState,
        getAnimationSettings,
        createNextFrameWithoutMoving,
        updateCameraCenter
    }


})();