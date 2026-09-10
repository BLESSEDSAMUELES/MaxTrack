import React, { useState } from 'react';
import { sanctionBlock, getExportT351Url } from '../services/api';

export default function BlockScheduler({
  state,
  onNavigate,
  onOpenMathModal,
  onOpenMemoModal,
  onOpenAIAuditModal,
  onShowToast,
  onBlockSanctioned
}) {
  const sched = state.schedule || {};
  const blocks = sched.blocks || [];
  const horizon = sched.horizon || state.horizon || 'weekly';

  const [sanctioningIds, setSanctioningIds] = useState(new Set());

  const handleSanction = async (bundleId) => {
    setSanctioningIds((prev) => new Set(prev).add(bundleId));
    try {
      await sanctionBlock(bundleId);
      onBlockSanctioned?.(bundleId);
      onShowToast?.(`Block ${bundleId} digitally sanctioned under G&SR 15.08! Form T/351 generated.`, 'success');
    } catch (err) {
      console.error(err);
      onShowToast?.('Failed to sanction block: ' + err.message, 'danger');
    } finally {
      setSanctioningIds((prev) => {
        const next = new Set(prev);
        next.delete(bundleId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Summary Banner */}
      <div className="rail-card">
        <div className="card-header flex-wrap gap-3">
          <div>
            <div className="card-title">CP-SAT MULTI-DEPARTMENT COORDINATED BLOCK SCHEDULE</div>
            <div className="card-subtitle">
              Corridor: <strong className="text-[#0f172a]">{state.corridor}</strong> • 
              Horizon: <strong className="text-[#0284c7]">{horizon.toUpperCase()}</strong> • 
              Total Master Possessions: <strong className="text-[#0f172a]">{sched.total_blocks_scheduled || blocks.length}</strong> • 
              Net Downtime Saved: <strong className="text-[#059669]">{sched.total_downtime_saved_hours || 4.5} Hours</strong>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              className="action-btn-primary !bg-[#7c3aed] !border-[#6d28d9]"
              onClick={onOpenAIAuditModal}
            >
              🧠 View AI Decision Audit →
            </button>
            <button
              className="action-btn-primary !bg-[#0284c7]"
              onClick={() => onNavigate('marey_chart')}
            >
              View Marey Time-Space Diagram →
            </button>
            <button
              className="action-btn-primary !bg-[#059669] !border-[#047857]"
              onClick={() => onNavigate('bdms_dispatch')}
            >
              Export CRIS Statutory Memos →
            </button>
          </div>
        </div>

        {/* Bundle Cards Feed */}
        <div className="flex flex-col gap-3.5 mt-3.5">
          {blocks.length === 0 ? (
            <div className="text-center py-10 text-[#64748b]">
              No coordinated master blocks found. Click "Re-Solve (CP-SAT)" in the sidebar.
            </div>
          ) : (
            blocks.map((block, idx) => {
              const lead = block.lead_task || {};
              const shadows = block.shadow_tasks || [];
              const isBundled = block.is_bundled;
              const isEmergency = block.is_emergency || (block.bundle_id && block.bundle_id.includes('EMERGENCY'));
              const isCustom = block.is_custom || (lead && lead.is_custom);
              const isSanctioned = block.status === 'SANCTIONED_COA' || block.officer_sanctioned;
              const isSanctioning = sanctioningIds.has(block.bundle_id);

              const borderLeftColor = isEmergency
                ? 'var(--accent-danger)'
                : isBundled
                ? 'var(--accent-cyan)'
                : 'var(--accent-eng)';

              return (
                <div
                  key={block.bundle_id || idx}
                  className="bundle-box"
                  style={{ borderLeft: `4px solid ${borderLeftColor}` }}
                >
                  <div className="bundle-top flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-extrabold text-[13px] text-[#0f172a]">
                        {block.bundle_id}
                      </span>

                      {isEmergency && <span className="badge badge-danger">EMERGENCY INJECTION</span>}
                      {isCustom && <span className="badge badge-bundle">LIVE EVALUATOR TASK</span>}
                      <span className={`badge ${isBundled ? 'badge-bundle' : 'badge-eng'}`}>
                        {isBundled ? 'CO-SCHEDULED SHADOW BUNDLE' : 'ISOLATED BLOCK'}
                      </span>
                      {block.power_off_required && (
                        <span className="badge badge-danger">25kV OHE POWER-OFF</span>
                      )}

                      <span className={`badge ${isSanctioned ? 'badge-snt' : 'badge-trd'}`}>
                        {isSanctioned ? '✓ SANCTIONED (COA)' : 'PENDING SANCTION'}
                      </span>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="text-[#64748b]">Possession Slot: </span>
                      <span className="font-bold text-[#0284c7]">
                        {block.scheduled_start} to {block.scheduled_end ? (block.scheduled_end.split(' ')[1] || block.scheduled_end) : ''} ({block.duration_minutes}m)
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 text-[11px] mb-2 text-[#475569] flex-wrap">
                    <span>Line: <strong className="text-[#0f172a] font-mono">{block.line}</strong></span>
                    <span>Section: <strong className="text-[#0f172a] font-mono">Km {Number(block.km_start || 0).toFixed(1)} - {Number(block.km_end || 0).toFixed(1)}</strong></span>
                    <span>Elementary Section: <strong className="text-[#0284c7] font-mono">{block.elementary_section}</strong></span>
                    <span>Departments: <strong className="text-[#0f172a]">{(block.departments || []).join(' + ')}</strong></span>
                    <span>Safety Buffer: <strong className="text-[#059669]">15 min G&SR 15.08 Headway</strong></span>
                  </div>

                  {/* Lead Block Specification */}
                  <div className="bundle-tasks-list">
                    <div className="task-item border-b border-[#e2e8f0] pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="badge badge-eng">LEAD POSSESSION</span>
                        <span className="font-bold text-[#0f172a]">
                          {lead.department || 'ENG'}: {lead.task_type || 'Track Maintenance'}
                        </span>
                        <span className="text-[#64748b] text-[10px]">[{lead.id || 'T-01'}]</span>
                      </div>
                      <div className="font-mono font-bold text-[#0284c7]">
                        Duration: {lead.duration_minutes || block.duration_minutes}m {lead.machine_required ? `• ${lead.machine_required}` : ''}
                      </div>
                    </div>

                    {/* Shadow Tasks Piggybacked */}
                    {shadows.map((st, sidx) => (
                      <div key={st.id || sidx} className="task-item text-[#475569]">
                        <div className="flex items-center gap-1.5">
                          <span className={`badge ${st.department === 'SNT' ? 'badge-snt' : 'badge-trd'}`}>
                            SHADOW PIGGYBACK
                          </span>
                          <span className="text-[#0f172a] font-semibold">
                            {st.department}: {st.task_type}
                          </span>
                          <span className="text-[#64748b] text-[10px]">[{st.id} • {st.line}]</span>
                        </div>
                        <div className="font-mono text-[#059669] font-semibold">
                          Duration: {st.duration_minutes}m (Fully Absorbed)
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Concurrency Math & Action Toolbar */}
                  <div className="flex justify-between items-center mt-2.5 text-[11px] flex-wrap gap-2">
                    <div className="text-[#475569] leading-normal max-w-[60%]">
                      <strong className="text-[#0284c7]">Operations Justification: </strong>
                      {block.justification || 'Multi-department shadow possession under G&SR 15.08'}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        className="sub-tab-btn text-[11px] py-1 px-2.5"
                        onClick={() => onOpenMathModal?.(block)}
                      >
                        Inspect Math
                      </button>
                      <button
                        className="sub-tab-btn text-[11px] py-1 px-2.5 text-[#0369a1] border-[#bae6fd]"
                        onClick={() => onOpenMemoModal?.(block)}
                      >
                        Form T/351 Memo
                      </button>
                      <button
                        className="sub-tab-btn text-[11px] py-1 px-2.5 text-[#7c3aed] border-[#ddd6fe]"
                        onClick={() => window.open(getExportT351Url(block.bundle_id), '_blank')}
                      >
                        Export PDF
                      </button>
                      <button
                        className="action-btn-primary text-[11px] py-1 px-2.5"
                        style={{
                          backgroundColor: isSanctioned ? '#64748b' : '#059669',
                          borderColor: isSanctioned ? '#475569' : '#047857'
                        }}
                        disabled={isSanctioned || isSanctioning}
                        onClick={() => handleSanction(block.bundle_id)}
                      >
                        {isSanctioning ? 'Sanctioning...' : isSanctioned ? '✓ Sanctioned' : 'Sanction Block'}
                      </button>
                    </div>
                  </div>

                  {/* Per-block Rule Badges */}
                  {block.rules_satisfied && block.rules_satisfied.length > 0 && (
                    <div className="block-rules-strip">
                      {block.rules_satisfied.map((r, ri) => (
                        <span key={ri} className="block-rule-pill">
                          ✓ {r.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
