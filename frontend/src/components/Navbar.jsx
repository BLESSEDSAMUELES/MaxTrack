import React from 'react';
import { Train, ShieldCheck, RefreshCw, PlusCircle, Sparkles, Layers, Sliders, Activity, Brain } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  horizon,
  setHorizon,
  onOpenAddModal,
  onRegeneratePlan,
  isRegenerating
}) {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Division Info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-lg shadow-sky-500/20">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-sky-700 bg-clip-text text-transparent">
                  MaxTrack
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  SIH PS 26027
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Delhi Division (NR) • Station A – Station B (10.0 km)
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Control Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'tasks'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cross-Dept Task Pool</span>
            </button>

            <button
              onClick={() => setActiveTab('scenario')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'scenario'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>What-If Scenario Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ai'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>AI Intelligence</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Horizon Selector */}
            <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setHorizon('weekly')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  horizon === 'weekly' ? 'bg-white shadow-sm text-sky-700 font-semibold' : 'text-slate-500'
                }`}
              >
                7-Day Weekly
              </button>
              <button
                onClick={() => setHorizon('monthly')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  horizon === 'monthly' ? 'bg-white shadow-sm text-sky-700 font-semibold' : 'text-slate-500'
                }`}
              >
                30-Day Monthly
              </button>
            </div>

            {/* Log Defect Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Log Defect</span>
            </button>

            {/* Re-optimize Button */}
            <button
              onClick={onRegeneratePlan}
              disabled={isRegenerating}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Solving...' : 'Re-Optimize'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
