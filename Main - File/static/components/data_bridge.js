/**
 * Data Bridge Module (Section 5) - Professional Indian Railways Console Theme
 * Harmonized Multi-Department Ingestion Explorer: TMS, SMMS, TDMS, and COA
 * High-Density Industrial UI with Live Search, KPI Chips & Collapsible Wire Contract
 */

export function renderDataBridge(container, state) {
  const data = state.dataBridge || {};
  const tms = data.tms_pway || [];
  const smms = data.smms_signals || [];
  const tdms = data.tdms_traction || [];
  const coa = data.coa_trains || [];
  const allTasks = [...tms, ...smms, ...tdms];

  // Calculate high-level summary KPIs
  const criticalCount = allTasks.filter(t => (t.safety_class || '').toLowerCase() === 'critical').length;
  const machinesCount = allTasks.filter(t => t.machine_required && t.machine_required !== 'Manual Gang').length;
  const cautionCount = tms.filter(t => t.caution_order_speed && t.caution_order_speed < 130).length;

  let activeDepartment = 'all';
  let searchQuery = '';
  let safetyFilter = 'all';
  let isWireExpanded = false;

  const wireContractPayload = {
    header: {
      system: "CRIS_BDMS_GATEWAY",
      version: "2.4.0-PROD",
      protocol: "RAILNET_REST_JSON",
      timestamp: new Date().toISOString(),
      corridor_code: data.corridor?.corridor_code || state.corridor,
      zone: data.corridor?.zone || "NR_NCR"
    },
    security: {
      auth_type: "RAILNET_MUTUAL_TLS",
      token_id: "CRIS-AUTH-TOKEN-994827-SECURE"
    },
    ingested_telemetry: {
      total_tms_records: tms.length,
      total_smms_records: smms.length,
      total_tdms_records: tdms.length,
      total_wtt_paths: coa.length,
      critical_safety_demands: criticalCount,
      heavy_machines_demanded: machinesCount,
      active_caution_speed_orders: cautionCount,
      corridor: data.corridor,
      stations: data.stations
    }
  };

  function renderFullModule() {
    container.innerHTML = `
      <!-- Top Corridor Ingestion KPI Summary Grid -->
      <div class="data-bridge-kpi-grid">
        <div class="data-bridge-kpi-chip">
          <div class="chip-label">Total Requisitions Ingested</div>
          <div class="chip-value">${allTasks.length}</div>
          <div class="chip-sub" style="color: #0284c7; font-weight: 600;">Harmonized TMS + SMMS + TDMS</div>
        </div>

        <div class="data-bridge-kpi-chip" style="border-left: 3px solid var(--accent-danger);">
          <div class="chip-label">Critical Safety Demands</div>
          <div class="chip-value" style="color: #dc2626;">${criticalCount}</div>
          <div class="chip-sub">IMR / G&SR 3.51 / ACTM Urgent</div>
        </div>

        <div class="data-bridge-kpi-chip" style="border-left: 3px solid var(--accent-snt);">
          <div class="chip-label">Heavy Machines Requisitioned</div>
          <div class="chip-value" style="color: #059669;">${machinesCount}</div>
          <div class="chip-sub">CSM, BCM, UNIMAT & Tower Wagons</div>
        </div>

        <div class="data-bridge-kpi-chip" style="border-left: 3px solid var(--accent-trd);">
          <div class="chip-label">Active Speed Restrictions</div>
          <div class="chip-value" style="color: #d97706;">${cautionCount}</div>
          <div class="chip-sub">Caution orders to be restored</div>
        </div>
      </div>

      <!-- Main Ingestion Table Card -->
      <div class="rail-card">
        <div class="card-header" style="padding-bottom: 12px;">
          <div>
            <div class="card-title">CRIS MULTI-DEPARTMENT DATA INGESTION GATEWAY</div>
            <div class="card-subtitle">
              Live Ingested Feeds: <strong>TMS (Civil Track)</strong> • <strong>SMMS (Signalling)</strong> • <strong>TDMS (25kV OHE)</strong> • <strong>COA (WTT Paths)</strong>
            </div>
          </div>
          <div class="sub-tabs">
            <button class="sub-tab-btn ${activeDepartment === 'all' ? 'active' : ''}" id="tabAll">
              Unified View (${allTasks.length})
            </button>
            <button class="sub-tab-btn ${activeDepartment === 'tms' ? 'active' : ''}" id="tabTms">
              TMS Track (${tms.length})
            </button>
            <button class="sub-tab-btn ${activeDepartment === 'smms' ? 'active' : ''}" id="tabSmms">
              SMMS Signals (${smms.length})
            </button>
            <button class="sub-tab-btn ${activeDepartment === 'tdms' ? 'active' : ''}" id="tabTdms">
              TDMS OHE (${tdms.length})
            </button>
            <button class="sub-tab-btn ${activeDepartment === 'coa' ? 'active' : ''}" id="tabCoa">
              COA Trains (${coa.length})
            </button>
          </div>
        </div>

        <!-- Interactive Search & Safety Filter Toolbar -->
        <div class="data-bridge-toolbar" style="padding: 0 16px 12px 16px;">
          <div class="data-bridge-search-box">
            <span class="data-bridge-search-icon">🔍</span>
            <input 
              type="text" 
              id="bridgeSearchInput" 
              class="data-bridge-search-input" 
              placeholder="Search by ID, station, line, defect detail, or machine type..."
              value="${searchQuery}"
            >
          </div>

          <div style="display: flex; gap: 8px; align-items: center;">
            <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">Safety Class:</span>
            <select class="select-box-light" id="safetyFilterSelect" style="padding: 6px 10px; font-size: 11px; width: 140px;">
              <option value="all" ${safetyFilter === 'all' ? 'selected' : ''}>All Classes</option>
              <option value="critical" ${safetyFilter === 'critical' ? 'selected' : ''}>Critical Only</option>
              <option value="high" ${safetyFilter === 'high' ? 'selected' : ''}>High & Medium</option>
            </select>
          </div>
        </div>

        <!-- Table Container -->
        <div id="bridgeTableContent" style="overflow-x: auto;"></div>
      </div>

      <!-- Collapsible CRIS RailNet REST/JSON Wire Payload Inspector -->
      <div class="collapsible-wire-drawer">
        <button class="collapsible-wire-toggle" id="btnToggleWireDrawer">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>◈</span>
            <span>RAW CRIS RAILNET REST/JSON WIRE PAYLOAD INSPECTOR</span>
            <span class="badge badge-bundle" style="font-size: 9px;">MUTUAL_TLS VERIFIED</span>
          </div>
          <div style="font-size: 11px; color: #0284c7;" id="wireDrawerLabel">
            ${isWireExpanded ? '▲ Collapse Wire Inspector' : '▼ Expand Statutory Wire Payload'}
          </div>
        </button>

        <div class="collapsible-wire-content ${isWireExpanded ? 'expanded' : ''}" id="wireDrawerContent">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 11px; color: var(--text-secondary);">
              Production M2M contract serialized for CRIS BDMS and COA over secure RAILNET network.
            </div>
            <button class="action-btn-primary" id="btnCopyWirePayload" style="padding: 4px 10px; font-size: 10px;">
              📋 Copy JSON Payload
            </button>
          </div>
          <div class="code-inspector" style="max-height: 280px; overflow-y: auto;">
            <pre id="rawWirePre">${JSON.stringify(wireContractPayload, null, 2)}</pre>
          </div>
        </div>
      </div>
    `;

    attachEvents();
    renderCurrentTable();
  }

  function renderCurrentTable() {
    const contentEl = document.getElementById("bridgeTableContent");
    if (!contentEl) return;

    const query = searchQuery.toLowerCase().trim();

    if (activeDepartment === 'coa') {
      let filtered = coa.filter(t => {
        if (!query) return true;
        return (
          t.train_no.toLowerCase().includes(query) ||
          t.train_name.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          t.direction.toLowerCase().includes(query)
        );
      });

      if (filtered.length === 0) {
        contentEl.innerHTML = `<div style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 12px;">No matching train paths found.</div>`;
        return;
      }

      contentEl.innerHTML = `
        <table class="rail-table">
          <thead>
            <tr>
              <th>Train No</th>
              <th>Train Name</th>
              <th>Category</th>
              <th>Direction</th>
              <th>Max Speed</th>
              <th>Origin Departure</th>
              <th>Destination Arrival</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(t => `
              <tr>
                <td style="font-weight: 700; color: #0284c7; font-family: monospace;">${t.train_no}</td>
                <td style="color: var(--text-primary); font-weight: 600;">${t.train_name}</td>
                <td><span class="badge ${t.category.includes('PREMIUM') ? 'badge-danger' : 'badge-bundle'}">${t.category}</span></td>
                <td style="font-family: monospace; font-weight: 700;">${t.direction}</td>
                <td style="font-weight: 700; color: #059669; font-family: monospace;">${t.speed_kmh} km/h</td>
                <td style="font-family: monospace;">${t.schedule[0].station} (${formatMinToTime(t.schedule[0].dep_min)})</td>
                <td style="font-family: monospace;">${t.schedule[t.schedule.length-1].station} (${formatMinToTime(t.schedule[t.schedule.length-1].arr_min)})</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      return;
    }

    // Determine dataset for task records
    let baseList = [];
    if (activeDepartment === 'all') baseList = allTasks;
    else if (activeDepartment === 'tms') baseList = tms;
    else if (activeDepartment === 'smms') baseList = smms;
    else if (activeDepartment === 'tdms') baseList = tdms;

    // Apply safety filter
    if (safetyFilter === 'critical') {
      baseList = baseList.filter(t => (t.safety_class || '').toLowerCase() === 'critical');
    } else if (safetyFilter === 'high') {
      baseList = baseList.filter(t => (t.safety_class || '').toLowerCase() !== 'critical');
    }

    // Apply text search
    let filtered = baseList.filter(t => {
      if (!query) return true;
      return (
        (t.id && t.id.toLowerCase().includes(query)) ||
        (t.line && t.line.toLowerCase().includes(query)) ||
        (t.task_type && t.task_type.toLowerCase().includes(query)) ||
        (t.defect_detail && t.defect_detail.toLowerCase().includes(query)) ||
        (t.machine_required && t.machine_required.toLowerCase().includes(query)) ||
        (t.elementary_section && t.elementary_section.toLowerCase().includes(query))
      );
    });

    if (filtered.length === 0) {
      contentEl.innerHTML = `
        <div style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 12px;">
          No matching maintenance requisitions found for current search/filter.
        </div>
      `;
      return;
    }

    // Render department-specific or unified view
    if (activeDepartment === 'tms') {
      contentEl.innerHTML = `
        <table class="rail-table">
          <thead>
            <tr>
              <th>TMS ID</th>
              <th>Line</th>
              <th>Km Marker</th>
              <th>P-Way Defect & Requisition</th>
              <th>TQI Index</th>
              <th>Caution Speed</th>
              <th>Required Machine</th>
              <th>Overdue</th>
              <th>Safety Class</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(t => `
              <tr>
                <td style="font-weight: 700; color: #0284c7; font-family: monospace;">${t.id}</td>
                <td style="font-family: monospace; font-weight: 600;">${t.line}</td>
                <td style="font-family: monospace;">Km ${t.km_start.toFixed(1)} - ${t.km_end.toFixed(1)}</td>
                <td style="color: var(--text-primary); font-weight: 600;">
                  ${t.task_type}
                  <div style="font-size: 10px; color: var(--text-muted); font-weight: normal; margin-top: 2px;">
                    ${t.defect_detail || ''}
                  </div>
                </td>
                <td style="font-weight: 700; color: #d97706; font-family: monospace;">${t.tqi || 35.0}</td>
                <td style="color: #dc2626; font-weight: 700; font-family: monospace;">${t.caution_order_speed || 30} km/h</td>
                <td style="font-weight: 500;">${t.machine_required || 'Manual Gang'}</td>
                <td style="color: #d97706; font-weight: 600; font-family: monospace;">${t.days_overdue || 0}d / ${t.codal_interval_days || 90}d</td>
                <td><span class="badge ${t.safety_class === 'critical' ? 'badge-danger' : 'badge-eng'}">${t.safety_class || 'high'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeDepartment === 'smms') {
      contentEl.innerHTML = `
        <table class="rail-table">
          <thead>
            <tr>
              <th>SMMS ID</th>
              <th>Line</th>
              <th>Km Marker</th>
              <th>Signalling Gear & Failure Detail</th>
              <th>Sensor Vibration</th>
              <th>Insulation Resistance</th>
              <th>Power Cut</th>
              <th>Statutory Memo</th>
              <th>Safety Class</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(t => `
              <tr>
                <td style="font-weight: 700; color: #059669; font-family: monospace;">${t.id}</td>
                <td style="font-family: monospace; font-weight: 600;">${t.line}</td>
                <td style="font-family: monospace;">Km ${t.km_start.toFixed(1)} - ${t.km_end.toFixed(1)}</td>
                <td style="color: var(--text-primary); font-weight: 600;">
                  ${t.task_type}
                  <div style="font-size: 10px; color: var(--text-muted); font-weight: normal; margin-top: 2px;">
                    ${t.defect_detail || ''}
                  </div>
                </td>
                <td style="font-weight: 700; color: ${t.sensor_vibration_mms > 5 ? '#dc2626' : '#059669'}; font-family: monospace;">
                  ${t.sensor_vibration_mms || 3.0} mm/s
                </td>
                <td style="font-weight: 700; color: #0284c7; font-family: monospace;">
                  ${t.insulation_mohm || 80.0} MΩ
                </td>
                <td><span class="badge ${t.requires_power_off ? 'badge-danger' : 'badge-bundle'}">${t.requires_power_off ? 'YES (25kV)' : 'NO'}</span></td>
                <td><span class="badge badge-snt">Form S&T T/351</span></td>
                <td><span class="badge ${t.safety_class === 'critical' ? 'badge-danger' : 'badge-snt'}">${t.safety_class}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeDepartment === 'tdms') {
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
              <th>Required Machine</th>
              <th>Safety Rule</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(t => `
              <tr>
                <td style="font-weight: 700; color: #d97706; font-family: monospace;">${t.id}</td>
                <td style="font-family: monospace; font-weight: 600;">${t.line}</td>
                <td style="font-weight: 700; color: #0284c7; font-family: monospace;">${t.elementary_section}</td>
                <td style="font-family: monospace;">${t.feeding_post}</td>
                <td style="font-family: monospace; font-weight: 700; color: #0369a1;">${t.isolator_id}</td>
                <td style="color: var(--text-primary); font-weight: 600;">
                  ${t.task_type}
                  <div style="font-size: 10px; color: var(--text-muted); font-weight: normal; margin-top: 2px;">
                    ${t.defect_detail || ''}
                  </div>
                </td>
                <td style="font-weight: 700; color: #0284c7; font-family: monospace;">${t.duration_minutes}m</td>
                <td>${t.machine_required || 'Manual OHE Gang'}</td>
                <td><span class="badge badge-trd">Form TRD-PB-2 (PTW)</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      // Unified View across all departments
      contentEl.innerHTML = `
        <table class="rail-table">
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Source</th>
              <th>Dept</th>
              <th>Line</th>
              <th>Location</th>
              <th>Defect / Requisition Detail</th>
              <th>Machine / Crew</th>
              <th>Duration</th>
              <th>Power Cut</th>
              <th>Safety Class</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(t => {
              const deptBadge = t.department === 'ENG' ? 'badge-eng' : (t.department === 'SNT' ? 'badge-snt' : 'badge-trd');
              return `
                <tr>
                  <td style="font-weight: 700; color: #0284c7; font-family: monospace;">${t.id}</td>
                  <td><span class="badge ${deptBadge}">${t.source_system}</span></td>
                  <td style="font-weight: 600; color: var(--text-primary);">${t.department}</td>
                  <td style="font-family: monospace; font-weight: 600;">${t.line}</td>
                  <td style="font-family: monospace;">Km ${t.km_start.toFixed(1)} - ${t.km_end.toFixed(1)}</td>
                  <td style="color: var(--text-primary); font-weight: 500;">
                    ${t.task_type}
                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">${t.defect_detail || ''}</div>
                  </td>
                  <td>${t.machine_required || 'Manual Gang'}</td>
                  <td style="font-weight: 700; color: #0284c7; font-family: monospace;">${t.duration_minutes}m</td>
                  <td><span class="badge ${t.requires_power_off ? 'badge-danger' : 'badge-bundle'}">${t.requires_power_off ? 'YES' : 'NO'}</span></td>
                  <td><span class="badge ${t.safety_class === 'critical' ? 'badge-danger' : 'badge-trd'}">${t.safety_class}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }
  }

  function attachEvents() {
    // Sub-tab switching
    const tabs = [
      { id: "tabAll", key: "all" },
      { id: "tabTms", key: "tms" },
      { id: "tabSmms", key: "smms" },
      { id: "tabTdms", key: "tdms" },
      { id: "tabCoa", key: "coa" }
    ];

    tabs.forEach(({ id, key }) => {
      document.getElementById(id)?.addEventListener("click", () => {
        activeDepartment = key;
        tabs.forEach(t => document.getElementById(t.id)?.classList.toggle("active", t.key === key));
        renderCurrentTable();
      });
    });

    // Live search input
    const searchInput = document.getElementById("bridgeSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderCurrentTable();
      });
    }

    // Safety class filter
    const safetySelect = document.getElementById("safetyFilterSelect");
    if (safetySelect) {
      safetySelect.addEventListener("change", (e) => {
        safetyFilter = e.target.value;
        renderCurrentTable();
      });
    }

    // Collapsible Wire Drawer Toggle
    const toggleBtn = document.getElementById("btnToggleWireDrawer");
    const drawerContent = document.getElementById("wireDrawerContent");
    const drawerLabel = document.getElementById("wireDrawerLabel");

    toggleBtn?.addEventListener("click", () => {
      isWireExpanded = !isWireExpanded;
      drawerContent?.classList.toggle("expanded", isWireExpanded);
      if (drawerLabel) {
        drawerLabel.textContent = isWireExpanded 
          ? "▲ Collapse Wire Inspector" 
          : "▼ Expand Statutory Wire Payload";
      }
    });

    // Copy JSON Wire Payload Button
    document.getElementById("btnCopyWirePayload")?.addEventListener("click", () => {
      navigator.clipboard?.writeText(JSON.stringify(wireContractPayload, null, 2))
        .then(() => {
          const btn = document.getElementById("btnCopyWirePayload");
          if (btn) {
            const orig = btn.textContent;
            btn.textContent = "✓ Copied to Clipboard!";
            btn.style.background = "#15803d";
            setTimeout(() => {
              btn.textContent = orig;
              btn.style.background = "";
            }, 2000);
          }
        })
        .catch(err => console.error("Clipboard copy failed:", err));
    });
  }

  function formatMinToTime(minutes) {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  renderFullModule();
}
