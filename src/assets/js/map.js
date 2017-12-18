function initialize(geoArray, zoomLevel) {
    var map = L.map('mapid').setView(geoArray, zoomLevel);

    L.tileLayer(
        'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            id: 'mapbox.streets'
        }).addTo(map);


    var controlEle = document.getElementsByClassName("leaflet-control-container")[0];
    controlEle.parentNode.removeChild(controlEle);

    return map;
}

function startRun() {
    var map = initialize([-31.986, 116.025], 11);
    
    L.geoJSON(wasub).addTo(map);

    console.log(wasub);

}


startRun();