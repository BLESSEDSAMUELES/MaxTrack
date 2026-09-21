import React, { useState } from 'react';

export default function DataBridge({ state, onShowToast }) {
  const data = state.dataBridge || {};
  const tms = data.tms_pway || [];
  const smms = data.smms_signals || [];
  const tdms = data.tdms_traction || [];
  const coa = data.coa_trains || [];
  const allTasks = [...tms, ...smms, ...tdms];

  const [activeDept, setActiveDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [safetyFilter, setSafetyFilter] = useState('all');
  const [isWireExpanded, setIsWireExpanded] = useState(false);

  const criticalCount = allTasks.filter(
    (t) => (t.safety_class || '').toLowerCase() === 'critical'
  ).length;
  const machinesCount = allTasks.filter(
    (t) => t.machine_required && t.machine_required !== 'Manual Gang'
  ).length;
  const cautionCount = tms.filter(
    (t) => t.caution_order_speed && t.caution_order_speed < 130
  ).length;

  const wireContractPayload = {
    header: {
      system: 'CRIS_BDMS_GATEWAY',
      version: '2.4.0-PROD',
      protocol: 'RAILNET_REST_JSON',
      timestamp: new Date().toISOString(),
      corridor_code: data.corridor?.corridor_code || state.corridor,
      zone: data.corridor?.zone || 'NR_NCR'
    },
    security: {
      auth_type: 'RAILNET_MUTUAL_TLS',
      token_id: 'CRIS-AUTH-TOKEN-994827-SECURE'
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

  // Filter tasks
  let filtered = allTasks;
  if (activeDept === 'tms') filtered = tms;
  else if (activeDept === 'smms') filtered = smms;
  else if (activeDept === 'tdms') filtered = tdms;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        (t.task_type || '').toLowerCase().includes(q) ||
        (t.id || '').toLowerCase().includes(q) ||
        (t.line || '').toLowerCase().includes(q) ||
        (t.elementary_section || '').toLowerCase().includes(q) ||
        (t.defect_detail || '').toLowerCase().includes(q)
    );
  }

  if (safetyFilter !== 'all') {
    filtered = filtered.filter(
      (t) => (t.safety_class || '').toLowerCase() === safetyFilter.toLowerCase()
    );
  }

  const copyWirePayload = () => {
    navigator.clipboard?.writeText(JSON.stringify(wireContractPayload, null, 2));
    onShowToast?.('CRIS Wire Contract copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Corridor Ingestion KPI Summary Grid */}
      <div className="data-bridge-kpi-grid">
        <div className="data-bridge-kpi-chip">
          <div className="chip-label">Total Requisitions Ingested</div>
          <div className="chip-value">{allTasks.length}</div>
          <div className="chip-sub text-[#0284c7] font-semibold">
            Harmonized TMS + SMMS + TDMS
          </div>
        </div>

        <div className="data-bridge-kpi-chip !border-l-blu-600">
          <div className="chip-label">Critical Safety Demands</div>
          <div className="chip-value text-red-600">{criticalCount}</div>
          <div className="chip-sub">IMR / G&SR 3.51 / ACTM Urgent</div>
        </div>

        <div className="data-bridge-kpi-chip !border-l-[#0284c7]">
          <div className="chip-label">Heavy Machines Requisitioned</div>
          <div className="chip-value text-[#059669]">{machinesCount}</div>
          <div className="chip-sub">CSM, BCM, UNIMAT & Tower Wagons</div>
        </div>

        <div className="data-bridge-kpi-chip !border-l-[#0284c7]">
          <div className="chip-label">Active Speed Restrictions</div>
          <div className="chip-value text-[#d97706]">{cautionCount}</div>
          <div className="chip-sub">Caution orders to be restored</div>
        </div>
      </div>

      {/* Main Ingestion Table Card */}
      <div className="rail-card">
        <div className="card-header pb-3">
          <div>
            <div className="card-title">CRIS MULTI-DEPARTMENT DATA INGESTION GATEWAY</div>
            <div className="card-subtitle">
              Live Ingested Feeds: <strong>TMS (Civil Track)</strong> • <strong>SMMS (Signalling)</strong> • <strong>TDMS (25kV OHE)</strong> • <strong>COA (WTT Paths)</strong>
            </div>
          </div>
          <div className="sub-tabs">
            <button
              className={`sub-tab-btn ${activeDept === 'all' ? 'active' : ''}`}
              onClick={() => setActiveDept('all')}
            >
              Unified View ({allTasks.length})
            </button>
            <button
              className={`sub-tab-btn ${activeDept === 'tms' ? 'active' : ''}`}
              onClick={() => setActiveDept('tms')}
            >
              TMS Track ({tms.length})
            </button>
            <button
              className={`sub-tab-btn ${activeDept === 'smms' ? 'active' : ''}`}
              onClick={() => setActiveDept('smms')}
            >
              SMMS Signals ({smms.length})
            </button>
            <button
              className={`sub-tab-btn ${activeDept === 'tdms' ? 'active' : ''}`}
              onClick={() => setActiveDept('tdms')}
            >
              TDMS OHE ({tdms.length})
            </button>
          </div>
        </div>

        {/* Live Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 mb-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-md">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <span className="text-[#64748b] text-xs">🔍︎</span>
            <input
              type="text"
              className="form-input !py-1 text-xs"
              placeholder="Search by ID, task type, line (e.g. UP_MAIN), or elementary section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#64748b]">Safety Filter:</span>
            <select
              className="select-box-light !py-1 text-xs"
              value={safetyFilter}
              onChange={(e) => setSafetyFilter(e.target.value)}
            >
              <option value="all">All Criticality Classes</option>
              <option value="critical">Critical / Emergency Only</option>
              <option value="high">High Priority Only</option>
              <option value="normal">Normal Periodic Only</option>
            </select>
          </div>
        </div>

        {/* Ingested Records Table */}
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <table className="rail-table">
            <thead>
              <tr>
                <th>ID & Dept</th>
                <th>Asset / Task Description</th>
                <th>Track & Km</th>
                <th>Elementary Section</th>
                <th>Machine Demand</th>
                <th>Caution Speed</th>
                <th>Criticality Class</th>
                <th>Operational Attributes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-[#64748b]">
                    No maintenance records match current query filters.
                  </td>
                </tr>
              ) : (
                filtered.map((t, idx) => {
                  const dept = t.department || 'ENG';
                  const badgeClass =
                    dept === 'ENG' ? 'badge-eng' : dept === 'SNT' ? 'badge-snt' : 'badge-trd';
                  const isCrit = (t.safety_class || '').toLowerCase() === 'critical';

                  return (
                    <tr key={t.id || idx}>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span className={`badge ${badgeClass}`}>{dept}</span>
                          <span className="font-mono text-xs font-bold text-[#0f172a]">{t.id}</span>
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold text-[#0f172a]">{t.task_type}</div>
                        <div className="text-[11px] text-[#64748b] leading-tight">
                          {t.defect_detail || 'Standard maintenance intervention'}
                        </div>
                      </td>
                      <td className="font-mono text-xs">
                        <span className="font-bold text-[#0f172a]">{t.line}</span>
                        <span className="text-[#64748b] block text-[11px]">
                          Km {Number(t.km_start || 0).toFixed(1)} - {Number(t.km_end || 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="font-mono text-xs font-semibold text-[#0284c7]">
                        {t.elementary_section || 'N/A'}
                      </td>
                      <td>
                        {t.machine_required ? (
                          <span className="badge badge-bundle">{t.machine_required}</span>
                        ) : (
                          <span className="text-[#94a3b8] text-[11px]">Manual Gang</span>
                        )}
                      </td>
                      <td className="font-mono font-bold">
                        {t.caution_order_speed && t.caution_order_speed < 130 ? (
                          <span className="text-[#d97706]">{t.caution_order_speed} km/h</span>
                        ) : (
                          <span className="text-[#64748b] font-normal">Normal (130)</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${isCrit ? 'badge-danger' : 'badge-snt'}`}>
                          {t.safety_class ? t.safety_class.toUpperCase() : 'NORMAL'}
                        </span>
                      </td>
                      <td className="text-[11px] text-[#475569]">
                        <div>Duration: <strong>{t.duration_minutes}m</strong></div>
                        <div>Power Cut: {t.requires_power_off ? <strong className="text-red-600">YES (25kV)</strong> : 'NO'}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collapsible CRIS Wire Contract JSON Payload */}
      <div className="rail-card">
        <div
          className="flex justify-between items-center cursor-pointer select-none"
          onClick={() => setIsWireExpanded(!isWireExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{isWireExpanded ? '▼' : '▶'}</span>
            <span className="card-title text-xs">
              CRIS BDMS REST/JSON WIRE CONTRACT (SYSTEM INTERFACE SPECIFICATION)
            </span>
            <span className="badge badge-eng">JSON PAYLOAD CONTRACT</span>
          </div>
          <span className="text-xs text-[#0284c7] font-semibold">
            {isWireExpanded ? 'Collapse Payload' : 'Expand Schema & Telemetry'}
          </span>
        </div>

        {isWireExpanded && (
          <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-[#64748b]">
                Standardized REST schema exchanged between CRIS TMS, SMMS, TDMS, and MaxTrack Two-Brain Solver.
              </span>
              <button
                className="sub-tab-btn text-xs font-bold"
                onClick={copyWirePayload}
              >
                Copy JSON Payload
              </button>
            </div>
            <pre className="code-inspector max-h-80 overflow-y-auto">
              {JSON.stringify(wireContractPayload, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
