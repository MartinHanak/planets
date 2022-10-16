import { Router } from './Router.js'

// images have to be loaded so that webpack copies them into the dist folder
// same for css
import nasaIcon from './images/nasa-icon.jpg';
import earthIcon from './images/Earth.png';
import cssStyle from './style.css';

console.log(Router.getCurrentPage());

console.log(Router.renderPage(Router.getCurrentPage()))

