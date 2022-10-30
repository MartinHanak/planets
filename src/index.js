import { Router } from './Router.js'

// images have to be loaded so that webpack copies them into the dist folder
// same for css
import nasaIcon from './images/nasa-icon.jpg';
import earthIcon from './images/Earth.png';
import earthTexture from './images/Earth_texture.jpg'
import marsIcon from './images/Mars.png';
import cssStyle from './style.css';

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
