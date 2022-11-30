import nasaFetchData from "./nasaFetchData.js";
import loadSimulation from "../../simulationPage/loadSimulation.js";
import loadLoadingPage from "../../loadingPage/loadLoadingPage.js";
import loadErrorPage from "../../errorPage/loadErrorPage.js";

export default function nasaImportMethod(namesArray, dateObj) {
    const main = document.querySelector('main');

    const tempDiv = document.createElement('div');
    tempDiv.append("Pending");
    main.replaceChildren(tempDiv);

    const time = dateObj;
    // function expects array of [name, time] pairs
    const nameTimeArray = [];
    for(const name of namesArray) {
        nameTimeArray.push([name, time]);
    }

    nasaFetchData(nameTimeArray)
    .then(loadSimulation)
    .catch(err =>{
        loadSimulation();
        console.log(err);
    });

    // loading page until async fetch finished
    loadLoadingPage();

    
}
