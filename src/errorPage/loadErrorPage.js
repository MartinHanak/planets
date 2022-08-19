export default function loadErrorPage(err) {
    const main = document.querySelector('main');

    const errorHeader = document.createElement('h1');
    errorHeader.innerText = 'Error:'
    errorHeader.append(err);

    main.replaceChildren(errorHeader);
    
}