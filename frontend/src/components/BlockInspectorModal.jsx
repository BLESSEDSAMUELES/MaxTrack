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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-slate-200 custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-[#0f172a]/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 font-bold">
                Block #{block.id} Inspection
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                block.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
              }`}>
                {block.status || 'Proposed'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Synchronized Multi-Department Master Block
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium block">Block Window</span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[10px] text-slate-500">{startDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>

            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium block">Duration (Longest)</span>
              <span className="text-sm font-bold text-sky-400 mt-0.5 block">
                {block.duration_minutes} Minutes
              </span>
              <span className="text-[10px] text-slate-500">({(block.duration_minutes / 60).toFixed(1)} Hours)</span>
            </div>

            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium block">OHE Traction Status</span>
              <span className={`text-sm font-bold mt-0.5 block ${block.power_off_required ? 'text-rose-400' : 'text-slate-300'}`}>
                {block.power_off_required ? 'Power-Off Mandatory' : 'Energized'}
              </span>
              <span className="text-[10px] text-slate-500">25kV AC Overhead</span>
            </div>
          </div>

          {/* Mathematical Concurrency Explainer */}
          {block.duration_math && (
            <div className="bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 border border-sky-500/30 p-4 rounded-2xl">
              <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 mb-2">
                <Calculator className="w-4 h-4" />
                <span>CP-SAT Duration Equivalence Math (The Co-scheduling Aha)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Because parallel tasks inside one shared block run <strong>concurrently</strong> under the same safety window rather than sequentially, this block's duration is the <strong>longest single task ({block.duration_minutes}m)</strong>, not the sum of all tasks ({block.duration_math.sum_individual_minutes}m).
              </p>
              <div className="mt-3 flex items-center space-x-3 text-xs bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold">
                  ✓ Recovered Capacity: {block.duration_math.minutes_saved} minutes ({(block.duration_math.minutes_saved/60).toFixed(1)} hours saved)
                </span>
              </div>
            </div>
          )}

          {/* Explainable Constraint Justifications ("The Why") */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Operational Constraint Justifications</span>
            </h4>
            <div className="space-y-2.5">
              {(block.justifications || []).map((just, jIdx) => (
                <div
                  key={jIdx}
                  className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300"
                >
                  <span className="font-semibold text-sky-300 block mb-1">
                    • {just.constraint_type.replace(/_/g, ' ').toUpperCase()}:
                  </span>
                  {just.explanation_text}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Bundled in this Block */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Bundled Cross-Department Tasks ({block.tasks ? block.tasks.length : 0})
            </h4>
            <div className="space-y-2">
              {(block.tasks || []).map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.department_code === 'ENG' ? 'bg-sky-500/20 text-sky-400' :
                        task.department_code === 'SNT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {task.department_code}
                      </span>
                      <span className="font-semibold text-white text-xs">{task.task_type}</span>
                      <span className="text-[10px] font-mono text-slate-400">({task.source_ref})</span>
                    </div>
                    <div className="flex items-center space-x-3 mt-1.5 text-[11px] text-slate-400">
                      <span>km {task.km_marker_start.toFixed(1)} - {task.km_marker_end.toFixed(1)}</span>
                      <span>•</span>
                      <span>Duration: {task.estimated_duration_minutes}m</span>
                      <span>•</span>
                      <span className={task.overdue_days > 0 ? 'text-amber-400 font-semibold' : ''}>
                        {task.overdue_days > 0 ? `${task.overdue_days}d overdue` : 'On Schedule'}
                      </span>
                    </div>
                  </div>

                  {task.priority_score && (
                    <div className="text-right">
                      <div className="text-xs font-bold text-sky-400">
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
            <div className="bg-slate-900 p-4 rounded-2xl border border-amber-500/30">
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                Officer Override / Concern Notes
              </label>
              <textarea
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="Specify reason for override (e.g., Tamping machine diverted to yard; reschedule block to Friday night window)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 h-20"
              />
            </div>
          )}
        </div>

        {/* Footer Actions (Human in the loop) */}
        <div className="p-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-[#0b1120]/90 rounded-b-3xl">
          <div className="text-xs text-slate-400">
            Authorized: <span className="text-slate-200 font-semibold">Rakesh Sharma (Nodal Officer)</span>
          </div>

          <div className="flex items-center space-x-2">
            {!showOverrideInput ? (
              <button
                type="button"
                onClick={() => setShowOverrideInput(true)}
                className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
              >
                Flag Concern / Override
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAction('overridden')}
                className="px-3.5 py-2 text-xs font-bold text-amber-200 bg-amber-600/30 hover:bg-amber-600/40 rounded-xl border border-amber-500/50 transition-colors"
              >
                Confirm Override
              </button>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleAction('approved')}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
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
