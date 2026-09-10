import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import CommandCenter from './components/CommandCenter';
import DataBridge from './components/DataBridge';
import AIPrioritization from './components/AIPrioritization';
import BlockScheduler from './components/BlockScheduler';
import MareyChart from './components/MareyChart';
import GeoMap from './components/GeoMap';
import WhatIfSimulator from './components/WhatIfSimulator';
import BDMSDispatch from './components/BDMSDispatch';
import AddTaskModal from './components/AddTaskModal';
import InspectMathModal from './components/InspectMathModal';
import FormT351Modal from './components/FormT351Modal';
import AIAuditModal from './components/AIAuditModal';

import {
  fetchSystemStatus,
  fetchDashboardKPIs,
  fetchDataBridge,
  fetchPrioritization,
  fetchSchedule,
  solveSchedule,
  fetchBDMSMemos,
  fetchMLMetrics,
  resetSimulation
} from './services/api';

export default function App() {
  const [activeModule, setActiveModule] = useState('command_center');
  const [corridor, setCorridor] = useState('NDLS-CNB');
  const [horizon, setHorizon] = useState('weekly');

  const [state, setState] = useState({
    status: null,
    kpis: null,
    dataBridge: null,
    prioritization: null,
    schedule: null,
    bdmsMemos: null,
    mlMetrics: null,
    corridor: 'NDLS-CNB',
    horizon: 'weekly'
  });

  const [isSolving, setIsSolving] = useState(false);
  const [toast, setToast] = useState(null);

  // Modal states
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [mathModalBlock, setMathModalBlock] = useState(null);
  const [memoModalBlock, setMemoModalBlock] = useState(null);
  const [isAIAuditOpen, setIsAIAuditOpen] = useState(false);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadData = useCallback(async (c = corridor, h = horizon) => {
    try {
      const [statusRes, kpiRes, bridgeRes, prioRes, schedRes, memoRes, mlRes] =
        await Promise.all([
          fetchSystemStatus(c).catch(() => ({})),
          fetchDashboardKPIs(c, h).catch(() => ({})),
          fetchDataBridge(c).catch(() => ({})),
          fetchPrioritization(c).catch(() => ({})),
          fetchSchedule(c, h).catch(() => ({})),
          fetchBDMSMemos().catch(() => ({})),
          fetchMLMetrics().catch(() => ({}))
        ]);

      setState({
        status: statusRes,
        kpis: kpiRes,
        dataBridge: bridgeRes,
        prioritization: prioRes,
        schedule: schedRes,
        bdmsMemos: memoRes,
        mlMetrics: mlRes,
        corridor: c,
        horizon: h
      });
    } catch (err) {
      console.error('Error loading MaxTrack data:', err);
      showToast('Error connecting to MaxTrack backend', 'danger');
    }
  }, [corridor, horizon, showToast]);

  useEffect(() => {
    loadData(corridor, horizon);
  }, [corridor, horizon, loadData]);

  // Corridor change
  const handleSelectCorridor = (newCorridor) => {
    setCorridor(newCorridor);
    loadData(newCorridor, horizon);
    const corrName =
      newCorridor === 'DNR-PNBE'
        ? 'Danapur – Patna Junction (Branch 10km)'
        : 'New Delhi – Kanpur Central (HDN 440km)';
    showToast(`Loaded corridor: ${newCorridor} (${corrName})`, 'success');
  };

  // Horizon change
  const handleSelectHorizon = async (newHorizon) => {
    setHorizon(newHorizon);
    setIsSolving(true);
    try {
      const newSched = await solveSchedule(corridor, newHorizon);
      const newKPIs = await fetchDashboardKPIs(corridor, newHorizon);
      setState((prev) => ({
        ...prev,
        horizon: newHorizon,
        schedule: newSched,
        kpis: newKPIs
      }));
      showToast(`Switched horizon to ${newHorizon.toUpperCase()} (${newSched.total_blocks_scheduled || 0} blocks scheduled)`, 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to switch horizon', 'danger');
    } finally {
      setIsSolving(false);
    }
  };

  // Manual Trigger Solve
  const handleTriggerSolve = async () => {
    setIsSolving(true);
    try {
      const newSched = await solveSchedule(corridor, horizon);
      const newKPIs = await fetchDashboardKPIs(corridor, horizon);
      setState((prev) => ({
        ...prev,
        schedule: newSched,
        kpis: newKPIs
      }));
      showToast(
        `CP-SAT solved in ${newSched.solver_runtime_ms || 18}ms (${newSched.total_blocks_scheduled || 0} blocks, ${newSched.total_downtime_saved_hours || 0}h saved)`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Solver execution failed: ' + err.message, 'danger');
    } finally {
      setIsSolving(false);
    }
  };

  // When a task is added
  const handleTaskAdded = (res) => {
    if (res?.updated_schedule) {
      setState((prev) => ({
        ...prev,
        schedule: res.updated_schedule,
        kpis: res.updated_kpis
      }));
      showToast(res.message || 'Defect injected & CP-SAT re-optimized schedule!', 'success');
    } else {
      loadData(corridor, horizon);
      showToast('Task added successfully', 'success');
    }
  };

  // When a block is sanctioned
  const handleBlockSanctioned = (blockId) => {
    setState((prev) => {
      const sched = prev.schedule ? { ...prev.schedule } : {};
      const blocks = (sched.blocks || []).map((b) => {
        if (b.bundle_id === blockId || b.schedule_id === blockId) {
          return { ...b, status: 'SANCTIONED_COA', officer_sanctioned: true };
        }
        return b;
      });
      sched.blocks = blocks;
      return { ...prev, schedule: sched };
    });
  };

  // When simulation schedule is applied or reset
  const handleScheduleUpdated = (res) => {
    if (res?.schedule) {
      setState((prev) => ({
        ...prev,
        schedule: res.schedule,
        kpis: res.kpis || prev.kpis,
        status: {
          ...prev.status,
          is_simulation_active: Boolean(res.scenario_id),
          active_simulation_name: res.scenario_name || null
        }
      }));
    } else {
      loadData(corridor, horizon);
    }
  };

  // Revert active simulation baseline
  const handleResetSimulation = async () => {
    try {
      const res = await resetSimulation();
      handleScheduleUpdated(res);
      showToast('Live corridor schedule reverted to normal conflict-free baseline.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to reset simulation: ' + err.message, 'danger');
    }
  };

  return (
    <div className="app-layout">
      {/* Left Fixed Vertical Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        corridor={corridor}
        onSelectCorridor={handleSelectCorridor}
        horizon={horizon}
        onSelectHorizon={handleSelectHorizon}
        onTriggerSolve={handleTriggerSolve}
        isSolving={isSolving}
        solverTelemetry={state.schedule}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeModule === 'command_center' && (
          <CommandCenter
            state={state}
            onNavigate={setActiveModule}
            onOpenTaskModal={() => setIsAddTaskOpen(true)}
            onResetSimulation={handleResetSimulation}
          />
        )}

        {activeModule === 'data_bridge' && (
          <DataBridge state={state} onShowToast={showToast} />
        )}

        {activeModule === 'ai_prioritization' && (
          <AIPrioritization
            state={state}
            onOpenTaskModal={() => setIsAddTaskOpen(true)}
            onShowToast={showToast}
          />
        )}

        {activeModule === 'block_scheduler' && (
          <BlockScheduler
            state={state}
            onNavigate={setActiveModule}
            onOpenMathModal={(b) => setMathModalBlock(b)}
            onOpenMemoModal={(b) => setMemoModalBlock(b)}
            onOpenAIAuditModal={() => setIsAIAuditOpen(true)}
            onShowToast={showToast}
            onBlockSanctioned={handleBlockSanctioned}
          />
        )}

        {activeModule === 'marey_chart' && (
          <MareyChart state={state} />
        )}

        {activeModule === 'geo_map' && (
          <GeoMap state={state} />
        )}

        {activeModule === 'what_if_simulator' && (
          <WhatIfSimulator
            state={state}
            onNavigate={setActiveModule}
            onShowToast={showToast}
            onScheduleUpdated={handleScheduleUpdated}
          />
        )}

        {activeModule === 'bdms_dispatch' && (
          <BDMSDispatch state={state} onShowToast={showToast} />
        )}
      </main>

      {/* Global Modals */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        state={state}
        onTaskAdded={handleTaskAdded}
      />

      <InspectMathModal
        block={mathModalBlock}
        onClose={() => setMathModalBlock(null)}
      />

      <FormT351Modal
        block={memoModalBlock}
        onClose={() => setMemoModalBlock(null)}
        onShowToast={showToast}
      />

      <AIAuditModal
        isOpen={isAIAuditOpen}
        onClose={() => setIsAIAuditOpen(false)}
        candidates={state.schedule?.candidate_windows || []}
      />

      {/* Toast Notifications */}
      {toast && (
        <div className="maxtrack-toast-container">
          <div className={`maxtrack-toast ${toast.type}`}>
            <span className="font-bold text-base">
              {toast.type === 'success' ? '✓' : toast.type === 'danger' ? '⚠️' : '⚡'}
            </span>
            <span className="flex-1">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
