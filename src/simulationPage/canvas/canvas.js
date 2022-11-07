import { displayState } from "../../displayState.js";
import { massObjectState } from "../../massObjectState.js";
import { imageGenerator } from "../imageGenerator/imageGenerator.js";
import { vectorCalculator } from "../vectorCalculator/vectorCalculator.js";

export const canvas = (() => {
    const domCanvas = document.createElement('canvas');
    domCanvas.classList.add('main-canvas-display');
    domCanvas.classList.add('hidden');


    // have to be set explicitly, otherwise drawImage dimensions get weird
    domCanvas.height = 500;
    domCanvas.width = 500;

    const ctx = domCanvas.getContext('2d');

    const toggleDisplay = () => {
        domCanvas.classList.toggle('hidden');
    };

    const createCanvas = () => {
        const main = document.querySelector('main');

        // TODO: reslace canvas here depending on the device
        //domCanvas.width = 200;
        //domCanvas.height = 200;

        main.appendChild(domCanvas);
        toggleDisplay();


        preloadAllImages(["Sun_texture.jpg","Mercury_texture.jpg","Venus_texture.jpg","Earth_texture.jpg","Mars_texture.jpg","Jupiter_texture.jpg","Saturn_texture.jpg","Uranus_texture.jpg","Neptune_texture.jpg","Pluto_texture.jpg","Default_texture.jpg",])
        .then(results => {

            const newStaticImages = {};
            const names = ["SunTexture","MercuryTexture","VenusTexture","EarthTexture","MarsTexture","JupiterTexture","SaturnTexture","UranusTexture","NeptuneTexture","PlutoTexture","DefaultTexture",];

            let index = 0;
            for (const name of names) {
                newStaticImages[name] = results[index];
                index += 1;
            }

            displayState.updateStaticImages(newStaticImages);
            imageGenerator.initializeTextureImageData();
            return imageGenerator.updateCurrentImageData();
        }).then( results => {
            imageGenerator.updateCurrentImageBitmap();
        })
        .catch(err => console.log(err));
    }

    const getCanvasDim = () => {
        return [domCanvas.width, domCanvas.height];
    }

    // render planets based on massObjectState and displayState
    const renderMassObjects = () => {
        const images = displayState.getStaticImages();
        /*
        for (const name in images) {
            renderImage(images[name], [250,0],0.2);
        }
        */
        const massObjects = massObjectState.getObjects();

        //const canvasWidth = domCanvas.width;
        //const canvasHeight = domCanvas.height;


        // 1.5 AU = initial half-width of the canvas
        //const pixelPerKm = canvasWidth / (2* 224396806 * 1000);

        for (const massObject of massObjects) {
            let moBitmap = massObject.visualInfo.currentImageBitmap;

            if(moBitmap != null && massObject.visualInfo.isInFrame) {

                let displayedX = (massObject.projected2DPosition[0] ) ;
                let displayedY = (massObject.projected2DPosition[1] ) ;

                ctx.drawImage(moBitmap,displayedX,displayedY);
            }
        }

        console.log("rendering");
    }

    const clearCanvas = () => {
        ctx.clearRect(0,0,domCanvas.width, domCanvas.height);
    }

    const drawAxis = () => {
        const ratio = canvas.getPixelPerMeterRatio();
        

        let position3DKm = [domCanvas.width / (2 * ratio),0,0];
        let radius = 10;
        let width = 20;
        let projectedPos = vectorCalculator.projectScaleZoomShiftVectorOntoCameraPlane(position3DKm,width, width);
        ctx.beginPath();
        ctx.arc(projectedPos[0], projectedPos[1], radius, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();

        position3DKm = [0,domCanvas.width / (2 * ratio),0];
        radius = 10;
        width = 20;
        projectedPos = vectorCalculator.projectScaleZoomShiftVectorOntoCameraPlane(position3DKm,width, width);
        ctx.beginPath();
        ctx.arc(projectedPos[0], projectedPos[1], radius, 0, Math.PI * 2);
        ctx.fill();

        position3DKm = [0,0,domCanvas.width / (2 * ratio)];
        radius = 10;
        width = 20;
        projectedPos = vectorCalculator.projectScaleZoomShiftVectorOntoCameraPlane(position3DKm,width, width);
        ctx.beginPath();
        ctx.arc(projectedPos[0], projectedPos[1], radius, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFF00";
        ctx.fill();

        position3DKm = [0,0,0];
        radius = 10;
        width = 20;
        projectedPos = vectorCalculator.projectScaleZoomShiftVectorOntoCameraPlane(position3DKm,width, width);
        ctx.beginPath();
        ctx.arc(projectedPos[0], projectedPos[1], radius, 0, Math.PI * 2);
        //ctx.fillStyle = "#0000FF";
        ctx.fill();
    }

    const getPixelPerMeterRatio = () => {
        // canvas width in pixels = 3 times AU in meters (initial Earth distance from the Sun)
        return domCanvas.width / ( 4.5e11 );
    }

    // PRIVATE METHODS

    const preloadImage = (imgSrc) => {
        const img = new Image ();
        img.src = `/assets/${imgSrc}`;
        return new Promise((resolve,reject) => {
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
        ctx.drawImage(img,0,0, img.naturalWidth, img.naturalHeight,x,y,img.naturalWidth*sizeFactor,img.naturalHeight*sizeFactor);
    }


    return {
        createCanvas,
        getCanvasDim,
        toggleDisplay,
        renderMassObjects,
        clearCanvas,
        drawAxis, 
        getPixelPerMeterRatio
    }

})();