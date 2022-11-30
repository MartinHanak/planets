export const massObjectSelection = (() => {

    const options = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
    const container = document.createElement('div');

    const getContainer = () => {
        return container;
    }

    const createToggle = (option) => {
        const toggleDOMElement = document.createElement('input');
        toggleDOMElement.classList.add('import-select-option-checkbox')
        toggleDOMElement.type = 'checkbox';
        toggleDOMElement.checked = 'true';
        toggleDOMElement.id = option;
        return toggleDOMElement;
    }

    for (const option of options) {

        // // one planet div
        // const optionContainer = document.createElement('div');
        // optionContainer.classList.add('import-select-option')

        // label
        const optionLabel = document.createElement('label');
        optionLabel.htmlFor = option;
        optionLabel.textContent = option;
        optionLabel.classList.add('import-select-option-label');

        // checkbox input
        optionLabel.appendChild(createToggle(option));

        // span after checkbox
        const optionSpan = document.createElement('span');
        optionSpan.classList.add('import-select-option-span')
        optionLabel.appendChild(optionSpan);

        // container for all options
        container.appendChild(optionLabel);
    }

    return {
        getContainer
    }

})();