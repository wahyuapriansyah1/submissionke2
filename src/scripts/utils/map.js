import L from 'leaflet';

const sampleMarkers = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        title: 'Jalan Braga',
        description: 'Jalan bersejarah dengan arsitektur kolonial',
        date: '2024-03-18'
      },
      geometry: {
        type: 'Point',
        coordinates: [107.6089, -6.9177]
      }
    },
    {
      type: 'Feature',
      properties: {
        title: 'Trans Studio Bandung',
        description: 'Taman hiburan dalam ruangan dan pusat hiburan',
        date: '2024-03-16'
      },
      geometry: {
        type: 'Point',
        coordinates: [107.6333, -6.9167]
      }
    }
  ]
};

const createMarkerPopup = (feature) => `
  <div class="marker-popup">
    <h3>${feature.properties.title}</h3>
    <p>${feature.properties.description}</p>
    <small>${feature.properties.date}</small>
  </div>
`;

const createMapLayer = (map) => 
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

const createMarkers = (map) => 
  L.geoJSON(sampleMarkers, {
    pointToLayer: (feature, latlng) => 
      L.marker(latlng).bindPopup(createMarkerPopup(feature))
  }).addTo(map);

export const initMap = (containerId) => {
  try {
    console.log('Initializing map in container:', containerId);
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.error('Map container not found:', containerId);
      return null;
    }

    const map = L.map(containerId, {
      center: [-6.9175, 107.6191],
      zoom: 10,
      zoomControl: true
    });

    createMapLayer(map);
    createMarkers(map);

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    console.log('Map initialized successfully');
    return map;
  } catch (error) {
    console.error('Error initializing map:', error);
    return null;
  }
}; 