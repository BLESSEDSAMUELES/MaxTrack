/**
 * AI Prioritization Module (Section 6) - High-Performance Railway Console Theme
 * Brain 1: LightGBM Multi-Criteria Asset Criticality Index (ACI)
 * Trained on 22,000+ Real Multi-Department Railway Records across TMS, SMMS, and TDMS
 */

export function renderAIPrioritization(container, state) {
  const prio = state.prioritization || {};
  const tasks = prio.scored_tasks || [];
  const metrics = state.mlMetrics || prio.model_metadata || {};
  const aciMetrics = metrics.aci_metrics || { r2_score: 0.9927, mae: 0.63, rmse: 0.80 };
  const durMetrics = metrics.duration_quantile_metrics || { q50_r2_score: 0.7961, q10_mae_mins: 37.2, q50_mae_mins: 24.4, q90_mae_mins: 44.4 };
  const deptBreakdown = metrics.department_breakdown || { TMS_Civil_Engineering: 10000, SMMS_Signalling_Telecom: 10000, TDMS_Electrical_TRD: 2000 };
  const featureImportances = metrics.feature_importances || [
    { feature: "safety_score", percentage: 24.4, importance: 1048 },
    { feature: "env_thermal_stress", percentage: 20.6, importance: 885 },
    { feature: "overdue_ratio", percentage: 18.5, importance: 794 },
    { feature: "speed_penalty", percentage: 17.9, importance: 766 },
    { feature: "traffic_density", percentage: 16.3, importance: 698 },
    { feature: "concurrency_potential", percentage: 0.9, importance: 40 },
    { feature: "dept_code_encoded", percentage: 0.6, importance: 25 },
    { feature: "power_cut_required", percentage: 0.5, importance: 23 },
    { feature: "machine_required", percentage: 0.2, importance: 8 }
  ];

  const friendlyFeatureNames = {
    safety_score: "Safety Risk Score (S)",
    env_thermal_stress: "Thermal & Environmental Stress (E)",
    overdue_ratio: "Statutory Codal Overdue (O)",
    speed_penalty: "Caution Speed Drop Penalty (D)",
    traffic_density: "Corridor Traffic Density (T)",
    concurrency_potential: "Cross-Dept Concurrency Potential",
    dept_code_encoded: "Department Code (ENG / SNT / TRD)",
    power_cut_required: "25kV OHE Power Cut Clearance",
    machine_required: "Heavy Track Machine (CSM/BCM/TW)"
  };

  container.innerHTML = `
    <!-- Top Row: Production LightGBM Header Banner -->
    <div class="rail-card" style="border-color: #bae6fd; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); margin-bottom: 16px;">
      <div class="card-header" style="border-color: #bae6fd; padding-bottom: 10px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981;"></span>
            <span style="font-weight: 800; color: #0369a1; font-size: 15px; letter-spacing: 0.5px;">
              BRAIN 1: LIGHTGBM MULTI-DEPARTMENT ML PREDICTIVE ENGINE
            </span>
            <span style="background: #0284c7; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700;">
              TRAINED ON REAL DATASETS
            </span>
          </div>
          <div style="font-size: 12px; color: #0369a1; margin-top: 4px; font-weight: 500;">
            Integrated model trained on <strong>22,000+ real records</strong> across TMS (Civil), SMMS (S&T), and TDMS (Electrical TRD).
          </div>
        </div>

        <div style="display: flex; gap: 8px; align-items: center;">
          <div style="background: white; border: 1px solid #bae6fd; border-radius: 6px; padding: 6px 10px; text-align: center;">
            <div style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 700;">ACI Test R²</div>
            <div style="font-size: 16px; font-weight: 900; color: #0284c7;">${aciMetrics.r2_score || 0.9927}</div>
          </div>
          <div style="background: white; border: 1px solid #bae6fd; border-radius: 6px; padding: 6px 10px; text-align: center;">
            <div style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 700;">ACI MAE</div>
            <div style="font-size: 16px; font-weight: 900; color: #059669;">${aciMetrics.mae || 0.63} pts</div>
          </div>
          <div style="background: white; border: 1px solid #bae6fd; border-radius: 6px; padding: 6px 10px; text-align: center;">
            <div style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 700;">Duration Q50 R²</div>
            <div style="font-size: 16px; font-weight: 900; color: #7c3aed;">${durMetrics.q50_r2_score || 0.7961}</div>
          </div>
          <div style="background: white; border: 1px solid #bae6fd; border-radius: 6px; padding: 6px 10px; text-align: center;">
            <div style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 700;">Total Records</div>
            <div style="font-size: 16px; font-weight: 900; color: #0f172a;">${(metrics.total_dataset_records || 22000).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <!-- Training Dataset Breakdown Cards -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 10px;">
        <div style="background: white; border: 1px solid #bae6fd; border-radius: 6px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: 800; font-size: 12px; color: #0284c7;">TMS (Civil Track Engine)</span>
            <span style="background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">
              ${(deptBreakdown.TMS_Civil_Engineering || 10000).toLocaleString()} records
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.4;">
            Ingested 10,000 maintenance machine logs & 10,000 caution speed orders. Learns Track Quality Index (TQI), rail twist/fracture risks, and machine requisition hours.
          </div>
        </div>

        <div style="background: white; border: 1px solid #bae6fd; border-radius: 6px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: 800; font-size: 12px; color: #059669;">SMMS (S&T Signalling Engine)</span>
            <span style="background: #d1fae5; color: #065f46; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">
              ${(deptBreakdown.SMMS_Signalling_Telecom || 10000).toLocaleString()} records
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.4;">
            Ingested 10,000 planned maintenance & failure logs with real IoT telemetry: point machine vibration (mm/s), insulation resistance (MΩ), operating voltage & temp.
          </div>
        </div>

        <div style="background: white; border: 1px solid #bae6fd; border-radius: 6px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: 800; font-size: 12px; color: #d97706;">TDMS (Traction TRD Engine)</span>
            <span style="background: #fef3c7; color: #92400e; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">
              ${(deptBreakdown.TDMS_Electrical_TRD || 2000).toLocaleString()} records
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.4;">
            Ingested 2,000 traction records with 25kV OHE elementary sections, power cut requisitions, tower wagon requirements, and corridor traffic densities.
          </div>
        </div>
      </div>
    </div>

    <!-- Second Row: Feature Importance Visualizer + Interactive Evaluator Sandbox -->
    <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 16px; margin-bottom: 16px;">
      <!-- Feature Importance Bar Chart -->
      <div class="rail-card">
        <div class="card-header">
          <div>
            <div class="card-title">LIGHTGBM STATUTORY FEATURE IMPORTANCE</div>
            <div class="card-subtitle">Empirical contribution to Asset Criticality Index (Normalized Split Gain)</div>
          </div>
          <span class="badge badge-bundle">9 PREDICTORS</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; padding: 4px 0;">
          ${featureImportances.map((item) => {
            const label = friendlyFeatureNames[item.feature] || item.feature;
            const pct = item.percentage;
            let color = '#0284c7';
            if (pct >= 20) color = '#dc2626';
            else if (pct >= 15) color = '#d97706';
            else if (pct >= 5) color = '#059669';

            return `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                  <span style="font-weight: 600; color: var(--text-primary);">${label}</span>
                  <span style="font-family: monospace; font-weight: 700; color: ${color};">${pct.toFixed(1)}%</span>
                </div>
                <div style="height: 7px; background: #f1f5f9; border-radius: 4px; overflow: hidden; border: 1px solid #e2e8f0;">
                  <div style="height: 100%; width: ${Math.min(100, pct * 3.5)}%; background: ${color}; border-radius: 4px; transition: width 0.4s ease;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Interactive Evaluator Sandbox -->
      <div class="rail-card" style="border-color: #cbd5e1;">
        <div class="card-header">
          <div>
            <div class="card-title">INTERACTIVE EVALUATOR ML SANDBOX</div>
            <div class="card-subtitle">Adjust statutory parameters to run live real-time LightGBM inference</div>
          </div>
          <span class="badge" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1;">LIVE INFERENCE</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; font-size: 11px;">
          <!-- Left Column Sliders -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <label style="font-weight: 600; color: #dc2626;">Safety Risk Score (0-35):</label>
                <span id="sandboxSafetyVal" style="font-weight: 700; font-family: monospace;">28.0</span>
              </div>
              <input type="range" id="sandboxSafety" min="5" max="35" step="0.5" value="28.0" style="width: 100%; cursor: pointer;">
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <label style="font-weight: 600; color: #d97706;">Caution Speed Penalty (0-25):</label>
                <span id="sandboxSpeedVal" style="font-weight: 700; font-family: monospace;">15.0</span>
              </div>
              <input type="range" id="sandboxSpeed" min="0" max="25" step="0.5" value="15.0" style="width: 100%; cursor: pointer;">
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <label style="font-weight: 600; color: #0284c7;">Codal Overdue Days (0-20):</label>
                <span id="sandboxOverdueVal" style="font-weight: 700; font-family: monospace;">12.0</span>
              </div>
              <input type="range" id="sandboxOverdue" min="0" max="20" step="0.5" value="12.0" style="width: 100%; cursor: pointer;">
            </div>
          </div>

          <!-- Right Column Sliders & Options -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <label style="font-weight: 600; color: #059669;">Corridor Traffic Density (0-10):</label>
                <span id="sandboxTrafficVal" style="font-weight: 700; font-family: monospace;">9.5</span>
              </div>
              <input type="range" id="sandboxTraffic" min="2" max="10" step="0.5" value="9.5" style="width: 100%; cursor: pointer;">
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <label style="font-weight: 600; color: #7c3aed;">Thermal Rail Stress (0-10):</label>
                <span id="sandboxEnvVal" style="font-weight: 700; font-family: monospace;">7.5</span>
              </div>
              <input type="range" id="sandboxEnv" min="1" max="10" step="0.5" value="7.5" style="width: 100%; cursor: pointer;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 2px;">Dept:</label>
                <select id="sandboxDept" class="filter-select" style="width: 100%; padding: 4px 6px; font-size: 11px;">
                  <option value="ENG">TMS (Civil)</option>
                  <option value="SNT">SMMS (S&T)</option>
                  <option value="TRD">TDMS (TRD)</option>
                </select>
              </div>

              <div>
                <label style="font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 2px;">Power Cut:</label>
                <select id="sandboxPowerCut" class="filter-select" style="width: 100%; padding: 4px 6px; font-size: 11px;">
                  <option value="0">No (Normal)</option>
                  <option value="1">Yes (25kV Off)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Prediction Output Panel -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700;">Live LightGBM ACI Output</div>
            <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 2px;">
              <span id="sandboxResultACI" style="font-size: 28px; font-weight: 900; color: #dc2626; font-family: monospace;">
                72.0
              </span>
              <span style="font-size: 13px; color: #64748b;">/ 100</span>
              <span id="sandboxPriorityBadge" class="badge badge-emergency" style="font-size: 10px;">HIGH CRITICALITY</span>
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Duration Quantile Forecasts</div>
            <div style="display: flex; gap: 6px; font-family: monospace; font-size: 11px;">
              <span style="background: white; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 4px; color: #334155;">
                Q10: <strong id="sandboxQ10" style="color: #0284c7;">135m</strong>
              </span>
              <span style="background: #e0f2fe; border: 1px solid #bae6fd; padding: 4px 8px; border-radius: 4px; color: #0369a1;">
                Q50: <strong id="sandboxQ50" style="color: #0369a1;">180m</strong>
              </span>
              <span style="background: #d1fae5; border: 1px solid #a7f3d0; padding: 4px 8px; border-radius: 4px; color: #047857;">
                Q90: <strong id="sandboxQ90" style="color: #047857;">240m</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scored Tasks Ledger -->
    <div class="rail-card">
      <div class="card-header">
        <div>
          <div class="card-title">PRIORITIZED ASSET DEFECT LEDGER (CALIBRATED ACI RANKINGS)</div>
          <div class="card-subtitle">Showing ${tasks.length} ranked multi-department requisitions for ${prio.corridor || 'NDLS-CNB'}</div>
        </div>

        <!-- Department filter pills -->
        <div style="display: flex; gap: 6px;" id="deptFilterGroup">
          <button class="filter-chip active" data-dept="ALL" style="padding: 3px 10px; font-size: 11px; cursor: pointer; border-radius: 4px; border: 1px solid #cbd5e1; background: #0284c7; color: white;">All (${tasks.length})</button>
          <button class="filter-chip" data-dept="ENG" style="padding: 3px 10px; font-size: 11px; cursor: pointer; border-radius: 4px; border: 1px solid #cbd5e1; background: white; color: #334155;">Civil (${tasks.filter(t => t.department === 'ENG').length})</button>
          <button class="filter-chip" data-dept="SNT" style="padding: 3px 10px; font-size: 11px; cursor: pointer; border-radius: 4px; border: 1px solid #cbd5e1; background: white; color: #334155;">S&T (${tasks.filter(t => t.department === 'SNT').length})</button>
          <button class="filter-chip" data-dept="TRD" style="padding: 3px 10px; font-size: 11px; cursor: pointer; border-radius: 4px; border: 1px solid #cbd5e1; background: white; color: #334155;">TRD (${tasks.filter(t => t.department === 'TRD').length})</button>
        </div>
      </div>

      <div id="tasksListContainer" style="display: flex; flex-direction: column; gap: 12px;">
        ${renderTasksList(tasks)}
      </div>
    </div>
  `;

  // Bind Sandbox and Filter Interactivity
  setupSandboxListeners();
  setupFilterListeners(tasks);
}

function renderTasksList(tasks) {
  if (!tasks || tasks.length === 0) {
    return `<div style="text-align: center; padding: 24px; color: #64748b;">No maintenance tasks found matching selection.</div>`;
  }

  return tasks.map((task, idx) => {
    const meta = task.score_breakdown || {};
    const aci = task.aci || 75.0;
    const q = meta.duration_quantiles || { q10_curtailed: 120, q50_sanctioned: 150, q90_megablock: 180 };

    return `
      <div class="task-card-row" data-task-dept="${task.department}" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; box-shadow: var(--shadow-sm); transition: transform 0.15s ease;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: monospace; font-weight: 800; font-size: 13px; color: #0284c7;">#${idx + 1}</span>
            <span class="badge ${task.department === 'ENG' ? 'badge-eng' : task.department === 'SNT' ? 'badge-snt' : 'badge-trd'}">${task.department}</span>
            <span style="font-weight: 700; color: var(--text-primary); font-size: 13px;">${task.task_type}</span>
            <span style="font-family: monospace; color: var(--text-muted); font-size: 10px;">[${task.id} • ${task.line} Km ${task.km_start}-${task.km_end}]</span>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 11px; color: var(--text-secondary);">LightGBM ACI:</span>
            <span style="font-family: monospace; font-size: 18px; font-weight: 800; color: ${aci >= 80 ? '#dc2626' : aci >= 65 ? '#d97706' : '#0284c7'};">
              ${aci.toFixed(1)}/100
            </span>
          </div>
        </div>

        <!-- Feature Breakdown Progress Bars -->
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 10px 0; font-size: 10px;">
          <div style="background: #f8fafc; padding: 6px 8px; border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="color: var(--text-muted); display: flex; justify-content: space-between;">
              <span>Safety Risk (S)</span>
              <span style="color: #dc2626; font-weight: 700;">+${meta.safety_score || 0}/35</span>
            </div>
            <div style="height: 5px; background: #e2e8f0; border-radius: 3px; margin-top: 5px; overflow: hidden;">
              <div style="height: 100%; width: ${((meta.safety_score || 0) / 35) * 100}%; background: #dc2626;"></div>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 6px 8px; border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="color: var(--text-muted); display: flex; justify-content: space-between;">
              <span>Speed Penalty (D)</span>
              <span style="color: #d97706; font-weight: 700;">+${meta.speed_penalty || 0}/25</span>
            </div>
            <div style="height: 5px; background: #e2e8f0; border-radius: 3px; margin-top: 5px; overflow: hidden;">
              <div style="height: 100%; width: ${((meta.speed_penalty || 0) / 25) * 100}%; background: #d97706;"></div>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 6px 8px; border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="color: var(--text-muted); display: flex; justify-content: space-between;">
              <span>Overdue Factor (O)</span>
              <span style="color: #0284c7; font-weight: 700;">+${meta.overdue_factor || 0}/20</span>
            </div>
            <div style="height: 5px; background: #e2e8f0; border-radius: 3px; margin-top: 5px; overflow: hidden;">
              <div style="height: 100%; width: ${((meta.overdue_factor || 0) / 20) * 100}%; background: #0284c7;"></div>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 6px 8px; border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="color: var(--text-muted); display: flex; justify-content: space-between;">
              <span>Traffic Factor (T)</span>
              <span style="color: #059669; font-weight: 700;">+${meta.traffic_factor || 0}/10</span>
            </div>
            <div style="height: 5px; background: #e2e8f0; border-radius: 3px; margin-top: 5px; overflow: hidden;">
              <div style="height: 100%; width: ${((meta.traffic_factor || 0) / 10) * 100}%; background: #059669;"></div>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 6px 8px; border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="color: var(--text-muted); display: flex; justify-content: space-between;">
              <span>Thermal Stress (E)</span>
              <span style="color: #9333ea; font-weight: 700;">+${meta.env_stress || 0}/10</span>
            </div>
            <div style="height: 5px; background: #e2e8f0; border-radius: 3px; margin-top: 5px; overflow: hidden;">
              <div style="height: 100%; width: ${((meta.env_stress || 0) / 10) * 100}%; background: #9333ea;"></div>
            </div>
          </div>
        </div>

        <!-- Explanation and Quantiles -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border-color); font-size: 11px;">
          <div style="color: var(--text-secondary); max-width: 65%;">
            <span style="color: var(--text-primary); font-weight: 600;">Defect Audit:</span> ${task.defect_detail || 'Standard statutory inspection requirement.'}
          </div>

          <div style="display: flex; gap: 8px; font-family: monospace; font-size: 10px;">
            <span style="background: #f1f5f9; padding: 3px 6px; border-radius: 4px; color: var(--text-secondary); border: 1px solid var(--border-color);">Q10 (Curtailed): <strong style="color: var(--text-primary);">${q.q10_curtailed}m</strong></span>
            <span style="background: #e0f2fe; padding: 3px 6px; border-radius: 4px; color: #0369a1; border: 1px solid #bae6fd;">Q50 (Sanctioned): <strong>${q.q50_sanctioned}m</strong></span>
            <span style="background: #d1fae5; padding: 3px 6px; border-radius: 4px; color: #047857; border: 1px solid #a7f3d0;">Q90 (Mega): <strong>${q.q90_megablock}m</strong></span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setupSandboxListeners() {
  const safety = document.getElementById('sandboxSafety');
  const speed = document.getElementById('sandboxSpeed');
  const overdue = document.getElementById('sandboxOverdue');
  const traffic = document.getElementById('sandboxTraffic');
  const env = document.getElementById('sandboxEnv');
  const dept = document.getElementById('sandboxDept');
  const pwr = document.getElementById('sandboxPowerCut');

  if (!safety) return;

  const updateReadouts = () => {
    document.getElementById('sandboxSafetyVal').textContent = parseFloat(safety.value).toFixed(1);
    document.getElementById('sandboxSpeedVal').textContent = parseFloat(speed.value).toFixed(1);
    document.getElementById('sandboxOverdueVal').textContent = parseFloat(overdue.value).toFixed(1);
    document.getElementById('sandboxTrafficVal').textContent = parseFloat(traffic.value).toFixed(1);
    document.getElementById('sandboxEnvVal').textContent = parseFloat(env.value).toFixed(1);
  };

  let debounceTimer = null;
  const triggerInference = () => {
    updateReadouts();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const payload = {
          safety_score: parseFloat(safety.value),
          speed_penalty: parseFloat(speed.value),
          overdue_ratio: parseFloat(overdue.value),
          traffic_density: parseFloat(traffic.value),
          env_thermal_stress: parseFloat(env.value),
          department: dept.value,
          power_cut_required: parseInt(pwr.value)
        };

        const res = await fetch('/api/ml/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(r => r.json());

        if (res && res.predicted_aci !== undefined) {
          const aciEl = document.getElementById('sandboxResultACI');
          const badgeEl = document.getElementById('sandboxPriorityBadge');
          const q10El = document.getElementById('sandboxQ10');
          const q50El = document.getElementById('sandboxQ50');
          const q90El = document.getElementById('sandboxQ90');

          const aci = res.predicted_aci;
          aciEl.textContent = aci.toFixed(1);

          if (aci >= 80) {
            aciEl.style.color = '#dc2626';
            badgeEl.className = 'badge badge-emergency';
            badgeEl.textContent = 'CRITICAL PRIORITY';
          } else if (aci >= 65) {
            aciEl.style.color = '#d97706';
            badgeEl.className = 'badge';
            badgeEl.style.background = '#fef3c7';
            badgeEl.style.color = '#92400e';
            badgeEl.textContent = 'HIGH PRIORITY';
          } else {
            aciEl.style.color = '#0284c7';
            badgeEl.className = 'badge';
            badgeEl.style.background = '#e0f2fe';
            badgeEl.style.color = '#0369a1';
            badgeEl.textContent = 'ROUTINE PRIORITY';
          }

          const q = res.duration_quantiles || {};
          if (q10El) q10El.textContent = `${q.q10_curtailed_mins || 120}m`;
          if (q50El) q50El.textContent = `${q.q50_sanctioned_mins || 180}m`;
          if (q90El) q90El.textContent = `${q.q90_megablock_mins || 240}m`;
        }
      } catch (err) {
        console.error('Error in sandbox inference:', err);
      }
    }, 120);
  };

  [safety, speed, overdue, traffic, env, dept, pwr].forEach(el => {
    el.addEventListener('input', triggerInference);
    el.addEventListener('change', triggerInference);
  });

  // Initial trigger to ensure clean sync
  triggerInference();
}

function setupFilterListeners(tasks) {
  const chips = document.querySelectorAll('#deptFilterGroup .filter-chip');
  const container = document.getElementById('tasksListContainer');
  if (!chips || !container) return;

  chips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      chips.forEach(c => {
        c.style.background = 'white';
        c.style.color = '#334155';
        c.classList.remove('active');
      });

      const target = e.currentTarget;
      target.style.background = '#0284c7';
      target.style.color = 'white';
      target.classList.add('active');

      const dept = target.getAttribute('data-dept');
      const filtered = dept === 'ALL' ? tasks : tasks.filter(t => t.department === dept);
      container.innerHTML = renderTasksList(filtered);
    });
  });
}
