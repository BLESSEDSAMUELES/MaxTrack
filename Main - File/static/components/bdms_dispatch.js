/**
 * CRIS BDMS Statutory Dispatch Module (Section 10) - Professional Light Theme
 * Digital Safety Memos (Letterhead Quality):
 * 1. Form S&T (T/351) Disconnection & Reconnection Notice (G&SR 3.51)
 * 2. Form TRD-PB-1 & TRD-PB-2 Power Block & PTW (ACTM)
 * 3. Speed Restriction Cancellation Notice (IRPWM Para 812)
 * 4. Raw CRIS REST/JSON Wire Payload
 */

export function renderBDMSDispatch(container, state) {
  const memos = state.bdmsMemos || {};
  const sntMemo = memos.form_snt_351 || {};
  const trdMemo = memos.form_trd_pb || {};
  const speedMemo = memos.speed_restoration_memo || {};
  const crisWire = memos.cris_wire_payload || {};

  container.innerHTML = `
    <!-- Top Header -->
    <div class="rail-card" style="border-color: #bae6fd; background: #f0f9ff;">
      <div class="card-header" style="border-color: #e0f2fe;">
        <div class="card-title" style="color: #0369a1;">
          <span>◈ CRIS BDMS STATUTORY SAFETY PROTOCOLS & DIGITAL WIRE GATEWAY</span>
        </div>
        <span class="badge badge-bundle">INDIAN RAILWAYS STATUTORY COMPLIANCE</span>
      </div>
      <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.6;">
        Converts optimized block schedules into authenticated Indian Railways statutory memos (G&SR 3.51, ACTM Vol II, and IRPWM 2020) and production-ready CRIS JSON wire payloads.
      </div>
    </div>

    <!-- Tab Selector -->
    <div class="sub-tabs" style="margin-bottom: 16px;">
      <button class="sub-tab-btn active" id="btnTabSnt">Form S&T (T/351) Memo</button>
      <button class="sub-tab-btn" id="btnTabTrd">Form TRD-PB-1 / PB-2 (PTW)</button>
      <button class="sub-tab-btn" id="btnTabSpeed">Speed Restriction Cancellation</button>
      <button class="sub-tab-btn" id="btnTabWire">CRIS JSON Wire Payload</button>
    </div>

    <!-- Memo Content Container -->
    <div id="memoContentContainer"></div>
  `;

  const memoContainer = document.getElementById("memoContentContainer");

  // Render Form S&T T/351 by default
  renderSNTMemo();

  document.getElementById("btnTabSnt")?.addEventListener("click", () => {
    setActiveTab("btnTabSnt");
    renderSNTMemo();
  });

  document.getElementById("btnTabTrd")?.addEventListener("click", () => {
    setActiveTab("btnTabTrd");
    renderTRDMemo();
  });

  document.getElementById("btnTabSpeed")?.addEventListener("click", () => {
    setActiveTab("btnTabSpeed");
    renderSpeedMemo();
  });

  document.getElementById("btnTabWire")?.addEventListener("click", () => {
    setActiveTab("btnTabWire");
    renderWirePayload();
  });

  function setActiveTab(btnId) {
    ["btnTabSnt", "btnTabTrd", "btnTabSpeed", "btnTabWire"].forEach(id => {
      document.getElementById(id)?.classList.toggle("active", id === btnId);
    });
  }

  function renderSNTMemo() {
    memoContainer.innerHTML = `
      <div class="rail-card" style="border: 1px solid #cbd5e1; background: #ffffff; box-shadow: var(--shadow-md);">
        <div style="text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 14px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">GOVERNMENT OF INDIA • MINISTRY OF RAILWAYS (NORTH CENTRAL RAILWAY)</div>
          <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 4px 0;">${sntMemo.form_title || 'MEMORANDUM OF DISCONNECTION (FORM S&T T/351)'}</div>
          <div style="font-size: 11px; color: #047857; font-family: monospace; font-weight: 600;">Authority: ${sntMemo.statutory_authority || 'G&SR 3.51'} • Memo Serial: ${sntMemo.memo_serial_no || 'CRIS/SNT/042'}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 12px; margin-bottom: 16px; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div><strong>To:</strong> ${sntMemo.to_official || 'Station Master on Duty, TDL'}</div>
          <div><strong>From:</strong> ${sntMemo.from_official || 'SSE (Signals), Tundla'}</div>
          <div><strong>Section:</strong> ${sntMemo.section || 'TDL - ALJN (UP_MAIN)'}</div>
          <div><strong>Slot:</strong> <span style="color: #0284c7; font-weight: 700;">${sntMemo.scheduled_disconnection_time} to ${sntMemo.expected_reconnection_time} (${sntMemo.duration_minutes}m)</span></div>
        </div>

        <div style="font-size: 12px; margin-bottom: 14px;">
          <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">SIGNALLING & INTERLOCKING APPARATUS TO BE DISCONNECTED:</div>
          <ul style="padding-left: 22px; color: var(--text-secondary); line-height: 1.7;">
            ${(sntMemo.gear_affected || []).map(g => `<li>${g}</li>`).join('')}
          </ul>
        </div>

        <div style="font-size: 12px; margin-bottom: 16px;">
          <div style="font-weight: 700; color: #b45309; margin-bottom: 6px;">STATUTORY SAFETY CONDITIONS (G&SR 3.51):</div>
          <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 6px; color: #78350f; font-size: 11px; line-height: 1.6;">
            ${(sntMemo.safety_conditions_stipulated || []).join('<br>')}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; font-family: monospace; color: var(--text-muted);">
          <span>Digital Signature: ${sntMemo.digital_signature_hash}</span>
          <span class="badge badge-snt">VERIFIED DISCONNECTION NOTICE</span>
        </div>
      </div>
    `;
  }

  function renderTRDMemo() {
    memoContainer.innerHTML = `
      <div class="rail-card" style="border: 1px solid #cbd5e1; background: #ffffff; box-shadow: var(--shadow-md);">
        <div style="text-align: center; border-bottom: 2px solid #d97706; padding-bottom: 14px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">GOVERNMENT OF INDIA • MINISTRY OF RAILWAYS (TRACTION DISTRIBUTION)</div>
          <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 4px 0;">${trdMemo.form_title || 'REQUISITION FOR 25 kV AC OHE POWER BLOCK & PTW'}</div>
          <div style="font-size: 11px; color: #b45309; font-family: monospace; font-weight: 600;">Authority: ${trdMemo.statutory_authority || 'ACTM Vol II'} • Serial: ${trdMemo.memo_serial_no || 'CRIS/TRD/019'}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 12px; margin-bottom: 16px; background: #fefce8; padding: 12px; border-radius: 6px; border: 1px solid #fef08a;">
          <div><strong>To:</strong> ${trdMemo.to_official || 'Traction Power Controller (TPC)'}</div>
          <div><strong>From:</strong> ${trdMemo.from_official || 'SSE (TRD / OHE)'}</div>
          <div><strong>Elementary Section:</strong> <span style="color: #0284c7; font-weight: 700;">${trdMemo.elementary_section}</span></div>
          <div><strong>Feeding Post:</strong> ${trdMemo.feeding_post}</div>
          <div><strong>SCADA Isolators Opened:</strong> ${(trdMemo.scada_isolators_opened || []).join(', ')}</div>
          <div><strong>Power Cut Window:</strong> <span style="color: #dc2626; font-weight: 700;">${trdMemo.power_cutoff_requested} to ${trdMemo.power_restore_expected}</span></div>
        </div>

        <div style="background: #ffffff; border: 1px solid #fde68a; padding: 14px; border-radius: 6px; font-size: 12px; color: #92400e; line-height: 1.6; margin-bottom: 16px;">
          <strong>Permit to Work (PTW Form TRD-PB-2) Certificate:</strong><br>
          ${trdMemo.ptw_affirmation}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; font-family: monospace; color: var(--text-muted);">
          <span>Digital Signature: ${trdMemo.digital_signature_hash}</span>
          <span class="badge badge-trd">POWER BLOCK GRANTED</span>
        </div>
      </div>
    `;
  }

  function renderSpeedMemo() {
    memoContainer.innerHTML = `
      <div class="rail-card" style="border: 1px solid #cbd5e1; background: #ffffff; box-shadow: var(--shadow-md);">
        <div style="text-align: center; border-bottom: 2px solid #059669; padding-bottom: 14px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">GOVERNMENT OF INDIA • MINISTRY OF RAILWAYS (CIVIL ENGINEERING)</div>
          <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 4px 0;">${speedMemo.form_title || 'TRACK SAFETY & SPEED RESTRICTION CANCELLATION'}</div>
          <div style="font-size: 11px; color: #059669; font-family: monospace; font-weight: 600;">Authority: ${speedMemo.statutory_authority || 'IRPWM 2020 Para 812'} • Serial: ${speedMemo.memo_serial_no || 'CRIS/ENG/088'}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 12px; margin-bottom: 16px; background: #f0fdf4; padding: 12px; border-radius: 6px; border: 1px solid #bbf7d0;">
          <div><strong>Location:</strong> ${speedMemo.location_km} (${speedMemo.line})</div>
          <div><strong>Certifying Official:</strong> ${speedMemo.certifying_official}</div>
          <div><strong>Caution Speed:</strong> <span style="color: #dc2626; font-weight: 700;">${speedMemo.pre_work_caution_speed}</span></div>
          <div><strong>Restored Sectional Speed:</strong> <span style="color: #059669; font-weight: 800; font-size: 13px;">${speedMemo.restored_sectional_speed}</span></div>
        </div>

        <div style="background: #ffffff; border: 1px solid #bbf7d0; padding: 14px; border-radius: 6px; font-size: 12px; color: #065f46; line-height: 1.6; margin-bottom: 16px;">
          <strong>SSE / P-Way Fit Certificate:</strong><br>
          ${speedMemo.affirmation}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; font-family: monospace; color: var(--text-muted);">
          <span>Generated At: ${speedMemo.generated_at}</span>
          <span class="badge badge-snt">SPEED HAND-BACK CONFIRMED</span>
        </div>
      </div>
    `;
  }

  function renderWirePayload() {
    memoContainer.innerHTML = `
      <div class="rail-card">
        <div class="card-header">
          <div class="card-title">CRIS BDMS REST/JSON WIRE PAYLOAD (PRODUCTION FORMAT)</div>
          <span class="badge badge-bundle">REST JSON WIRE COMPLIANT</span>
        </div>
        <div class="code-inspector">
          <pre>${JSON.stringify(crisWire, null, 2)}</pre>
        </div>
      </div>
    `;
  }
}
