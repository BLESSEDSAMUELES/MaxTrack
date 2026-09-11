import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, BarChart3, Activity, Cpu, Database, FlaskConical, Sliders, Play, RefreshCw, Layers, Zap, ShieldCheck, Thermometer, Clock, Train, GitBranch, Power, Wrench } from 'lucide-react';
import { fetchMLMetrics, predictCustomACI } from '../services/api';

export default function AIModelDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [sandboxParams, setSandboxParams] = useState({
    department: 'ENG',
    safety_score: 25.0,
    speed_penalty: 10.0,
    overdue_ratio: 8.0,
    traffic_density: 8.0,
    env_thermal_stress: 5.0,
    concurrency_potential: 5.0,
    power_cut_required: 0,
    machine_required: 0
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await fetchMLMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load ML metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const result = await predictCustomACI(sandboxParams);
      setPrediction(result);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setPredicting(false);
    }
  };

  const updateParam = (key, value) => {
    setSandboxParams(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-10 h-10 text-sky-600 animate-spin" />
        <span className="ml-3 text-slate-500 text-sm font-medium mt-4">Loading LightGBM Model Intelligence...</span>
      </div>
    );
  }

  const deptBreakdown = metrics?.department_breakdown || {};
  const aciMetrics = metrics?.aci_metrics || {};
  const durMetrics = metrics?.duration_quantile_metrics || {};
  const featureImps = metrics?.feature_importances || [];
  const totalRecords = metrics?.total_dataset_records || 0;
  const trainSamples = metrics?.train_samples || 0;
  const testSamples = metrics?.test_samples || 0;

  const featureLabels = {
    safety_score: { label: 'Safety Criticality Score', icon: ShieldCheck, color: 'rose' },
    env_thermal_stress: { label: 'Thermal & Environmental Stress', icon: Thermometer, color: 'amber' },
    overdue_ratio: { label: 'IRPWM Codal Overdue Ratio', icon: Clock, color: 'orange' },
    speed_penalty: { label: 'Speed Restriction Penalty', icon: Zap, color: 'sky' },
    traffic_density: { label: 'Corridor Traffic Density', icon: Train, color: 'emerald' },
    concurrency_potential: { label: 'Multi-Dept Concurrency Potential', icon: GitBranch, color: 'violet' },
    power_cut_required: { label: '25kV Power-Off Required', icon: Power, color: 'red' },
    dept_code_encoded: { label: 'Department Code', icon: Layers, color: 'blue' },
    machine_required: { label: 'Heavy Machine Required', icon: Wrench, color: 'teal' }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Section 1: Model Overview */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-200 flex items-center">
                <Brain className="w-3 h-3 mr-1" />
                Brain 1: Production AI Engine
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                metrics?.status === 'TRAINED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {metrics?.status || 'UNKNOWN'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              LightGBM Multi-Department Gradient Boosting Engine
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {metrics?.algorithm || 'LightGBM (GBDT)'} v{metrics?.lightgbm_version || '4.x'} — Trained on {totalRecords.toLocaleString()} real railway maintenance records across 3 departments.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-center shadow-sm">
              <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Total Records</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">{totalRecords.toLocaleString()}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-center shadow-sm">
              <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Train / Test</div>
              <div className="text-lg font-bold text-sky-700 font-mono">{trainSamples.toLocaleString()} / {testSamples.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Department Data Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {[
            { name: 'TMS (Civil Engineering)', key: 'TMS_Civil_Engineering', count: deptBreakdown.TMS_Civil_Engineering || 0, color: 'sky', icon: '🔧' },
            { name: 'SMMS (Signal & Telecom)', key: 'SMMS_Signalling_Telecom', count: deptBreakdown.SMMS_Signalling_Telecom || 0, color: 'emerald', icon: '📡' },
            { name: 'TDMS (Electrical TRD)', key: 'TDMS_Electrical_TRD', count: deptBreakdown.TDMS_Electrical_TRD || 0, color: 'amber', icon: '⚡' }
          ].map((dept) => {
            const pct = totalRecords > 0 ? ((dept.count / totalRecords) * 100).toFixed(1) : 0;
            return (
              <div key={dept.key} className={`bg-slate-50 rounded-2xl p-4 border border-slate-200 relative overflow-hidden shadow-sm`}>
                <div className={`absolute top-0 left-0 right-0 h-1 bg-${dept.color}-500`}></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">{dept.name}</span>
                  <span className="text-lg">{dept.icon}</span>
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900 font-mono">{dept.count.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 font-mono">{pct}%</span>
                </div>
                <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-${dept.color}-500 transition-all duration-1000`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Test Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACI Model Metrics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
            <Activity className="w-4 h-4 text-sky-600" />
            <span className="text-sm font-bold text-slate-900 tracking-tight">ACI Regressor Performance</span>
            <span className="text-[10px] text-slate-500 ml-auto">Asset Criticality Index [0, 100]</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block font-medium">R² Score</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block font-mono">{(aciMetrics.r2_score || 0).toFixed(4)}</span>
              <div className="mt-1.5 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(aciMetrics.r2_score || 0) * 100}%` }}></div>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block font-medium">MAE</span>
              <span className="text-2xl font-black text-sky-700 mt-1 block font-mono">{aciMetrics.mae || '—'}</span>
              <span className="text-[10px] text-slate-500">points error</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block font-medium">RMSE</span>
              <span className="text-2xl font-black text-sky-700 mt-1 block font-mono">{aciMetrics.rmse || '—'}</span>
              <span className="text-[10px] text-slate-500">points error</span>
            </div>
          </div>
        </div>

        {/* Duration Quantile Metrics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-slate-900 tracking-tight">Duration Quantile Regressors</span>
            <span className="text-[10px] text-slate-500 ml-auto">Q10 / Q50 / Q90 (minutes)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block font-medium">Q50 R²</span>
              <span className="text-xl font-black text-emerald-700 mt-1 block font-mono">{(durMetrics.q50_r2_score || 0).toFixed(4)}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block font-medium">Q10 MAE</span>
              <span className="text-xl font-black text-sky-700 mt-1 block font-mono">{durMetrics.q10_mae_mins || '—'}m</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block font-medium">Q50 MAE</span>
              <span className="text-xl font-black text-sky-700 mt-1 block font-mono">{durMetrics.q50_mae_mins || '—'}m</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block font-medium">Q90 MAE</span>
              <span className="text-xl font-black text-sky-700 mt-1 block font-mono">{durMetrics.q90_mae_mins || '—'}m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Feature Importance Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-200">
          <BarChart3 className="w-4 h-4 text-sky-600" />
          <span className="text-sm font-bold text-slate-900 tracking-tight">LightGBM Feature Importance Ranking</span>
          <span className="text-[10px] text-slate-500 ml-auto">Split-gain based importance (higher = more predictive)</span>
        </div>

        <div className="mt-4 space-y-2.5">
          {featureImps.map((fi, idx) => {
            const meta = featureLabels[fi.feature] || { label: fi.feature, color: 'slate' };
            const barColors = [
              'bg-rose-500',
              'bg-amber-500',
              'bg-orange-500',
              'bg-sky-500',
              'bg-emerald-500',
              'bg-violet-500',
              'bg-red-500',
              'bg-blue-500',
              'bg-teal-500'
            ];

            return (
              <div key={fi.feature} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                      {meta.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{fi.feature}</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono">{fi.percentage}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden ml-7">
                  <div
                    className={`h-full rounded-full ${barColors[idx % barColors.length]} transition-all duration-700 ease-out`}
                    style={{ width: `${Math.max(2, fi.percentage)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Live Prediction Sandbox */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-emerald-50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                <FlaskConical className="w-3 h-3 mr-1" />
                Live Evaluator Sandbox
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-1">
              Real-Time LightGBM Inference Playground
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust parameters below and see the production model predict ACI scores and duration quantiles in real-time.
            </p>
          </div>

          <button
            onClick={handlePredict}
            disabled={predicting}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50"
          >
            {predicting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{predicting ? 'Computing...' : 'Run Prediction'}</span>
          </button>
        </div>

        {/* Parameter Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {/* Department Selector */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-2">Department</label>
            <div className="flex items-center space-x-1">
              {['ENG', 'SNT', 'TRD'].map(d => (
                <button
                  key={d}
                  onClick={() => updateParam('department', d)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    sandboxParams.department === d
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Numeric Sliders */}
          {[
            { key: 'safety_score', label: 'Safety Score', min: 0, max: 35, step: 0.5, icon: ShieldCheck },
            { key: 'speed_penalty', label: 'Speed Penalty', min: 0, max: 25, step: 0.5, icon: Zap },
            { key: 'overdue_ratio', label: 'Overdue Ratio', min: 0, max: 20, step: 0.5, icon: Clock },
            { key: 'traffic_density', label: 'Traffic Density', min: 0, max: 10, step: 0.5, icon: Train },
            { key: 'env_thermal_stress', label: 'Thermal Stress', min: 0, max: 10, step: 0.5, icon: Thermometer },
            { key: 'concurrency_potential', label: 'Concurrency', min: 0, max: 10, step: 0.5, icon: GitBranch },
          ].map(slider => {
            const Icon = slider.icon;
            return (
              <div key={slider.key} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center">
                    <Icon className="w-3 h-3 mr-1 text-slate-500" />
                    {slider.label}
                  </label>
                  <span className="text-xs font-bold text-sky-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm font-mono">
                    {sandboxParams[slider.key]}
                  </span>
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={sandboxParams[slider.key]}
                  onChange={(e) => updateParam(slider.key, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-sky-500"
                />
                <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
                  <span>{slider.min}</span>
                  <span>{slider.max}</span>
                </div>
              </div>
            );
          })}

          {/* Toggle Switches */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-2">Constraints</label>
            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-slate-700 flex items-center">
                  <Power className="w-3 h-3 mr-1.5 text-rose-500" /> 25kV Power-Off
                </span>
                <button
                  onClick={() => updateParam('power_cut_required', sandboxParams.power_cut_required ? 0 : 1)}
                  className={`w-9 h-5 rounded-full transition-colors ${sandboxParams.power_cut_required ? 'bg-rose-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${sandboxParams.power_cut_required ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-slate-700 flex items-center">
                  <Wrench className="w-3 h-3 mr-1.5 text-amber-500" /> Machine Required
                </span>
                <button
                  onClick={() => updateParam('machine_required', sandboxParams.machine_required ? 0 : 1)}
                  className={`w-9 h-5 rounded-full transition-colors ${sandboxParams.machine_required ? 'bg-amber-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${sandboxParams.machine_required ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
              </label>
            </div>
          </div>
        </div>

        {/* Prediction Result */}
        {prediction && (
          <div className="mt-6 bg-emerald-50 rounded-2xl p-5 border border-emerald-200 shadow-sm animate-fadeIn">
            <div className="flex items-center space-x-2 pb-3 border-b border-emerald-200">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-800">LightGBM Inference Result</span>
              <span className="text-[10px] font-mono text-slate-500 ml-auto">{prediction.model_type}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm text-center">
                <span className="text-[10px] text-slate-500 block font-medium">Predicted ACI</span>
                <span className={`text-3xl font-black mt-1 block font-mono ${
                  prediction.predicted_aci >= 80 ? 'text-rose-700' :
                  prediction.predicted_aci >= 60 ? 'text-amber-700' :
                  prediction.predicted_aci >= 40 ? 'text-sky-700' : 'text-emerald-700'
                }`}>
                  {prediction.predicted_aci}
                </span>
                <span className="text-[10px] text-slate-500">/ 100</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm text-center">
                <span className="text-[10px] text-slate-500 block font-medium">Q10 Curtailed</span>
                <span className="text-2xl font-black text-sky-700 mt-1 block font-mono">
                  {prediction.duration_quantiles?.q10_curtailed_mins || '—'}
                </span>
                <span className="text-[10px] text-slate-500">minutes</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm text-center">
                <span className="text-[10px] text-slate-500 block font-medium">Q50 Sanctioned</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                  {prediction.duration_quantiles?.q50_sanctioned_mins || '—'}
                </span>
                <span className="text-[10px] text-slate-500">minutes</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm text-center">
                <span className="text-[10px] text-slate-500 block font-medium">Q90 Mega-Block</span>
                <span className="text-2xl font-black text-amber-700 mt-1 block font-mono">
                  {prediction.duration_quantiles?.q90_megablock_mins || '—'}
                </span>
                <span className="text-[10px] text-slate-500">minutes</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-emerald-900 bg-white p-3 rounded-lg border border-emerald-100 leading-relaxed shadow-sm">
              <strong className="text-emerald-700">Explainability:</strong> The Asset Criticality Index of <strong className="text-slate-900">{prediction.predicted_aci}/100</strong> was computed by the production LightGBM GBDT model using {Object.keys(prediction.features_used || {}).length} railway-specific features.
              Top contributing factors: Safety={prediction.features_used?.safety_score}, Speed Penalty={prediction.features_used?.speed_penalty}, Overdue={prediction.features_used?.overdue_ratio}.
              Duration quantiles indicate the task would take between <strong className="text-sky-700">{prediction.duration_quantiles?.q10_curtailed_mins}m</strong> (curtailed block) and <strong className="text-amber-700">{prediction.duration_quantiles?.q90_megablock_mins}m</strong> (full mega-block).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
