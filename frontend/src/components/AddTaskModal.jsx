import React, { useState } from 'react';
import { addCustomTask } from '../services/api';

export default function AddTaskModal({ isOpen, onClose, state, onTaskAdded }) {
  if (!isOpen) return null;

  const isDNR = state.corridor === 'DNR-PNBE';
  const defaultKmStart = isDNR ? 4.5 : 285.5;
  const defaultKmEnd = isDNR ? 5.2 : 286.8;
  const defaultES = isDNR ? 'ES-DNR-02' : 'ES-24B';

  const [preset, setPreset] = useState('imr_flaw');
  const [dept, setDept] = useState('ENG');
  const [line, setLine] = useState('UP_MAIN');
  const [taskType, setTaskType] = useState('Emergency Rail Flaw Clamping & USFD Joint Renewal');
  const [kmStart, setKmStart] = useState(defaultKmStart);
  const [kmEnd, setKmEnd] = useState(defaultKmEnd);
  const [es, setES] = useState(defaultES);
  const [duration, setDuration] = useState(90);
  const [safetyClass, setSafetyClass] = useState('critical');
  const [cautionSpeed, setCautionSpeed] = useState(20);
  const [machine, setMachine] = useState('');
  const [requiresPowerOff, setRequiresPowerOff] = useState(false);
  const [defectDetail, setDefectDetail] = useState(
    'Evaluator Live Injection: Severe transverse fissure > 65% cross-section. Immediate emergency intervention.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePresetChange = (val) => {
    setPreset(val);
    if (val === 'imr_flaw') {
      setDept('ENG');
      setTaskType('Emergency Rail Flaw Clamping & USFD Joint Renewal');
      setSafetyClass('critical');
      setDuration(90);
      setRequiresPowerOff(false);
      setMachine('');
      setCautionSpeed(20);
      setDefectDetail('Evaluator Live Injection: Severe transverse fissure > 65% cross-section. Immediate emergency intervention.');
    } else if (val === 'point_machine') {
      setDept('SNT');
      setTaskType('Point Machine 104A/B Overhaul & Detector Test');
      setSafetyClass('critical');
      setDuration(75);
      setRequiresPowerOff(true);
      setMachine('');
      setCautionSpeed(30);
      setDefectDetail('Evaluator Live Injection: Operating current spike 5.8A, detector lock delay under G&SR 3.51 Form T/351.');
    } else if (val === 'ohe_hotspot') {
      setDept('TRD');
      setTaskType('OHE Contact Wire Stagger & Dropper Regulation');
      setSafetyClass('critical');
      setDuration(105);
      setRequiresPowerOff(true);
      setMachine('Tower Wagon TW-108');
      setCautionSpeed(45);
      setDefectDetail('Evaluator Live Injection: ACTM 2.11 stagger exceedance +230mm, thermal camera hotspot detection.');
    } else if (val === 'tamper_block') {
      setDept('ENG');
      setTaskType('Continuous Heavy Track Tamping & Alignment');
      setSafetyClass('high');
      setDuration(180);
      setRequiresPowerOff(false);
      setMachine('CSM 09-32');
      setCautionSpeed(35);
      setDefectDetail('Evaluator Live Injection: Track Quality Index (TQI) degraded to 42.1, alignment twist 3.8mm/3.6m.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        department: dept,
        corridor_code: state.corridor,
        line,
        task_type: taskType,
        km_start: parseFloat(kmStart),
        km_end: parseFloat(kmEnd),
        elementary_section: es,
        duration_minutes: parseInt(duration, 10),
        safety_class: safetyClass,
        caution_order_speed: parseInt(cautionSpeed, 10),
        machine_required: machine || null,
        requires_power_off: requiresPowerOff,
        defect_detail: defectDetail,
        days_overdue: 5,
        codal_interval_days: 60,
        tqi: 41.5,
        rail_temp_c: 42.0
      };

      const res = await addCustomTask(payload);
      onTaskAdded?.(res);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to inject task: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>⚡</span>
            <span>LIVE MAINTENANCE REQUISITION INJECTION (EVALUATOR TESTBED)</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-md p-3 mb-3.5 text-xs text-[#0369a1] leading-relaxed">
            <strong>Evaluator Live Demonstration:</strong> Inject a field defect demand. Watch <strong>Brain 1</strong> compute the Multi-Criteria ACI score and <strong>Brain 2</strong> Google OR-Tools CP-SAT re-solve the master block in real time.
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            {/* Quick Preset Selector */}
            <div className="form-group full-width">
              <label className="form-label">Quick Defect Template Presets</label>
              <select
                className="form-select"
                value={preset}
                onChange={(e) => handlePresetChange(e.target.value)}
              >
                <option value="custom">-- Custom Maintenance Demand --</option>
                <option value="imr_flaw">ENG: Severe Ultrasonic Rail Flaw (IMR Para 706 - Critical)</option>
                <option value="point_machine">S&T: Point Machine 104A Operating Current Spike (Form T/351)</option>
                <option value="ohe_hotspot">TRD: 25kV OHE Dropper Thermal Hotspot Exceedance</option>
                <option value="tamper_block">ENG: High-Speed Ballast Tamping & Track Realignment (CSM 09-32)</option>
              </select>
            </div>

            {/* Department */}
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                required
              >
                <option value="ENG">Civil Engineering (P-Way / TMS)</option>
                <option value="SNT">Signalling & Telecom (S&T / SMMS)</option>
                <option value="TRD">Traction Distribution (TRD / TDMS)</option>
              </select>
            </div>

            {/* Line */}
            <div className="form-group">
              <label className="form-label">Track Line</label>
              <select
                className="form-select"
                value={line}
                onChange={(e) => setLine(e.target.value)}
                required
              >
                <option value="UP_MAIN">UP Main Track</option>
                <option value="DN_MAIN">DN Main Track</option>
              </select>
            </div>

            {/* Task Type */}
            <div className="form-group full-width">
              <label className="form-label">Task Type / Requisition Title</label>
              <input
                type="text"
                className="form-input"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                required
              />
            </div>

            {/* Km Start & End */}
            <div className="form-group">
              <label className="form-label">Kilometer Start Post</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={kmStart}
                onChange={(e) => setKmStart(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kilometer End Post</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={kmEnd}
                onChange={(e) => setKmEnd(e.target.value)}
                required
              />
            </div>

            {/* Elementary Section */}
            <div className="form-group">
              <label className="form-label">25kV Elementary Section ID</label>
              <input
                type="text"
                className="form-input"
                value={es}
                onChange={(e) => setES(e.target.value)}
                required
              />
            </div>

            {/* Duration (Minutes) */}
            <div className="form-group">
              <label className="form-label">Requested Window Duration (Minutes)</label>
              <input
                type="number"
                step="15"
                min="30"
                max="360"
                className="form-input"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>

            {/* Safety Criticality */}
            <div className="form-group">
              <label className="form-label">Safety Criticality Class</label>
              <select
                className="form-select"
                value={safetyClass}
                onChange={(e) => setSafetyClass(e.target.value)}
              >
                <option value="critical">Critical (Emergency / Urgent)</option>
                <option value="high">High Priority</option>
                <option value="normal">Normal Periodic Maintenance</option>
              </select>
            </div>

            {/* Caution Order Speed */}
            <div className="form-group">
              <label className="form-label">Caution Order Speed (km/h)</label>
              <input
                type="number"
                min="15"
                max="110"
                step="5"
                className="form-input"
                value={cautionSpeed}
                onChange={(e) => setCautionSpeed(e.target.value)}
              />
            </div>

            {/* Machine Required */}
            <div className="form-group">
              <label className="form-label">Special Fleet Machine Required</label>
              <select
                className="form-select"
                value={machine}
                onChange={(e) => setMachine(e.target.value)}
              >
                <option value="">None (Manual Gang / Tool Van)</option>
                <option value="CSM 09-32">CSM 09-32 Heavy Tamper</option>
                <option value="Tower Wagon TW-108">Tower Wagon TW-108 (TRD)</option>
                <option value="BCM RM-80">BCM RM-80 Ballast Cleaner</option>
                <option value="RGM-96">RGM-96 Rail Grinder</option>
              </select>
            </div>

            {/* Power Off Checkbox */}
            <div className="form-group justify-center">
              <label className="form-checkbox-label mt-3.5">
                <input
                  type="checkbox"
                  checked={requiresPowerOff}
                  onChange={(e) => setRequiresPowerOff(e.target.checked)}
                />
                <span>Requires 25 kV AC Power Isolation (PTW)</span>
              </label>
            </div>

            {/* Defect Details */}
            <div className="form-group full-width">
              <label className="form-label">Defect Observation & Field Justification</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={defectDetail}
                onChange={(e) => setDefectDetail(e.target.value)}
              />
            </div>

            <div className="form-group full-width flex justify-end gap-2.5 mt-2">
              <button
                type="button"
                className="sub-tab-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="action-btn-primary !bg-[#059669] !border-[#047857]"
                disabled={isSubmitting}
              >
                <span>⚡</span>
                <span>{isSubmitting ? 'Brain 1 Scoring & Brain 2 Solving...' : 'Submit & Re-Optimize Schedule'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
