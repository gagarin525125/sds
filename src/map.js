/**
 * Manage and interact with a Google Maps map.
 */

import { getPolygonCenter, getBoundsForPoints } from './util';

/* A rectangle containing Sierra Leone. */
const defaultBounds = { south: 10.012, west: -13.304,
                        north:  6.905, east: -10.250 };

var map;
var markers = {};  // A mapping of string ID's to Marker objects.
var polygons = {};  // A mapping of string ID's to arrays of Polygon objects.
var coordinatesCallback;
var popup;
var selectedId = "";


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

/**
 * Set a callback function that will receive coordinates from the map, its
 * signature is func(latitude, longitude).
 */
export function mapSetCoordinatesCallback(callback) {
    coordinatesCallback = callback;
}

/**
 * Enable or disable highlighting of an item on the map. Has no effect if id
 * represents the currently selected item.
 */
export function mapHighlightItem(id, enable) {
    if (!markers[id]) {
        console.log(`mapHighlightItem: no marker found for id ${id}`);
        return;
    }
    if (id == selectedId)
        return;

    markers[id].setAnimation(enable ? google.maps.Animation.BOUNCE : null);
    if (polygons[id])
        polygons[id].forEach(p =>
            p.setOptions({fillOpacity: enable ? 0.2 : 0}));
}

/** Show an item as selected on the map. */
export function mapSelectItem(id) {
    // Remove the previous selection first.
    if (popup)
        popup.close();
    if (selectedId && polygons[selectedId])
        polygons[selectedId].forEach(p => p.setOptions({fillOpacity: 0}));

    // Remove any highlighting so it doesn't interfere.
    mapHighlightItem(id, false);
    selectedId = id;

    if (markers[id]) {
        popup = new google.maps.InfoWindow({content: markers[id].title});
        popup.open(map, markers[id]);
    }

    if (polygons[id])
        polygons[id].forEach(p => p.setOptions({fillOpacity: 0.2}));
}

/**
 * Add markers. places is an array of
 * { id: s, lat: n, lng: n, title: s, callback: func } objects, the callback is
 * optional. id is a string that uniquely identifies the marker. */
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
    for (let id in markers)
        markers[id].setMap(null);
    markers = {};
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
        fillColor: '#0000B0',
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

    if (!polygons[id])
        polygons[id] = [];
    polygons[id].push(poly);
}

/** Remove all polygons from the map. */
function mapClearPolygons() {
    for (let id in polygons)
        polygons[id].forEach(p => p.setMap(null));
    polygons = {};
}

/** Add to the information displayed on the map. */
export function mapAddItems(organisationUnits, autoZoom=true) {
    var places = [];
    var bounds;

    function parseJson(maybeJson) {
        try       { return JSON.parse(maybeJson); }
        catch (e) { console.log(`mapAddItems: invalid JSON: ${e.message}`) }
        return null;
    }

    for(let i = 0; i < organisationUnits.length; i++) {
        let ou = organisationUnits[i];
        let newPoints = [];

        if (!ou.coordinates) {
            console.log(`mapAddItems: missing coordinates for ${ou.displayName}
                         (${ou.id})`);
            continue;
        }

        if (ou.featureType == "POINT") {
            let coords = parseJson(ou.coordinates);

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
            let parsed = parseJson(ou.coordinates);
            newPoints = parsed ? parsed[0][0] : [];
            if (newPoints.length > 0)
                mapAddPolygon(ou.id, newPoints, ou.displayName, ou.callback);
        }
        else if (ou.featureType == "MULTI_POLYGON") {
            let matches = ou.coordinates.match(/\[\[[^[].*?\]\]/g);
            let polys = matches.map(m => parseJson(m)).filter(a => a);

            polys.forEach(p => mapAddPolygon(ou.id, p, null, ou.callback));
            newPoints = [].concat(...polys);

            // Add a clickable, hoverable marker inside the area.
            let center = getPolygonCenter(newPoints);
            mapAddMarkers([{
                id: ou.id, lat: center.lat, lng: center.lng,
                title: ou.displayName, callback: ou.callback
            }]);
        }
        else {
            console.log(`mapAddItems: unrecognized featureType
                         ${ou.featureType} for ${ou.displayName} (${ou.id})`);
        }

        // Update bounds to include the new coordinates.
        if (newPoints.length > 0)
            bounds = getBoundsForPoints(newPoints, bounds);
    }

    if (places.length > 0)
        mapAddMarkers(places);

    if (autoZoom && bounds)
        map.fitBounds(bounds);
    else if (!autoZoom)
        map.fitBounds(defaultBounds);
}

/** Set the information to be displayed on the map. */
export function mapSetItems(organisationUnits, autoZoom=true) {
    mapClearAll();
    mapAddItems(organisationUnits, autoZoom);
}

/** Clear all info on the map. */
export function mapClearAll() {
    if (popup) {
        popup.close();
        popup = null;
    }
    mapClearPolygons();
    mapClearMarkers();
    if (map)
        map.fitBounds(defaultBounds);
}

/** Load the Google Maps API, call a function when it's done. */
export function loadGoogleMaps(callback) {
    var script = document.createElement('script');
    script.onload = callback;
    script.src = "https://maps.googleapis.com/maps/api/js";
    document.body.appendChild(script);
}
