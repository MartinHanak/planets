import loadImportSelection from '../importPage/loadImportSelection.js';
import { Router } from '../Router.js';

export default function loadHomePage() {
    const main = document.querySelector('main');

    const header = document.createElement('h1');
    header.innerText = 'Home Page';

    const importButton = document.createElement('button');
    importButton.innerText = 'Start Import';

    importButton.addEventListener('click', () =>{
        loadImportSelection();
    });

    const importLink = document.createElement('a');
    importLink.href = "/import";
    importLink.innerText = "Import";
    importLink.addEventListener('click', (e) => {
        e.preventDefault();

        let state = null;
        let title = "";
        let path = "/import";

        history.pushState(state,title,path);
        Router.renderPage("/import");

    });

    main.replaceChildren(header, importButton, importLink);
    

}
