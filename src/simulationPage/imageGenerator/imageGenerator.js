import { displayState } from "../../displayState.js";
import { massObjectState } from "../../massObjectState.js";

export const imageGenerator = (() => {

    // OLD: const textureImageData = {};

    const updateCurrentImageData = () => {

        let promiseArray = [];
        const massObjects = massObjectState.getObjects();

        for (const massObject of massObjects) {
            let newImageData = generateImageData(massObject.name);
            massObject.visualInfo.currentImageData = newImageData;
            promiseArray.push(new Promise((resolve,reject) => { resolve(newImageData)}));
        }

        return Promise.all(promiseArray);

    }

    const updateCurrentImageBitmap = () => {
        const massObjects = massObjectState.getObjects();

        for (const massObject of massObjects) {
            massObject.visualInfo.nextFrameImageBitmap = createImageBitmap(massObject.visualInfo.currentImageData)
                .then(bitmap => {
                    massObject.visualInfo.currentImageBitmap = bitmap;
                    massObject.visualInfo.nextFrameImageBitmap = null;

                    // if animation is not running, update by drawing one frame

                    if(displayState.getAnimationState().run == false) {
                        displayState.createNextFrameWithoutMoving();
                    }
                })
        }
    }

    const getNextFrameImageData = (name) => {

        return new Promise((resolve, reject) => {
            resolve(generateImageData(name));
        });

    }

    const initializeTextureImageData = () => {
        const images = displayState.getStaticImages();

        const textureNameRegExp = /(\w+)(Texture)/i;

        for(const name in images) {
            // if name ends with Texture, then initialize its image data
            let nameMatch = name.match(textureNameRegExp);
            if(nameMatch != null) {
                const textureName = nameMatch[1];
                const textureImage = images[name];

                let tempCanvas = document.createElement('canvas');
                tempCanvas.width = textureImage.naturalWidth;
                tempCanvas.height = textureImage.naturalHeight;

                let tempctx = tempCanvas.getContext('2d');

                tempctx.drawImage(textureImage,0,0);

                //textureImageData[textureName] = tempctx.getImageData(0,0,tempCanvas.width,tempCanvas.height);
                const massObject = massObjectState.getObjectByName(textureName);


                if (massObject !== undefined && massObject.visualInfo.textureImageData === null) {
                    massObject.visualInfo.textureImageData = tempctx.getImageData(0,0,tempCanvas.width,tempCanvas.height);
                } 
            }
        }
    }

    // private

    const generateImageData = (name) => {
        const massObject = massObjectState.getObjectByName(name);
        const textureID = massObject.visualInfo.textureImageData;

        if (textureID != null) {
            const finalImageRadius = 25;

            const width = finalImageRadius*2;
            const height = finalImageRadius*2;
            const newImageData = new ImageData(width,height);

            const radiusSquared = width*width / 4;


            // 1st and 2nd vector = camera tilt
            // 3rd vector = point of view
            // rotate these vectors to get image from the correct angle
            //const rotatedCameraVectors = displayState.getCameraPosition().basisVectors;

            const rotatedCameraVectors = rotateCameraVectors(displayState.getCameraPosition().basisVectors, name);
            const planeVectorOne = rotatedCameraVectors[0];
            const planeVectorTwo = rotatedCameraVectors[1];
            const cameraPOV = rotatedCameraVectors[2];


            for (let i = 0; i < newImageData.data.length; i += 4) {

                // x,y coordinates for a given pixel
                // origin = center
                // half of pixel size added
                let pixelIndex = Math.round(i / 4);
                let x = pixelIndex % width - width / 2 + 0.5;
                let y =  Math.floor(pixelIndex / width) - height / 2 + 0.5;

                if ( x*x + y*y < radiusSquared) {
                    // update pixel only in this case
                    let sphereVector = inverseSphereToPlaneProjection([x,y],finalImageRadius,[planeVectorOne,planeVectorTwo,cameraPOV]);
                    let [r,theta,phi] = cartesianToSphericalCoordinates(sphereVector, finalImageRadius);

                    let thetaDeg = theta * 180 / Math.PI;
                    let phiDeg = phi * 180 / Math.PI;

                    let [red,green,blue,alpha] = getTextureColorFromSphericalCoor(textureID,thetaDeg,phiDeg);

                    // Modify pixel data
                    newImageData.data[i + 0] = red;        // R value
                    newImageData.data[i + 1] = green;        // G value
                    newImageData.data[i + 2] = blue ;     // B value
                    newImageData.data[i + 3] = alpha;      // A value
                }
                
            }
            return newImageData;
        } 

        return null;
    }

    const rotateCameraVectors = (vectors, massObjectName) => {
        const massObject = massObjectState.getObjectByName(massObjectName);
        const moRotationVector = massObject.rotationInfo.rotationVector;

        let tempVectors = vectors;

        tempVectors = rotateVectorsAroundUnitVector(tempVectors,tempVectors[2],90);
    
        tempVectors = rotateVectorsAroundUnitVector(tempVectors,tempVectors[2],massObject.rotationInfo.currentAngle);

        tempVectors = rotateVectorsAroundUnitVector(tempVectors,[0,1,0],-massObject.rotationInfo.rotationAngleDeg);

        return tempVectors;
    }


    // get 3D sphere coordinates from 2D projected coordinates
    const inverseSphereToPlaneProjection = ([X,Y], R = 1,[planeVectorOne,planeVectorTwo,cameraPOV]) => {

        // get non-zero component of the second camera basis vector
        // finite number error solved by inequality
        let nonZeroComponent;

        if (Math.abs(planeVectorTwo[2]) > 0.01) {
            nonZeroComponent = 2;
        } else if (Math.abs(planeVectorTwo[1]) > 0.01) {
            nonZeroComponent = 1;
        } else {
            nonZeroComponent = 0;
        }

        // get second index for non-zero combination
        let nonZeroCombinationComponent;
        let testComponents = [];
        let testCombinations = [];
        let nonZeroCombination;
        for(let i = 0; i < 3; i++) {
            if(i != nonZeroComponent) {
                testCombinations.push( planeVectorOne[i] - planeVectorOne[nonZeroComponent]*(planeVectorTwo[i] /planeVectorTwo[nonZeroComponent]));
                testComponents.push(i);
            }
        }

        if(Math.abs(testCombinations[0]) > Math.abs(testCombinations[1])) {
            nonZeroCombinationComponent = testComponents[0];
            nonZeroCombination = testCombinations[0];
        } else {
            nonZeroCombinationComponent = testComponents[1];
            nonZeroCombination = testCombinations[1];
        }

        // third component
        let thirdComponent
        for(let i = 0; i < 3; i++) {
            if (i != nonZeroComponent && i != nonZeroCombinationComponent ) {
                thirdComponent = i;
                break;
            }
        }


        //const A = (X - planeVectorOne[nonZeroComponent]/planeVectorTwo[nonZeroComponent]*Y) / (planeVectorOne[nonZeroCombinationComponent] - planeVectorOne[nonZeroComponent]/planeVectorTwo[nonZeroComponent]*planeVectorTwo[nonZeroCombinationComponent]);
        const A = (X - planeVectorOne[nonZeroComponent]/planeVectorTwo[nonZeroComponent]*Y) / (nonZeroCombination);
        const B = (-1) * (planeVectorOne[thirdComponent] - planeVectorOne[nonZeroComponent]/planeVectorTwo[nonZeroComponent]*planeVectorTwo[thirdComponent]) / (nonZeroCombination);
        const C = (Y/planeVectorTwo[nonZeroComponent] - planeVectorTwo[nonZeroCombinationComponent]/planeVectorTwo[nonZeroComponent]*A);
        const D = ((-1) * planeVectorTwo[nonZeroCombinationComponent]/planeVectorTwo[nonZeroComponent] * B - planeVectorTwo[thirdComponent]/planeVectorTwo[nonZeroComponent]);

        // example for  x = nonZeroCombinationComponent, y = nonZeroComponent, z = 3rd component
        // equation transfomed into
        // x = A + Bz
        // y = C + Dz
        //
        // plus the vector norm x^2 + y^2 + z^2 = R^2
        // solve for z, plug in, check the sign

        let sphereVector = [null,null,null];

        const discriminant = Math.pow(2*A*B + 2*C*D,2) - 4*(1 + B*B + D*D)*(A*A + C*C - R*R);

        if (discriminant > 0) {
            // test solution with + and -

            // case - 
            sphereVector[thirdComponent] = ((-2)*(A*B + C*D) - Math.sqrt(discriminant))/(2*(1 + B*B + D*D));
            sphereVector[nonZeroCombinationComponent] = A + B * sphereVector[thirdComponent];
            sphereVector[nonZeroComponent] = C + D * sphereVector[thirdComponent];

            let cameraScalarProduct = 0;
            for (let i = 0; i < 3; i++) {
                cameraScalarProduct += sphereVector[i]*cameraPOV[i];
            }

            if (cameraScalarProduct > 0) {
                // must be case +
                sphereVector[thirdComponent] = ((-2)*(A*B + C*D) + Math.sqrt(discriminant))/(2*(1 + B*B + D*D));
                sphereVector[nonZeroCombinationComponent] = A + B * sphereVector[thirdComponent];
                sphereVector[nonZeroComponent] = C + D * sphereVector[thirdComponent];
            }

        } else if (discriminant == 0) {
            sphereVector[thirdComponent] = - (A*B + C*D)/(1 + B*B + D*D);
            sphereVector[nonZeroCombinationComponent] = A + B * sphereVector[thirdComponent];
            sphereVector[nonZeroComponent] = C + D * sphereVector[thirdComponent];

        } else {
            console.log("Negative determinant while computing inverse sphere projection");
            console.log("Input camera vectors:")
            console.log(planeVectorOne)
            console.log(planeVectorTwo)
            console.log(cameraPOV)
            console.log(`Non zero component: ${nonZeroComponent} `);
            console.log(`Non zero combination index: ${nonZeroCombinationComponent}`);
            console.log(`Third component: ${thirdComponent}`);
            console.log(`Non-zero combination: ${nonZeroCombination}`);
            console.log(`1st test combination: ${testCombinations[0]}`);
            console.log(`2nd test combination: ${testCombinations[1]}`);


            sphereVector[thirdComponent] = - (A*B + C*D)/(1 + B*B + D*D);
            sphereVector[nonZeroCombinationComponent] = A + B * sphereVector[thirdComponent];
            sphereVector[nonZeroComponent] = C + D * sphereVector[thirdComponent];
        }

        return sphereVector;
    }

    const cartesianToSphericalCoordinates = ([x,y,z], Radius = 1) => {
        let r;
        let theta;
        if ( Radius == 1 ) {
            r = 1;
            theta = Math.acos(z);
        } else {
            r = Math.sqrt(x*x + y*y + z*z);
            theta = Math.acos(z / r);
        }

        let phi;
        if ( x > 0 ) {
            phi = Math.atan( y / x );
        } else if ( x < 0 && y >= 0) {
            phi = Math.atan( y / x ) + Math.PI;
        } else if ( x < 0 && y < 0) {
            phi = Math.atan( y / x ) - Math.PI;
        } else if ( x == 0 && y > 0) {
            phi = Math.PI / 2; 
        } else if ( x == 0 && y < 0 ) {
            phi = - Math.PI / 2;
        } else if ( x == 0 && y == 0) {
            // all phi converge in this point, choose one
            phi = 0;
        }

        return [r, theta, phi];
        
    }

    const getTextureColorFromSphericalCoor = (textureID,theta,phi) => {
        const width = textureID.width;
        const height = textureID.height;

        const maximumPhi = 360;
        const maximumTheta = 180;


        const fractionalXCoor = (phi + 180)/ maximumPhi;
        const fractionalYCoor = theta/ maximumTheta;

        const XCoor = Math.round(fractionalXCoor * width);
        const YCoor = Math.round(fractionalYCoor * height);

        const clampedArrayIndex = YCoor * width * 4 + XCoor * 4;

        const R = textureID.data[clampedArrayIndex]
        const G = textureID.data[clampedArrayIndex + 1];
        const B = textureID.data[clampedArrayIndex + 2];
        const A = textureID.data[clampedArrayIndex + 3];

        return [R, G, B, A];

    }

    const rotateVectorsAroundUnitVector = (vectors, unitVector, angleDeg) => {
        let resultVectors = [];
        // Rodrigues' rotation formula
        for(const vec of vectors) {
            let scalarProduct = 0;
            for(let i = 0; i < vec.length; i++) {
                scalarProduct += vec[i]*unitVector[i]
            }

            // unitVec x vec
            let vectorProduct = [null,null,null];
            vectorProduct[0] = unitVector[1] * vec[2] - unitVector[2] * vec[1];
            vectorProduct[1] = unitVector[2] * vec[0] - unitVector[0] * vec[2];
            vectorProduct[2] = unitVector[0] * vec[1] - unitVector[1] * vec[0];

            let tempCos = Math.cos(angleDeg * 2 * Math.PI / 360);
            let tempSin = Math.sin(angleDeg * 2 * Math.PI / 360);

            let tempVec = [null,null,null]
            for (let i = 0; i < 3; i++) {
                tempVec[i] = vec[i] * tempCos + vectorProduct[i] * tempSin + unitVector[i] * scalarProduct * (1 - tempCos);
            }
            resultVectors.push(tempVec);
        }

        return resultVectors;
    }

    return {
        updateCurrentImageData,
        initializeTextureImageData,
        getNextFrameImageData,
        updateCurrentImageBitmap
    }
} )();