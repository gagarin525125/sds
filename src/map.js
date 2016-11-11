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

/** Add markers. places is an array of { lat: n, lng: n, title: s } objects. */
export function mapAddMarkers(places) {
    var newMarkers = places.map(p =>
        new google.maps.Marker({
            map: map,
            position: {lat: p.lat, lng: p.lng},
            title: p.title
        })
    );
    markers.concat(newMarkers);
}

/** Remove all markers from the map.*/
export function mapClearMarkers() {
    markers.forEach(m => m.setMap(null));
    markers.length = 0;
}

/**
 * Draw organization unit borders on the map.
 */
export function mapShowBorders(orgunits) {
    mapClearPolygons();
    for (var i = 0; i < orgunits.length; i++) {
        var o = orgunits[i];
        mapAddPolygon(JSON.parse(o.coordinates), o.id);
    }
}

/**
 * Draw a polygon on the map. area is a coordinates value of type POLYGON
 * from the DHIS API.
 */
export function mapAddPolygon(area, identifier) {
    // Convert to an array of LatLng objects
    var coords = area[0][0].map(a => ({lat: a[1], lng: a[0]}));
    var poly = new google.maps.Polygon({
        map: map,
        paths: coords,
        strokeColor: '#0000B0',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillOpacity: 0
    });

    google.maps.event.addListener(poly, "click", (event) => {
        console.log("Click in polygon: " + identifier);
        console.log(poly);
    });

    polygons.push(poly);
}

/** Remove all polygons from the map. */
export function mapClearPolygons() {
    polygons.forEach(p => p.setMap(null));
    polygons.length = 0;
}

/** Set the information to be displayed on the map. */
export function mapSetItems(organisationUnits) {
    //console.log("mapSetItems:");
    //console.log(organisationUnits);
    for(let i = 0; i < organisationUnits.length; i++) {
        let ou = organisationUnits[i];
        if (!ou.coordinates) {
            console.log(`mapSetItems: missing coordinates for ${ou.displayName} (${ou.id})`);
            continue;
        }

        let coords = JSON.parse(ou.coordinates);
        if (ou.featureType == "POINT") {
            mapAddMarkers([{
                lat: coords[1], lng: coords[0],
                title: `{ou.displayName}\n${ou.id}`
            }]);
        }
        else if (ou.featureType == "POLYGON") {
            // Test border drawing, only works for featureType="POLYGON" currently.
            mapAddPolygon(coords, ou.id);
        }
        else if (ou.featureType == "MULTI_POLYGON") {
            // FIXME
            console.log(`mapSetItems: MULTI_POLYGON support not implement yet [${ou.displayName} (${ou.id})]`);
        }
        else {
            alert(`mapSetItems: unrecognized featureType for ${ou.displayName} (${ou.id})`);
        }

    }
}

/** Load the Google Maps API, call a function when it's done. */
export function loadGoogleMaps(callback) {
    var script = document.createElement('script');
    script.onload = callback;
    script.src = "https://maps.googleapis.com/maps/api/js";
    document.body.appendChild(script);
}
