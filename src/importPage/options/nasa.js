import nasaFetchData from "./nasaFetchData.js";
import loadSimulation from "../../simulationPage/loadSimulation.js";
import loadLoadingPage from "../../loadingPage/loadLoadingPage.js";
import loadErrorPage from "../../errorPage/loadErrorPage.js";

export default function nasaImportMethod() {
    const main = document.querySelector('main');

    const tempDiv = document.createElement('div');
    tempDiv.append("Pending");
    main.replaceChildren(tempDiv);

    const time = Date.now();
    //nasaFetchData([['Earth',time]]);
    nasaFetchData([['Sun',time],['Mercury',time],['Venus',time],['Earth',time],['Mars',time],['Jupiter',time],['Saturn',time],['Uranus',time],['Neptune',time],['Pluto',time],])
    .then(loadSimulation)
    .catch(err => loadErrorPage(err));

    // loading page until async fetch finished
    loadLoadingPage();

    
}
