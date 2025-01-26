// Create basemap and streetmap layers.
let basemap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
});

let streetmap = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors, Humanitarian OpenStreetMap Team"
});

// Create the map object.
let map = L.map("map", {
  center: [37.09, -95.71],
  zoom: 4,
  layers: [basemap]
});

// Layer groups for earthquakes and tectonic plates.
let earthquakeLayer = new L.LayerGroup();
let tectonicLayer = new L.LayerGroup();

// Base maps and overlay maps.
let baseMaps = {
  "Basemap": basemap,
  "Street Map": streetmap
};

let overlayMaps = {
  "Earthquakes": earthquakeLayer,
  "Tectonic Plates": tectonicLayer
};

// Add control layers.
L.control.layers(baseMaps, overlayMaps).addTo(map);

// Add earthquake data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  function styleInfo(feature) {
    return {
      radius: getRadius(feature.properties.mag),
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000",
      weight: 0.5,
      opacity: 1,
      fillOpacity: 0.8
    };
  }

  function getColor(depth) {
    return depth > 90 ? "#ff5f65" :
           depth > 70 ? "#fca35d" :
           depth > 50 ? "#fdb72a" :
           depth > 30 ? "#f7db11" :
           depth > 10 ? "#dcf400" :
                        "#a3f600";
  }

  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 4;
  }

  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `Magnitude: ${feature.properties.mag}<br>Location: ${feature.properties.place}`
      );
    }
  }).addTo(earthquakeLayer);

  earthquakeLayer.addTo(map);
});

// Add tectonic plates data.
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (data) {
  L.geoJson(data, {
    color: "orange",
    weight: 2
  }).addTo(tectonicLayer);

  tectonicLayer.addTo(map);
});
