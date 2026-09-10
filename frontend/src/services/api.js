/**
 * MaxTrack High-Performance API Client
 * Connects directly to FastAPI backend running in Main - File (or dev proxy on :5173)
 */

const API_BASE = '/api';

export async function fetchSystemStatus(corridor = 'NDLS-CNB') {
  const res = await fetch(`${API_BASE}/status?corridor=${encodeURIComponent(corridor)}`);
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function fetchDashboardKPIs(corridor = 'NDLS-CNB', horizon = 'weekly') {
  const res = await fetch(`${API_BASE}/kpis?horizon=${encodeURIComponent(horizon)}&corridor=${encodeURIComponent(corridor)}`);
  if (!res.ok) throw new Error('Failed to fetch KPIs');
  return res.json();
}

export async function fetchDataBridge(corridor = 'NDLS-CNB') {
  const res = await fetch(`${API_BASE}/data-bridge?corridor=${encodeURIComponent(corridor)}`);
  if (!res.ok) throw new Error('Failed to fetch data bridge records');
  return res.json();
}

export async function fetchPrioritization(corridor = 'NDLS-CNB') {
  const res = await fetch(`${API_BASE}/prioritization?corridor=${encodeURIComponent(corridor)}`);
  if (!res.ok) throw new Error('Failed to fetch prioritization queue');
  return res.json();
}

export async function fetchMLMetrics() {
  const res = await fetch(`${API_BASE}/ml/metrics`);
  if (!res.ok) throw new Error('Failed to fetch ML metrics');
  return res.json();
}

export async function predictCustomACI(payload) {
  const res = await fetch(`${API_BASE}/ml/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to predict ACI score');
  return res.json();
}

export async function fetchSchedule(corridor = 'NDLS-CNB', horizon = 'weekly') {
  const res = await fetch(`${API_BASE}/schedule?horizon=${encodeURIComponent(horizon)}&corridor=${encodeURIComponent(corridor)}`);
  if (!res.ok) throw new Error('Failed to fetch block schedule');
  return res.json();
}

export async function solveSchedule(corridor = 'NDLS-CNB', horizon = 'weekly') {
  const res = await fetch(`${API_BASE}/schedule/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ corridor, horizon })
  });
  if (!res.ok) throw new Error('Failed to solve schedule');
  return res.json();
}

export async function addCustomTask(taskData) {
  const res = await fetch(`${API_BASE}/tasks/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error('Failed to add maintenance task');
  return res.json();
}

export async function resetTasks() {
  const res = await fetch(`${API_BASE}/tasks/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset tasks');
  return res.json();
}

export async function runSimulation(scenarioId, corridor = 'NDLS-CNB', horizon = 'weekly') {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_id: scenarioId, corridor, horizon })
  });
  if (!res.ok) throw new Error('Failed to run simulation');
  return res.json();
}

export async function applySimulation(scenarioId, corridor = 'NDLS-CNB', horizon = 'weekly') {
  const res = await fetch(`${API_BASE}/simulate/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_id: scenarioId, corridor, horizon })
  });
  if (!res.ok) throw new Error('Failed to apply simulation');
  return res.json();
}

export async function resetSimulation() {
  const res = await fetch(`${API_BASE}/simulate/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset simulation');
  return res.json();
}

export async function sanctionBlock(blockId, officerName = 'A. K. Srivastava (Section Controller / Sr. DOM)') {
  const res = await fetch(`${API_BASE}/blocks/${encodeURIComponent(blockId)}/sanction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ officer_name: officerName, action: 'sanction' })
  });
  if (!res.ok) throw new Error('Failed to sanction block');
  return res.json();
}

export async function fetchBDMSMemos(blockId = null) {
  const url = blockId ? `${API_BASE}/bdms/memos?block_id=${encodeURIComponent(blockId)}` : `${API_BASE}/bdms/memos`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch BDMS memos');
  return res.json();
}

export function getExportT351Url(blockId = null) {
  return blockId ? `${API_BASE}/bdms/export/t351?block_id=${encodeURIComponent(blockId)}` : `${API_BASE}/bdms/export/t351`;
}
