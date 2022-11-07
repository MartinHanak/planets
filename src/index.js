import { Router } from './Router.js'

// images have to be loaded so that webpack copies them into the dist folder
// same for css
import nasaIcon from './images/nasa-icon.jpg';
import earthIcon from './images/Earth.png';
import marsIcon from './images/Mars.png';
import cssStyle from './style.css';

import SunTexture from './images/Sun_texture.jpg'
import MercuryTexture from './images/Mercury_texture.jpg'
import VenusTexture from './images/Venus_texture.jpg'
import EarthTexture from './images/Earth_texture.jpg'
import MarsTexture from './images/Mars_texture.jpg'
import JupiterTexture from './images/Jupiter_texture.jpg'
import SaturnTexture from './images/Saturn_texture.jpg'
import NeptuneTexture from './images/Neptune_texture.jpg'
import UranusTexture from './images/Uranus_texture.jpg'
import PlutoTexture from './images/Pluto_texture.jpg'
import DefaultTexture from './images/Default_texture.jpg'

console.log(Router.getCurrentPage());

console.log(Router.renderPage(Router.getCurrentPage()));

// initialize links for SPA
initializeSPALinks();

// Single Page Application links
function initializeSPALinks ()  {

    const linksArray = document.querySelectorAll("nav a");

    linksArray.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const state = null;
            const title = "";
            const path = link.pathname;
    
            history.pushState(state, title, path);
            Router.renderPage(path);
        });
    });

};


// handle browser history navigation
window.onpopstate = () => {
    Router.renderPage(document.location.pathname);
}
