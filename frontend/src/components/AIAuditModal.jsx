import React from 'react';

export default function AIAuditModal({ isOpen, onClose, candidates = [] }) {
  if (!isOpen) return null;

  const defaultCandidates = [
    {
      option_label: 'A',
      option_title: 'Night Shadow Window (Optimal)',
      scheduled_start: '01:30',
      scheduled_end: '04:30',
      duration_minutes: 180,
      downtime_hours: 3.0,
      objective_score: 8420,
      passenger_conflicts: 0,
      tsr_imposed: false,
      status: 'SELECTED',
      why: 'MaxTrack selected this nocturnal window because it combines TRD 25kV OHE isolation and ENG track tamping while strictly maintaining 15-minute headway buffer under G&SR 15.08. Zero passenger services operate in this corridor section during 01:30-04:30.',
      constraints_satisfied: [
        'GSR_15_08 (Headway)',
        'OHE_ISOLATION (25kV)',
        'MACHINE_CAPACITY (CSM 09-32)',
        'ZERO_PASSENGER_CONFLICT',
        'FIFO_PRIORITY',
        'IRPWM_CODAL'
      ],
      constraints_violated: []
    },
    {
      option_label: 'B',
      option_title: 'Midday Corridor Window (Sub-Optimal)',
      scheduled_start: '11:45',
      scheduled_end: '14:45',
      duration_minutes: 180,
      downtime_hours: 3.0,
      objective_score: 6062,
      passenger_conflicts: 0,
      tsr_imposed: true,
      tsr_speed_kmh: 30,
      status: 'FEASIBLE',
      why: 'Avoids direct passenger overlaps but imposes 30 km/h Temporary Speed Restriction (TSR) on adjacent line during daytime traffic, causing cascading delays to 3 Mail/Express services. 28% objective score degradation vs optimal nocturnal slot.',
      constraints_satisfied: ['GSR_15_08', 'MACHINE_CAPACITY', 'FIFO_PRIORITY'],
      constraints_violated: ['TSR_PENALTY (30 km/h TSR on adjacent line during peak traffic)']
    },
    {
      option_label: 'C',
      option_title: 'Morning Peak (REJECTED — Passenger Conflict)',
      scheduled_start: '08:00',
      scheduled_end: '11:00',
      duration_minutes: 180,
      downtime_hours: 3.0,
      objective_score: 1200,
      passenger_conflicts: 4,
      tsr_imposed: true,
      tsr_speed_kmh: 20,
      status: 'REJECTED',
      why: 'Strictly eliminated by Google OR-Tools CP-SAT hard non-overlap constraint. Possession directly clashes with Vande Bharat Express (22436) and Gomti Express (12419).',
      constraints_satisfied: ['MACHINE_CAPACITY'],
      constraints_violated: [
        'ZERO_PASSENGER_CONFLICT (4 High-Speed Trains Blocked)',
        'GSR_15_08 (Buffer Violated)'
      ]
    }
  ];

  const list = candidates.length > 0 ? candidates : defaultCandidates;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🧠</span>
            <span>AI DECISION AUDIT: CP-SAT CANDIDATE WINDOW EVALUATION</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body space-y-3.5 text-xs">
          <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-md p-3 text-[#0369a1] leading-relaxed">
            <strong>Google OR-Tools CP-SAT Combinatorial Search:</strong> Evaluated all possible temporal slots in the corridor planning horizon against the Working Time Table (WTT). Displays why the selected nocturnal slot outscored alternative candidate windows.
          </div>

          <div className="space-y-3">
            {list.map((c, idx) => {
              const isSelected = c.status === 'SELECTED';
              const isFeasible = c.status === 'FEASIBLE';
              const borderClass = isSelected
                ? 'border-[#059669] bg-[#f0fdf4]'
                : isFeasible
                ? 'border-[#d97706] bg-[#fffbeb]'
                : 'border-red-300 bg-red-50/60';

              const badgeClass = isSelected
                ? 'badge-snt'
                : isFeasible
                ? 'badge-trd'
                : 'badge-danger';

              return (
                <div key={idx} className={`border rounded-lg p-3.5 ${borderClass}`}>
                  <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm font-mono text-[#0f172a]">
                        Option {c.option_label}: {c.option_title}
                      </span>
                      <span className={`badge ${badgeClass}`}>{c.status}</span>
                    </div>
                    <div className="font-mono text-xs text-[#475569]">
                      Slot: <strong>{c.scheduled_start} - {c.scheduled_end}</strong> ({c.duration_minutes}m) • Score: <strong className="text-[#0284c7]">{c.objective_score}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#475569] leading-relaxed mb-2.5">
                    {c.why}
                  </p>

                  <div className="flex flex-wrap gap-2 text-[10px]">
                    {c.constraints_satisfied?.map((cs, csi) => (
                      <span key={csi} className="bg-white border border-[#bbf7d0] text-[#166534] px-2 py-0.5 rounded font-medium">
                        ✓ {cs}
                      </span>
                    ))}
                    {c.constraints_violated?.map((cv, cvi) => (
                      <span key={cvi} className="bg-white border border-red-300 text-red-700 px-2 py-0.5 rounded font-medium">
                        ✗ {typeof cv === 'string' ? cv : cv.detail || cv.code}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button className="action-btn-primary" onClick={onClose}>
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
}
