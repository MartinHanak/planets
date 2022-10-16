export const canvas = (() => {
    const domCanvas = document.createElement('canvas');
    domCanvas.classList.add('main-canvas-display');
    domCanvas.classList.add('hidden');

    const ctx = domCanvas.getContext('2d');

    const toggleDisplay = () => {
        domCanvas.classList.toggle('hidden');
    };

    const createCanvas = () => {
        const main = document.querySelector('main');
        main.appendChild(domCanvas);
        toggleDisplay();
    }

    // render planets based on massObjectState and displayState
    const renderMassObjects = () => {
        console.log('rendering');
        renderImage('Earth.png',[100,100],[50,50]);
    }

    // PRIVATE METHODS

    // center and size are expected to be arrays with 2 numbers
    const renderImage = (src, center, size) => {
        const img = new Image();
        img.src = '/assets/' + src;

        // coordinates of the top left image corner
        const x = Math.round(center[0] - size[0] / 2);
        const y = Math.round(center[1] - size[1] / 2);

        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, x, y, size[0], 25);
        console.log(`${img.width} and ${img.height}`)
        console.log(`${x} and ${y}`)
        console.log(`${size[0]} and ${size[1]}`)
    }

    return {
        createCanvas,
        toggleDisplay,
        renderMassObjects,
    }

})();