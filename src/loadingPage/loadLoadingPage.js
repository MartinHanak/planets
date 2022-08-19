export default function loadLoadingPage() {
    const main = document.querySelector('main');

    const loadingHeader = document.createElement('h1');
    loadingHeader.innerText = 'Loading';

    main.replaceChildren(loadingHeader);
    
}