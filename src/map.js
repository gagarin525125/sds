var map;
var markers = [];
var polygons = [];

/** Show a map of Sierra Leone. */
export function initMap() {
    map = new google.maps.Map(document.getElementById('theMap'), {
        center: { lat: 8.5, lng: -12 },
        zoom: 8
    });
}

/** Add markers. places is an array of
 * { lat: n, lng: n, title: s, callback: func } objects, the callback is
 * optional. */
export function mapAddMarkers(places) {
    places.forEach(p => {
        var m = new google.maps.Marker({
            map: map,
            position: {lat: p.lat, lng: p.lng},
            title: p.title
        });
        if (p.callback) {
            google.maps.event.addListener(p, "click", (event) => {
                console.log("Click on marker: " + identifier);
                console.log(m);
                p.callback();
            });
        }
        markers.push(m);
    });
}

/** Remove all markers from the map.*/
export function mapClearMarkers() {
    markers.forEach(m => m.setMap(null));
    markers.length = 0;
}

/**
 * Draw a polygon on the map. points is an array of [lng, lat] arrays.
 */
export function mapAddPolygon(points, identifier, callback) {
    // Convert to an array of LatLng objects
    var coords = points.map(a => ({lat: a[1], lng: a[0]}));
    var poly = new google.maps.Polygon({
        map: map,
        paths: coords,
        strokeColor: '#0000B0',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillOpacity: 0
    });

    if (callback) {
        google.maps.event.addListener(poly, "click", (event) => {
            console.log("Click in polygon: " + identifier);
            console.log(poly);
            callback();
        });
    }

    polygons.push(poly);
}

/** Remove all polygons from the map. */
export function mapClearPolygons() {
    polygons.forEach(p => p.setMap(null));
    polygons.length = 0;
}

/** Add to the information displayed on the map. */
export function mapAddItems(organisationUnits) {
    var places = [];

    for(let i = 0; i < organisationUnits.length; i++) {
        let ou = organisationUnits[i];
        if (!ou.coordinates) {
            console.log(`mapSetItems: missing coordinates for ${ou.displayName} (${ou.id})`);
            continue;
        }

        if (ou.featureType == "POINT") {
            let coords = JSON.parse(ou.coordinates);
            places.push({
                lat: coords[1], lng: coords[0],
                title: `${ou.displayName}\n${ou.id}`,
                callback: ou.callback
            });
        }
        else if (ou.featureType == "POLYGON") {
            let coords = JSON.parse(ou.coordinates);
            mapAddPolygon(coords[0][0], ou.id, ou.callback);
        }
        else if (ou.featureType == "MULTI_POLYGON") {
            let matches = ou.coordinates.match(/\[\[[^[].*?\]\]/g);
            let polys = matches.map(m => JSON.parse(m));
            polys.forEach(p => mapAddPolygon(p, ou.id, ou.callback));
        }
        else {
            alert(`mapSetItems: unrecognized featureType for ${ou.displayName} (${ou.id})`);
        }
    }

    if (places.length > 0) {
        mapAddMarkers(places);
    }
}

/** Set the information to be displayed on the map. */
export function mapSetItems(organisationUnits) {
    mapClearPolygons();
    mapClearMarkers();
    mapAddItems(organisationUnits);
}

/** Load the Google Maps API, call a function when it's done. */
export function loadGoogleMaps(callback) {
    var script = document.createElement('script');
    script.onload = callback;
    script.src = "https://maps.googleapis.com/maps/api/js";
    document.body.appendChild(script);
}
