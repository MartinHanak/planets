import nasaExtractData from "./nasaExtractData.js";
import { massObjectState } from "../../massObjectState.js";
import { displayState } from "../../displayState.js";

// expects array of dublets [name,time] 
// time in format getTime(): returns the number of milliseconds since January 1, 1970 00:00:00.
export default async function nasaFetchData(inputArray) {

    // API server cannot support many requests at once - do one at a time
    //const responseArray = await Promise.all(inputArray.map(([name,time]) => createPromise(...[name,time]))).catch('Error while calling fetch.');

    // call API one by one, consecutively
    const responseArray = [];
    for (const [name, time] of inputArray) {
        const response = await createPromise(name, time);
        // x miliseconds delay after each promise
        const ms = 200;
        await ((ms) => new Promise(resolve => setTimeout(resolve, ms)));

        responseArray.push(response);
    }

    const responseJSON = await Promise.all(responseArray.map(response => response.json()))
    .catch('Error while parsing into JSON.');

    //responseJSON.forEach(instance => console.log(instance.result));

    const extractedData = await Promise.all(responseJSON.map(responseJSONinstance => nasaExtractData(responseJSONinstance.result)))
    .catch('Error while extracting data from JSON.');

    //extractedData.forEach(instance => console.log(instance));

    localStorage.setItem("massObjects", JSON.stringify(extractedData));
    localStorage.setItem("displayState", JSON.stringify([displayState.getCameraPosition(),displayState.getAnimationSettings()]));

    console.log("extracted data")
    console.log(JSON.stringify(extractedData));

    console.log("default display")
    console.log(JSON.stringify([displayState.getCameraPosition(),displayState.getAnimationSettings()]))
}

async function createPromise(name,time) {
    return fetch(generateApiUrl(name, time));
}


function generateApiUrl(name, time) {
    const baseUrl = `https://ssd.jpl.nasa.gov/api/horizons.api?`;

    //const apiKey = 'Nl8LqYiUPfYrchGnC2Djbf1v5ZgBEQAHC8II416K';

    // JS months start at 0, to 11
    const startTime = new Date(time);
    const finalTime = new Date(startTime.getTime() + 86400000); // day later

    // getMonth() return 0 to 11
    const startTimeString = `${startTime.getFullYear()}-${startTime.getMonth() + 1}-${startTime.getDate()}`;
    const finalTimeString = `${finalTime.getFullYear()}-${finalTime.getMonth() + 1}-${finalTime.getDate()}`;

    const parametersObject = {
        //api_key: apiKey,
        // Parameters info: https://ssd-api.jpl.nasa.gov/doc/horizons.html#ephem_type
        // Common Parameters
        //format: 'text', default = json
        COMMAND: assignIdFromName(name),
        OBJ_DATA: 'YES',
        MAKE_EPHEM: 'YES',
        EPHEM_TYPE: 'VECTORS',
        EMAIL_ADDR: 'none',
        // Ephemeris-Specific Parameters
        CENTER: '@0',
        REF_PLANE: 'ECLIPTIC',
        COORD_TYPE: 'GEODETIC',
        START_TIME: startTimeString,
        STOP_TIME: finalTimeString,
        STEP_SIZE: '2 d',
        REF_SYSTEM: 'ICRF',
        OUT_UNITS: 'KM-S',
        VEC_TABLE: '3',
        VEC_CORR: 'NONE',
        TIME_DIGITS: 'MINUTES',
        CSV_FORMAT: 'NO',
        VEC_LABELS: 'YES',
    }

    let finalUrl = 
        baseUrl
        .concat(...Object.entries(parametersObject)
        .map(([key, value]) => `${key}='${encodeURIComponent(value)}'&` ))
        .slice(0, -1);

    return finalUrl;

}


// convert names to API planet IDs 
function assignIdFromName(name) {
    let id = -1;

    const nameObject = {
        // planets and the Sun
        Sun: 10,
        Mercury: 199,
        Venus: 299,
        Earth: 399,
        Mars: 499,
        Jupiter: 599,
        Saturn: 699,
        Uranus: 799,
        Neptune: 899,
        Pluto: 999,
    }

    if (nameObject.hasOwnProperty(name)) {
        id = nameObject[name];
    }

  
    return id.toString();
}