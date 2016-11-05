import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import { loadGoogleMaps, initMap } from './map';

// Load and initialize Google Maps
loadGoogleMaps(() => initMap());

// Render the App component into the .app element
render(<App />, document.querySelector('.app'));
