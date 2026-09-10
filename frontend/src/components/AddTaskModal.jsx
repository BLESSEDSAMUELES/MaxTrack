import React, { useState } from 'react';
import { X, PlusCircle, ShieldAlert, Zap, Layers, AlertCircle } from 'lucide-react';
import { createTask } from '../services/api';

export default function AddTaskModal({ isOpen, onClose, onTaskCreated }) {
  if (!isOpen) return null;

  const [departmentId, setDepartmentId] = useState(1); // 1: ENG, 2: SNT, 3: TRD
  const [taskType, setTaskType] = useState('');
  const [kmStart, setKmStart] = useState(12.5);
  const [kmEnd, setKmEnd] = useState(13.5);
  const [duration, setDuration] = useState(120);
  const [requiresPowerOff, setRequiresPowerOff] = useState(false);
  const [machineType, setMachineType] = useState('');
  const [safetyClass, setSafetyClass] = useState('high');
  const [overdueDays, setOverdueDays] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskType.trim()) {
      setErrorMsg('Please provide a task type description');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        department_id: Number(departmentId),
        corridor_id: 1,
        task_type: taskType,
        km_marker_start: parseFloat(kmStart),
        km_marker_end: parseFloat(kmEnd),
        estimated_duration_minutes: parseInt(duration, 10),
        requires_power_off: Boolean(requiresPowerOff),
        requires_machine_type: machineType || null,
        safety_class: safetyClass,
        irpwm_periodicity_days: 60,
        overdue_days: parseInt(overdueDays, 10),
        degradation_trend: 0.75,
        source_system: departmentId === 1 ? 'TMS' : departmentId === 2 ? 'SMMS' : 'TDMS'
      };

      await createTask(payload);
      onTaskCreated();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create maintenance task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Log Department Maintenance Defect</h3>
              <p className="text-[11px] text-slate-400">Enters unified task pool for automatic bundling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Department Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Owning Railway Department
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setDepartmentId(1); setRequiresPowerOff(false); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  departmentId === 1
                    ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Engineering (P-Way)
              </button>

              <button
                type="button"
                onClick={() => { setDepartmentId(2); setRequiresPowerOff(true); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  departmentId === 2
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Signal & Telecom
              </button>

              <button
                type="button"
                onClick={() => { setDepartmentId(3); setRequiresPowerOff(true); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  departmentId === 3
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Traction (TRD)
              </button>
            </div>
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Defect Description / Task Type
            </label>
            <input
              type="text"
              required
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              placeholder="e.g. Switch Expansion Joint Renewal, OHE Dropper Replacement"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Location Km Markers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Start Kilometer Marker
              </label>
              <input
                type="number"
                step="0.1"
                value={kmStart}
                onChange={(e) => setKmStart(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                End Kilometer Marker
              </label>
              <input
                type="number"
                step="0.1"
                value={kmEnd}
                onChange={(e) => setKmEnd(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Duration & Overdue Days */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                step="15"
                min="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Days Overdue (vs IRPWM)
              </label>
              <input
                type="number"
                min="0"
                value={overdueDays}
                onChange={(e) => setOverdueDays(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Safety Class & Machine */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Safety Criticality Class
              </label>
              <select
                value={safetyClass}
                onChange={(e) => setSafetyClass(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="critical">Critical (Immediate Block)</option>
                <option value="high">High (Within 7 Days)</option>
                <option value="routine">Routine Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Required Machine
              </label>
              <select
                value={machineType}
                onChange={(e) => setMachineType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="">None (Manual Gang)</option>
                <option value="tamping_machine">Tamping Machine (Duomatic)</option>
                <option value="tower_wagon">OHE Tower Wagon</option>
              </select>
            </div>
          </div>

          {/* OHE Power Off Checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="powerOffCheck"
              checked={requiresPowerOff}
              onChange={(e) => setRequiresPowerOff(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-sky-400"
            />
            <label htmlFor="powerOffCheck" className="text-xs font-medium text-slate-300 flex items-center space-x-1 cursor-pointer">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Requires 25kV OHE Power-Off Isolation (Permit to Work)</span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Logging...' : 'Log Defect & Recompute Priority'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
