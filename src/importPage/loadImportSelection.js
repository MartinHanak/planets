import { DatePicker } from "./datePicker.js";
import { massObjectSelection } from "./massObjectSelection.js";
import nasaImportMethod from "./nasaImport/nasa.js";

export default function loadImportSelection() {
    const main = document.querySelector('main');

    // container form
    const importForm = document.createElement('form');
    importForm.classList.add('import-form');
    const formElements = [];

    // date picker
    const importDatePickerContainer = document.createElement('div');

    const importDatePickerId = "import-date-picker";
    const importDatePickerLabel = document.createElement('label');
    importDatePickerLabel.htmlFor = importDatePickerId;
    importDatePickerLabel.innerText = "Select start of the simulation:";
    
    const importDatePicker = new DatePicker();
    const importDateInput = importDatePicker.getDOMinputElement(importDatePickerId);

    importDatePickerContainer.replaceChildren(importDatePickerLabel, importDateInput);
    formElements.push(importDatePickerContainer)


    // radio select 
    const radioContainer = document.createElement('div');

    const radioLabel = document.createElement('label');
    radioLabel.innerText = "Included objects:";
    radioContainer.appendChild(radioLabel);
    radioContainer.appendChild(document.createElement('br'));



    const radioLabelName = "import-radio";

    const valueA = 'all';

    const radioInputOptionA = document.createElement('input');
    radioInputOptionA.type = 'radio';
    radioInputOptionA.name = radioLabelName;
    radioInputOptionA.value = valueA;
    radioInputOptionA.id = valueA;
    radioInputOptionA.checked = true;
    radioContainer.appendChild(radioInputOptionA);

    const radioInputOptionALabel = document.createElement('label');
    radioInputOptionALabel.htmlFor = valueA;
    radioInputOptionALabel.innerText = valueA;
    radioContainer.appendChild(radioInputOptionALabel);

    radioContainer.appendChild(document.createElement('br'));

    const valueB = 'selection';

    const radioInputOptionB = document.createElement('input');
    radioInputOptionB.type = 'radio';
    radioInputOptionB.name = radioLabelName;
    radioInputOptionB.value = valueB;
    radioInputOptionB.id = valueB;
    radioContainer.appendChild(radioInputOptionB);

    const radioInputOptionBLabel = document.createElement('label');
    radioInputOptionBLabel.htmlFor = valueB;
    radioInputOptionBLabel.innerText = 'from selection';
    radioContainer.appendChild(radioInputOptionBLabel);
    formElements.push(radioContainer);

    

    // (disabled) massobject select
    const selectionContainer = massObjectSelection.getContainer();
    selectionContainer.classList.add("import-options");
    selectionContainer.classList.add("disabled-import-options");
    formElements.push(selectionContainer);

    // toggle display using the radio option
    [radioInputOptionA, radioInputOptionB].forEach(element => 
        element.addEventListener('change', () => {
            selectionContainer.classList.toggle("disabled-import-options");
        }));

    // button to start simulation

    const startButtonId = "import-submit-button";
    const startButton = document.createElement('button');
    startButton.id = startButtonId;
    startButton.type = 'submit';
    startButton.value = "Start Simulation";
    startButton.innerText = "Start Simulation";

    startButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(e);
        // check validity
        let selectedDate;
        let errorMessages = [];
        const dateInput = importDateInput.querySelector('input');
        const value = dateInput.value;
        
        let errorMessage = document.querySelector('.form-error-message');
        if(errorMessage) {
            // reset if any previous errors
            errorMessage.replaceChildren();
        } else {
            // create error message div
            errorMessage = document.createElement('div');
            errorMessage.classList.add('form-error-message');
        }

        // correct format
        const valueRegExp = /^(\s*\d{1,2}\s*)\/(\s*\d{1,2}\s*)\/(\s*-?\d{1,4})\s*$/;
        const valueMatch = value.match(valueRegExp);
        console.log(valueMatch)

        if(valueMatch != null) {
            let day = Number(valueMatch[1]);
            let month = Number(valueMatch[2]);
            let year = Number(valueMatch[3]);

            if( day > 0 && day < 32 && month > 0 && month < 13) {
                console.log(`Year: ${year}, month: ${month}, day: ${day}`)
                selectedDate = new Date(year,month - 1,day);
            } else {
                errorMessages.push('Selected day or month are out of proper range.');
            }
        } else {
            errorMessages.push('Inserted date value does not match the correct format.\nPlease input the date in the following format: dd/mm/yyyy');
        }

        // correct values
        if(errorMessages.length === 0) {
            console.log('start fetching data');
            const importNames = [];
            const formElements = importForm.elements;
            for(const formElement of formElements) {
                if(formElement.type == "checkbox" && formElement.checked == true) {
                    importNames.push(formElement.id);
                }
            }
            nasaImportMethod(importNames, selectedDate);
        } else {
            const errorList = document.createElement('ul');
            for(const message of errorMessages) {
                const errorListItem = document.createElement('li');
                errorListItem.textContent = message;
                errorList.appendChild(errorListItem);
                console.log(message);
            }

            errorMessage.appendChild(errorList);

            // add to DOM
            const form = document.querySelector('form');
            form.appendChild(errorMessage);

        }
    })

    formElements.push(startButton);

    // old:
    //main.replaceChildren(...importOptions.map(option => option.getDomElement()));
    // import type selection = presets / custom / load empty and build in the app

    main.replaceChildren(importForm);
    importForm.replaceChildren(...formElements);

}