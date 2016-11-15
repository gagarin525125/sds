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
function mapAddMarkers(places) {
    places.forEach(p => {
        var m = new google.maps.Marker({
            map: map,
            position: {lat: p.lat, lng: p.lng},
            title: p.title
        });
        if (p.callback) {
            google.maps.event.addListener(m, "click", (event) => {
                //console.log("Click on marker: " + p.title);
                p.callback();
            });
        }
        markers.push(m);
    });
}

/** Remove all markers from the map.*/
function mapClearMarkers() {
    markers.forEach(m => m.setMap(null));
    markers.length = 0;
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
 * Draw a polygon on the map. points is an array of [lng, lat] arrays. callback
 * is optional. If text is not null, a marker with that title will be added.
 */
function mapAddPolygon(points, text, callback) {
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
        let f = (event) => {
            //console.log("Clicked on area: " + text);
            callback();
        };
        google.maps.event.addListener(poly, "click", f);
    }

    if (text) {
        let place = getPolygonCenter(points);
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
            newPoints = [coords];
        }
        else if (ou.featureType == "POLYGON") {
            newPoints = JSON.parse(ou.coordinates)[0][0];
            mapAddPolygon(newPoints, ou.displayName, ou.callback);
        }
        else if (ou.featureType == "MULTI_POLYGON") {
            let matches = ou.coordinates.match(/\[\[[^[].*?\]\]/g);
            let polys = matches.map(m => JSON.parse(m));
            polys.forEach(p => mapAddPolygon(p, null, ou.callback));
            newPoints = [].concat.apply([], polys);

            // Add a clickable, hoverable marker inside the area.
            let center = getPolygonCenter(newPoints);
            mapAddMarkers([{ lat: center.lat, lng: center.lng,
                             title: ou.displayName, callback: ou.callback }]);
        }
        else {
            alert(`mapSetItems: unrecognized featureType for ${ou.displayName} (${ou.id})`);
        }
        bounds = getBoundsForPoints(newPoints, bounds);
    }

    if (places.length > 0)
        mapAddMarkers(places);

    if (organisationUnits.length > 0)
        map.fitBounds(bounds);
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
