const API_BASE = '/api';

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchTasks(departmentCode = null, status = null) {
  let url = `${API_BASE}/tasks`;
  const params = new URLSearchParams();
  if (departmentCode) params.append('department_code', departmentCode);
  if (status) params.append('status', status);
  if (params.toString()) url += `?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(taskData) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function fetchLatestPlan() {
  const res = await fetch(`${API_BASE}/plans/latest`);
  if (!res.ok) throw new Error('Failed to fetch latest plan');
  return res.json();
}

export async function generatePlan(horizonType = 'weekly') {
  const res = await fetch(`${API_BASE}/plans/generate?horizon_type=${horizonType}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to generate plan');
  return res.json();
}

export async function takeBlockAction(blockId, action, notes = '') {
  const res = await fetch(`${API_BASE}/blocks/${blockId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      officer_name: 'Rakesh Sharma (Nodal Planning Officer)',
      role: 'planning_officer',
      notes
    })
  });
  if (!res.ok) throw new Error('Failed to update block');
  return res.json();
}

export async function runWhatIfSimulation(scenarioPayload) {
  const res = await fetch(`${API_BASE}/simulator/what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scenarioPayload)
  });
  if (!res.ok) throw new Error('Failed to run simulation');
  return res.json();
}

export async function fetchMLMetrics() {
  const res = await fetch(`${API_BASE}/ml/metrics`);
  if (!res.ok) throw new Error('Failed to fetch ML metrics');
  return res.json();
}

export async function predictCustomACI(params) {
  const res = await fetch(`${API_BASE}/ml/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to predict ACI');
  return res.json();
}
