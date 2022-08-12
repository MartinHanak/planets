import MassObject from "../../massObject.js";

export default async function nasaExtractData(text) {
        // text contains plain text response
        // data have to be extracted using regular expressions
        // patterns = two capital letters or one capital and space = number in exp. form
        // e.g. X = 4.953382706823754E+07 Y = 1.394931209068222E+08 Z = 8.142142795555294E+03
        //      VX=-2.847384182076938E+01 VY= 1.007739354140973E+01 VZ=-1.112126458759910E-03

        let massObjectInstance = {};

        // name 
        // e.g. Target body name: Sun (10)
        const nameRegExp = /(Target body name\:)(\s)([\s\w]+)\s\(/;
        const name = nameRegExp.exec(text);
        console.log(name[3]);
        massObjectInstance.name = name[3];
        
        // mass in kilograms
        // example API output:  Mass x10^24 (kg)= 5.97219+-0.0006
        // inconsistent notation, also: Mass x 10^22 (g)      = 189818722 +- 8817
        const massValueRegExp = /(Mass)([^=]+)(=)(\D+)(\d+(\.\d+)?)/;
        const massExponentRegExp = /(Mass)([^\^]+)(\^)(\d+)/;
        const massUnitsRegExp = /(Mass)([^kg]+)(g|kg)/;

        const massValue = massValueRegExp.exec(text);
        const massExponent = massExponentRegExp.exec(text);
        const massUnitMultiplier = massUnitsRegExp.exec(text);
        const massMultiplier = (massUnitMultiplier[3] == 'g') ? 0.001 : 1.0;

        massObjectInstance.mass = Number(massValue[5]) * massMultiplier * 10**Number(massExponent[4]);
    /*

        const massRegExp = /(Mass)([^x]+)(x10\^)([-\+]?\d+)([^=]+)(\D+)(\d+(\.\d+)?)/g;
        const mass = massRegExp.exec(text);
        massObjectInstance.mass = Number(mass[7]) * 10**Number(mass[4]);
    */

        // data about the object position and velocity is between the lines
        // denoted by $$SOE and $$EOE (Start/End Of Ephemeris)
        text = text.substring(text.indexOf("$$SOE"), text.indexOf("$$EOE"));
        // position and speed in meters (API outputs kilometers)
        const vecComponentRegExp = /(\w{1,2})(\s)?(=)(\s)?([\+\-]?\d+\.\d+E[\+\-]\d+)/g;
        const vectorComponents = text.matchAll(vecComponentRegExp);
        for (const vecComponent of vectorComponents) {
            massObjectInstance[vecComponent[1]] = Number(vecComponent[5]) * 1000;
        }

        // check if import is intact
        // all required are present and not falsy values
        const requiredPropertyNames = ['X', 'Y', 'Z', 'VX', 'VY', 'VZ', 'mass','name'];
        if (requiredPropertyNames
            .map(propertyName => Object.keys(massObjectInstance).includes(propertyName))
            .reduce((previous,current) => previous && current, true) && 
            Object.values(massObjectInstance)
            .reduce((previous,current) => previous && current, true)
            ) {
            // return planet object
            return new MassObject(massObjectInstance.name, massObjectInstance.mass,
                massObjectInstance.X, massObjectInstance.Y, massObjectInstance.Z, 
                massObjectInstance.VX, massObjectInstance.VY, massObjectInstance.VZ);
        } else {
            throw new Error('Object properties could not be extracted correctly')
        }
}