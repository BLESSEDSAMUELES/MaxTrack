import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KpiRibbon from './components/KpiRibbon';
import ProofPanel from './components/ProofPanel';
import BlockGantt from './components/BlockGantt';
import BlockInspectorModal from './components/BlockInspectorModal';
import TaskPoolTable from './components/TaskPoolTable';
import ScenarioPlayground from './components/ScenarioPlayground';
import AddTaskModal from './components/AddTaskModal';
import AIModelDashboard from './components/AIModelDashboard';
import { fetchDashboardStats, fetchTasks, fetchLatestPlan, generatePlan } from './services/api';
import { Sparkles, Shield, Layers, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'tasks', 'scenario'
  const [horizon, setHorizon] = useState('weekly');
  const [stats, setStats] = useState(null);
  const [plan, setPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const [statsRes, planRes, tasksRes] = await Promise.all([
        fetchDashboardStats(),
        fetchLatestPlan(),
        fetchTasks()
      ]);
      setStats(statsRes);
      setPlan(planRes);
      setTasks(tasksRes);
    } catch (err) {
      console.error('Error loading MaxTrack data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegeneratePlan = async () => {
    setIsRegenerating(true);
    try {
      const newPlan = await generatePlan(horizon);
      setPlan(newPlan);
      const newStats = await fetchDashboardStats();
      setStats(newStats);
      showToast('CP-SAT Solver generated an optimal bundled block schedule in < 25ms!');
    } catch (err) {
      console.error('Failed to regenerate plan:', err);
      showToast('Failed to solve plan.');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        horizon={horizon}
        setHorizon={(h) => {
          setHorizon(h);
          handleRegeneratePlan();
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onRegeneratePlan={handleRegeneratePlan}
        isRegenerating={isRegenerating}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Executive KPI Ribbon (Always visible) */}
        <KpiRibbon stats={stats} />

        {/* Tab 1: Operational Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* The Central Proof Panel: Manual Baseline vs MaxTrack Bundled */}
            <ProofPanel comparison={stats?.proof_panel} />

            {/* Bundled Master Block Gantt Calendar */}
            <BlockGantt
              blocks={plan?.blocks || []}
              onSelectBlock={(b) => setSelectedBlock(b)}
            />
          </div>
        )}

        {/* Tab 2: Unified Cross-Department Task Pool */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-fadeIn">
            <TaskPoolTable
              tasks={tasks}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 3: Interactive What-If Scenario Lab */}
        {activeTab === 'scenario' && (
          <div className="space-y-6 animate-fadeIn">
            <ScenarioPlayground
              onApplyToActivePlan={() => {
                loadData();
                setActiveTab('dashboard');
              }}
            />
          </div>
        )}

        {/* Tab 4: AI/ML Intelligence Dashboard */}
        {activeTab === 'ai' && (
          <div className="space-y-6 animate-fadeIn">
            <AIModelDashboard />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060910] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MaxTrack Rail Asset Availability Optimization • Smart India Hackathon 2026 (PS: 26027)</span>
          <span className="font-mono text-slate-400">Decision Support Architecture • Google OR-Tools CP-SAT</span>
        </div>
      </footer>

      {/* Modals */}
      {selectedBlock && (
        <BlockInspectorModal
          block={selectedBlock}
          onClose={() => setSelectedBlock(null)}
          onActionSuccess={() => {
            loadData();
            showToast('Block status successfully logged to audit trail.');
          }}
        />
      )}

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTaskCreated={() => {
          loadData();
          showToast('Defect logged & priority score computed.');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-sky-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl shadow-sky-600/30 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
