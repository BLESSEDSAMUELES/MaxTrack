import React from 'react';

export default function FormT351Modal({ block, onClose, onShowToast }) {
  if (!block) return null;

  const lead = block.lead_task || {};
  const shadows = block.shadow_tasks || [];

  const memoText = `================================================================================
  INDIAN RAILWAYS · CONTROL OFFICE AUTOMATION (COA) / CRIS
  TELEGRAPHIC NOTICE: MEMO FORM S&T T/351 & ELECTRICAL PERMIT TO WORK (PTW)
================================================================================
DISCONNECTION MEMO NUMBER : CRIS/COA/T351/${block.bundle_id}/2026
SANCTIONING AUTHORITY     : Section Controller / Sr. Divisional Operations Manager
OPERATIONAL CORRIDOR      : ${block.corridor_code || 'NDLS-CNB'} [${block.line}]
TRACK LOCATION POSTS      : Km ${Number(block.km_start || 0).toFixed(3)} to Km ${Number(block.km_end || 0).toFixed(3)}
25 kV ELEMENTARY SECTION  : ${block.elementary_section}
SANCTIONED POSSESSION     : ${block.scheduled_start} TO ${block.scheduled_end} (${block.duration_minutes} MINS)
TRACTION POWER STATUS     : ${block.power_off_required ? 'POWER-OFF REQUIRED (OHE Permit-To-Work PTW-09)' : 'TRACTION LIVE (No Isolation)'}

INTERLOCKED MULTI-DEPARTMENT CO-ORDINATION:
1. LEAD DISCIPLINE        : ${lead.department || 'ENG'} — ${lead.task_type || 'Track Maintenance'} (${lead.duration_minutes || block.duration_minutes}m)
   MACHINE ASSET DEPLOYED : ${lead.machine_required || 'Manual P-Way Gang & Tool Van'}
   SAFETY RESTRICTION     : Caution Order Speed ${lead.caution_order_speed || 30} km/h

2. PIGGYBACKED DISCIPLINES:
${shadows.length === 0 ? '   - Nil (Single possession)' : shadows.map((s, i) => `   ${i + 1}. ${s.department} [${s.id}]: ${s.task_type} (${s.duration_minutes}m, absorbed inside master window)`).join('\n')}

STATUTORY SAFETY UNDERTAKINGS (G&SR 3.51 & 15.08):
• Both Station Masters at adjacent block huts advised. Interlocking levers locked normal.
• Track Circuit / Axle Counter disconnect pins clamped under Form T/351 Para 4.
• Minimum 15-minute headway buffer certified free of high-speed passenger paths.
• Nodal Engineer to personally report speed restoration via COA terminal upon completion.

DIGITAL SIGN-OFF:
Dy. Chief Controller (Coaching/Track) · Prayagraj / Danapur Division
CRIS DIGITAL TOKEN: SHA256-${block.bundle_id}-VERIFIED-OK
================================================================================`;

  const copyMemo = () => {
    navigator.clipboard?.writeText(memoText);
    onShowToast?.('Form T/351 Memo copied to clipboard!', 'success');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>📑</span>
            <span>CRIS STATUTORY WIRE MEMO: FORM S&T (T/351) & TRD PERMIT-TO-WORK</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <pre className="code-inspector whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
            {memoText}
          </pre>
        </div>

        <div className="modal-footer">
          <button className="action-btn-primary" onClick={copyMemo}>
            Copy Wire Memo
          </button>
          <button className="sub-tab-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
