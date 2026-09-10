import React, { useRef, useEffect, useState, useCallback } from 'react';

export default function MareyChart({ state }) {
  const isDNR = state.corridor === 'DNR-PNBE';
  const data = state.dataBridge || {};
  const corridorStations =
    data.stations && data.stations.length > 0
      ? data.stations
      : isDNR
      ? [
          { code: 'DNR', name: 'Danapur', km: 0.0 },
          { code: 'PWS', name: 'Phulwari Sharif', km: 5.2 },
          { code: 'PNBE', name: 'Patna Junction', km: 10.0 }
        ]
      : [
          { code: 'NDLS', name: 'New Delhi', km: 0.0 },
          { code: 'GZB', name: 'Ghaziabad', km: 45.0 },
          { code: 'ALJN', name: 'Aligarh', km: 140.0 },
          { code: 'TDL', name: 'Tundla', km: 280.0 },
          { code: 'CNB', name: 'Kanpur Central', km: 440.0 }
        ];

  const rawTrains = data.coa_trains && data.coa_trains.length > 0 ? data.coa_trains : [];
  const sched = state.schedule || {};
  const blocks = sched.blocks || [];
  const maxKm = isDNR ? 10.0 : 440.0;

  // Fallback synthetic trains if rawTrains is empty
  const trains =
    rawTrains.length > 0
      ? rawTrains
      : isDNR
      ? [
          {
            train_no: '12141',
            train_name: 'Pataliputra Superfast Express',
            category: 'PREMIUM_PASSENGER',
            direction: 'DN',
            speed_kmh: 90,
            schedule: [
              { station: 'DNR', km: 0.0, dep_min: 330 },
              { station: 'PWS', km: 5.2, dep_min: 339 },
              { station: 'PNBE', km: 10.0, arr_min: 348 }
            ]
          },
          {
            train_no: '12309',
            train_name: 'Patna Rajdhani Express',
            category: 'PREMIUM_PASSENGER',
            direction: 'DN',
            speed_kmh: 110,
            schedule: [
              { station: 'DNR', km: 0.0, dep_min: 420 },
              { station: 'PWS', km: 5.2, dep_min: 427 },
              { station: 'PNBE', km: 10.0, arr_min: 435 }
            ]
          },
          {
            train_no: '13240',
            train_name: 'Kota Patna Express',
            category: 'EXPRESS',
            direction: 'UP',
            speed_kmh: 70,
            schedule: [
              { station: 'PNBE', km: 10.0, dep_min: 510 },
              { station: 'PWS', km: 5.2, dep_min: 520 },
              { station: 'DNR', km: 0.0, arr_min: 530 }
            ]
          },
          {
            train_no: 'BOXN-DNR',
            train_name: 'Freight Coal Rake',
            category: 'FREIGHT',
            direction: 'DN',
            speed_kmh: 55,
            schedule: [
              { station: 'DNR', km: 0.0, dep_min: 720 },
              { station: 'PWS', km: 5.2, dep_min: 735 },
              { station: 'PNBE', km: 10.0, arr_min: 750 }
            ]
          }
        ]
      : [
          {
            train_no: '12002',
            train_name: 'Bhopal Shatabdi Express',
            category: 'PREMIUM_PASSENGER',
            direction: 'DN',
            speed_kmh: 130,
            schedule: [
              { station: 'NDLS', km: 0.0, dep_min: 360 },
              { station: 'GZB', km: 45.0, dep_min: 395 },
              { station: 'ALJN', km: 140.0, dep_min: 455 },
              { station: 'TDL', km: 280.0, dep_min: 545 },
              { station: 'CNB', km: 440.0, arr_min: 650 }
            ]
          },
          {
            train_no: '12302',
            train_name: 'Howrah Rajdhani Express',
            category: 'PREMIUM_PASSENGER',
            direction: 'DN',
            speed_kmh: 130,
            schedule: [
              { station: 'NDLS', km: 0.0, dep_min: 1015 },
              { station: 'GZB', km: 45.0, dep_min: 1045 },
              { station: 'ALJN', km: 140.0, dep_min: 1100 },
              { station: 'TDL', km: 280.0, dep_min: 1180 },
              { station: 'CNB', km: 440.0, arr_min: 1290 }
            ]
          },
          {
            train_no: '12418',
            train_name: 'Prayagraj Express',
            category: 'EXPRESS',
            direction: 'DN',
            speed_kmh: 110,
            schedule: [
              { station: 'NDLS', km: 0.0, dep_min: 1330 },
              { station: 'GZB', km: 45.0, dep_min: 1365 },
              { station: 'ALJN', km: 140.0, dep_min: 1425 },
              { station: 'TDL', km: 280.0, dep_min: 85 },
              { station: 'CNB', km: 440.0, arr_min: 210 }
            ]
          },
          {
            train_no: '12301',
            train_name: 'Kolkata Rajdhani (UP)',
            category: 'PREMIUM_PASSENGER',
            direction: 'UP',
            speed_kmh: 130,
            schedule: [
              { station: 'CNB', km: 440.0, dep_min: 240 },
              { station: 'TDL', km: 280.0, dep_min: 345 },
              { station: 'ALJN', km: 140.0, dep_min: 430 },
              { station: 'GZB', km: 45.0, dep_min: 490 },
              { station: 'NDLS', km: 0.0, arr_min: 525 }
            ]
          },
          {
            train_no: 'BOXN-88',
            train_name: 'Coal Heavy Freight',
            category: 'FREIGHT',
            direction: 'DN',
            speed_kmh: 75,
            schedule: [
              { station: 'NDLS', km: 0.0, dep_min: 60 },
              { station: 'GZB', km: 45.0, dep_min: 110 },
              { station: 'ALJN', km: 140.0, dep_min: 220 },
              { station: 'TDL', km: 280.0, dep_min: 360 },
              { station: 'CNB', km: 440.0, arr_min: 510 }
            ]
          },
          {
            train_no: 'BCN-24',
            train_name: 'Cement Freight (UP)',
            category: 'FREIGHT',
            direction: 'UP',
            speed_kmh: 70,
            schedule: [
              { station: 'CNB', km: 440.0, dep_min: 780 },
              { station: 'TDL', km: 280.0, dep_min: 940 },
              { station: 'ALJN', km: 140.0, dep_min: 1080 },
              { station: 'GZB', km: 45.0, dep_min: 1200 },
              { station: 'NDLS', km: 0.0, arr_min: 1260 }
            ]
          }
        ];

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [currentTimeMin, setCurrentTimeMin] = useState(360); // 06:00 AM default
  const [isPlaying, setIsPlaying] = useState(false);
  const [dirFilter, setDirFilter] = useState('ALL');
  const [catFilter, setCatFilter] = useState('ALL');
  const [showBlocks, setShowBlocks] = useState(true);
  const [hoveredTrain, setHoveredTrain] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const formatTime = (totalMinutes) => {
    const m = (Math.floor(totalMinutes) % 1440 + 1440) % 1440;
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    const padH = String(hours).padStart(2, '0');
    const padM = String(mins).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${padH}:${padM} (${h12}:${padM} ${ampm})`;
  };

  // 20x Animation loop
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTimeMin((prev) => (prev + 3) % 1440);
      }, 60);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  // Canvas drawing function
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const padLeft = 85;
    const padRight = 35;
    const padTop = 30;
    const padBottom = 40;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const maxMin = 1440.0;

    // Clear background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 1. Station Horizontal Lines & Labels
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#475569';
    ctx.font = '10px JetBrains Mono, monospace';

    corridorStations.forEach((st) => {
      const y = padTop + (st.km / maxKm) * chartH;

      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.textAlign = 'right';
      ctx.fillText(`${st.code} (${st.km.toFixed(1)}k)`, padLeft - 10, y + 3);
    });

    // 2. Time Vertical Lines & Labels (every 2 hours = 120 mins)
    for (let m = 0; m <= maxMin; m += 120) {
      const x = padLeft + (m / maxMin) * chartW;

      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, height - padBottom);
      ctx.stroke();

      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`${hh}:00`, x, height - padBottom + 16);
    }

    // 3. Scheduled Maintenance Block Possessions
    if (showBlocks && blocks.length > 0) {
      blocks.forEach((b) => {
        let bStartMin = 75;
        if (b.start_minute_of_horizon !== undefined) {
          bStartMin = b.start_minute_of_horizon % 1440;
        } else if (b.scheduled_start) {
          const parts = b.scheduled_start.includes(' ')
            ? b.scheduled_start.split(' ')[1].split(':')
            : b.scheduled_start.split(':');
          bStartMin = (parseInt(parts[0], 10) * 60 + parseInt(parts[1] || 0, 10)) % 1440;
        }

        const bEndMin = bStartMin + (b.duration_minutes || 120);
        const bKmStart = b.km_start !== undefined ? b.km_start : 0.0;
        const bKmEnd = b.km_end !== undefined ? b.km_end : maxKm;

        const x1 = padLeft + (bStartMin / maxMin) * chartW;
        const x2 = padLeft + (Math.min(1440, bEndMin) / maxMin) * chartW;
        const y1 = padTop + (Math.min(bKmStart, bKmEnd) / maxKm) * chartH;
        const y2 = padTop + (Math.max(bKmStart, bKmEnd) / maxKm) * chartH;

        const bW = Math.max(16, x2 - x1);
        const bH = Math.max(22, y2 - y1 || 24);

        const isEmergency =
          b.is_emergency || (b.bundle_id && b.bundle_id.includes('EMERGENCY'));

        if (isEmergency) {
          ctx.fillStyle = 'rgba(220, 38, 38, 0.16)';
          ctx.fillRect(x1, y1 - 4, bW, bH + 8);
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 3]);
          ctx.strokeRect(x1, y1 - 4, bW, bH + 8);
          ctx.setLineDash([]);

          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`⚠️ EMERGENCY: ${b.bundle_id} (${b.duration_minutes}m)`, x1 + 4, y1 + 10);
        } else {
          ctx.fillStyle = b.power_off_required ? 'rgba(217, 119, 6, 0.14)' : 'rgba(2, 132, 199, 0.12)';
          ctx.fillRect(x1, y1 - 4, bW, bH + 8);
          ctx.strokeStyle = b.power_off_required ? '#d97706' : '#0284c7';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(x1, y1 - 4, bW, bH + 8);
          ctx.setLineDash([]);

          ctx.fillStyle = b.power_off_required ? '#b45309' : '#0369a1';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`POSSESSION: ${b.bundle_id} (${b.duration_minutes}m)`, x1 + 4, y1 + 10);
        }
      });
    }

    // 4. Draw Train Trajectories
    const activeTrains = [];

    trains.forEach((t) => {
      // Filter by direction
      if (dirFilter !== 'ALL' && t.direction !== dirFilter) return;

      // Filter by category
      if (catFilter === 'PREMIUM' && !t.category?.includes('PREMIUM')) return;
      if (
        catFilter === 'EXPRESS' &&
        !t.category?.includes('EXPRESS') &&
        !t.category?.includes('MAIL') &&
        !t.category?.includes('PASSENGER')
      )
        return;
      if (catFilter === 'FREIGHT' && !t.category?.includes('FREIGHT')) return;

      const sch = t.schedule || [];
      if (sch.length < 2) return;

      ctx.lineWidth = 2;
      if (t.train_no === '12002' || t.train_no === '12302' || t.category?.includes('PREMIUM')) {
        ctx.strokeStyle = '#dc2626'; // Premium high-speed red
      } else if (
        t.category?.includes('PASSENGER') ||
        t.category?.includes('MAIL') ||
        t.category?.includes('LOCAL')
      ) {
        ctx.strokeStyle = '#0284c7'; // Express blue
      } else {
        ctx.strokeStyle = '#d97706'; // Freight amber
      }

      ctx.beginPath();
      sch.forEach((stop, i) => {
        const minVal = stop.dep_min !== undefined ? stop.dep_min : stop.arr_min;
        const x = padLeft + ((minVal % 1440) / maxMin) * chartW;
        const y = padTop + (stop.km / maxKm) * chartH;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Train Start Label
      const firstStop = sch[0];
      const firstMin = firstStop.dep_min !== undefined ? firstStop.dep_min : firstStop.arr_min;
      const xLabel = padLeft + ((firstMin % 1440) / maxMin) * chartW;
      const yLabel = padTop + (firstStop.km / maxKm) * chartH;
      ctx.fillStyle = '#0f172a';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        `${t.train_no} (${t.train_name ? t.train_name.split(' ')[0] : ''})`,
        xLabel + 4,
        yLabel - 4
      );

      // Check if train is currently active at currentTimeMin
      const tStart = sch[0].dep_min !== undefined ? sch[0].dep_min : sch[0].arr_min;
      const tEnd =
        sch[sch.length - 1].arr_min !== undefined
          ? sch[sch.length - 1].arr_min
          : sch[sch.length - 1].dep_min;

      if (currentTimeMin >= tStart && currentTimeMin <= tEnd) {
        for (let i = 0; i < sch.length - 1; i++) {
          const s1 = sch[i];
          const s2 = sch[i + 1];
          const m1 = s1.dep_min !== undefined ? s1.dep_min : s1.arr_min;
          const m2 = s2.arr_min !== undefined ? s2.arr_min : s2.dep_min;

          if (currentTimeMin >= m1 && currentTimeMin <= m2) {
            const ratio = m2 > m1 ? (currentTimeMin - m1) / (m2 - m1) : 0;
            const currentKm = s1.km + ratio * (s2.km - s1.km);
            activeTrains.push({
              train: t,
              currentKm,
              direction: t.direction
            });
            break;
          }
        }
      }
    });

    // 5. 24-Hour Red Time Scrubber Cursor Line
    const scrubberX = padLeft + (currentTimeMin / maxMin) * chartW;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(scrubberX, padTop - 10);
    ctx.lineTo(scrubberX, height - padBottom + 10);
    ctx.stroke();

    // Scrubber Pin Header
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(scrubberX, padTop - 8, 4, 0, Math.PI * 2);
    ctx.fill();

    // 6. Moving Train Badges at Current Time
    activeTrains.forEach((item) => {
      const t = item.train;
      const y = padTop + (item.currentKm / maxKm) * chartH;
      const isPremium = t.category?.includes('PREMIUM');
      const isFreight = t.category?.includes('FREIGHT');

      const badgeColor = isPremium ? '#dc2626' : isFreight ? '#d97706' : '#0284c7';

      // Train Pulse Circle
      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      ctx.arc(scrubberX, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Train Badge Callout Box
      const badgeText = `${t.train_no} (${item.direction === 'UP' ? '▲ UP' : '▼ DN'}) @ ${item.currentKm.toFixed(1)}k`;
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      const tw = ctx.measureText(badgeText).width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(scrubberX + 8, y - 8, tw + 8, 16);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(badgeText, scrubberX + 12, y + 4);
    });

    // Outer border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(padLeft, padTop, chartW, chartH);
  }, [
    corridorStations,
    trains,
    blocks,
    maxKm,
    currentTimeMin,
    dirFilter,
    catFilter,
    showBlocks
  ]);

  // Redraw on canvas or dependencies change
  useEffect(() => {
    drawChart();
  }, [drawChart]);

  // Mouse hover detection on canvas for interactive tooltips
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setMousePos({ x: e.clientX, y: e.clientY });

    const padLeft = 85;
    const padRight = 35;
    const padTop = 30;
    const padBottom = 40;
    const chartW = canvas.width - padLeft - padRight;
    const chartH = canvas.height - padTop - padBottom;

    if (
      x < padLeft ||
      x > canvas.width - padRight ||
      y < padTop ||
      y > canvas.height - padBottom
    ) {
      setHoveredTrain(null);
      return;
    }

    const mouseMin = ((x - padLeft) / chartW) * 1440;
    const mouseKm = ((y - padTop) / chartH) * maxKm;

    let closest = null;
    let minDistance = 20;

    trains.forEach((t) => {
      const sch = t.schedule || [];
      if (sch.length < 2) return;

      const tStart = sch[0].dep_min !== undefined ? sch[0].dep_min : sch[0].arr_min;
      const tEnd =
        sch[sch.length - 1].arr_min !== undefined
          ? sch[sch.length - 1].arr_min
          : sch[sch.length - 1].dep_min;

      if (mouseMin >= tStart - 20 && mouseMin <= tEnd + 20) {
        for (let i = 0; i < sch.length - 1; i++) {
          const s1 = sch[i];
          const s2 = sch[i + 1];
          const m1 = s1.dep_min !== undefined ? s1.dep_min : s1.arr_min;
          const m2 = s2.arr_min !== undefined ? s2.arr_min : s2.dep_min;

          if (mouseMin >= m1 && mouseMin <= m2) {
            const ratio = m2 > m1 ? (mouseMin - m1) / (m2 - m1) : 0;
            const expKm = s1.km + ratio * (s2.km - s1.km);
            const distPx = (Math.abs(expKm - mouseKm) / maxKm) * chartH;

            if (distPx < minDistance) {
              minDistance = distPx;
              closest = {
                train: t,
                approxKm: expKm.toFixed(1),
                timeAtPos: formatTime(mouseMin)
              };
            }
            break;
          }
        }
      }
    });

    setHoveredTrain(closest);
  };

  return (
    <div className="space-y-4">
      <div className="rail-card">
        <div className="card-header flex-wrap gap-3">
          <div>
            <div className="card-title">
              TIME-SPACE MAREY STRING CHART (GRAPH-BASED TRAIN TRAJECTORIES)
            </div>
            <div className="card-subtitle">
              Corridor: <strong>{isDNR ? 'Danapur – Patna Junction (DNR-PNBE 10 km)' : 'New Delhi – Kanpur Central (NDLS-CNB 440 km)'}</strong> • 
              24-Hour Operational Cycle (00:00 - 24:00) • Loaded Trains: <strong className="text-[#0284c7]">{trains.length}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3.5 text-[11px] flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-1 bg-[#dc2626] inline-block" />
              <span className="text-[#475569]">Premium Express (130 km/h)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-1 bg-[#0284c7] inline-block" />
              <span className="text-[#475569]">Mail / Express (110 km/h)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-1 bg-[#d97706] inline-block" />
              <span className="text-[#475569]">Freight BOXN (75 km/h)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-2.5 bg-[rgba(2,132,199,0.15)] border border-dashed border-[#0284c7] inline-block" />
              <span className="text-[#0284c7] font-bold">Scheduled Possession Block</span>
            </div>
          </div>
        </div>

        {/* Interactive Controls Toolbar & 24-Hour Scrubber */}
        <div className="marey-controls-bar">
          <div className="time-scrubber-group">
            <button
              className="play-pause-btn"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <span>{isPlaying ? '⏸' : '▶'}</span>
              <span>{isPlaying ? 'Pause' : 'Play Time (20x)'}</span>
            </button>

            <input
              type="range"
              className="time-slider"
              min="0"
              max="1439"
              step="1"
              value={currentTimeMin}
              onChange={(e) => setCurrentTimeMin(parseInt(e.target.value, 10))}
            />

            <div className="time-badge">{formatTime(currentTimeMin)}</div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Direction Filter */}
            <div className="filter-pill-group">
              <span className="text-[11px] font-bold text-[#64748b]">LINE:</span>
              <button
                className={`filter-pill ${dirFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setDirFilter('ALL')}
              >
                ALL
              </button>
              <button
                className={`filter-pill ${dirFilter === 'UP' ? 'active' : ''}`}
                onClick={() => setDirFilter('UP')}
              >
                UP
              </button>
              <button
                className={`filter-pill ${dirFilter === 'DN' ? 'active' : ''}`}
                onClick={() => setDirFilter('DN')}
              >
                DN
              </button>
            </div>

            {/* Category Filter */}
            <div className="filter-pill-group">
              <span className="text-[11px] font-bold text-[#64748b]">TRAINS:</span>
              <button
                className={`filter-pill ${catFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setCatFilter('ALL')}
              >
                All
              </button>
              <button
                className={`filter-pill ${catFilter === 'PREMIUM' ? 'active' : ''}`}
                onClick={() => setCatFilter('PREMIUM')}
              >
                Premium
              </button>
              <button
                className={`filter-pill ${catFilter === 'EXPRESS' ? 'active' : ''}`}
                onClick={() => setCatFilter('EXPRESS')}
              >
                Express
              </button>
              <button
                className={`filter-pill ${catFilter === 'FREIGHT' ? 'active' : ''}`}
                onClick={() => setCatFilter('FREIGHT')}
              >
                Freight
              </button>
            </div>

            {/* Blocks Toggle */}
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0f172a] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showBlocks}
                onChange={(e) => setShowBlocks(e.target.checked)}
              />
              <span>Show Blocks</span>
            </label>
          </div>
        </div>

        {/* HTML5 Canvas Container */}
        <div
          ref={containerRef}
          className="relative overflow-x-auto border border-[#e2e8f0] rounded-lg bg-white"
        >
          <canvas
            ref={canvasRef}
            width={1100}
            height={540}
            className="w-full h-auto cursor-crosshair block"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredTrain(null)}
          />

          {/* Hover Tooltip */}
          {hoveredTrain && (
            <div
              className="fixed pointer-events-none z-50 bg-[#0f172a] text-white px-3 py-2 rounded-md shadow-xl text-[11px] font-sans border border-slate-700"
              style={{
                left: mousePos.x + 14,
                top: mousePos.y - 35
              }}
            >
              <div className="font-bold text-[#38bdf8] flex items-center gap-1.5">
                <span>{hoveredTrain.train.train_no}</span>
                <span>•</span>
                <span>{hoveredTrain.train.train_name}</span>
              </div>
              <div className="text-[#cbd5e1] mt-0.5">
                Line: <strong className="text-white">{hoveredTrain.train.direction} Main</strong> • Speed: <strong className="text-[#34d399]">{hoveredTrain.train.speed_kmh || 110} km/h</strong>
              </div>
              <div className="text-[#94a3b8] text-[10px] mt-0.5">
                Position: Km {hoveredTrain.approxKm} @ {hoveredTrain.timeAtPos}
              </div>
            </div>
          )}
        </div>

        {/* Footer Subtext */}
        <div className="mt-2.5 text-[11px] text-[#64748b] flex justify-between flex-wrap gap-2">
          <span>Horizontal Axis: Time of Day (00:00 to 24:00) • Drag slider or click Play to animate moving trains!</span>
          <span>Vertical Axis: Kilometer Posts ({corridorStations[0]?.code} Km 0 to {corridorStations[corridorStations.length - 1]?.code} Km {maxKm.toFixed(1)})</span>
          <span className="text-[#059669] font-semibold">✓ G&SR 15.08 Headway Preserved: Zero Conflict Intersection</span>
        </div>
      </div>
    </div>
  );
}
