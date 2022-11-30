import { displayState } from "../../displayState.js";
import { canvas } from "../canvas/canvas.js";


export const vectorCalculator = (() => {

    const projectScaleZoomShiftVectorOntoCameraPlane = (vector, imageWidth = 0, imageHeight = 0) => {

        let resultVector = vector;

        // project from 3D to 2D
        resultVector = projectOntoCameraPlane(resultVector);

        // apply zoom
        resultVector = multiplyVectorByCameraZoom(resultVector);

        // scale from meter to pixels
        resultVector = scaleMeterToPixel(resultVector);

        // shift to canvas coordinate system = DOES NOT INCLUDE the image dimension shift
        resultVector = shiftToCanvasCoor(resultVector);

        if( imageWidth != 0 || imageHeight != 0) {
            resultVector = shiftByHalfImageDim(resultVector, imageWidth, imageHeight);
        }

        return resultVector;
    }


    const projectOntoCameraPlane = (vector) => {

        const cameraVectors = displayState.getCameraPosition().basisVectors;

        let projectedVector = [0,0];

        projectedVector[0] = projectVectorOntoUnitVector(vector, cameraVectors[0]);
        projectedVector[1] = projectVectorOntoUnitVector(vector, cameraVectors[1]);

        return projectedVector;
    }

    const multiplyVectorByCameraZoom = (vector) => {

        const cameraZoom = displayState.getCameraPosition().zoom;

        return multiplyVectorByScalar(vector, cameraZoom);

    }


    const scaleMeterToPixel = (vector) => {
        const canvasDim = canvas.getCanvasDim();

        // 1.5 AU = initial half-width of the canvas
        const pixelPerKm = canvas.getPixelPerMeterRatio();

        return multiplyVectorByScalar(vector, pixelPerKm);
    }

    const shiftToCanvasCoor = (vector) => {
        const [canvasWidth, canvasHeight] = canvas.getCanvasDim();

        let widthShift = canvasWidth / 2 ;
        let heightShift = canvasHeight / 2;

        // x and y are swapped in the canvas compared to camera
        // y canvas dimension has revered direction
        let displayedX = vector[1] + widthShift;
        let displayedY = - vector[0] + heightShift
        
        return [displayedX, displayedY];
    }

    const shiftByHalfImageDim = (vector, imgWidth, imgHeight) => {
        // shift in the canvas coor. system: positive half of the image dim.
        return [vector[0] - imgWidth / 2, vector[1] - imgHeight / 2];
    }

    const projectVectorOntoUnitVector = (vector, unitVector) => {
        let projectionValue = 0;
        for(let i = 0; i < vector.length; i++) {
            projectionValue += vector[i] * unitVector[i];
        }
        
        return projectionValue;

    }

    const scalarProduct = (vec1, vec2) => {

        let scalarVectorProduct = 0;

        for(let i = 0; i < vec1.length; i++) {
            scalarVectorProduct += vec1[i] * vec2[i];
        }
        
        return scalarVectorProduct;
    }

    const addVectors = (vec1, vec2) => {
        let vectorSum = [];

        for(let i = 0; i < vec1.length; i++) {
            vectorSum[i] = vec1[i] + vec2[i];
        }

        return vectorSum;
    }

    const multiplyVectorByScalar = (vector, scalar) => {
        let multipliedVector = [];

        for(let i = 0; i < vector.length; i++) {
            multipliedVector[i] = vector[i] * scalar;
        }

        return multipliedVector;
    }

    const subtractSecondVector = (vec1, vec2) => {
        return addVectors(vec1, multiplyVectorByScalar(vec2, -1));
    }


    return {
        projectScaleZoomShiftVectorOntoCameraPlane,
        projectVectorOntoUnitVector,
        addVectors,
        multiplyVectorByScalar,
        subtractSecondVector,
        scalarProduct
    }

})();