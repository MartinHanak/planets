import loadImportSelection from '../importPage/loadImportSelection.js';


export default function loadHomePage() {
    const main = document.querySelector('main');

    const header = document.createElement('h1');
    header.innerText = 'Home Page';

    const importButton = document.createElement('button');
    importButton.innerText = 'Start Import';

    importButton.addEventListener('click', () =>{
        loadImportSelection();
    });


    main.replaceChildren(header, importButton);
    

}
