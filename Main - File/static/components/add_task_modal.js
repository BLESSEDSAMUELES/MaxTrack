/**
 * Add Task Modal Component
 * Live Evaluator Requisition Injection:
 * Calculates Brain 1 ACI score and triggers Brain 2 CP-SAT re-solve in real time.
 */

export function openAddTaskModal(state, onTaskAdded) {
  // Remove existing modal if any
  const existing = document.getElementById('addTaskModalOverlay');
  if (existing) existing.remove();

  const isDNR = state.corridor === 'DNR-PNBE';
  const defaultKmStart = isDNR ? 4.5 : 285.5;
  const defaultKmEnd = isDNR ? 5.2 : 286.8;
  const defaultES = isDNR ? 'ES-DNR-02' : 'ES-24B';

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'addTaskModalOverlay';
  modalOverlay.className = 'modal-overlay';

  modalOverlay.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title">
          <span>⚡</span>
          <span>LIVE MAINTENANCE REQUISITION INJECTION (EVALUATOR TESTBED)</span>
        </div>
        <button class="modal-close-btn" id="btnCloseAddTaskModal">&times;</button>
      </div>

      <div class="modal-body">
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; font-size: 11px; color: #0369a1; line-height: 1.5;">
          <strong>Evaluator Live Demonstration:</strong> Inject a field defect demand. Watch <strong>Brain 1</strong> compute the Multi-Criteria ACI score and <strong>Brain 2</strong> Google OR-Tools CP-SAT re-solve the master block in real time.
        </div>

        <form id="addTaskForm" class="form-grid">
          <!-- Quick Preset Selector -->
          <div class="form-group full-width">
            <label class="form-label">Quick Defect Template Presets</label>
            <select class="form-select" id="presetSelect">
              <option value="custom">-- Custom Maintenance Demand --</option>
              <option value="imr_flaw" selected>ENG: Severe Ultrasonic Rail Flaw (IMR Para 706 - Critical)</option>
              <option value="point_machine">S&T: Point Machine 104A Operating Current Spike (Form T/351)</option>
              <option value="ohe_hotspot">TRD: 25kV OHE Dropper Thermal Hotspot Exceedance</option>
              <option value="tamper_block">ENG: High-Speed Ballast Tamping & Track Realignment (CSM 09-32)</option>
            </select>
          </div>

          <!-- Department -->
          <div class="form-group">
            <label class="form-label">Department</label>
            <select class="form-select" id="taskDept" required>
              <option value="ENG">Civil Engineering (P-Way / TMS)</option>
              <option value="SNT">Signalling & Telecom (S&T / SMMS)</option>
              <option value="TRD">Traction Distribution (TRD / TDMS)</option>
            </select>
          </div>

          <!-- Line -->
          <div class="form-group">
            <label class="form-label">Track Line</label>
            <select class="form-select" id="taskLine" required>
              <option value="UP_MAIN">UP Main Track</option>
              <option value="DN_MAIN">DN Main Track</option>
            </select>
          </div>

          <!-- Task Type -->
          <div class="form-group full-width">
            <label class="form-label">Task Type / Requisition Title</label>
            <input type="text" class="form-input" id="taskType" value="Emergency Rail Flaw Clamping & USFD Joint Renewal" required />
          </div>

          <!-- Km Start & End -->
          <div class="form-group">
            <label class="form-label">Kilometer Start Post</label>
            <input type="number" step="0.1" class="form-input" id="taskKmStart" value="${defaultKmStart}" required />
          </div>

          <div class="form-group">
            <label class="form-label">Kilometer End Post</label>
            <input type="number" step="0.1" class="form-input" id="taskKmEnd" value="${defaultKmEnd}" required />
          </div>

          <!-- Elementary Section -->
          <div class="form-group">
            <label class="form-label">25kV Elementary Section ID</label>
            <input type="text" class="form-input" id="taskES" value="${defaultES}" required />
          </div>

          <!-- Duration (Minutes) -->
          <div class="form-group">
            <label class="form-label">Requested Window Duration (Minutes)</label>
            <input type="number" step="15" min="30" max="360" class="form-input" id="taskDuration" value="90" required />
          </div>

          <!-- Safety Criticality -->
          <div class="form-group">
            <label class="form-label">Safety Criticality Class</label>
            <select class="form-select" id="taskSafetyClass">
              <option value="critical" selected>Critical (Emergency / Urgent)</option>
              <option value="high">High Priority</option>
              <option value="normal">Normal Periodic Maintenance</option>
            </select>
          </div>

          <!-- Caution Order Speed -->
          <div class="form-group">
            <label class="form-label">Caution Order Speed (km/h)</label>
            <input type="number" min="15" max="110" step="5" class="form-input" id="taskCautionSpeed" value="30" />
          </div>

          <!-- Machine Required -->
          <div class="form-group">
            <label class="form-label">Special Fleet Machine Required</label>
            <select class="form-select" id="taskMachine">
              <option value="">None (Manual Gang / Tool Van)</option>
              <option value="CSM 09-32">CSM 09-32 Heavy Tamper</option>
              <option value="Tower Wagon TW-108">Tower Wagon TW-108 (TRD)</option>
              <option value="BCM RM-80">BCM RM-80 Ballast Cleaner</option>
              <option value="RGM-96">RGM-96 Rail Grinder</option>
            </select>
          </div>

          <!-- Power Off Checkbox -->
          <div class="form-group" style="justify-content: center;">
            <label class="form-checkbox-label" style="margin-top: 14px;">
              <input type="checkbox" id="taskPowerOff" />
              <span>Requires 25 kV AC Power Isolation (PTW)</span>
            </label>
          </div>

          <!-- Defect Details -->
          <div class="form-group full-width">
            <label class="form-label">Defect Observation & Field Justification</label>
            <textarea class="form-textarea" id="taskDefectDetail" rows="2">Evaluator Live Injection: Ultrasonic testing identified 68% transverse fissure flaw under IRPWM Para 706.</textarea>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button class="sub-tab-btn" id="btnCancelAddTaskModal">Cancel</button>
        <button class="action-btn-primary" id="btnSubmitAddTask" style="background: #059669; border-color: #047857;">
          <span>⚡ Submit & Re-Optimize Schedule</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  // Preset Handler
  const presetSelect = document.getElementById('presetSelect');
  presetSelect?.addEventListener('change', (e) => {
    const val = e.target.value;
    const taskDept = document.getElementById('taskDept');
    const taskType = document.getElementById('taskType');
    const taskSafetyClass = document.getElementById('taskSafetyClass');
    const taskDuration = document.getElementById('taskDuration');
    const taskPowerOff = document.getElementById('taskPowerOff');
    const taskMachine = document.getElementById('taskMachine');
    const taskCautionSpeed = document.getElementById('taskCautionSpeed');
    const taskDefectDetail = document.getElementById('taskDefectDetail');

    if (val === 'imr_flaw') {
      taskDept.value = 'ENG';
      taskType.value = 'Emergency Rail Flaw Clamping & USFD Joint Renewal';
      taskSafetyClass.value = 'critical';
      taskDuration.value = 90;
      taskPowerOff.checked = false;
      taskMachine.value = '';
      taskCautionSpeed.value = 20;
      taskDefectDetail.value = 'Evaluator Live Injection: Severe transverse fissure > 65% cross-section. Immediate emergency intervention.';
    } else if (val === 'point_machine') {
      taskDept.value = 'SNT';
      taskType.value = 'Point Machine 104A/B Overhaul & Detector Test';
      taskSafetyClass.value = 'critical';
      taskDuration.value = 75;
      taskPowerOff.checked = true;
      taskMachine.value = '';
      taskCautionSpeed.value = 30;
      taskDefectDetail.value = 'Evaluator Live Injection: Operating current spike 5.8A, detector lock delay under G&SR 3.51 Form T/351.';
    } else if (val === 'ohe_hotspot') {
      taskDept.value = 'TRD';
      taskType.value = 'OHE Contact Wire Stagger & Dropper Regulation';
      taskSafetyClass.value = 'critical';
      taskDuration.value = 105;
      taskPowerOff.checked = true;
      taskMachine.value = 'Tower Wagon TW-108';
      taskCautionSpeed.value = 45;
      taskDefectDetail.value = 'Evaluator Live Injection: ACTM 2.11 stagger exceedance +230mm, thermal camera hotspot detection.';
    } else if (val === 'tamper_block') {
      taskDept.value = 'ENG';
      taskType.value = 'Continuous Heavy Track Tamping & Alignment';
      taskSafetyClass.value = 'high';
      taskDuration.value = 180;
      taskPowerOff.checked = false;
      taskMachine.value = 'CSM 09-32';
      taskCautionSpeed.value = 35;
      taskDefectDetail.value = 'Evaluator Live Injection: Track Quality Index (TQI) degraded to 42.1, alignment twist 3.8mm/3.6m.';
    }
  });

  // Close handlers
  const closeModal = () => modalOverlay.remove();
  document.getElementById('btnCloseAddTaskModal')?.addEventListener('click', closeModal);
  document.getElementById('btnCancelAddTaskModal')?.addEventListener('click', closeModal);

  // Submit handler
  document.getElementById('btnSubmitAddTask')?.addEventListener('click', async () => {
    const btn = document.getElementById('btnSubmitAddTask');
    btn.disabled = true;
    btn.textContent = 'Brain 1 Scoring & Brain 2 Solving...';

    const payload = {
      department: document.getElementById('taskDept').value,
      corridor_code: state.corridor,
      line: document.getElementById('taskLine').value,
      task_type: document.getElementById('taskType').value,
      km_start: parseFloat(document.getElementById('taskKmStart').value),
      km_end: parseFloat(document.getElementById('taskKmEnd').value),
      elementary_section: document.getElementById('taskES').value,
      duration_minutes: parseInt(document.getElementById('taskDuration').value, 10),
      safety_class: document.getElementById('taskSafetyClass').value,
      caution_order_speed: parseInt(document.getElementById('taskCautionSpeed').value, 10),
      machine_required: document.getElementById('taskMachine').value || null,
      requires_power_off: document.getElementById('taskPowerOff').checked,
      defect_detail: document.getElementById('taskDefectDetail').value,
      days_overdue: 5,
      codal_interval_days: 60,
      tqi: 41.5,
      rail_temp_c: 42.0
    };

    try {
      const res = await fetch('/api/tasks/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      closeModal();
      if (onTaskAdded) onTaskAdded(res);
    } catch (err) {
      console.error('Error adding task:', err);
      alert('Failed to inject task: ' + err.message);
      btn.disabled = false;
      btn.textContent = 'Submit & Re-Optimize Schedule';
    }
  });
}
