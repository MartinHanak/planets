import { displayState } from "../../displayState.js";
import { imageGenerator } from "../imageGenerator/imageGenerator.js";

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


        preloadAllImages(["Earth_texture.jpg"])
        .then(results => {

            const newStaticImages = {};
            const names = ["EarthTexture"];

            let index = 0;
            for (const name of names) {
                newStaticImages[name] = results[index];
                index += 1;
            }

            displayState.updateStaticImages(newStaticImages);
        })
        .then( results => {
            imageGenerator.initializeTextureImageData();
        })
        .then( results => {
            imageGenerator.updateCurrentImageData(["Earth"]);
        })
        .catch(err => console.log(err));
    }

    // render planets based on massObjectState and displayState
    const renderMassObjects = () => {
        const images = displayState.getStaticImages();
        const imageData = displayState.getCurrentImageData();
/*
        for (const name in images) {
            renderImage(images[name], [250,0],0.2);
        }
        */

        for (const name in imageData) {
            ctx.putImageData(imageData[name],-250,0);
        }
        console.log("rendering");
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
        toggleDisplay,
        renderMassObjects,
    }

})();