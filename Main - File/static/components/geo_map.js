/**
 * Geospatial Corridor Map Module (Feature 2) - Leaflet.js Integration
 * Renders interactive OpenStreetMap showing:
 * 1. Real-world station markers with popups
 * 2. Track polyline connecting corridor stations
 * 3. Pulsing active maintenance block segments
 * 4. Dynamic corridor switching (NDLS-CNB / DNR-PNBE)
 */

// Real-world approximate lat/lng coordinates for Indian Railways stations
const STATION_COORDS = {
  'NDLS-CNB': [
    { code: 'NDLS', name: 'New Delhi', km: 0.0, lat: 28.6448, lng: 77.2167 },
    { code: 'GZB', name: 'Ghaziabad Jn', km: 45.0, lat: 28.6692, lng: 77.4538 },
    { code: 'ALJN', name: 'Aligarh Jn', km: 140.0, lat: 27.8974, lng: 78.0880 },
    { code: 'TDL', name: 'Tundla Jn', km: 280.0, lat: 27.2012, lng: 78.2340 },
    { code: 'CNB', name: 'Kanpur Central', km: 440.0, lat: 26.4535, lng: 80.3510 }
  ],
  'DNR-PNBE': [
    { code: 'DNR', name: 'Danapur', km: 0.0, lat: 25.6217, lng: 85.0553 },
    { code: 'PWS', name: 'Phulwari Sharif', km: 5.2, lat: 25.5945, lng: 85.0890 },
    { code: 'PNBE', name: 'Patna Junction', km: 10.0, lat: 25.6078, lng: 85.1348 }
  ]
};

let _mapInstance = null;
let _blockLayers = [];

export function renderGeoMap(container, state) {
  const corridorKey = state.corridor || 'NDLS-CNB';
  const stations = STATION_COORDS[corridorKey] || STATION_COORDS['NDLS-CNB'];
  const sched = state.schedule || {};
  const blocks = sched.blocks || [];
  const isDNR = corridorKey === 'DNR-PNBE';
  const maxKm = isDNR ? 10.0 : 440.0;

  container.innerHTML = `
    <div class="rail-card">
      <div class="card-header">
        <div>
          <div class="card-title">GEOSPATIAL CORRIDOR MAP OVERLAY</div>
          <div class="card-subtitle">
            Corridor: <strong>${isDNR ? 'Danapur – Patna Junction (DNR-PNBE 10 km)' : 'New Delhi – Kanpur Central (NDLS-CNB 440 km)'}</strong> •
            Active Possessions: <strong style="color: #dc2626;">${blocks.length}</strong> •
            Real-World Coordinates (OpenStreetMap)
          </div>
        </div>
        <span class="badge badge-eng">LEAFLET.JS LIVE MAP</span>
      </div>

      <div class="geo-map-container" id="corridorMap"></div>

      <div class="map-legend">
        <div class="map-legend-item">
          <div class="map-legend-swatch" style="background: #0284c7;"></div>
          <span>Station Marker</span>
        </div>
        <div class="map-legend-item">
          <div class="map-legend-swatch" style="background: #059669;"></div>
          <span>Track Alignment</span>
        </div>
        <div class="map-legend-item">
          <div class="map-legend-swatch" style="background: #dc2626; opacity: 0.7;"></div>
          <span>Active Maintenance Block</span>
        </div>
        <div class="map-legend-item">
          <div class="map-legend-swatch" style="background: #d97706;"></div>
          <span>25 kV OHE Power-Off Section</span>
        </div>
      </div>
    </div>
  `;

  // Wait for DOM, then initialize Leaflet
  requestAnimationFrame(() => {
    initializeMap(stations, blocks, maxKm, isDNR);
  });
}

function initializeMap(stations, blocks, maxKm, isDNR) {
  const mapEl = document.getElementById('corridorMap');
  if (!mapEl || typeof L === 'undefined') {
    if (mapEl) {
      mapEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%;
          color: var(--text-muted); font-size: 13px;">
          Leaflet.js is loading... If the map does not appear, please check your internet connection.
        </div>
      `;
    }
    return;
  }

  // Clean up existing map
  if (_mapInstance) {
    _mapInstance.remove();
    _mapInstance = null;
  }
  _blockLayers = [];

  // Calculate center of corridor
  const centerLat = stations.reduce((sum, s) => sum + s.lat, 0) / stations.length;
  const centerLng = stations.reduce((sum, s) => sum + s.lng, 0) / stations.length;
  const zoomLevel = isDNR ? 13 : 8;

  _mapInstance = L.map('corridorMap', {
    scrollWheelZoom: true,
    zoomControl: true
  }).setView([centerLat, centerLng], zoomLevel);

  // OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | MaxTrack CRIS',
    maxZoom: 18
  }).addTo(_mapInstance);

  // Draw track polyline
  const trackCoords = stations.map(s => [s.lat, s.lng]);
  L.polyline(trackCoords, {
    color: '#059669',
    weight: 4,
    opacity: 0.8,
    dashArray: null
  }).addTo(_mapInstance);

  // Station markers
  stations.forEach(station => {
    const marker = L.circleMarker([station.lat, station.lng], {
      radius: isDNR ? 10 : 8,
      fillColor: '#0284c7',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.9
    }).addTo(_mapInstance);

    marker.bindPopup(`
      <div style="font-family: Inter, sans-serif; min-width: 180px;">
        <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">
          ${station.code} — ${station.name}
        </div>
        <div style="font-size: 11px; color: #64748b; line-height: 1.5;">
          <strong>Km Post:</strong> ${station.km.toFixed(1)}<br>
          <strong>Type:</strong> Interlocking Station with Loops<br>
          <strong>Corridor:</strong> ${isDNR ? 'DNR-PNBE' : 'NDLS-CNB'}
        </div>
      </div>
    `);

    // Station label
    L.tooltip({
      permanent: true,
      direction: 'top',
      offset: [0, -12],
      className: 'station-tooltip'
    }).setContent(`<span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #0f172a; background: #fff; padding: 2px 6px; border-radius: 3px; border: 1px solid #e2e8f0;">${station.code}</span>`)
      .setLatLng([station.lat, station.lng])
      .addTo(_mapInstance);
  });

  // Draw active maintenance block segments
  blocks.forEach((block, idx) => {
    const blockLatLng = interpolateBlockCoords(block, stations, maxKm);
    if (!blockLatLng) return;

    const isPowerOff = block.power_off_required;
    const isEmergency = block.is_emergency;
    const blockColor = isEmergency ? '#dc2626' : (isPowerOff ? '#d97706' : '#dc2626');

    // Block polyline segment
    const blockLine = L.polyline(blockLatLng, {
      color: blockColor,
      weight: 8,
      opacity: 0.7,
      className: 'leaflet-pulsing-block'
    }).addTo(_mapInstance);

    blockLine.bindPopup(`
      <div style="font-family: Inter, sans-serif; min-width: 220px;">
        <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 6px;">
          ${block.bundle_id}
        </div>
        <div style="font-size: 11px; color: #475569; line-height: 1.6;">
          <strong>Section:</strong> Km ${block.km_start.toFixed(1)} – ${block.km_end.toFixed(1)} (${block.line})<br>
          <strong>Window:</strong> ${block.scheduled_start} to ${block.scheduled_end?.split(' ')[1] || ''}<br>
          <strong>Duration:</strong> ${block.duration_minutes}m<br>
          <strong>Departments:</strong> ${(block.departments || []).join(' + ')}<br>
          <strong>ES:</strong> ${block.elementary_section}<br>
          ${isPowerOff ? '<strong style="color: #d97706;">⚡ 25 kV OHE Power-Off Required</strong><br>' : ''}
          ${isEmergency ? '<strong style="color: #dc2626;">🚨 Emergency Injection</strong><br>' : ''}
          <strong>Status:</strong> <span style="color: ${block.status === 'SANCTIONED_COA' ? '#059669' : '#d97706'}; font-weight: 700;">${block.status}</span>
        </div>
      </div>
    `);

    _blockLayers.push(blockLine);

    // Add block center marker
    const midIdx = Math.floor(blockLatLng.length / 2);
    const midPoint = blockLatLng[midIdx] || blockLatLng[0];
    L.circleMarker(midPoint, {
      radius: 5,
      fillColor: blockColor,
      color: '#fff',
      weight: 2,
      fillOpacity: 1
    }).addTo(_mapInstance).bindTooltip(
      `<span style="font-family: monospace; font-size: 9px;">${block.bundle_id}</span>`,
      { permanent: false, direction: 'right' }
    );
  });

  // Fit map to track bounds
  if (trackCoords.length > 1) {
    _mapInstance.fitBounds(L.latLngBounds(trackCoords).pad(0.15));
  }
}

function interpolateBlockCoords(block, stations, maxKm) {
  /**
   * Maps block km_start and km_end to lat/lng by linear interpolation
   * along the station polyline.
   */
  if (!stations || stations.length < 2) return null;

  const kmToLatLng = (km) => {
    // Clamp km
    km = Math.max(0, Math.min(maxKm, km));

    // Find the two stations this km falls between
    for (let i = 0; i < stations.length - 1; i++) {
      const s1 = stations[i];
      const s2 = stations[i + 1];
      if (km >= s1.km && km <= s2.km) {
        const ratio = (km - s1.km) / (s2.km - s1.km);
        return [
          s1.lat + ratio * (s2.lat - s1.lat),
          s1.lng + ratio * (s2.lng - s1.lng)
        ];
      }
    }

    // If beyond last station, use last station
    const last = stations[stations.length - 1];
    return [last.lat, last.lng];
  };

  const startCoord = kmToLatLng(block.km_start);
  const endCoord = kmToLatLng(block.km_end);

  if (!startCoord || !endCoord) return null;

  // Generate intermediate points for smooth curves
  const points = [startCoord];
  const steps = 5;
  for (let i = 1; i < steps; i++) {
    const ratio = i / steps;
    const km = block.km_start + ratio * (block.km_end - block.km_start);
    points.push(kmToLatLng(km));
  }
  points.push(endCoord);

  return points;
}
