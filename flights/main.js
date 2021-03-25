(function(){

    //create map in leaflet and tie it to the div called 'theMap'
    let map = L.map('theMap').setView([42, -60], 4);

    // Create marker group for markers
    let markers = [];

    // Create an icon object for the marker
    const busIcon = L.icon({
        iconUrl: 'plane.png',
        iconSize: [50,40],
    });

    // Get the API Endpoint of the HRM bus data
    const url = `https://opensky-network.org/api/states/all`;

    showLoader();
    requestAPI();

    // Update the data every TEN seconds
    setInterval(requestAPI, 10000);

    async function requestAPI() {
        await fetch(url)
            .then(handleResponse)
            .then(handleData)
            .catch(error => console.log(error));
    } 

    // Handle the response
    function handleResponse(response) {
        return response.json()
            .then(json => response.ok ? json : Promise.reject(json));
    }

    // Handle the fetched data
    function handleData(json) {
        console.dir(json);

        hideLoader();

        // Create a feature collection object to handle all the features
        let planeFeatures = {
            "type": "FeatureCollection",
            "features": []
        }

        // Transform data to GeoJSON objects
        json.states.map(e => {
            planeFeatures.features.push({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [e[5], e[6]]
                },
                "properties": {
                    "id": e[0].toUpperCase(),
                    "transport": "Plane",
                    "originCountry": e[2],
                    "trueTrack": e[10],
                    "velocity": e[9],
                }
            });
        });

        // Use the GeoJSON objects to create markers on the map
        L.geoJSON(planeFeatures, {
           onEachFeature: onEachFeature,
           pointToLayer: pointToLayer,
           filter: filter,
        }).addTo(map);
    }

    function onEachFeature(feature, layer) {
        // Add the feature properties to the popup
        let popupContent = "<p>FLIGHT: " + feature.properties.id + "</p>" +
                            "<p>Transport Type: " + feature.properties.transport + "</p>" +
                            "<p>Origin Country: " + feature.properties.originCountry + "</p>" +
                            "<p>True Track: " + feature.properties.trueTrack + " degree</p>" +
                            "<p>Velocity: " + feature.properties.velocity + " m/s</p>";
        layer.bindPopup(popupContent);
    }

    function pointToLayer(feature, coord) {
        // Update the specific marker's coordinates based on the marker's id
        let theMarker = markers
            .filter(m => m.feature.properties.id === feature.properties.id)
            .map(m => {
                m.feature.properties.velocity = feature.properties.velocity;
                m.setLatLng(coord);
                m.setRotationAngle(feature.properties.trueTrack);
            });
        
        // If the marker already exists in the group, return the existing marker
        if (theMarker.length > 0)
            return theMarker.pop();
        
        // Otherwise, create a new marker then add it to the group
        else {
            let marker = L.marker(coord, { 
                icon: busIcon,
                rotationAngle: feature.properties.trueTrack,
                rotationOrigin: 'center center',
            });
            markers.push(marker);
            return marker;
        }
    }

    // Filter the feature based on its route id
    function filter(feature, layer) {
        if (feature.properties.originCountry === 'Canada')
            return true;
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
})()