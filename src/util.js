/**
 * Miscellaneous helper functions.
 */

/** Returns a copy of the items array with callback added to each item. */
export function addCallbackToItems(items, callback) {
    return items.map(item =>
        Object.assign({}, item, { callback: () => callback(item) }));
}

/** Returns true if arrays a and b have the same contents, false if not. */
export function arraysEqual(a, b) {
    if (a.length != b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}

/**
 * Returns a {lat: n, lng: n} object that represents the center of the polygon
 * defined by points.
 */
export function getPolygonCenter(points) {
    let lngSum = points.reduce((acc, point) => acc + point[0], 0);
    let latSum = points.reduce((acc, point) => acc + point[1], 0);
    return { lat: latSum/points.length, lng: lngSum/points.length };
}

/**
 * Returns a google.maps.LatLngBoundsLiteral object that contains all the
 * points. currentBounds is a google.maps.LatLngBoundsLiteral that if present
 * is taken to represent a rectangle that should be contained in the result.
 */
export function getBoundsForPoints(points, currentBounds) {
    if (!currentBounds)
        currentBounds = { south: -90, west: 180, north: 90, east: -180 };

    let latArray = points.map(p => p[1]);
    let lngArray = points.map(p => p[0]);
    return {
        south: Math.max(currentBounds.south, ...latArray),
        west:  Math.min(currentBounds.west,  ...lngArray),
        north: Math.min(currentBounds.north, ...latArray),
        east:  Math.max(currentBounds.east,  ...lngArray)
    };
}
