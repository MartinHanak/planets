import importOptions from './importOptions.js';

export default function loadImportSelection() {
    const main = document.querySelector('main');

    main.replaceChildren(...importOptions.map(option => option.getDomElement()));
    console.log(importOptions);

    // import type selection = presets / custom / load empty and build in the app

    // 



}