import { displayState } from "../../displayState.js";
import { massObjectState } from "../../massObjectState.js";
import { imageGenerator } from "../imageGenerator/imageGenerator.js";
import { vectorCalculator } from "../vectorCalculator/vectorCalculator.js";

import { cameraController } from "./cameraController.js";
import { simulationController } from "./simulationController.js";
import { massObjectInfoController } from "./massObjectInfoController.js";

export const canvas = (() => {
    const domCanvas = document.createElement('canvas');
    domCanvas.classList.add('main-canvas-display');
    domCanvas.classList.add('hidden');


    // have to be set explicitly, otherwise drawImage dimensions get weird
    domCanvas.height = 500;
    domCanvas.width = 500;

    const ctx = domCanvas.getContext('2d');


    // event listeners
    domCanvas.addEventListener('click', (e) => {
        // check if any planet is close to the click
        const massObjects = massObjectState.getObjects();
        const canvasBounds = domCanvas.getBoundingClientRect();

        // click coordinates relative to canvas start (top left corner)
        let clickX = e.clientX - canvasBounds.left;
        let clickY = e.clientY - canvasBounds.top;

        for(const massObject of massObjects) {
            // placeholder: all in-frame
            if(massObject.visualInfo.isInFrame 
                && isVectorWithinDisplayedObject([clickX, clickY],massObject.projected2DPosition,massObject.visualInfo.displayedRadius)
                ) {
                // MO details
                massObjectInfoController.toggleMODetails(massObject.name);

                // MO name
                if(massObject.visualInfo.displayName) {
                    massObject.visualInfo.displayName = false;
                } else {
                    massObject.visualInfo.displayName = true;
                }

                // trajectory toggle
                if(massObject.visualInfo.displayTrajectory) {
                    massObject.visualInfo.displayTrajectory = false;
                    massObject.trajectory = [];
                } else {
                    massObject.visualInfo.displayTrajectory = true;
                }
            }
        }

    })

    // camera angle position change
    domCanvas.addEventListener('mousedown', (e) => {
        domCanvas.addEventListener('mousemove', handleMouseMove);
    });
    domCanvas.addEventListener('mouseup', (e) => {
        domCanvas.removeEventListener('mousemove',handleMouseMove);

        // update images
        imageGenerator.updateCurrentImageData()
        .then(results =>{
            imageGenerator.updateCurrentImageBitmap();

            if(!displayState.getAnimationSettings().run) {
                displayState.createNextFrameWithoutMoving();
            }
        });

    });

    function handleMouseMove(event) {
        let horizontalAngleChange = -event.movementX;
        let verticalAngleChange = event.movementY;

        let originalHorizontalAngle = displayState.getCameraPosition().horizontalAngle;
        let originalVerticalAngle = displayState.getCameraPosition().verticalAngle;

        let newHorizontalAngle = Math.max(Math.min(0, originalHorizontalAngle + horizontalAngleChange), 360);
        let newVerticalAngle = Math.max(Math.min(0,originalVerticalAngle + verticalAngleChange), 180);


        // update camera
        displayState.updateCameraPosition(newHorizontalAngle,newVerticalAngle);
        if(!displayState.getAnimationSettings().run) {
            displayState.createNextFrameWithoutMoving();
        }
        cameraController.updateCameraControllers();

    }



    // methods

    const toggleDisplay = () => {
        domCanvas.classList.remove('hidden');
    };

    const createCanvas = () => {
        const main = document.querySelector('main');

        // TODO: reslace canvas here depending on the device
        //domCanvas.width = 200;
        //domCanvas.height = 200;

        main.appendChild(domCanvas);
        toggleDisplay();


        preloadAllImages(["Sun_texture.jpg", "Mercury_texture.jpg", "Venus_texture.jpg", "Earth_texture.jpg", "Mars_texture.jpg", "Jupiter_texture.jpg", "Saturn_texture.jpg", "Uranus_texture.jpg", "Neptune_texture.jpg", "Pluto_texture.jpg", "Default_texture.jpg",])
            .then(results => {

                const newStaticImages = {};
                const names = ["SunTexture", "MercuryTexture", "VenusTexture", "EarthTexture", "MarsTexture", "JupiterTexture", "SaturnTexture", "UranusTexture", "NeptuneTexture", "PlutoTexture", "DefaultTexture",];

                let index = 0;
                for (const name of names) {
                    newStaticImages[name] = results[index];
                    index += 1;
                }

                displayState.updateStaticImages(newStaticImages);
                imageGenerator.initializeTextureImageData();
                return imageGenerator.updateCurrentImageData();
            }).then(results => {
                imageGenerator.updateCurrentImageBitmap();
            })
            .catch(err => console.log(err));
    }

    const createCanvasControllers = () => {
        const main = document.querySelector('main');
        const controllersAside = document.createElement('aside');

        const controllers = [simulationController, cameraController, massObjectInfoController];
        let controllersDOMArray = [];

        for (const controller of controllers){
            controllersDOMArray.push(controller.getDOMelement())
        }

        for(const controller of controllersDOMArray) {
            controllersAside.appendChild(controller);
        }

        main.appendChild(controllersAside);
    }

    const getCanvasDim = () => {
        return [domCanvas.width, domCanvas.height];
    }

    // render planets based on massObjectState and displayState
    const renderMassObjects = () => {
        const images = displayState.getStaticImages();
        const cameraVectors = displayState.getCameraPosition().basisVectors;
        /*
        for (const name in images) {
            renderImage(images[name], [250,0],0.2);
        }
        */

        // order massobjects array given the camera POV
        massObjectState.orderByCameraDist(cameraVectors[2]);

        const massObjects = massObjectState.getObjects();

        //const canvasWidth = domCanvas.width;
        //const canvasHeight = domCanvas.height;


        // 1.5 AU = initial half-width of the canvas
        //const pixelPerKm = canvasWidth / (2* 224396806 * 1000);

        for (const massObject of massObjects) {
            let moBitmap = massObject.visualInfo.currentImageBitmap;

            if (moBitmap != null && massObject.visualInfo.isInFrame) {
                // display name
                if(massObject.visualInfo.displayName) {
                    // assume center position text
                    let bottomPadding = 2;
                    let textPositionX = massObject.projected2DPosition[0]; //- massObject.visualInfo.displayedRadius;
                    let textPositionY = massObject.projected2DPosition[1] - massObject.visualInfo.displayedRadius - bottomPadding;

                    ctx.fillStyle = 'black';
                    ctx.font = 'bold 16px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(massObject.name,textPositionX, textPositionY);
                }

                let diameter = massObject.visualInfo.radius * 2 * displayState.getCameraPosition().zoom;

                massObject.visualInfo.displayedRadius = massObject.visualInfo.radius * displayState.getCameraPosition().zoom;
                //let baseDiameter = 250;
                //let diameter = baseDiameter * massObject.visualInfo.radius * displayState.getCameraPosition().zoom;

                let displayedX = (massObject.projected2DPosition[0] - diameter /2);
                let displayedY = (massObject.projected2DPosition[1] - diameter /2);

                ctx.drawImage(moBitmap, displayedX, displayedY, diameter, diameter);
            }
        }

        console.log("rendering");
    }

    const renderTrajectories = ( ) => {
        const massObjects = massObjectState.getObjects();

        for(const massObject of massObjects) {
            if(massObject.visualInfo.isInFrame && massObject.visualInfo.displayTrajectory) {
                for(const posVector of massObject.trajectory) {
                    let vector2D = vectorCalculator.projectScaleZoomShiftVectorOntoCameraPlane(posVector);

                    // check if trajectory point is within any of the displayed planets
                    let obstructingObjects = getObstructingObjects(vector2D);

                    if(obstructingObjects.length > 0) {
                        // assume ordered array = last object is the deciding factor

                        const obstructingMO = massObjectState.getObjectByName(obstructingObjects[obstructingObjects.length - 1]);
                        const cameraVectors = displayState.getCameraPosition().basisVectors;

                        let moCameraDist = vectorCalculator.scalarProduct(obstructingMO.position,cameraVectors[2]);
                        let trajectoryCameraDist = vectorCalculator.scalarProduct(posVector,cameraVectors[2]);

                        if(moCameraDist > trajectoryCameraDist) {
                            renderPoint(posVector);
                        }
                    } else {
                        renderPoint(posVector);
                    }
                }
            }
        }
    }

    const isVectorWithinDisplayedObject = (test2dVector, mo2dPosition, moRadius) => {
        let result = false;
        if(Math.abs(test2dVector[0] - mo2dPosition[0]) <= moRadius && Math.abs(test2dVector[1] - mo2dPosition[1]) <= moRadius) {
            result = true;
        }
        return result;
    }

    const getObstructingObjects = (test2dVector) => {
        let result = [];
        const massObjects = massObjectState.getObjects();

        for(const massObject of massObjects) { 
            if(massObject.visualInfo.isInFrame && isVectorWithinDisplayedObject(test2dVector,massObject.projected2DPosition,massObject.visualInfo.displayedRadius)) {
                result.push(massObject.name);
            }
        }

        return result;
    }

    const clearCanvas = () => {
        ctx.clearRect(0, 0, domCanvas.width, domCanvas.height);
    }

    const drawAxis = () => {

        renderPlaneGrid( );
    }

    const getPixelPerMeterRatio = () => {
        // canvas width in pixels = 3 times AU in meters (initial Earth distance from the Sun)
        return domCanvas.width / (4.5e11);
    }

    const renderLineFrom3DCoor = (startVector, endVector) => {

        let start2Dvector = vectorCalculator.projectScaleZoomShiftVectorOntoCameraPlane(startVector);
        let end2Dvector = vectorCalculator.projectScaleZoomShiftVectorOntoCameraPlane(endVector);

        ctx.beginPath();
        ctx.moveTo(...start2Dvector);
        ctx.lineTo(...end2Dvector);
        ctx.strokeStyle = `rgb(200,200,200)`;
        ctx.lineWidth = 1;
        ctx.stroke();

    }

    // assumes XY plane
    const renderPlaneGrid = () => {
        const ratio = canvas.getPixelPerMeterRatio();

        let zoomedDistance =  (domCanvas.width / ratio) / displayState.getCameraPosition().zoom;
        let baseDistance = domCanvas.width / ratio;

        let minimumLineDist = baseDistance / (10 - 1);
        let maximumLineNumber = 7;

        let lineDist = minimumLineDist;
        let lineNumber = zoomedDistance / minimumLineDist;
        let multiplier = 1.0;
        // if over maximum
        if(lineNumber > maximumLineNumber) {
            multiplier = Math.ceil(lineNumber / maximumLineNumber);
            lineNumber = Math.round(maximumLineNumber / 2) + (lineNumber % maximumLineNumber);
            lineDist = lineDist * multiplier;
        }
        // always odd number
         if(lineNumber % 2 === 0) {
            lineNumber += 1;
        }

        // grid lines

        let lineLength = (lineNumber ) * lineDist;

        let start3Dcoor = [];
        let end3Dcoor = [];

        // lines parallel to y
        // always include middle line
        let middleYStart = [0, lineLength/2, 0];
        let middleYEnd = [0, - lineLength/2, 0];

        start3Dcoor.push(middleYStart);
        end3Dcoor.push(middleYEnd);

        for (let i = 1; i < lineNumber / 2; i++) {
            // positive dir
            let new3DStart = [i * lineDist, lineLength/2, 0];
            let new3DEnd = [i * lineDist, -lineLength/2, 0];
            start3Dcoor.push(new3DStart);
            end3Dcoor.push(new3DEnd);

            // negative dir
            new3DStart = [-i * lineDist, lineLength/2, 0];
            new3DEnd = [-i * lineDist, -lineLength/2, 0];

            start3Dcoor.push(new3DStart);
            end3Dcoor.push(new3DEnd);
        }

        // lines parallel to x
        let middleXStart = [lineLength/2, 0, 0];
        let middleXEnd = [-lineLength/2, 0, 0];
        start3Dcoor.push(middleXStart);
        end3Dcoor.push(middleXEnd);

        for (let i = 1; i < lineNumber / 2; i++) {
            // positive dir
            let new3DStart = [lineLength/2, i * lineDist, 0];
            let new3DEnd = [- lineLength/2, i * lineDist, 0];
            start3Dcoor.push(new3DStart);
            end3Dcoor.push(new3DEnd);

            // negative dir
            new3DStart = [lineLength/2, -i * lineDist, 0];
            new3DEnd = [-lineLength/2, -i * lineDist, 0];

            start3Dcoor.push(new3DStart);
            end3Dcoor.push(new3DEnd);
        }


        // render all lines

        for(let i = 0; i < start3Dcoor.length; i++) {
            renderLineFrom3DCoor(start3Dcoor[i], end3Dcoor[i]);
        }
        

        // distance value = 1st square in the positive x and y axis direction
        let textContent = `${Number(lineDist / 149597870691).toFixed(1)} AU`; // units = AU

        let textPositionXaxis = vectorCalculator.projectScaleZoomShiftVectorOntoCameraPlane([lineDist, 0, 0]);
        let textPositionYaxis = vectorCalculator.projectScaleZoomShiftVectorOntoCameraPlane([0, lineDist, 0]);

        let bottomPadding = 8;
        ctx.fillStyle = 'black';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(textContent, textPositionXaxis[0], textPositionXaxis[1] - bottomPadding);
        //ctx.fillText(textContent, textPositionYaxis[0], textPositionYaxis[1] - bottomPadding);
                

    }

    const renderPoint = (vector) => {
        const baseRadius = 3;
        let vector2D = vectorCalculator.projectScaleZoomShiftVectorOntoCameraPlane(vector);
        ctx.beginPath();
        ctx.arc(vector2D[0], vector2D[1], baseRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
    }

    const render2Dpoint = (vector2D) => {
        const baseRadius = 3;
        ctx.beginPath();
        ctx.arc(vector2D[0], vector2D[1], baseRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
    }


    const preloadImage = (imgSrc) => {
        const img = new Image();
        img.src = `/assets/${imgSrc}`;
        return new Promise((resolve, reject) => {
            img.addEventListener("load", () => {
                resolve(img);
            })
        });
    }

    const preloadAllImages = (imgSrcArray) => {
        const imgPromiseArray = [];

        for (const imgSrc of imgSrcArray) {
            imgPromiseArray.push(preloadImage(imgSrc));
        }
        console.log("loading images")
        return Promise.all(imgPromiseArray);
    }

    // center and size are expected to be arrays with 2 numbers
    const renderImage = (img, center, sizeFactor) => {

        // coordinates of the top left image corner
        const x = Math.round(center[0] - img.naturalWidth * sizeFactor / 2);
        const y = Math.round(center[1] - img.naturalHeight * sizeFactor / 2);

        //ctx.drawImage(img, 0, 0, 100, 100, x, y, 100, 100);
        //console.log(img);
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, x, y, img.naturalWidth * sizeFactor, img.naturalHeight * sizeFactor);
    }


    return {
        createCanvas,
        createCanvasControllers,
        getCanvasDim,
        toggleDisplay,
        renderMassObjects,
        clearCanvas,
        drawAxis,
        getPixelPerMeterRatio,
        renderTrajectories,
    }

})();