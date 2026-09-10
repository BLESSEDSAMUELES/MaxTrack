import React from 'react';

export default function Sidebar({
  activeModule,
  onSelectModule,
  corridor,
  onSelectCorridor,
  horizon,
  onSelectHorizon,
  onTriggerSolve,
  isSolving,
  solverTelemetry
}) {
  const runtimeMs = solverTelemetry?.solver_runtime_ms || 18;
  const solverStatus = solverTelemetry?.solver_status || 'OPTIMAL';

  const modules = [
    { id: 'command_center', label: 'Command Center', icon: '⚡' },
    { id: 'data_bridge', label: 'Data Bridge', icon: '🗄' },
    { id: 'ai_prioritization', label: 'AI Prioritization', icon: '🧠' },
    { id: 'block_scheduler', label: 'Block Scheduler', icon: '📅' },
    { id: 'marey_chart', label: 'Marey Chart', icon: '📈' },
    { id: 'geo_map', label: 'Corridor Map', icon: '🗺' },
    { id: 'what_if_simulator', label: 'What-If Simulator', icon: '🧪' },
    { id: 'bdms_dispatch', label: 'CRIS Gateway', icon: '📑' }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div
        className="sidebar-header cursor-pointer"
        onClick={() => onSelectModule('command_center')}
      >
        <img src="/assets/ir_logo.svg" alt="Indian Railways" className="sidebar-brand-img" />
        <div className="sidebar-brand-text">
          <span className="brand-title">IR-ABPS | MAXTRACK</span>
          <span className="brand-subtitle">CRIS • SIH PS 26027</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <nav className="sidebar-nav">
        {modules.map((m) => (
          <button
            key={m.id}
            className={`nav-item-btn ${activeModule === m.id ? 'active' : ''}`}
            onClick={() => onSelectModule(m.id)}
          >
            <span className="nav-icon">{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </nav>

      {/* Sidebar Footer Controls */}
      <div className="sidebar-footer">
        <div className="sidebar-select-group">
          <label className="sidebar-select-label" htmlFor="corridorSelect">
            Corridor Subgraph
          </label>
          <select
            className="select-box-light"
            id="corridorSelect"
            value={corridor}
            onChange={(e) => onSelectCorridor(e.target.value)}
          >
            <option value="NDLS-CNB">NDLS-CNB (HDN 440km)</option>
            <option value="DNR-PNBE">DNR-PNBE (Branch 10km)</option>
          </select>
        </div>

        <div className="sidebar-select-group">
          <label className="sidebar-select-label" htmlFor="horizonSelect">
            Planning Horizon
          </label>
          <select
            className="select-box-light"
            id="horizonSelect"
            value={horizon}
            onChange={(e) => onSelectHorizon(e.target.value)}
          >
            <option value="weekly">Weekly (7-Day Rolling)</option>
            <option value="monthly">Monthly (30-Day Capital)</option>
          </select>
        </div>

        <button
          className="action-btn-sidebar"
          onClick={onTriggerSolve}
          disabled={isSolving}
        >
          <span>⚡</span>
          <span>{isSolving ? 'Solving CP-SAT...' : 'Re-Solve (CP-SAT)'}</span>
        </button>

        <div className="sidebar-solver-pill">
          <span>🟢</span>
          <span>CP-SAT {solverStatus} • {runtimeMs}ms</span>
        </div>
      </div>
    </aside>
  );
}
