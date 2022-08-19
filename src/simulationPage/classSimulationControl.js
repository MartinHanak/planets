// common class for all simulation controls
export default class SimulationControl {
    constructor(domElement, cssClass) {
        this.domElement = domElement;
        this.cssClass = cssClass;
    }

    getDomElement() {
        const newDomElement = document.createElement(this.domElement);
        newDomElement.classList.add(this.cssClass);
        return newDomElement;
    }
}

