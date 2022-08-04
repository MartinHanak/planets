export default function nasaImportMethod() {
    const main = document.querySelector('main');

    const tempDiv = document.createElement('div');
    tempDiv.append(generateApiUrl());



    main.replaceChildren(tempDiv);
}

// convert names to API IDs 
function assignIdFromName(name) {
    let id = -1;

    const nameObject = {
        Sun: 10,
        Mercury: 199,
        Venus: 299,
        Earth: 399,
        Mars: 499,
        Jupiter: 599,
        Saturn: 699,
        Uranus: 799,
        Neptune: 899
    }

    if (nameObject.hasOwnProperty(name)) {
        id = nameObject[name];
    }

  
    return id.toString();
}

function generateApiUrl(name, type, time = { year, month, day }) {
    const baseUrl = `https://ssd.jpl.nasa.gov/api/horizons.api?`;

    const startTime = new Date(time.year, time.month, time.day);
    const finalTime = new Date(startTime.getMilliseconds() + 86400000); // day later

    const startTimeString = `${startTime.getFullYear()}-${startTime.getMonth()}-${startTime.getDay()}`;
    const finalTimeString = `${finalTime.getFullYear()}-${finalTime.getMonth()}-${finalTime.getDay()}`;

    const parametersObject = {
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

    let finalUrl = encodeURI(
        baseUrl
        .concat(...Object.entries(parametersObject)
        .map(([key, value]) => `${key}='${value}'&` ))
        .slice(0, -1)
    );

    return finalUrl;

}