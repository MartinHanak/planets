import { canvas } from './simulationPage/canvas/canvas.js';

export const displayState = (() => {

    const cameraPosition = {
        center: [0,0,0],
        altAziAngles: [0,0],
        distance: 1.0,
    }

    const animation = {
        run: 'no',
        startTime: 0,
        speed: 1.0,
        timeStep: 1.0,
        stepsPerFrame: 10.0,
    }

    const getCameraPosition = () => {
        return cameraPosition;
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
        console.log(timeStamp);

        // update positions

        // render new positions
        canvas.renderMassObjects();

        // request another one 
        if (animation.run == 'yes') {
            window.requestAnimationFrame(createNextFrame);
        }
    }

    return {
        getCameraPosition,
        startAnimation,
        stopAnimation
    }


})();