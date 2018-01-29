var colors = ['#ffffe5', '#bdbdbd', '#a6bddb', '#dfc27d', '#feb24c', '#74c476', '#7a0177', '#045a8d', '#800026', '#252525'];
var importGrades = [0, 1000, 5000, 10000, 15000, 20000, 25000, 30000, 40000];
var exportGrades = [0, 1000, 5000, 10000, 15000, 20000, 30000, 40000, 50000];
var validSub = [];
var curData, grades;
if (document.title == 'imports') {
    curData = importsData;
    grades = importGrades;
} else {
    curData = exportsData;
    grades = exportGrades;
}


function getColor(value) { // mapping value to colors uniformly dispatch
    var i = 0;
    while (value > grades[i]) i++;
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
        weight: 0.2,
        opacity: 1,
        color: 'black',
        fillOpacity: 1.0
    };
}

function processData(curData, map) {
    var resultArea = wasub['features'];
    // .filter(sub =>
    //     areaArray.includes(sub['properties']['wa_local_2'])
    // )

    var valueArray = curData['vol'];
    var areaArray = curData['suburb'];

    function findThroughAreaArray(curSub) {
        // for (var i = 0; i < areaArray.length; i++) {
        //     if (areaArray[i].indexOf(curSub) > -1) return i;
        // }
        // return -1;
        return areaArray.indexOf(curSub);
    }

    resultArea.forEach(sub => {
        var curSub = sub.properties['wa_local_2'];
        var idx = findThroughAreaArray(curSub);
        if (idx === -1) {
            sub.properties.value = 0;
        } else {
            sub.properties.value = valueArray[idx];
            sub.properties.postcode = curData['post'][idx];
            validSub.push(areaArray[idx]);
        }
    });

    return resultArea;
}


function addLegend(map) {
    var legend = L.control({
        position: 'bottomright'
    });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            labels = [],
            from, to;

        labels.push('<i style="background:' + getColor(0) + '"></i> ' + "= 0");

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

    console.log(wasub);

    var resultArea = processData(curData, map);

    var info = L.control();
    //-------------------------------------- info codes ----------
    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
        geojson.resetStyle(e.target);

        info.update();
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        if (props) {
            this._div.style.display = "block";
            this._div.innerHTML = '<h4>Suburb:</h4>' + '<br />' + props['postcode'] + '<b>' + props['wa_local_2'] + '</b><br />' + props.value;
        } else {
            this._div.style.display = "none";
        }
    };


    info.addTo(map);

    // -------------------- end info codes ---------------

    var geojson = L.geoJSON(resultArea, {
        style: getStyle,
        onEachFeature: onEachFeature
    }).addTo(map);

    addLegend(map);

    console.log(resultArea);

    removeControlElement();

    for (var sub of curData['suburb']) {
        if (!validSub.includes(sub)) console.log("Sub cannot find: " + sub);
    }
}


startRun();