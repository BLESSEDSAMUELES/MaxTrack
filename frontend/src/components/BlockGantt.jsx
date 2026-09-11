import React from 'react';
import { Clock, Zap, AlertCircle, CheckCircle2, ChevronRight, MapPin, Users } from 'lucide-react';

export default function BlockGantt({ blocks, onSelectBlock }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-sm">
        <p className="text-slate-500 text-sm">No scheduled corridor blocks yet. Click "Re-Optimize" above.</p>
      </div>
    );
  }

  const getDeptBadge = (code) => {
    switch (code) {
      case 'ENG':
        return <span key={code} className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">ENG (Track)</span>;
      case 'SNT':
        return <span key={code} className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">S&T (Signals)</span>;
      case 'TRD':
        return <span key={code} className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">TRD (OHE)</span>;
      default:
        return <span key={code} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{code}</span>;
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>Coordinated Block Schedule & Gantt Timeline</span>
            <span className="text-xs font-normal text-slate-500 font-mono">({blocks.length} scheduled master blocks)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any block to inspect multi-department concurrency math, constraint reasoning, or log officer approval.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span className="text-slate-500">Engineering</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-500">S&T</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-500">TRD (OHE)</span>
          </div>
        </div>
      </div>

      {/* Block Timeline List */}
      <div className="mt-6 space-y-4">
        {blocks.map((block, idx) => {
          const startDate = new Date(block.scheduled_start);
          const endDate = new Date(block.scheduled_end);
          const isBundled = block.is_bundled || (block.departments && block.departments.length > 1);
          const hours = (block.duration_minutes / 60).toFixed(1);

          return (
            <div
              key={block.id || idx}
              onClick={() => onSelectBlock(block)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative group ${
                isBundled
                  ? 'bg-white hover:bg-slate-50 border-sky-200 hover:border-sky-400 shadow-sm shadow-sky-100'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Top Row: Date, Duration, Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold text-slate-900 shadow-sm">
                    {startDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} • {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 font-mono shadow-sm">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{block.duration_minutes} mins ({hours} hrs)</span>
                  </div>

                  {block.power_off_required && (
                    <div className="flex items-center space-x-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 shadow-sm animate-pulse">
                      <Zap className="w-3.5 h-3.5 text-rose-600" />
                      <span>25kV OHE Power-Off Active</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                    block.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : block.status === 'flagged'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-sky-50 text-sky-700 border border-sky-200'
                  }`}>
                    {block.status || 'Proposed'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* Segmented Department Ribbon */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-700">
                      Synchronized Departments:
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {(block.departments || []).map((code) => getDeptBadge(code))}
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-500">
                    {block.tasks ? block.tasks.length : 0} Concurrent Tasks
                  </span>
                </div>

                {/* Visual Gantt Bar Segment */}
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                  {(block.departments || []).includes('TRD') && (
                    <div className="bg-amber-500 flex-1 hover:brightness-110 transition-all" title="TRD (OHE)"></div>
                  )}
                  {(block.departments || []).includes('ENG') && (
                    <div className="bg-sky-500 flex-1 hover:brightness-110 transition-all" title="Engineering"></div>
                  )}
                  {(block.departments || []).includes('SNT') && (
                    <div className="bg-emerald-500 flex-1 hover:brightness-110 transition-all" title="S&T"></div>
                  )}
                </div>
              </div>

              {/* Task Chips Inside This Block */}
              <div className="mt-3 flex flex-wrap gap-2">
                {(block.tasks || []).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-2 text-xs bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm text-slate-700"
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      task.department_code === 'ENG' ? 'bg-sky-400' :
                      task.department_code === 'SNT' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}></span>
                    <span className="font-medium text-slate-900">{task.task_type}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      (km {task.km_marker_start.toFixed(1)}-{task.km_marker_end.toFixed(1)} • {task.estimated_duration_minutes}m)
                    </span>
                  </div>
                ))}
              </div>

              {/* Math Explainer Footer Note */}
              {block.duration_math && (
                <div className="mt-3 pt-2 text-[11px] text-sky-800 flex items-center space-x-1.5 font-medium border-t border-slate-200">
                  <span className="font-semibold text-slate-900">Concurrency Gain:</span>
                  <span>{block.duration_math.explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
