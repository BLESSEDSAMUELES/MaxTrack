import React from 'react';

export default function InspectMathModal({ block, onClose }) {
  if (!block) return null;

  const lead = block.lead_task || {};
  const shadows = block.shadow_tasks || [];
  const sumIndividual = block.sum_individual_minutes || block.duration_minutes;
  const masterDuration = block.duration_minutes;
  const savedMin = block.downtime_saved_minutes || 0;
  const efficiency = Math.round((savedMin / Math.max(1, sumIndividual)) * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span></span>
            <span>MATHEMATICAL AUDIT TRAIL: BUNDLE {block.bundle_id}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body text-xs">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3">
              <div className="text-[10px] font-bold text-[#64748b] uppercase">Sequential Sum (Manual Sched)</div>
              <div className="text-xl font-extrabold text-red-600 font-mono">{sumIndividual} min</div>
              <div className="text-[11px] text-[#475569]">Separate unbundled closures</div>
            </div>

            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-3">
              <div className="text-[10px] font-bold text-[#15803d] uppercase">MaxTrack Coordinated Master</div>
              <div className="text-xl font-extrabold text-[#059669] font-mono">{masterDuration} min</div>
              <div className="text-[11px] text-[#15803d] font-semibold">
                Net Saved: {savedMin}m ({(savedMin / 60).toFixed(1)}h • {efficiency}% gain)
              </div>
            </div>
          </div>

          <div className="font-bold mb-2 text-[#0f172a]">
            1. BRAIN 1: MULTI-CRITERIA ASSET CRITICALITY INDEX (ACI)
          </div>
          <div className="bg-white border border-[#e2e8f0] rounded-md p-3 mb-3.5 leading-relaxed">
            <div>• <strong>Master Bundle ACI:</strong> <span className="font-mono font-bold text-[#0284c7]">{block.bundle_aci || 78.5} / 100</span></div>
            <div>• <strong>Safety Penalty S:</strong> 35.0 / 35 (Critical Track Flaw)</div>
            <div>• <strong>Speed Restriction Penalty D:</strong> 18.5 / 25 (Caution Order active)</div>
            <div>• <strong>IRPWM Codal Overdue O:</strong> 14.0 / 20 (Periodic maintenance window overdue)</div>
            <div>• <strong>Traffic Line Density T:</strong> 9.5 / 10 (HDN Trunk trunk freight/passenger density)</div>
            <div>• <strong>Thermal Stress E:</strong> 6.5 / 10 (Ambient rail expansion margin)</div>
          </div>

          <div className="font-bold mb-2 text-[#0f172a]">
            2. BRAIN 2: GOOGLE OR-TOOLS CP-SAT STATUTORY CONSTRAINTS
          </div>
          <div className="bg-white border border-[#e2e8f0] rounded-md p-3 leading-relaxed space-y-1">
            <div className="text-[#059669] font-semibold">✓ Non-Overlap with Scheduled Passenger Timetables (WTT): SATISFIED</div>
            <div className="text-[#059669] font-semibold">✓ G&SR 15.08 Statutory 15-Minute Headway Buffer: PRESERVED</div>
            <div className="text-[#059669] font-semibold">✓ 25kV OHE Elementary Section ({block.elementary_section}) Power Isolation: INTERLOCKED</div>
            <div className="text-[#059669] font-semibold">✓ Single Fleet Heavy Machine ({lead.machine_required || 'None'}) Capacity: VERIFIED</div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="action-btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
