var map;
var markers = [];

export function initMap() {
    map = new google.maps.Map(document.getElementById('theMap'), {
        center: { lat: 8.5, lng: -12 },
        zoom: 8
    });
}

export function locateOnMap(places) {
    // Remove old markers first
    markers.forEach(m => m.setMap(null));
    markers.length = 0;

    markers = places.map(p =>
        new google.maps.Marker({
                map: map,
                position: { lat: p.lat, lng: p.lng },
                title: p.title
        })
    );
}

export function loadGoogleMaps(callback) {
    var script = document.createElement('script');
    script.onload = callback;
    script.src = "https://maps.googleapis.com/maps/api/js";
    document.body.appendChild(script);
}
