/**
 * Data Bridge Module (Section 5) - Professional Light Minimalist Theme
 * Harmonized Multi-Department Ingestion Explorer: TMS, SMMS, TDMS, and COA
 */

export function renderDataBridge(container, state) {
  const data = state.dataBridge || {};
  const tms = data.tms_pway || [];
  const smms = data.smms_signals || [];
  const tdms = data.tdms_traction || [];
  const coa = data.coa_trains || [];

  container.innerHTML = `
    <div class="rail-card">
      <div class="card-header">
        <div>
          <div class="card-title">CRIS MULTI-DEPARTMENT DATA INGESTION GATEWAY</div>
          <div class="card-subtitle">Harmonized Datasets: TMS (P-Way), SMMS (Signals), TDMS (Traction), COA (WTT)</div>
        </div>
        <div class="sub-tabs">
          <button class="sub-tab-btn active" id="tabAll">Unified View</button>
          <button class="sub-tab-btn" id="tabTms">TMS (Track)</button>
          <button class="sub-tab-btn" id="tabSmms">SMMS (Signals)</button>
          <button class="sub-tab-btn" id="tabTdms">TDMS (OHE)</button>
          <button class="sub-tab-btn" id="tabCoa">COA (WTT Trains)</button>
        </div>
      </div>

      <div id="bridgeTableContent">
        <!-- Default: Unified Defect Records -->
        <table class="rail-table">
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Source</th>
              <th>Dept</th>
              <th>Track Line</th>
              <th>Location</th>
              <th>Defect / Requisition</th>
              <th>Machine / Gear</th>
              <th>Duration</th>
              <th>Safety Class</th>
            </tr>
          </thead>
          <tbody>
            ${[...tms, ...smms, ...tdms].map(t => `
              <tr>
                <td style="font-weight: 700; color: #0284c7; font-family: monospace;">${t.id}</td>
                <td><span class="badge ${t.department === 'ENG' ? 'badge-eng' : t.department === 'SNT' ? 'badge-snt' : 'badge-trd'}">${t.source_system}</span></td>
                <td style="font-weight: 600; color: var(--text-primary);">${t.department}</td>
                <td style="font-family: monospace; color: var(--text-primary);">${t.line}</td>
                <td style="font-family: monospace;">Km ${t.km_start.toFixed(1)} - ${t.km_end.toFixed(1)}</td>
                <td style="color: var(--text-primary); font-weight: 500;">${t.task_type}</td>
                <td>${t.machine_required || 'Manual Gang'}</td>
                <td style="font-weight: 700; color: #0284c7;">${t.duration_minutes}m</td>
                <td><span class="badge ${t.safety_class === 'critical' ? 'badge-danger' : 'badge-trd'}">${t.safety_class}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Raw Wire JSON Payload Preview -->
    <div class="rail-card">
      <div class="card-header">
        <div class="card-title">RAW CRIS RAILNET REST/JSON WIRE PAYLOAD INSPECTOR</div>
        <span class="badge badge-bundle">MUTUAL_TLS VERIFIED</span>
      </div>
      <div class="code-inspector">
        <pre>${JSON.stringify({
          corridor: data.corridor,
          total_ingested_tms: tms.length,
          total_ingested_smms: smms.length,
          total_ingested_tdms: tdms.length,
          total_wtt_train_paths: coa.length,
          stations: data.stations
        }, null, 2)}</pre>
      </div>
    </div>
  `;

  // Filter tab clicks
  const contentEl = document.getElementById("bridgeTableContent");

  document.getElementById("tabAll")?.addEventListener("click", () => {
    setActiveTab("tabAll");
    renderDataBridge(container, state);
  });

  document.getElementById("tabTms")?.addEventListener("click", () => {
    setActiveTab("tabTms");
    contentEl.innerHTML = `
      <table class="rail-table">
        <thead>
          <tr>
            <th>TMS ID</th>
            <th>Line</th>
            <th>Km Marker</th>
            <th>P-Way Defect</th>
            <th>TQI Index</th>
            <th>Caution Speed</th>
            <th>Required Machine</th>
            <th>Overdue</th>
          </tr>
        </thead>
        <tbody>
          ${tms.map(t => `
            <tr>
              <td style="font-weight: 700; color: #0284c7; font-family: monospace;">${t.id}</td>
              <td style="font-family: monospace;">${t.line}</td>
              <td style="font-family: monospace;">Km ${t.km_start} - ${t.km_end}</td>
              <td style="color: var(--text-primary); font-weight: 600;">${t.task_type}<br><span style="font-size: 10px; color: var(--text-muted); font-weight: normal;">${t.defect_detail}</span></td>
              <td style="font-weight: 700; color: #d97706;">${t.tqi}</td>
              <td style="color: #dc2626; font-weight: 700;">${t.caution_order_speed} km/h</td>
              <td>${t.machine_required || 'None'}</td>
              <td style="color: #d97706; font-weight: 600;">${t.days_overdue} days</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  });

  document.getElementById("tabSmms")?.addEventListener("click", () => {
    setActiveTab("tabSmms");
    contentEl.innerHTML = `
      <table class="rail-table">
        <thead>
          <tr>
            <th>SMMS ID</th>
            <th>Line</th>
            <th>Km Marker</th>
            <th>Signalling Gear</th>
            <th>Failure Detail</th>
            <th>Vibration (mm/s)</th>
            <th>Insulation (MΩ)</th>
            <th>G&SR Protocol</th>
          </tr>
        </thead>
        <tbody>
          ${smms.map(t => `
            <tr>
              <td style="font-weight: 700; color: #059669; font-family: monospace;">${t.id}</td>
              <td style="font-family: monospace;">${t.line}</td>
              <td style="font-family: monospace;">Km ${t.km_start} - ${t.km_end}</td>
              <td style="color: var(--text-primary); font-weight: 600;">${t.task_type}</td>
              <td style="color: var(--text-secondary);">${t.defect_detail}</td>
              <td style="font-weight: 700; color: #dc2626;">${t.sensor_vibration_mms} mm/s</td>
              <td style="font-weight: 700; color: #0284c7;">${t.insulation_mohm} MΩ</td>
              <td><span class="badge badge-snt">Form S&T T/351</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  });

  document.getElementById("tabTdms")?.addEventListener("click", () => {
    setActiveTab("tabTdms");
    contentEl.innerHTML = `
      <table class="rail-table">
        <thead>
          <tr>
            <th>TDMS ID</th>
            <th>Line</th>
            <th>Elementary Sec</th>
            <th>Feeding Post</th>
            <th>SCADA Isolator</th>
            <th>OHE Maintenance Detail</th>
            <th>Duration</th>
            <th>Safety Rule</th>
          </tr>
        </thead>
        <tbody>
          ${tdms.map(t => `
            <tr>
              <td style="font-weight: 700; color: #d97706; font-family: monospace;">${t.id}</td>
              <td style="font-family: monospace;">${t.line}</td>
              <td style="font-weight: 700; color: #0284c7;">${t.elementary_section}</td>
              <td>${t.feeding_post}</td>
              <td style="font-family: monospace;">${t.isolator_id}</td>
              <td style="color: var(--text-primary); font-weight: 600;">${t.task_type}</td>
              <td style="font-weight: 700; color: var(--text-primary);">${t.duration_minutes}m</td>
              <td><span class="badge badge-trd">Form TRD-PB-2 (PTW)</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  });

  document.getElementById("tabCoa")?.addEventListener("click", () => {
    setActiveTab("tabCoa");
    contentEl.innerHTML = `
      <table class="rail-table">
        <thead>
          <tr>
            <th>Train No</th>
            <th>Train Name</th>
            <th>Category</th>
            <th>Direction</th>
            <th>Section Speed</th>
            <th>Origin Departure</th>
            <th>Destination Arrival</th>
          </tr>
        </thead>
        <tbody>
          ${coa.map(t => `
            <tr>
              <td style="font-weight: 700; color: #0284c7; font-family: monospace;">${t.train_no}</td>
              <td style="color: var(--text-primary); font-weight: 600;">${t.train_name}</td>
              <td><span class="badge ${t.category.includes('PREMIUM') ? 'badge-danger' : 'badge-bundle'}">${t.category}</span></td>
              <td style="font-family: monospace;">${t.direction}</td>
              <td style="font-weight: 700; color: #059669;">${t.speed_kmh} km/h</td>
              <td>${t.schedule[0].station} (${formatMinToTime(t.schedule[0].dep_min)})</td>
              <td>${t.schedule[t.schedule.length-1].station} (${formatMinToTime(t.schedule[t.schedule.length-1].arr_min)})</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  });

  function setActiveTab(activeId) {
    ["tabAll", "tabTms", "tabSmms", "tabTdms", "tabCoa"].forEach(id => {
      document.getElementById(id)?.classList.toggle("active", id === activeId);
    });
  }

  function formatMinToTime(minutes) {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}
