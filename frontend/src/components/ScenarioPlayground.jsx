import React, { useState } from 'react';
import { Sliders, Play, AlertOctagon, CheckCircle, RefreshCw, Zap, Sparkles, Layers } from 'lucide-react';
import { runWhatIfSimulation } from '../services/api';

export default function ScenarioPlayground({ onApplyToActivePlan }) {
  const [scenarioType, setScenarioType] = useState('emergency_signal');
  const [isRunning, setIsRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const handleRunSimulation = async () => {
    setIsRunning(true);
    try {
      let payload = {
        scenario_name: scenarioType === 'emergency_signal' 
          ? 'Emergency S&T Point Machine Failure' 
          : 'High-Speed OHE Dropper Parting (Emergency Power-Off)',
        injected_defect: scenarioType === 'emergency_signal' ? {
          id: 999,
          department_code: 'SNT',
          department_name: 'Signal & Telecom',
          task_type: 'EMERGENCY: Point Machine Detector Lock Fault',
          estimated_duration_minutes: 150,
          requires_power_off: true,
          requires_machine_type: null,
          safety_class: 'critical',
          priority_score: 96.0,
          overdue_days: 12,
          km_marker_start: 13.2,
          km_marker_end: 13.5
        } : {
          id: 998,
          department_code: 'TRD',
          department_name: 'Traction Distribution',
          task_type: 'EMERGENCY: 25kV OHE Dropper Fatigue Parting',
          estimated_duration_minutes: 210,
          requires_power_off: true,
          requires_machine_type: 'tower_wagon',
          safety_class: 'critical',
          priority_score: 98.0,
          overdue_days: 5,
          km_marker_start: 14.0,
          km_marker_end: 14.8
        }
      };

      const res = await runWhatIfSimulation(payload);
      setSimulationResult(res);
    } catch (err) {
      console.error('Simulation run failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center">
              <Sliders className="w-3 h-3 mr-1" />
              Dynamic Evaluator Sandbox
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-1">
            "What-If" Rail Scenario & Perturbation Simulator
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Test system resilience under sudden track failures, emergency safety alerts, or machine availability shifts.
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isRunning}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all disabled:opacity-50"
        >
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
          <span>{isRunning ? 'Solving CP-SAT Constraints...' : 'Run Perturbation Test'}</span>
        </button>
      </div>

      {/* Scenario Presets Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div
          onClick={() => setScenarioType('emergency_signal')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            scenarioType === 'emergency_signal'
              ? 'bg-amber-50 border-amber-300 shadow-sm'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 flex items-center">
              <AlertOctagon className="w-4 h-4 mr-1.5" />
              Scenario A: Emergency S&T Point Machine Failure
            </span>
            <input
              type="radio"
              name="scenario"
              checked={scenarioType === 'emergency_signal'}
              onChange={() => setScenarioType('emergency_signal')}
              className="text-amber-600 focus:ring-amber-500"
            />
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Injects an urgent lock detector breakdown at km 13.2. Tests if the solver can automatically absorb this emergency task into the nearest 25kV power-off block window without increasing corridor closures.
          </p>
        </div>

        <div
          onClick={() => setScenarioType('ohe_dropper')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            scenarioType === 'ohe_dropper'
              ? 'bg-amber-50 border-amber-300 shadow-sm'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 flex items-center">
              <Zap className="w-4 h-4 mr-1.5" />
              Scenario B: 25kV OHE Wire Fatigue Breakdown
            </span>
            <input
              type="radio"
              name="scenario"
              checked={scenarioType === 'ohe_dropper'}
              onChange={() => setScenarioType('ohe_dropper')}
              className="text-amber-600 focus:ring-amber-500"
            />
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Injects a high-priority TRD contact wire defect at km 14.0 requiring immediate power-off isolation and Tower Wagon TW-402 dispatch.
          </p>
        </div>
      </div>

      {/* Simulation Output Card */}
      {simulationResult && (
        <div className="mt-6 bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                CP-SAT Solved: {simulationResult.solver_status}
              </span>
              <span className="text-xs font-mono text-slate-600">
                Runtime: {simulationResult.solver_runtime_ms} ms
              </span>
            </div>

            <div className="text-xs font-semibold text-sky-700">
              {simulationResult.scenario}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">Manual Baseline</span>
              <span className="text-lg font-bold text-rose-700 font-mono mt-0.5 block">
                {simulationResult.baseline.baseline_blocks_count} Blocks ({simulationResult.baseline.baseline_downtime_minutes / 60}h)
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">MaxTrack Bundled</span>
              <span className="text-lg font-bold text-sky-700 font-mono mt-0.5 block">
                {simulationResult.optimized.blocks_count} Blocks ({simulationResult.optimized.downtime_minutes / 60}h)
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">Downtime Saved</span>
              <span className="text-lg font-bold text-emerald-700 font-mono mt-0.5 block">
                +{(simulationResult.optimized.downtime_saved_minutes / 60).toFixed(1)} Hours
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">Train Capacity Saved</span>
              <span className="text-lg font-bold text-emerald-700 font-mono mt-0.5 block">
                +{simulationResult.optimized.train_paths_recovered} Paths
              </span>
            </div>
          </div>

          {/* Scheduled Blocks Preview in Simulation */}
          <div className="mt-4 space-y-2">
            <span className="text-xs font-bold text-slate-700">Generated Coordinated Blocks:</span>
            {(simulationResult.blocks || []).map((b, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 font-mono">Block #{i + 1}:</span>
                  <span className="text-sky-700 font-mono">{b.duration_minutes} mins</span>
                  {b.power_off_required && (
                    <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-bold">
                      25kV Power-Off
                    </span>
                  )}
                  <span className="text-slate-500">({b.departments.join(', ')})</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {b.duration_math.explanation}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
