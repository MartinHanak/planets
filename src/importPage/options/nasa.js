import nasaFetchData from "./nasaFetchData.js";

export default function nasaImportMethod() {
    const main = document.querySelector('main');

    const tempDiv = document.createElement('div');
    tempDiv.append("Pending");
    main.replaceChildren(tempDiv);

    const time = Date.now();
    //nasaFetchData([['Earth',time]]);
     nasaFetchData([['Sun',time],['Mercury',time],['Venus',time],['Earth',time],['Mars',time],['Jupiter',time],['Saturn',time],['Uranus',time],['Neptune',time],['Pluto',time],]);

    // create all input fields (including custom date picker)

    // option to add/ remove planets
    // option for presets

    // when submiting - check values

    // then call fetch data

    // extract data

    // go to simulation with imported data


    /*
    //console.log(generateApiUrl('Earth',{year:2020,month:12,day:2}));
   // const header = new Headers({ "Access-Control-Allow-Origin": "*" });
    console.log(generateApiUrl('Earth',{year:2020,month:12,day:2}))

     // changing origin using Moesif to solve CORS during development
    fetch(generateApiUrl('Earth', {year:2020,month:12,day:2}))
    .then((response) => response.json())
    .then(data => nasaExtractData(data.result))
    .then(extractedObject => console.log(extractedObject))
    .catch(err => console.log(err));
   
    */

    
}
