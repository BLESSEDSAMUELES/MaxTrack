import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Zap, Shield, Clock, MapPin, Calculator } from 'lucide-react';

export default function BlockInspectorModal({ block, onClose, onActionSuccess }) {
  if (!block) return null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overrideNotes, setOverrideNotes] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);

  const startDate = new Date(block.scheduled_start);
  const endDate = new Date(block.scheduled_end);

  const handleAction = async (action) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/blocks/${block.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          officer_name: 'Rakesh Sharma (Nodal Planning Officer)',
          role: 'planning_officer',
          notes: overrideNotes || (action === 'approved' ? 'Approved without modifications' : 'Flagged for revision')
        })
      });
      if (res.ok) {
        onActionSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Error logging block action:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative text-slate-900 custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-bold">
                Block #{block.id} Inspection
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                block.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {block.status || 'Proposed'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Synchronized Multi-Department Master Block
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-medium block">Block Window</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block font-mono">
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[10px] text-slate-500">{startDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-medium block">Duration (Longest)</span>
              <span className="text-sm font-bold text-sky-700 mt-0.5 block font-mono">
                {block.duration_minutes} Minutes
              </span>
              <span className="text-[10px] text-slate-500 font-mono">({(block.duration_minutes / 60).toFixed(1)} Hours)</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-medium block">OHE Traction Status</span>
              <span className={`text-sm font-bold mt-0.5 block ${block.power_off_required ? 'text-rose-700' : 'text-slate-700'}`}>
                {block.power_off_required ? 'Power-Off Mandatory' : 'Energized'}
              </span>
              <span className="text-[10px] text-slate-500">25kV AC Overhead</span>
            </div>
          </div>

          {/* Mathematical Concurrency Explainer */}
          {block.duration_math && (
            <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-2 text-xs font-bold text-sky-800 mb-2">
                <Calculator className="w-4 h-4" />
                <span>CP-SAT Duration Equivalence Math (The Co-scheduling Aha)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Because parallel tasks inside one shared block run <strong>concurrently</strong> under the same safety window rather than sequentially, this block's duration is the <strong>longest single task ({block.duration_minutes}m)</strong>, not the sum of all tasks ({block.duration_math.sum_individual_minutes}m).
              </p>
              <div className="mt-3 flex items-center space-x-3 text-xs bg-white p-2.5 rounded-xl border border-sky-100 shadow-sm">
                <span className="text-emerald-700 font-bold font-mono">
                  ✓ Recovered Capacity: {block.duration_math.minutes_saved} minutes ({(block.duration_math.minutes_saved/60).toFixed(1)} hours saved)
                </span>
              </div>
            </div>
          )}

          {/* Explainable Constraint Justifications ("The Why") */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-600" />
              <span>Operational Constraint Justifications</span>
            </h4>
            <div className="space-y-2.5">
              {(block.justifications || []).map((just, jIdx) => (
                <div
                  key={jIdx}
                  className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-700 shadow-sm"
                >
                  <span className="font-semibold text-sky-800 block mb-1">
                    • {just.constraint_type.replace(/_/g, ' ').toUpperCase()}:
                  </span>
                  {just.explanation_text}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Bundled in this Block */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Bundled Cross-Department Tasks ({block.tasks ? block.tasks.length : 0})
            </h4>
            <div className="space-y-2">
              {(block.tasks || []).map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.department_code === 'ENG' ? 'bg-sky-50 text-sky-700' :
                        task.department_code === 'SNT' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {task.department_code}
                      </span>
                      <span className="font-semibold text-slate-900 text-xs">{task.task_type}</span>
                      <span className="text-[10px] font-mono text-slate-500">({task.source_ref})</span>
                    </div>
                    <div className="flex items-center space-x-3 mt-1.5 text-[11px] text-slate-500 font-mono">
                      <span>km {task.km_marker_start.toFixed(1)} - {task.km_marker_end.toFixed(1)}</span>
                      <span>•</span>
                      <span>Duration: {task.estimated_duration_minutes}m</span>
                      <span>•</span>
                      <span className={task.overdue_days > 0 ? 'text-amber-700 font-semibold' : ''}>
                        {task.overdue_days > 0 ? `${task.overdue_days}d overdue` : 'On Schedule'}
                      </span>
                    </div>
                  </div>

                  {task.priority_score && (
                    <div className="text-right">
                      <div className="text-xs font-bold text-sky-700 font-mono">
                        Priority: {task.priority_score.total_score}/100
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {task.safety_class.toUpperCase()} Class
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Override Notes Input if toggled */}
          {showOverrideInput && (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-sm">
              <label className="block text-xs font-semibold text-amber-800 mb-1">
                Officer Override / Concern Notes
              </label>
              <textarea
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="Specify reason for override (e.g., Tamping machine diverted to yard; reschedule block to Friday night window)..."
                className="w-full bg-white border border-amber-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm h-20"
              />
            </div>
          )}
        </div>

        {/* Footer Actions (Human in the loop) */}
        <div className="p-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 rounded-b-3xl">
          <div className="text-xs text-slate-500">
            Authorized: <span className="text-slate-900 font-semibold">Rakesh Sharma (Nodal Officer)</span>
          </div>

          <div className="flex items-center space-x-2">
            {!showOverrideInput ? (
              <button
                type="button"
                onClick={() => setShowOverrideInput(true)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors shadow-sm"
              >
                Flag Concern / Override
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAction('overridden')}
                className="px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl border border-amber-300 transition-colors shadow-sm"
              >
                Confirm Override
              </button>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleAction('approved')}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-200 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve Coordinated Block</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
