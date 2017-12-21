var colors = ['#ffffcc', '#bdbdbd', '#74a9cf', '#feb24c', '#74c476', '#7a0177', '#023858', '#7f0000', '#252525'];

var sampleArea = ["PERTH", "NORTHBRIDGE", "EAST PERTH", "WEST PERTH", "SUBIACO"];
var sampleValue = [100, 400, 800, 1200, 1500];
var grades = [100,400,800,1200,1500,2000];
var MAX, MIN;


function getColor(value) { // mapping value to colors uniformly dispatch
    var i = 0;
    while (value >= grades[i]) i++;
    return colors[i];
}

function initialize(geoArray, zoomLevel) {
    var map = L.map('mapid').setView(geoArray, zoomLevel);

    // L.tileLayer(
    //     'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    //         maxZoom: 18,
    //         id: 'mapbox.streets'
    //     }).addTo(map);



    return map;
}

function getStyle(feature) {
    return {
        fillColor: getColor(feature.properties.value),
        weight: 1,
        opacity: 1,
        color: 'black',
        fillOpacity: 1.0
    };
}


function processData(areaArray, valueArray, map) {
    MAX = Math.max(...sampleValue);
    MIN = Math.min(...sampleValue);

    console.log("Values in range: ", MIN, MAX);

    var resultArea = wasub['features'];
    // .filter(sub =>
    //     areaArray.includes(sub['properties']['wa_local_2'])
    // )

    resultArea.forEach(sub => {
        var idx = areaArray.indexOf(sub.properties['wa_local_2']);
        if (idx === -1) {
            sub.properties.value = 0;
        } else {
            sub.properties.value = valueArray[idx];
        }
    });

    return resultArea;
}

function addLegend(map) {
    var legend = L.control({
        position: 'bottomright'
    });

    var step = (MAX - MIN) / colors.length;
    var grades = [];

    for (var i = 0; i < colors.length; i++) {
        grades.push(i * step);
    }

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            labels = [],
            from, to;

        for (var i = 0; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];

            labels.push(
                '<i style="background:' + getColor(from + 1) + '"></i> ' +
                from + (to ? '&ndash;' + to : '+'));
        }

        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(map);
}

function removeControlElement() {
    var controlEle = document.getElementsByClassName("leaflet-control-zoom")[0];
    controlEle.parentNode.removeChild(controlEle);
    controlEle = document.getElementsByClassName("leaflet-control-attribution")[0];
    controlEle.parentNode.removeChild(controlEle);
}

function startRun() {
    var map = initialize([-31.95508, 115.8498], 11);

    var resultArea = processData(sampleArea, sampleValue, map);

    L.geoJSON(resultArea, {
        style: getStyle
    }).addTo(map);

    addLegend(map);

    console.log(resultArea);

    removeControlElement();
}


startRun();