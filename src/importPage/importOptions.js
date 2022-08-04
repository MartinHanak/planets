import presetsImportMethod from './options/presets.js';
import nasaImportMethod from './options/nasa.js';
import builderImportMethod from './options/builder.js';

let importOptions =  [];


// define class for import options
class ImportOption {
    constructor(name, redirectMethod, icon) {
        this.name = name;
        this.redirectMethod = redirectMethod;
        this.icon = icon;
        this.cssClass = 'import-option';
        this.domElement = 'button'
    }

    getDomElement() {
        const newDomElement = document.createElement(this.domElement);
        newDomElement.classList.add(this.cssClass);

        // event on click
        newDomElement.addEventListener('click',()=>{
            this.redirectMethod();
        });

        // icon
        const newImgElement = document.createElement('img');
        newImgElement.classList.add('import-option-icon');
        newImgElement.src = `./assets/${this.icon}.jpg`;
        newImgElement.alt = `Icon for ${this.name} import option`;
        newDomElement.appendChild(newImgElement);

        // description
        newDomElement.append(this.name);

        return newDomElement;
    }
}


// create several instances, append into exported array

importOptions.push(
    new ImportOption('Presets', presetsImportMethod, 'presets-icon'),
    new ImportOption('NASA API', nasaImportMethod, 'nasa-icon'),
    new ImportOption('Builder', builderImportMethod,'builder-icon'),
);

export default importOptions;