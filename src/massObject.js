import { displayState } from "./displayState.js";

export default class MassObject {
    constructor(name,mass,x,y,z,vx,vy,vz) {
        this.name = name;
        this.mass = mass; // kg 
        this.position = [x,y,z]; // m 
        this.velocity = [vx,vy,vz]; // m/sec 
        this.rotationInfo = getMassObjectRotationInfo(name);
        this.visualInfo =  getMassObjectVisualInfo(name);
        this.projected2DPosition = [null, null];
    }

    updateRotationInfo() {
        const cameraVectors = displayState.getCameraPosition().basisVectors;

        // update
    }
}


function getMassObjectRotationInfo(name) {

    const infoObjectMap = {
        'Sun' : {
            rotationAngleDeg: 0, // degrees
            rotationDirection: 1,   // compared to Earth rot.
            rotationSpeed: 1/25,        // in days
            rotationVector: null,
            rotationVectorProjectionLength: 0,
            currentAngle: 0,
            nextAngleStep: 1,
            framesWithoutRotation: 10,
            elapsedFrames: 0
        },
        'Mercury' : {
            rotationAngleDeg: 2, // degrees
            rotationDirection: 1,   // compared to Earth rot.
            rotationSpeed: 1/176,        // in days
            rotationVector: null,
            rotationVectorProjectionLength: 0,
            currentAngle: 0,
            nextAngleStep: 1,
            framesWithoutRotation: 10,
            elapsedFrames: 0
        },
        'Venus' : {
            rotationAngleDeg: 177, // degrees
            rotationDirection: -1,   // compared to Earth rot.
            rotationSpeed: 1/242,        // in days
            rotationVector: null,
            rotationVectorProjectionLength: 0,
            currentAngle: 0,
            nextAngleStep: 1,
            framesWithoutRotation: 10,
            elapsedFrames: 0
        },
        'Earth' : {
            rotationAngleDeg: 23.5, // degrees
            rotationDirection: 1,   // compared to Earth rot.
            rotationSpeed: 1,        // in days
            rotationVector: null,
            rotationVectorProjectionLength: 0,
            currentAngle: 0,
            nextAngleStep: 1,
            framesWithoutRotation: 10,
            elapsedFrames: 0
        },
        'Mars' : {
            rotationAngleDeg: 25, // degrees
            rotationDirection: 1,   // compared to Earth rot.
            rotationSpeed: 1/1.02,        // in days
            rotationVector: null,
            rotationVectorProjectionLength: 0,
            currentAngle: 0,
            nextAngleStep: 1,
            framesWithoutRotation: 10,
            elapsedFrames: 0
        },
        'Jupiter' : {
            rotationAngleDeg: 3, // degrees
            rotationDirection: 1,   // compared to Earth rot.
            rotationSpeed: 1/0.4,        // in days
            rotationVector: null,
            rotationVectorProjectionLength: 0,
            currentAngle: 0,
            nextAngleStep: 1,
            framesWithoutRotation: 10,
            elapsedFrames: 0
        },
        'Saturn' : {
            rotationAngleDeg: 26, // degrees
            rotationDirection: 1,   // compared to Earth rot.
            rotationSpeed: 1/0.45,        // in days
            rotationVector: null,
            rotationVectorProjectionLength: 0,
            currentAngle: 0,
            nextAngleStep: 1,
            framesWithoutRotation: 10,
            elapsedFrames: 0
        },
        'Uranus' : {
            rotationAngleDeg: 97, // degrees
            rotationDirection: -1,   // compared to Earth rot.
            rotationSpeed: 1/0.7,        // in days
            rotationVector: null,
            rotationVectorProjectionLength: 0,
            currentAngle: 0,
            nextAngleStep: 1,
            framesWithoutRotation: 10,
            elapsedFrames: 0
        },
        'Neptune' : {
            rotationAngleDeg: 29.6, // degrees
            rotationDirection: 1,   // compared to Earth rot.
            rotationSpeed: 1/0.67,        // in days
            rotationVector: null,
            rotationVectorProjectionLength: 0,
            currentAngle: 0,
            nextAngleStep: 1,
            framesWithoutRotation: 10,
            elapsedFrames: 0
        },
        'Pluto' : {
            rotationAngleDeg: 122.5, // degrees
            rotationDirection: -1,   // compared to Earth rot.
            rotationSpeed: 1/6,        // in days
            rotationVector: null,
            rotationVectorProjectionLength: 0,
            currentAngle: 0,
            nextAngleStep: 1,
            framesWithoutRotation: 10,
            elapsedFrames: 0
        },
    }

    // initialize rotation vectors
    //rotationVector: generateRotationVector(this.rotationAngleDeg, this.rotationDirection, this.rotationSpeed),
    for (const name in infoObjectMap) {
        infoObjectMap[name].rotationVector = generateRotationVector(infoObjectMap[name].rotationAngleDeg, infoObjectMap[name].rotationDirection, infoObjectMap[name].rotationSpeed);
    }

    const defaultRotationInfo = {
        rotationAngleDeg: 23.5, // degrees
        rotationDirection: 1,   // compared to Earth rot.
        rotationSpeed: 1,        // in days
        rotationVector: generateRotationVector(23.5, 1.0 , 1.0),
        rotationVectorProjectionLength: 0,
        currentAngle: 0,
        nextAngleStep: 10,
        framesWithoutRotation: 60,
        elapsedFrames: 0
    }

    // initialize framesWithoutRotation
    for (const name in infoObjectMap) {

        const baseNumber = 60;
        infoObjectMap[name].framesWithoutRotation = Math.round(baseNumber * infoObjectMap[name].rotationSpeed);

    }
 
    if (name in infoObjectMap) {
        return infoObjectMap[name];
    } else {
        // default settings
        return defaultRotationInfo;
    }
}

function generateRotationVector(angle, direction, speed) {
    // assume: vector in plane [1,0,0] and [0,0,1]
    const rotationVector = [
        (-1) * direction * Math.sin(angle * 360 / (2*Math.PI)),
        direction * 0,
        direction * Math.cos(angle * 360 / (2*Math.PI))
    ];

    return rotationVector;
}


function getMassObjectVisualInfo(name) {

    const loadedImageNames = ['Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Pluto'];

    let imageName;
    if (loadedImageNames.includes(name)) {
        imageName = name;
    } else {
        imageName = 'Default';
    }

    const visualInfoObject = {
        staticImage : `${imageName}.jpg`,
        texture : `${imageName}Texture.jpg`,
        textureImageData: null,
        nightTexture : `${imageName}TextureNight.jpg`,
        nightTextureImageData: null,
        currentImageData : null,
        nextFrameImageData : null,
        currentImageBitmap : null,
        nextFrameImageBitmap : null,
        framesWithoutRotation : 0,
        isInFrame: false,
        radius: nameToRadius(name)
    }

    return visualInfoObject;
}

// radius in terms of Earth radius
// Sun and bigger planets have to be scaled down to fit
function nameToRadius(name) {
    const radiusMap = {
        'Sun' : 2,
        'Mercury' : 0.4,
        'Venus' : 0.95,
        "Earth" : 1.0,
        "Mars" : 0.53,
        "Jupiter" : 11,
        "Saturn" : 9,
        "Uranus" : 4,
        "Pluto" : 0.2
    }

    if(name in radiusMap) {
        return radiusMap[name];
    } else {
        return 0.5;
    }
}