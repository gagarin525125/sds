var map;

export function initMap() {
    map = new google.maps.Map(document.getElementById('theMap'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    });
}

export function locateOnMapTest() {
    new google.maps.Marker({
            position: {lat: -34.397, lng: 150.644},
            map: map,
            title: 'Testing 1 2 3'
    });
}

export function loadGoogleMaps(callback) {
    var script = document.createElement('script');
    script.onload = callback;
    script.src = "https://maps.googleapis.com/maps/api/js";
    document.body.appendChild(script);
}
