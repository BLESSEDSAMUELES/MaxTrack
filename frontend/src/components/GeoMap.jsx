import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

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

export default function GeoMap({ state }) {
  const corridorKey = state.corridor || 'NDLS-CNB';
  const stations = STATION_COORDS[corridorKey] || STATION_COORDS['NDLS-CNB'];
  const sched = state.schedule || {};
  const blocks = sched.blocks || [];
  const isDNR = corridorKey === 'DNR-PNBE';
  const maxKm = isDNR ? 10.0 : 440.0;

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Helper to interpolate LatLng along corridor
  const kmToLatLng = (targetKm) => {
    const clampedKm = Math.max(0, Math.min(targetKm, maxKm));
    for (let i = 0; i < stations.length - 1; i++) {
      const s1 = stations[i];
      const s2 = stations[i + 1];
      if (clampedKm >= s1.km && clampedKm <= s2.km) {
        const segLen = s2.km - s1.km;
        const frac = segLen > 0 ? (clampedKm - s1.km) / segLen : 0;
        return [
          s1.lat + frac * (s2.lat - s1.lat),
          s1.lng + frac * (s2.lng - s1.lng)
        ];
      }
    }
    const last = stations[stations.length - 1];
    return [last.lat, last.lng];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Remove existing map if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter = isDNR ? [25.61, 85.09] : [27.5, 78.8];
    const defaultZoom = isDNR ? 13 : 7;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: true
    });
    mapInstanceRef.current = map;

    // CartoDB Positron / OpenStreetMap light tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors • Indian Railways CRIS BDMS',
      maxZoom: 18
    }).addTo(map);

    // Track polyline
    const trackLatLngs = stations.map((s) => [s.lat, s.lng]);
    L.polyline(trackLatLngs, {
      color: '#059669',
      weight: 5,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Station markers
    stations.forEach((st) => {
      const marker = L.circleMarker([st.lat, st.lng], {
        radius: 8,
        fillColor: '#0284c7',
        color: '#ffffff',
        weight: 2.5,
        opacity: 1,
        fillOpacity: 1
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 12px;">
          <div style="font-weight: 800; color: #0f172a;">${st.name} (${st.code})</div>
          <div style="color: #64748b;">Post: Km ${st.km.toFixed(1)}</div>
          <div style="color: #0284c7; font-weight: 600; margin-top: 4px;">Status: Active Block Station</div>
        </div>
      `);

      marker.bindTooltip(`${st.code} (${st.km.toFixed(0)}k)`, {
        permanent: true,
        direction: 'top',
        offset: [0, -10],
        className: 'font-mono text-[10px] font-bold'
      });
    });

    // Active Maintenance Block Segments
    blocks.forEach((b) => {
      const p1 = kmToLatLng(b.km_start);
      const p2 = kmToLatLng(b.km_end);
      const isPowerOff = b.power_off_required;

      const blockPoly = L.polyline([p1, p2], {
        color: isPowerOff ? '#d97706' : '#dc2626',
        weight: 10,
        opacity: 0.75,
        dashArray: '6, 4'
      }).addTo(map);

      const lead = b.lead_task || {};
      blockPoly.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 12px; max-width: 240px;">
          <div style="font-weight: 800; color: #dc2626;">${b.bundle_id}</div>
          <div style="font-weight: 600; margin: 2px 0;">${lead.task_type || 'Track Maintenance'}</div>
          <div style="color: #475569; font-size: 11px;">Section: Km ${Number(b.km_start || 0).toFixed(1)} - ${Number(b.km_end || 0).toFixed(1)}</div>
          <div style="color: #475569; font-size: 11px;">Duration: ${b.duration_minutes} mins</div>
          <div style="color: #0284c7; font-weight: 600; margin-top: 4px;">ES: ${b.elementary_section}</div>
          ${isPowerOff ? '<div style="color: #d97706; font-weight: 700; font-size: 10px; margin-top: 2px;">⚡ 25kV OHE POWER ISOLATION ACTIVE</div>' : ''}
        </div>
      `);
    });

    // Fit bounds
    if (trackLatLngs.length > 0) {
      map.fitBounds(L.latLngBounds(trackLatLngs), { padding: [50, 50] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [corridorKey, stations, blocks, isDNR, maxKm]);

  return (
    <div className="space-y-4">
      <div className="rail-card">
        <div className="card-header">
          <div>
            <div className="card-title">GEOSPATIAL CORRIDOR MAP OVERLAY</div>
            <div className="card-subtitle">
              Corridor: <strong>{isDNR ? 'Danapur – Patna Junction (DNR-PNBE 10 km)' : 'New Delhi – Kanpur Central (NDLS-CNB 440 km)'}</strong> • 
              Active Possessions: <strong className="text-red-600">{blocks.length}</strong> • Real-World Coordinates (OpenStreetMap)
            </div>
          </div>
          <span className="badge badge-eng">LEAFLET.JS LIVE MAP</span>
        </div>

        <div ref={mapContainerRef} className="geo-map-container" />

        <div className="map-legend">
          <div className="map-legend-item">
            <div className="map-legend-swatch bg-[#0284c7]" />
            <span>Station Marker</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-swatch bg-[#059669]" />
            <span>Track Alignment</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-swatch bg-[#dc2626] opacity-75" />
            <span>Active Maintenance Block</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-swatch bg-[#d97706]" />
            <span>25 kV OHE Power-Off Section</span>
          </div>
        </div>
      </div>
    </div>
  );
}
