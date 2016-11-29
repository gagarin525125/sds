import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import { loadGoogleMaps, initMap } from './map';


/* Load the DHIS API URL from the manifest. */
(function () {
    fetch("manifest.webapp")
        .then(response => response.json())
        .then(json => {
            console.log("testFetch:");
            console.log(json);
            console.log(`href = ${json.activites.href}`)
        });
})();

// Load and initialize Google Maps
loadGoogleMaps(() => initMap());

// Render the App component into the .app element
render(<App />, document.querySelector('.app'));
