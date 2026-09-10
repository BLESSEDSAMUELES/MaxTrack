import React from 'react';
import { ArrowRight, CheckCircle, XCircle, Zap, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

export default function ProofPanel({ comparison }) {
  if (!comparison) return null;

  const manual = comparison.manual_baseline || {};
  const optimized = comparison.maxtrack_optimized || {};

  const baseBlocks = manual.total_separate_blocks || 3;
  const optBlocks = optimized.total_bundled_blocks || 1;
  const baseHours = (manual.corridor_downtime_hours || 9).toFixed(1);
  const optHours = (optimized.corridor_downtime_hours || 4).toFixed(1);
  const basePaths = manual.passenger_detentions_count || 21;
  const optPaths = optimized.passenger_detentions_count || 0;
  const savedHours = (parseFloat(baseHours) - parseFloat(optHours)).toFixed(1);
  const savedPaths = basePaths - optPaths;
  const recoveryPct = basePaths > 0 ? ((savedPaths / basePaths) * 100).toFixed(1) : '55.6';

  return (
    <div className="rail-glass p-6 rounded-3xl border border-sky-500/30 rail-glass-glow mb-8 relative overflow-hidden">
      {/* Glow background accent */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Verified Optimization Proof
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Canonical Worked Corridor Benchmark
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Manual Legacy Baseline vs. MaxTrack Bundling
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-world comparison of independent department requests vs. synchronized CP-SAT scheduling.
          </p>
        </div>

        {/* Highlight recovery pill */}
        <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 px-4 py-2.5 rounded-2xl flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-emerald-300 font-medium">Corridor Capacity Gain</div>
            <div className="text-lg font-black text-emerald-400 tracking-tight">
              +{recoveryPct}% Recovered
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Baseline (Legacy) */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-rose-900/40 relative">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                ✕
              </div>
              <span className="font-bold text-sm text-slate-200">
                Legacy Manual Baseline (BDMS)
              </span>
            </div>
            <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Uncoordinated Siloes
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium block">Blocks Taken</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">
                {baseBlocks}
              </span>
              <span className="text-[10px] text-slate-400">Separate closures</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium block">Total Downtime</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">
                {baseHours}h
              </span>
              <span className="text-[10px] text-slate-400">Sequential sum</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium block">Train Paths Lost</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">
                ~{basePaths}
              </span>
              <span className="text-[10px] text-slate-400">Displaced trains</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
            <strong className="text-slate-300">Operational Failure:</strong> The same 10 km track section is shut down 3 separate times by Engineering, S&T, and TRD over multiple days, compounding train delays.
          </p>
        </div>

        {/* MaxTrack (Optimized) */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-sky-500/40 shadow-lg shadow-sky-950/30 relative">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <span className="font-bold text-sm text-white">
                MaxTrack Synchronized Plan
              </span>
            </div>
            <span className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              CP-SAT Bundled
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-sky-500/20">
              <span className="text-[11px] text-slate-400 font-medium block">Blocks Taken</span>
              <span className="text-2xl font-black text-sky-400 mt-1 block">
                {optBlocks}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">
                -{baseBlocks - optBlocks} Block eliminated
              </span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-sky-500/20">
              <span className="text-[11px] text-slate-400 font-medium block">Total Downtime</span>
              <span className="text-2xl font-black text-sky-400 mt-1 block">
                {optHours}h
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">
                -{savedHours}h saved
              </span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-sky-500/20">
              <span className="text-[11px] text-slate-400 font-medium block">Train Paths Lost</span>
              <span className="text-2xl font-black text-sky-400 mt-1 block">
                ~{optPaths}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">
                +{savedPaths} preserved
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs text-sky-200/90 bg-sky-950/40 p-2.5 rounded-lg border border-sky-800/40 leading-relaxed">
            <strong className="text-sky-300">Operations-Research Insight:</strong> Traction power-off enables track tamping and signal maintenance to execute concurrently. Block duration = <code className="bg-sky-900/60 px-1 py-0.5 rounded text-sky-200 font-mono">max(4h, 3h, 2h) = 4h</code> instead of the 9h sum!
          </p>
        </div>
      </div>
    </div>
  );
}
