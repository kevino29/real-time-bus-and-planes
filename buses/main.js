(function(){

    // Create map in leaflet and tie it to the div called 'theMap'
    let map = L.map('theMap').setView([44.650627, -63.597140], 14);

    // Create marker group for markers
    let markers = [];

    // Create an icon object for the marker
    let busIcon = L.icon({
        iconUrl: 'bus.png',
        iconSize: [50,40],
    });

    // Get the API Endpoint of the HRM bus data
    let url = `https://hrmbusapi.herokuapp.com`;

    // Update the data every FIVE seconds
    setInterval(async () => {
        await fetch(url)
            .then(handleResponse)
            .then(handleData)
            .catch(error => console.error(error));
    }, 7000);

    // Handle the response
    function handleResponse(response) {
        return response.json()
            .then(json => response.ok ? json : Promise.reject());
    }

    // Handle the fetched data
    function handleData(json) {
        console.log(json.entity.length);

        // Create a feature collection object to handle all the features
        let busFeatures = {
            "type": "FeatureCollection",
            "features": []
        }

        // Transform data to GeoJSON objects
        json.entity.map((e, i) => {
            busFeatures.features.push({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [e.vehicle.position.longitude, e.vehicle.position.latitude]
                },
                "properties": {
                    "id": e.id,
                    "transport": "Bus",
                    "routeId": e.vehicle.trip.routeId,
                    "bearing": e.vehicle.position.bearing,
                }
            });
        });

        // Use the GeoJSON objects to create markers on the map
        L.geoJSON(busFeatures, {
           onEachFeature: onEachFeature,
           pointToLayer: pointToLayer,
           filter: filter,
        }).addTo(map);
    }

    function onEachFeature(feature, layer) {
        // Add the feature properties to the popup
        let popupContent = "<p>ID: " + feature.properties.id + "</p>" +
                            "<p>Transport Type: " + feature.properties.transport + "</p>" +
                            "<p>Route: " + feature.properties.routeId + "</p>" +
                            "<p>Bearing: " + feature.properties.bearing + "</p>";
        layer.bindPopup(popupContent);
    }

    function pointToLayer(feature, coord) {
        // Update the specific marker's coordinates based on the marker's id
        let theMarker = markers
            .filter(m => m.feature.properties.id === feature.properties.id &&
                        m.feature.properties.routeId === feature.properties.routeId)
            .map(m => {
                m.setLatLng(coord);
                m.setRotationAngle(feature.properties.bearing);
            });
        
        // If the marker already exists in the group, return the existing marker
        if (theMarker.length > 0)
            return theMarker.pop();
        
        // Otherwise, create a new marker then add it to the group
        else {
            let marker = L.marker(coord, { 
                icon: busIcon,
                rotationAngle: feature.properties.bearing,
                rotationOrigin: 'center center',
            });
            markers.push(marker);
            return marker;
        }
    }

    // Filter the feature based on its route id
    function filter(feature, layer) {
        if (feature.properties.routeId <= 10 ||
            feature.properties.routeId === '9A' ||
            feature.properties.routeId === '9B')
            return true;
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
})()