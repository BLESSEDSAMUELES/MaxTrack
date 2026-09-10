import React from 'react';
import { Clock, Train, CheckCircle2, AlertTriangle, TrendingUp, Zap } from 'lucide-react';

export default function KpiRibbon({ stats }) {
  const proof = stats?.proof_panel || {};
  const manual = proof.manual_baseline || {};
  const optimized = proof.maxtrack_optimized || {};

  const downtimeSavedHours = stats?.downtime_saved_hours || 0;
  const manualBlocks = manual.total_separate_blocks || 0;
  const optimizedBlocks = optimized.total_bundled_blocks || 0;
  const blocksReduced = manualBlocks - optimizedBlocks;
  const recoveryPct = stats?.availability_gain_pct || 0;
  const trainPathsRecovered = stats?.passenger_train_detention_minutes_averted ? Math.round(stats.passenger_train_detention_minutes_averted / 30) : 0;
  const bundlingRatio = stats?.bundling_efficiency_ratio_pct || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* KPI 1: Downtime Saved */}
      <div className="rail-glass p-4 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-sky-500/40 transition-all">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Corridor Downtime Saved
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            +{downtimeSavedHours}h
          </span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            {recoveryPct}% Recovered
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Saved vs uncoordinated sequential blocks
        </p>
      </div>

      {/* KPI 2: Train Paths Preserved */}
      <div className="rail-glass p-4 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Train Paths Preserved
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Train className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            +{trainPathsRecovered}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            slots protected
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Passenger & freight capacity protected
        </p>
      </div>

      {/* KPI 3: Bundling Efficiency */}
      <div className="rail-glass p-4 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-amber-500/40 transition-all">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Block Bundling Ratio
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {manualBlocks} → {optimizedBlocks}
          </span>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            -{blocksReduced} Blocks
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Cross-department multi-crew coordination
        </p>
      </div>

      {/* KPI 4: Bundling Efficiency */}
      <div className="rail-glass p-4 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-rose-500/40 transition-all">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-600"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Bundling Efficiency
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {bundlingRatio}%
          </span>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {stats?.total_blocks_scheduled || 0} Blocks Scheduled
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Multi-department piggybacking ratio
        </p>
      </div>
    </div>
  );
}
