

function startRun() {
    var mymap = L.map('mapid').setView([51.505, -0.09], 13);

    L.tileLayer(
        'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            id: 'mapbox.streets'
        }).addTo(mymap);


    var controlEle = document.getElementsByClassName("leaflet-control-container")[0];
    controlEle.parentNode.removeChild(controlEle);
}


startRun();