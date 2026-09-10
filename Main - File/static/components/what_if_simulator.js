/**
 * What-If Disruption Simulator Module (Section 9) - Professional Light Minimalist Theme
 * Injects Real-Time Railway Incidents:
 * 1. Emergency Rail Fracture (IMR Flaw Insertion at Km 285.4)
 * 2. Block Bursting (Machine Mechanical Failure Overrun +45m)
 * 3. Adverse Weather / Thermal Stress (Rail Temp > 65°C Nocturnal Shift)
 */

export function renderWhatIfSimulator(container, state, onRunSimulation, onNavigate) {
  let simResult = state.simulationResult || null;
  const isApplied = state.status?.is_simulation_active;

  container.innerHTML = `
    <!-- Header Banner (Light Minimalist) -->
    <div class="rail-card" style="border-color: #fde68a; background: #fffbeb;">
      <div class="card-header" style="border-color: #fef3c7;">
        <div class="card-title" style="color: #b45309;">
          <span>◈ WHAT-IF DISRUPTION SIMULATOR & DYNAMIC RESCHEDULER</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${isApplied ? '<span class="badge badge-danger">PERTURBATION ACTIVE IN LIVE SYSTEM</span>' : '<span class="badge badge-trd">G&SR PERTURBATION TESTBED</span>'}
          ${isApplied ? '<button class="sub-tab-btn" id="btnResetBaselineSim" style="color: #dc2626; font-weight: 700;">Revert Baseline</button>' : ''}
        </div>
      </div>
      <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.6;">
        Simulates unplanned operational shocks on <strong>${state.corridor}</strong>. Triggers the Two-Brain pipeline to recalculate section capacity, adjust freight train paths, and produce an emergency re-scheduled block plan in &lt; 25ms.
      </div>
    </div>

    <!-- Scenario Cards Grid (Clean Light Cards) -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 22px;">
      <!-- Scenario 1: IMR Rail Fracture -->
      <div class="rail-card" style="margin-bottom: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="badge badge-danger">SCENARIO 1</span>
          <span style="font-size: 10px; color: var(--text-muted); font-weight: 600;">IRPWM Para 706</span>
        </div>
        <div style="font-weight: 700; color: var(--text-primary); font-size: 13px; margin-bottom: 4px;">Emergency Rail Fracture (IMR Flaw)</div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">
          Ultrasonic testing detects critical transverse rail flaw on UP_MAIN. Injects emergency 150m possession with fishplate clamping and freight train loop regulation.
        </p>
        <button class="action-btn-primary" id="btnSimIMR" style="width: 100%; justify-content: center; background: #dc2626; border-color: #b91c1c;">
          Inject IMR Fracture & Solve →
        </button>
      </div>

      <!-- Scenario 2: Block Bursting -->
      <div class="rail-card" style="margin-bottom: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="badge badge-trd">SCENARIO 2</span>
          <span style="font-size: 10px; color: var(--text-muted); font-weight: 600;">Machine Failure</span>
        </div>
        <div style="font-weight: 700; color: var(--text-primary); font-size: 13px; margin-bottom: 4px;">Block Bursting (+45m Machine Overrun)</div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">
          CSM 09-32 tamper encounters hydraulic seal blow-out, exceeding sanctioned window by 45 mins. Section Controller issues controlled advance order.
        </p>
        <button class="action-btn-primary" id="btnSimBurst" style="width: 100%; justify-content: center; background: #d97706; border-color: #b45309;">
          Inject Block Overrun & Regulate →
        </button>
      </div>

      <!-- Scenario 3: Thermal Stress -->
      <div class="rail-card" style="margin-bottom: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="badge badge-bundle">SCENARIO 3</span>
          <span style="font-size: 10px; color: var(--text-muted); font-weight: 600;">IRPWM Para 812</span>
        </div>
        <div style="font-weight: 700; color: var(--text-primary); font-size: 13px; margin-bottom: 4px;">Extreme Rail Temp Buckling (T > 65°C)</div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">
          Extreme solar heat drives rail temperature above destressing threshold. Automatically diverts all planned destressing blocks to nocturnal off-peak hours (01:30 AM).
        </p>
        <button class="action-btn-primary" id="btnSimTemp" style="width: 100%; justify-content: center; background: #0284c7; border-color: #0369a1;">
          Trigger Thermal Safety Shift →
        </button>
      </div>
    </div>

    <!-- Real-Time Simulation Result Output Container -->
    <div id="simResultContainer">
      ${simResult ? renderSimulationResultHTML(simResult, isApplied) : `
        <div class="rail-card" style="text-align: center; padding: 36px 20px; color: var(--text-muted); background: #f8fafc;">
          Select any operational perturbation above to simulate dynamic re-scheduling under Google OR-Tools CP-SAT.
        </div>
      `}
    </div>
  `;

  // Attach event listeners for scenarios
  document.getElementById("btnSimIMR")?.addEventListener("click", () => {
    onRunSimulation("IMR_FRACTURE");
  });

  document.getElementById("btnSimBurst")?.addEventListener("click", () => {
    onRunSimulation("BLOCK_BURST");
  });

  document.getElementById("btnSimTemp")?.addEventListener("click", () => {
    onRunSimulation("RAIL_TEMP");
  });

  // Attach Apply to Live System
  document.getElementById("btnApplyToLive")?.addEventListener("click", async () => {
    if (!simResult) return;
    const btn = document.getElementById("btnApplyToLive");
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Applying to Live System...';
    }

    try {
      const res = await fetch('/api/simulate/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: simResult.scenario_id,
          corridor: state.corridor,
          horizon: state.horizon
        })
      }).then(r => r.json());

      if (window.maxTrackApp) {
        state.schedule = res.schedule;
        state.kpis = res.kpis;
        state.status.is_simulation_active = true;
        state.status.active_simulation_name = res.scenario_name;
        window.maxTrackApp.showToast(`Perturbation '${res.scenario_name}' applied to live system!`, 'danger');
        renderWhatIfSimulator(container, state, onRunSimulation, onNavigate);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to apply perturbation: ' + err.message);
    }
  });

  // Attach Reset from Simulation Tab
  const attachReset = (btnId) => {
    document.getElementById(btnId)?.addEventListener("click", async () => {
      try {
        await fetch('/api/simulate/reset', { method: 'POST' });
        if (window.maxTrackApp) {
          await window.maxTrackApp.fetchInitialData();
          window.maxTrackApp.showToast('Schedule reverted to conflict-free baseline.', 'success');
          renderWhatIfSimulator(container, state, onRunSimulation, onNavigate);
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  attachReset("btnResetBaselineSim");
  attachReset("btnResetToNormal");

  // Navigation shortcuts
  document.getElementById("btnGoMareyFromSim")?.addEventListener("click", () => {
    if (onNavigate) onNavigate("marey_chart");
  });

  document.getElementById("btnGoSchedulerFromSim")?.addEventListener("click", () => {
    if (onNavigate) onNavigate("block_scheduler");
  });
}

export function renderSimulationResultHTML(sim, isApplied) {
  const sched = sim.revised_schedule || {};
  const blocks = sched.blocks || [];

  return `
    <div class="rail-card" style="border-color: #a7f3d0; background: #f0fdf4;">
      <div class="card-header" style="border-color: #d1fae5;">
        <div>
          <div class="card-title" style="color: #047857;">
            <span>✓ CP-SAT RE-OPTIMIZATION COMPLETE: ${sim.scenario_name}</span>
          </div>
          <div class="card-subtitle">${sim.description}</div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span class="badge badge-snt">SOLVED IN ${sim.elapsed_ms} MS</span>
          ${isApplied ? `
            <span class="badge badge-danger">APPLIED TO LIVE</span>
            <button class="sub-tab-btn" id="btnResetToNormal" style="color: #dc2626; font-weight: 700; font-size: 11px;">
              Revert Baseline
            </button>
          ` : `
            <button class="action-btn-primary" id="btnApplyToLive" style="background: #dc2626; border-color: #b91c1c; font-size: 11px;">
              Apply Revised Schedule to Live System →
            </button>
          `}
        </div>
      </div>

      <!-- Action Log Taken -->
      <div style="background: #ffffff; border: 1px solid #d1fae5; border-radius: 6px; padding: 12px 16px; margin-bottom: 14px; font-size: 11px;">
        <div style="font-weight: 700; color: #047857; margin-bottom: 4px;">OPERATIONAL MITIGATION PROTOCOL EXECUTED:</div>
        ${(sim.actions_taken || []).map(act => `
          <div style="color: var(--text-secondary); margin: 3px 0;">• ${act}</div>
        `).join('')}
      </div>

      <!-- Visual Diff Notification Banner -->
      <div class="diff-card" style="margin-bottom: 14px; margin-top: 0;">
        <div class="diff-header">
          <div class="diff-title">
            <span>⚡ DYNAMIC DISRUPTION IMPACT & FAST-FORWARD PREVIEW</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="sub-tab-btn" id="btnGoMareyFromSim" style="font-size: 11px; color: #0284c7; border-color: #bae6fd;">
              View Shift on Marey Chart →
            </button>
            <button class="sub-tab-btn" id="btnGoSchedulerFromSim" style="font-size: 11px; color: #059669; border-color: #bbf7d0;">
              View Block Scheduler →
            </button>
          </div>
        </div>
        <div style="font-size: 11px; color: #9a3412; line-height: 1.5;">
          ${sim.scenario_id === 'IMR_FRACTURE' ? 'Emergency 150m possession injected at priority 1 on UP_MAIN. Freight BOXN-701 regulated to avoid passenger conflicts.' : 
            (sim.scenario_id === 'BLOCK_BURST' ? 'Active continuous tamping block lengthened by 45m (+25%). Downstream trains regulated with 15m headway.' : 
             'Track thermal stress > 65°C: daytime destressing shifted to 01:30 AM night shadow window.')}
        </div>
      </div>

      <!-- Revised Blocks Preview -->
      <div style="font-size: 11px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
        REVISED CONFLICT-FREE SCHEDULE (${blocks.length} BLOCKS GENERATED):
      </div>

      <table class="rail-table">
        <thead>
          <tr>
            <th>Bundle ID</th>
            <th>Line</th>
            <th>Section Km</th>
            <th>Duration</th>
            <th>Traction Power</th>
            <th>Departments Synchronized</th>
            <th>Mitigation Justification</th>
          </tr>
        </thead>
        <tbody>
          ${blocks.map(b => {
            const isEm = b.is_emergency || (b.bundle_id && b.bundle_id.includes('EMERGENCY'));
            return `
              <tr style="${isEm ? 'background: #fff1f2;' : ''}">
                <td style="font-weight: 700; color: ${isEm ? '#dc2626' : '#0284c7'}; font-family: monospace;">
                  ${b.bundle_id} ${isEm ? '⚠️' : ''}
                </td>
                <td style="font-family: monospace;">${b.line}</td>
                <td style="font-family: monospace;">Km ${b.km_start.toFixed(1)} - ${b.km_end.toFixed(1)}</td>
                <td style="font-weight: 700; color: var(--text-primary);">${b.duration_minutes}m</td>
                <td>${b.power_off_required ? '<span class="badge badge-danger">25kV CUT</span>' : '<span class="badge badge-snt">LIVE</span>'}</td>
                <td>${(b.departments || []).join(' + ')}</td>
                <td style="font-size: 11px; color: var(--text-secondary); max-width: 320px;">${b.justification}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

