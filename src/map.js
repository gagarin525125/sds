var map;
var markers = {};  // A mapping of string ID's to Marker objects.
var polygons = [];
var coordinatesCallback;
var popup;

/** Show a map of Sierra Leone. */
export function initMap() {
    map = new google.maps.Map(document.getElementById('theMap'), {
        center: { lat: 8.5, lng: -12 },
        zoom: 8,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.BOTTOM_RIGHT,
        },
    });
    google.maps.event.addListener(map, "rightclick", event => {
        coordinatesCallback(event.latLng.lat(), event.latLng.lng());
    });
}

export function mapSetCoordinatesCallback(callback) {
    coordinatesCallback = callback;
}

/** Highlight at item on the map. */
export function mapSelectItem(id) {
    if (!markers[id]) {
        console.log(`mapSelectItem: no marker found for id ${id}`);
        return;
    }
    if (popup)
        popup.close();
    popup = new google.maps.InfoWindow({content: markers[id].title});
    popup.open(map, markers[id]);
}

/** Add markers. places is an array of
 * { id: s, lat: n, lng: n, title: s, callback: func } objects, the callback is
 * optional. id a string that uniquely identifies the marker. */
function mapAddMarkers(places) {
    places.forEach(p => {
        var m = new google.maps.Marker({
            map: map,
            position: {lat: p.lat, lng: p.lng},
            title: p.title
        });

        if (p.callback)
            google.maps.event.addListener(m, "click", event => p.callback());

        markers[p.id] = m;
    });
}

/** Remove all markers from the map.*/
function mapClearMarkers() {
    for (let m in markers)
        markers[m].setMap(null);
    markers = {};
}

function getPolygonCenter(points) {
    let lngSum = points.reduce((acc, point) => acc + point[0], 0);
    let latSum = points.reduce((acc, point) => acc + point[1], 0);
    return { lat: latSum/points.length, lng: lngSum/points.length };
}

function getBoundsForPoints(points, currentBounds) {
    if (!currentBounds)
        currentBounds = { south: -90, west: 180, north: 90, east: -180 };

    var latArray = points.map(p => p[1]);
    var lngArray = points.map(p => p[0]);
    return { south: Math.max(currentBounds.south, ...latArray),
             west:  Math.min(currentBounds.west,  ...lngArray),
             north: Math.min(currentBounds.north, ...latArray),
             east:  Math.max(currentBounds.east,  ...lngArray) };
}

/**
 * Draw a polygon on the map. points is an array of [lng, lat] arrays. id is a
 * string that uniquely identifies the polygon. callback is optional. If text
 * is not null, a marker with that title will be added.
 */
function mapAddPolygon(id, points, text, callback) {
    var coords = points.map(a => ({lat: a[1], lng: a[0]}));

    var poly = new google.maps.Polygon({
        map: map,
        paths: coords,
        clickable: callback != null,
        strokeColor: '#0000B0',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillOpacity: 0
    });

    if (callback)
        google.maps.event.addListener(poly, "click", event => callback());

    if (text) {
        let place = getPolygonCenter(points);
        place.id = id;
        place.title = text;
        place.callback = callback;
        mapAddMarkers([place]);
    }

    polygons.push(poly);
}

/** Remove all polygons from the map. */
function mapClearPolygons() {
    polygons.forEach(p => p.setMap(null));
    polygons.length = 0;
}

/** Add to the information displayed on the map. */
export function mapAddItems(organisationUnits) {
    var places = [];
    var bounds;

    for(let i = 0; i < organisationUnits.length; i++) {
        let ou = organisationUnits[i];
        let newPoints = [];
        if (!ou.coordinates) {
            console.log(`mapAddItems: missing coordinates for ${ou.displayName} (${ou.id})`);
            continue;
        }

        if (ou.featureType == "POINT") {
            let coords;

            try {
                coords = JSON.parse(ou.coordinates);
            }
            catch (e) {
                console.log(`Exception in mapAddItems: ${e.message}`)
            }

            if (coords) {
                places.push({
                    id: ou.id, title: ou.displayName,
                    lat: coords[1], lng: coords[0],
                    callback: ou.callback
                });
                newPoints = [coords];
            }
        }
        else if (ou.featureType == "POLYGON") {
            try {
                newPoints = JSON.parse(ou.coordinates)[0][0];
                mapAddPolygon(ou.id, newPoints, ou.displayName, ou.callback);
            }
            catch (e) {
                console.log(`Exception in mapAddItems: ${e.message}`)
            }
        }
        else if (ou.featureType == "MULTI_POLYGON") {
            let matches = ou.coordinates.match(/\[\[[^[].*?\]\]/g);
            let polys;

            try {
                polys = matches.map(m => JSON.parse(m));
            }
            catch (e) {
                console.log(`Exception in mapAddItems: ${e.message}`)
            }

            if (polys) {
                polys.forEach(p => mapAddPolygon(ou.id, p, null, ou.callback));
                newPoints = [].concat(...polys);

                // Add a clickable, hoverable marker inside the area.
                let center = getPolygonCenter(newPoints);
                mapAddMarkers([{
                    id: ou.id, lat: center.lat, lng: center.lng,
                    title: ou.displayName, callback: ou.callback
                }]);
            }
        }
        else {
            console.log(`mapAddItems: unrecognized featureType ${ou.featureType} for
                         ${ou.displayName} (${ou.id})`);
        }

        // Update bounds to include the new coordinates.
        if (newPoints.length > 0)
            bounds = getBoundsForPoints(newPoints, bounds);
    }

    if (places.length > 0)
        mapAddMarkers(places);

    if (bounds)
        map.fitBounds(bounds);
}

/** Set the information to be displayed on the map. */
export function mapSetItems(organisationUnits) {
    mapClearAll();
    mapAddItems(organisationUnits);
}

/** Clear all info on the map. */
export function mapClearAll() {
    if (popup) {
        popup.close();
        popup = null;
    }
    mapClearPolygons();
    mapClearMarkers();
}

/** Load the Google Maps API, call a function when it's done. */
export function loadGoogleMaps(callback) {
    var script = document.createElement('script');
    script.onload = callback;
    script.src = "https://maps.googleapis.com/maps/api/js";
    document.body.appendChild(script);
}
