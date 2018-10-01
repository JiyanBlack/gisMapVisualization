var colors = ['#ffffe5', '#bdbdbd', '#a6bddb', '#dfc27d', '#feb24c', '#74c476', '#7a0177', '#045a8d', '#800026', '#252525'];
// var monocolors = ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026', '#252525'];
var importGrades = [0, 1000, 5000, 10000, 15000, 20000, 25000, 30000, 40000];
var exportGrades = [0, 1000, 2500, 5000, 7500, 10000, 15000, 20000, 30000];
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
    var resultArea = wasub['features'].filter(sub => sub.properties["STATE_2006"] == 5);

    var valueArray = curData['vol'];
    var postArray = curData['post'];
    var suburbArray = curData['suburb'];

    function findThroughAreaArray(post) {
        return postArray.indexOf(post);
    }

    resultArea.forEach(sub => {
        var post = parseInt(sub.properties['name']);
        var idx = findThroughAreaArray(post);
        if (idx === -1) {
            sub.properties.value = 0;
        } else {
            sub.properties.value = valueArray[idx];
            sub.properties.suburb = suburbArray[idx].join(', ');
            validSub.push(post);
        }
    });

    return resultArea;
}

function getSciNumber(number) {
    if (number === undefined) return number;

    var str = number.toString();
    if (str.length > 3)
        return str.slice(0, -3) + "," + str.slice(-3);
    else
        return str;
}


function addLegend(map) {
    var legend = L.control({
        position: 'bottomright'
    });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            labels = [],
            from, to;

        labels.push("TEUs");

        for (var i = 0; i < grades.length; i++) {
            from = getSciNumber(grades[i]);
            to = getSciNumber(grades[i + 1]);

            labels.push(
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
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
            this._div.innerHTML = '<b> Postcode:</b> ' + props.name + (props.suburb ? '<br />' + props.suburb : '') + '<br /><b>Volume:</b> ' + props.value;
            this._div.style.visibility = "visible";
        } else {
            this._div.innerHTML = '';
            this._div.style.visibility = "hidden";
        }
    };


    info.addTo(map);

    // -------------------- end info codes ---------------

    var geojson = L.geoJSON(resultArea, {
        style: getStyle,
        onEachFeature: onEachFeature
    }).addTo(map);

    addLegend(map);

    L.control.scale({
        imperial: false,
        maxWidth: 200
    }).addTo(map);

    removeControlElement();

    // add click popup:

    // var popup = L.popup();
    // function onMapClick(e) {
    //     popup
    //         .setLatLng(e.latlng)
    //         .setContent("You clicked the map at " + e.latlng.toString())
    //         .openOn(map);
    // }
    // map.on('click', onMapClick);

    // fremantle port point:  LatLng(-32.04573, 115.73349)

    var marker = L.marker([-32.04573, 115.73349]).addTo(map);

    var marker = new L.marker([-32.04573, 115.73349], { opacity: 0.01 }); //opacity may be set to zero
    marker.bindTooltip("Port of Fremantle", { permanent: true, className: "my-label", offset: [0, 0], direction: "left" });
    marker.addTo(map);

}


startRun();