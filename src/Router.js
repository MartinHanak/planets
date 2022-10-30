import loadHomePage from "./homePage/loadHomePage.js";
import loadImportSelection from "./importPage/loadImportSelection.js";
import loadErrorPage from "./errorPage/loadErrorPage.js";
import loadLoadingPage from "./loadingPage/loadLoadingPage.js";
import loadSimulation from "./simulationPage/loadSimulation.js";

export const Router = (() => {

    const routes = {
        '/': loadHomePage,
        '/import' : loadImportSelection,
        '/error' : loadErrorPage,
        '/simulation' : loadSimulation,
        '/loading' : loadLoadingPage
    };


    const getCurrentPage = () => {
        return window.location.pathname;
    };

    const renderPage = (page) => {
        console.log(page);
        console.log(routes[page]);
        const loadFunction = routes[page];
        if (page in routes) {
            routes[page]();
        } else {
            routes['/']();
        }
    };

    return {
        getCurrentPage,
        renderPage,
    };
})();
