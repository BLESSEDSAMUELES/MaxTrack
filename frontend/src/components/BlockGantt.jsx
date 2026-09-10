import React from 'react';
import { Clock, Zap, AlertCircle, CheckCircle2, ChevronRight, MapPin, Users } from 'lucide-react';

export default function BlockGantt({ blocks, onSelectBlock }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="rail-glass p-8 rounded-3xl border border-slate-800 text-center">
        <p className="text-slate-400 text-sm">No scheduled corridor blocks yet. Click "Re-Optimize" above.</p>
      </div>
    );
  }

  const getDeptBadge = (code) => {
    switch (code) {
      case 'ENG':
        return <span key={code} className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">ENG (Track)</span>;
      case 'SNT':
        return <span key={code} className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">S&T (Signals)</span>;
      case 'TRD':
        return <span key={code} className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">TRD (OHE)</span>;
      default:
        return <span key={code} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">{code}</span>;
    }
  };

  return (
    <div className="rail-glass p-6 rounded-3xl border border-slate-800 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Coordinated Block Schedule & Gantt Timeline</span>
            <span className="text-xs font-normal text-slate-400">({blocks.length} scheduled master blocks)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any block to inspect multi-department concurrency math, constraint reasoning, or log officer approval.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span className="text-slate-400">Engineering</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400">S&T</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-400">TRD (OHE)</span>
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
                  ? 'bg-slate-900/90 hover:bg-slate-800/90 border-sky-500/30 hover:border-sky-500/60 shadow-md shadow-sky-950/20'
                  : 'bg-slate-900/50 hover:bg-slate-800/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Row: Date, Duration, Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/60">
                <div className="flex items-center space-x-3">
                  <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs font-mono font-semibold text-slate-200">
                    {startDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} • {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{block.duration_minutes} mins ({hours} hrs)</span>
                  </div>

                  {block.power_off_required && (
                    <div className="flex items-center space-x-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 animate-pulse">
                      <Zap className="w-3.5 h-3.5 text-rose-400" />
                      <span>25kV OHE Power-Off Active</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                    block.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : block.status === 'flagged'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}>
                    {block.status || 'Proposed'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* Segmented Department Ribbon */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-300">
                      Synchronized Departments:
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {(block.departments || []).map((code) => getDeptBadge(code))}
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    {block.tasks ? block.tasks.length : 0} Concurrent Tasks
                  </span>
                </div>

                {/* Visual Gantt Bar Segment */}
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
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
                    className="flex items-center space-x-2 text-xs bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800/80 text-slate-300"
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      task.department_code === 'ENG' ? 'bg-sky-400' :
                      task.department_code === 'SNT' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}></span>
                    <span className="font-medium text-slate-200">{task.task_type}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      (km {task.km_marker_start.toFixed(1)}-{task.km_marker_end.toFixed(1)} • {task.estimated_duration_minutes}m)
                    </span>
                  </div>
                ))}
              </div>

              {/* Math Explainer Footer Note */}
              {block.duration_math && (
                <div className="mt-3 pt-2 text-[11px] text-sky-400/90 flex items-center space-x-1.5 font-medium border-t border-slate-800/40">
                  <span className="font-semibold text-white">Concurrency Gain:</span>
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
