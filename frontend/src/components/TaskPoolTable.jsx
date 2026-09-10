import React, { useState } from 'react';
import { Filter, Layers, AlertCircle, ShieldAlert, Clock, ChevronDown, ChevronUp, Plus, Info } from 'lucide-react';

export default function TaskPoolTable({ tasks, onOpenAddModal }) {
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const filteredTasks = (tasks || []).filter((task) => {
    if (selectedDept !== 'ALL' && task.department_code !== selectedDept) return false;
    return true;
  });

  const toggleExpand = (id) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const getSafetyBadge = (safetyClass) => {
    switch (safetyClass?.toLowerCase()) {
      case 'critical':
      case 'emergency':
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            HIGH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300">
            ROUTINE
          </span>
        );
    }
  };

  return (
    <div className="rail-glass p-6 rounded-3xl border border-slate-800">
      {/* Header & Department Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Unified Cross-Department Maintenance Demand</span>
            <span className="text-xs font-normal text-slate-400">({filteredTasks.length} pending items)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Single transparent view reconciling TMS (Track), SMMS (Signals), and TDMS (Traction) defect logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dept Filter Tabs */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {['ALL', 'ENG', 'SNT', 'TRD'].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  selectedDept === dept
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {dept === 'ALL' ? 'All Depts' : dept}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Task</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
            <tr>
              <th className="py-3 px-4">Task & Department</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Safety Class</th>
              <th className="py-3 px-4">Overdue Status</th>
              <th className="py-3 px-4">Explainable Priority</th>
              <th className="py-3 px-4 text-right">Breakdown</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTasks.map((task) => {
              const isExpanded = expandedTaskId === task.id;
              const pScore = task.priority_score?.total_score || 50;

              return (
                <React.Fragment key={task.id}>
                  <tr
                    onClick={() => toggleExpand(task.id)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          task.department_code === 'ENG' ? 'bg-sky-400' :
                          task.department_code === 'SNT' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}></span>
                        <div>
                          <div className="font-bold text-white text-xs">{task.task_type}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {task.department_name} • {task.source_system} #{task.source_ref}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-200">
                      km {task.km_marker_start.toFixed(1)} - {task.km_marker_end.toFixed(1)}
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-300">
                      {task.estimated_duration_minutes} min
                    </td>

                    <td className="py-3 px-4">
                      {getSafetyBadge(task.safety_class)}
                    </td>

                    <td className="py-3 px-4">
                      {task.overdue_days > 0 ? (
                        <span className="text-amber-400 font-bold">
                          +{task.overdue_days}d overdue
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">
                          On Schedule
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="w-36">
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                          <span className="text-sky-400">{pScore}/100</span>
                          <span className="text-[10px] text-slate-500 font-normal">Ranked</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pScore >= 80 ? 'bg-gradient-to-r from-amber-500 to-rose-500' :
                              pScore >= 60 ? 'bg-gradient-to-r from-sky-500 to-emerald-500' : 'bg-slate-600'
                            }`}
                            style={{ width: `${Math.min(100, pScore)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right text-slate-400">
                      <button className="p-1 rounded hover:bg-slate-700/60 text-slate-300">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Score Explanation Drawer */}
                  {isExpanded && task.priority_score && (
                    <tr className="bg-slate-950/80">
                      <td colSpan="7" className="p-4 border-b border-slate-800">
                        <div className="bg-slate-900/90 rounded-2xl p-4 border border-sky-500/20">
                          <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 mb-2">
                            <Info className="w-4 h-4" />
                            <span>Transparent 4-Factor Priority Score Formulation</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">1. IRPWM Overdue Factor</span>
                              <span className="font-bold text-sky-400 text-sm mt-0.5 block">
                                +{task.priority_score.overdue_component.toFixed(1)} pts
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {task.overdue_days} days past interval
                              </span>
                            </div>

                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">2. Safety Criticality</span>
                              <span className="font-bold text-sky-400 text-sm mt-0.5 block">
                                +{task.priority_score.safety_component.toFixed(1)} pts
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {task.safety_class.toUpperCase()} statutory weight
                              </span>
                            </div>

                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">3. Degradation Trend</span>
                              <span className="font-bold text-sky-400 text-sm mt-0.5 block">
                                +{task.priority_score.degradation_component.toFixed(1)} pts
                              </span>
                              <span className="text-[10px] text-slate-500">
                                TGI & wire wear rate
                              </span>
                            </div>

                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">4. Traffic Corridor Density</span>
                              <span className="font-bold text-sky-400 text-sm mt-0.5 block">
                                +{task.priority_score.traffic_impact_component.toFixed(1)} pts
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Main line freight/passenger
                              </span>
                            </div>
                          </div>

                          <p className="mt-3 text-xs text-slate-300 font-medium">
                            <strong className="text-white">Explainability Statement:</strong> {task.priority_score.explanation}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
