import React, { useState } from 'react';
import { getExportT351Url } from '../services/api';

export default function BDMSDispatch({ state, onShowToast }) {
  const memos = state.bdmsMemos || {};
  const sntMemo = memos.form_snt_351 || {};
  const trdMemo = memos.form_trd_pb || {};
  const speedMemo = memos.speed_restoration_memo || {};
  const crisWire = memos.cris_wire_payload || {};

  const [activeTab, setActiveTab] = useState('snt');

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    onShowToast?.(`${label} copied to clipboard!`, 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="rail-card border-[#bae6fd] bg-[#f0f9ff]">
        <div className="card-header border-[#e0f2fe]">
          <div className="card-title text-[#0369a1]">
            <span>◈ CRIS BDMS STATUTORY SAFETY PROTOCOLS & DIGITAL WIRE GATEWAY</span>
          </div>
          <span className="badge badge-bundle">INDIAN RAILWAYS STATUTORY COMPLIANCE</span>
        </div>
        <div className="text-[11px] text-[#475569] leading-relaxed">
          Converts optimized block schedules into authenticated Indian Railways statutory memos (G&SR 3.51, ACTM Vol II, and IRPWM 2020) and production-ready CRIS JSON wire payloads.
        </div>
      </div>

      {/* Tab Selector */}
      <div className="sub-tabs flex-wrap">
        <button
          className={`sub-tab-btn ${activeTab === 'snt' ? 'active' : ''}`}
          onClick={() => setActiveTab('snt')}
        >
          Form S&T (T/351) Memo
        </button>
        <button
          className={`sub-tab-btn ${activeTab === 'trd' ? 'active' : ''}`}
          onClick={() => setActiveTab('trd')}
        >
          Form TRD-PB-1 / PB-2 (PTW)
        </button>
        <button
          className={`sub-tab-btn ${activeTab === 'speed' ? 'active' : ''}`}
          onClick={() => setActiveTab('speed')}
        >
          Speed Restriction Cancellation
        </button>
        <button
          className={`sub-tab-btn ${activeTab === 'wire' ? 'active' : ''}`}
          onClick={() => setActiveTab('wire')}
        >
          CRIS JSON Wire Payload
        </button>
        <button
          className="sub-tab-btn !text-[#7c3aed] !border-[#ddd6fe] font-bold"
          onClick={() => window.open(getExportT351Url(), '_blank')}
        >
          📄 Export Printable T/351 →
        </button>
      </div>

      {/* Tab 1: Form S&T (T/351) Memo */}
      {activeTab === 'snt' && (
        <div className="rail-card border-[#cbd5e1] bg-white shadow-md">
          <div className="text-center border-b-2 border-[#0284c7] pb-3.5 mb-4">
            <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              GOVERNMENT OF INDIA • MINISTRY OF RAILWAYS (NORTH CENTRAL RAILWAY)
            </div>
            <div className="text-base font-extrabold text-[#0f172a] my-1">
              {sntMemo.form_title || 'MEMORANDUM OF DISCONNECTION (FORM S&T T/351)'}
            </div>
            <div className="text-[11px] text-[#047857] font-mono font-semibold">
              Authority: {sntMemo.statutory_authority || 'G&SR 3.51'} • Memo Serial: {sntMemo.memo_serial_no || 'CRIS/SNT/042'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-4 bg-[#f8fafc] p-3 rounded-md border border-[#e2e8f0]">
            <div><strong>To:</strong> {sntMemo.to_official || 'Station Master on Duty, TDL'}</div>
            <div><strong>From:</strong> {sntMemo.from_official || 'SSE (Signals), Tundla'}</div>
            <div><strong>Section:</strong> {sntMemo.section || 'TDL - ALJN (UP_MAIN)'}</div>
            <div>
              <strong>Slot:</strong> <span className="text-[#0284c7] font-bold">{sntMemo.scheduled_disconnection_time} to {sntMemo.expected_reconnection_time} ({sntMemo.duration_minutes}m)</span>
            </div>
          </div>

          <div className="text-xs mb-3.5">
            <div className="font-bold text-[#0f172a] mb-1.5">SIGNALLING & INTERLOCKING APPARATUS TO BE DISCONNECTED:</div>
            <ul className="list-disc pl-5 text-[#475569] space-y-1">
              {(sntMemo.gear_affected || [
                'Point Machine 104A & 104B detector slides & lock bar',
                'Track Circuit 104T / Axle Counter clamping unit',
                'Advanced Starter Signal No. 12 (Down Direction) locked red'
              ]).map((g, gi) => (
                <li key={gi}>{g}</li>
              ))}
            </ul>
          </div>

          <div className="text-xs mb-4 bg-[#ecfdf5] border border-[#a7f3d0] p-3 rounded-md text-[#065f46] leading-relaxed">
            <strong>STATUTORY DECLARATION (G&SR 3.51 Para 4):</strong><br />
            I hereby certify that all relevant lever handles / VDU controls have been clamped and padlocked normal, and red warning collars applied to track circuits. Train movements through the affected section will take place strictly on Written Paper Authority (T/369-3b).
          </div>

          <div className="flex justify-between items-center text-xs text-[#64748b] border-t border-[#e2e8f0] pt-3">
            <div>Digital Signature: <strong>SSE / Signals (P-Way Joint Requisition)</strong></div>
            <button
              className="action-btn-primary text-xs"
              onClick={() => copyToClipboard(JSON.stringify(sntMemo, null, 2), 'Form S&T T/351')}
            >
              Copy Memo Data
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Form TRD-PB-1 / PB-2 (PTW) */}
      {activeTab === 'trd' && (
        <div className="rail-card border-[#fde68a] bg-white shadow-md">
          <div className="text-center border-b-2 border-[#d97706] pb-3.5 mb-4">
            <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              INDIAN RAILWAYS • TRACTION DISTRIBUTION BRANCH (ACTM VOL II)
            </div>
            <div className="text-base font-extrabold text-[#0f172a] my-1">
              {trdMemo.form_title || 'PERMIT TO WORK (PTW) & 25 kV AC TRACTION POWER BLOCK MEMO'}
            </div>
            <div className="text-[11px] text-[#b45309] font-mono font-semibold">
              Authority: ACTM Chapter 6 • Memo Ref: {trdMemo.permit_number || 'TRD/PTW/2026/088'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-4 bg-[#fffbeb] p-3 rounded-md border border-[#fef3c7]">
            <div><strong>Traction Power Controller:</strong> {trdMemo.tpc_officer || 'TPC / Prayagraj Division'}</div>
            <div><strong>Authorised Person (Field):</strong> {trdMemo.authorised_person || 'SSE (TRD), Aligarh Jn'}</div>
            <div><strong>Elementary Section:</strong> <span className="text-[#d97706] font-bold font-mono">{trdMemo.elementary_section || 'ES-24B (Km 280.0 - 286.8)'}</span></div>
            <div><strong>Feeding Post:</strong> {trdMemo.feeding_post || 'FP-TDL (Sub-Station)'}</div>
          </div>

          <div className="text-xs mb-3.5">
            <div className="font-bold text-[#0f172a] mb-1.5">ISOLATORS TO BE OPENED & EARTHED:</div>
            <ul className="list-disc pl-5 text-[#475569] space-y-1">
              {(trdMemo.isolators_opened || [
                'Isolator Switch SM-24B locked in OPEN position',
                'Isolator Switch SM-25A locked in OPEN position',
                'Discharge earth rods clamped at Mast 280/14 and 286/22'
              ]).map((iso, ii) => (
                <li key={ii}>{iso}</li>
              ))}
            </ul>
          </div>

          <div className="text-xs mb-4 bg-[#fef2f2] border border-[#fecaca] p-3 rounded-md text-[#991b1b] leading-relaxed">
            <strong>CRITICAL ELECTRICAL SAFETY UNDERTAKING:</strong><br />
            The 25 kV AC overhead equipment within the specified elementary section has been completely isolated from all supply feeds, discharged to rail ground, and proved dead. Work is strictly permitted only within the earthed boundary.
          </div>

          <div className="flex justify-between items-center text-xs text-[#64748b] border-t border-[#e2e8f0] pt-3">
            <div>Permit Status: <span className="badge badge-trd">ACTIVE SHADOW PTW</span></div>
            <button
              className="action-btn-primary text-xs !bg-[#d97706] !border-[#b45309]"
              onClick={() => copyToClipboard(JSON.stringify(trdMemo, null, 2), 'TRD PTW Memo')}
            >
              Copy TRD Permit
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Speed Restriction Cancellation Notice */}
      {activeTab === 'speed' && (
        <div className="rail-card border-[#bbf7d0] bg-white shadow-md">
          <div className="text-center border-b-2 border-[#059669] pb-3.5 mb-4">
            <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              INDIAN RAILWAYS • CIVIL PERMANENT WAY ENGINEERING (IRPWM 2020)
            </div>
            <div className="text-base font-extrabold text-[#0f172a] my-1">
              {speedMemo.form_title || 'CAUTION ORDER REVOCATION & SPEED RESTORATION CERTIFICATE'}
            </div>
            <div className="text-[11px] text-[#047857] font-mono font-semibold">
              Authority: IRPWM Para 812 • Notice: {speedMemo.memo_id || 'ENG/RESTORE/2026/014'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-4 bg-[#f0fdf4] p-3 rounded-md border border-[#bbf7d0]">
            <div><strong>Nodal P-Way Engineer:</strong> {speedMemo.pway_engineer || 'ADEN (Track), Tundla'}</div>
            <div><strong>Section Controller Advised:</strong> {speedMemo.section_controller || 'Dy. Controller (Track), NCR'}</div>
            <div><strong>Track Km Location:</strong> <span className="font-mono font-bold">{speedMemo.location || 'Km 285.500 to Km 286.800 (UP_MAIN)'}</span></div>
            <div><strong>Restored Line Speed:</strong> <span className="text-[#059669] font-bold font-mono text-sm">{speedMemo.restored_speed_kmh || 130} km/h (Normal Sectional Speed)</span></div>
          </div>

          <div className="text-xs mb-4 text-[#475569] leading-relaxed">
            Following continuous mechanized tamping by CSM 09-32 and dynamic track stabilization (DGS), the track parameters have been certified within codal tolerances: Track Quality Index (TQI) = 31.2, Twist &lt; 2.0 mm/3.6m. The previous 30 km/h caution order is hereby unconditionally cancelled.
          </div>

          <div className="flex justify-between items-center text-xs text-[#64748b] border-t border-[#e2e8f0] pt-3">
            <div>Speed Status: <span className="badge badge-snt">130 KM/H RESTORED</span></div>
            <button
              className="action-btn-primary text-xs !bg-[#059669] !border-[#047857]"
              onClick={() => copyToClipboard(JSON.stringify(speedMemo, null, 2), 'Speed Restoration Memo')}
            >
              Copy Speed Certificate
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: CRIS JSON Wire Payload */}
      {activeTab === 'wire' && (
        <div className="rail-card">
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="card-title text-xs">RAW CRIS BDMS/COA XML/JSON DISPATCH PAYLOAD</div>
              <div className="text-[11px] text-[#64748b]">
                Machine-to-machine payload transmitted across Indian Railways RailNet to update COA timetable graphs.
              </div>
            </div>
            <button
              className="action-btn-primary text-xs"
              onClick={() => copyToClipboard(JSON.stringify(crisWire, null, 2), 'Wire Payload')}
            >
              Copy Wire JSON
            </button>
          </div>
          <pre className="code-inspector max-h-96 overflow-y-auto">
            {JSON.stringify(crisWire, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
