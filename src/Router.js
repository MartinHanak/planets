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
    };

    const getCurrentPage = () => {
        return window.location.pathname;
    };

    const renderPage = (page) => {
        page in routes ? routes[page]() : routes['/']() ;
    };

    return {
        getCurrentPage,
        renderPage,
    };
})();

