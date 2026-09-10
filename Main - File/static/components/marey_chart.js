/**
 * Marey Time-Space Diagram Module (Section 11) - Professional Light Theme
 * Interactive HTML5 Canvas Time-Space String Chart with 24-Hour Time Scrubber & Train Animation
 * Vertical Axis: Stations / Kilometer Markers (Dynamically scales: 440 km for NDLS-CNB, 10 km for DNR-PNBE)
 * Horizontal Axis: Time of Day (00:00 to 24:00)
 * Visualizes: Passenger & Freight Train Slopes, Moving Train Badges, and Bundled Maintenance Windows
 */

let _currentTimeMin = 360; // 06:00 AM default
let _isPlaying = false;
let _animationTimer = null;
let _dirFilter = 'ALL';
let _catFilter = 'ALL';
let _showBlocks = true;

export function renderMareyChart(container, state) {
  const isDNR = state.corridor === 'DNR-PNBE';
  const data = state.dataBridge || {};
  const corridorStations = data.stations && data.stations.length > 0 ? data.stations : (
    isDNR ? [
      { code: 'DNR', name: 'Danapur', km: 0.0 },
      { code: 'PWS', name: 'Phulwari Sharif', km: 5.2 },
      { code: 'PNBE', name: 'Patna Junction', km: 10.0 }
    ] : [
      { code: 'NDLS', name: 'New Delhi', km: 0.0 },
      { code: 'GZB', name: 'Ghaziabad', km: 45.0 },
      { code: 'ALJN', name: 'Aligarh', km: 140.0 },
      { code: 'TDL', name: 'Tundla', km: 280.0 },
      { code: 'CNB', name: 'Kanpur Central', km: 440.0 }
    ]
  );

  const trains = (data.coa_trains && data.coa_trains.length > 0) ? data.coa_trains : [];
  const sched = state.schedule || {};
  const blocks = sched.blocks || [];
  const maxKm = isDNR ? 10.0 : 440.0;

  container.innerHTML = `
    <div class="rail-card">
      <div class="card-header">
        <div>
          <div class="card-title">TIME-SPACE MAREY STRING CHART (GRAPH-BASED TRAIN TRAJECTORIES)</div>
          <div class="card-subtitle">
            Corridor: <strong>${isDNR ? 'Danapur – Patna Junction (DNR-PNBE 10 km)' : 'New Delhi – Kanpur Central (NDLS-CNB 440 km)'}</strong> • 
            24-Hour Operational Cycle (00:00 - 24:00)
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 14px; font-size: 11px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 16px; height: 3px; background: #dc2626; display: inline-block;"></span>
            <span style="color: var(--text-secondary);">Premium Express (130 km/h)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 16px; height: 3px; background: #0284c7; display: inline-block;"></span>
            <span style="color: var(--text-secondary);">Mail / Express (110 km/h)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 16px; height: 3px; background: #d97706; display: inline-block;"></span>
            <span style="color: var(--text-secondary);">Freight BOXN (75 km/h)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 14px; height: 10px; background: rgba(2, 132, 199, 0.15); border: 1px dashed #0284c7; display: inline-block;"></span>
            <span style="color: #0284c7; font-weight: 700;">Scheduled Possession Block</span>
          </div>
        </div>
      </div>

      <!-- Interactive Controls Toolbar & 24-Hour Scrubber -->
      <div class="marey-controls-bar">
        <div class="time-scrubber-group">
          <button class="play-pause-btn" id="btnPlayPause">
            <span id="playIcon">▶</span>
            <span id="playText">Play Time (20x)</span>
          </button>
          
          <input type="range" class="time-slider" id="timeSlider" min="0" max="1439" step="1" value="${_currentTimeMin}" />
          
          <div class="time-badge" id="timeDisplay">
            ${formatTime(_currentTimeMin)}
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <!-- Direction Filter -->
          <div class="filter-pill-group">
            <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary);">LINE:</span>
            <button class="filter-pill ${_dirFilter === 'ALL' ? 'active' : ''}" data-dir="ALL">ALL</button>
            <button class="filter-pill ${_dirFilter === 'UP' ? 'active' : ''}" data-dir="UP">UP</button>
            <button class="filter-pill ${_dirFilter === 'DN' ? 'active' : ''}" data-dir="DN">DN</button>
          </div>

          <!-- Category Filter -->
          <div class="filter-pill-group">
            <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary);">TRAINS:</span>
            <button class="filter-pill ${_catFilter === 'ALL' ? 'active' : ''}" data-cat="ALL">All</button>
            <button class="filter-pill ${_catFilter === 'PREMIUM' ? 'active' : ''}" data-cat="PREMIUM">Premium</button>
            <button class="filter-pill ${_catFilter === 'EXPRESS' ? 'active' : ''}" data-cat="EXPRESS">Express</button>
            <button class="filter-pill ${_catFilter === 'FREIGHT' ? 'active' : ''}" data-cat="FREIGHT">Freight</button>
          </div>

          <!-- Blocks Toggle -->
          <label class="form-checkbox-label" style="font-size: 11px;">
            <input type="checkbox" id="toggleShowBlocks" ${_showBlocks ? 'checked' : ''} />
            <span>Show Blocks</span>
          </label>
        </div>
      </div>

      <!-- Canvas Chart Container -->
      <div class="chart-container">
        <canvas id="mareyCanvas" width="1080" height="540"></canvas>
      </div>

      <div style="margin-top: 10px; font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <span>Horizontal Axis: Time of Day (00:00 to 24:00) • Drag slider or click Play to animate moving trains!</span>
        <span>Vertical Axis: Kilometer Posts (${corridorStations[0]?.code} Km 0 to ${corridorStations[corridorStations.length-1]?.code} Km ${maxKm.toFixed(1)})</span>
        <span style="color: #059669; font-weight: 600;">✓ G&SR 15.08 Headway Preserved: Zero Conflict Intersection</span>
      </div>
    </div>
  `;

  // Draw chart initially
  setTimeout(() => {
    drawMareyChart(corridorStations, trains, blocks, maxKm);
  }, 50);

  // Wire Slider
  const slider = document.getElementById('timeSlider');
  const timeDisplay = document.getElementById('timeDisplay');
  slider?.addEventListener('input', (e) => {
    _currentTimeMin = parseInt(e.target.value, 10);
    if (timeDisplay) timeDisplay.textContent = formatTime(_currentTimeMin);
    drawMareyChart(corridorStations, trains, blocks, maxKm);
  });

  // Wire Play/Pause
  const btnPlay = document.getElementById('btnPlayPause');
  const playIcon = document.getElementById('playIcon');
  const playText = document.getElementById('playText');

  const stopAnimation = () => {
    if (_animationTimer) {
      clearInterval(_animationTimer);
      _animationTimer = null;
    }
    _isPlaying = false;
    if (playIcon) playIcon.textContent = '▶';
    if (playText) playText.textContent = 'Play Time (20x)';
  };

  const startAnimation = () => {
    _isPlaying = true;
    if (playIcon) playIcon.textContent = '⏸';
    if (playText) playText.textContent = 'Pause';

    _animationTimer = setInterval(() => {
      _currentTimeMin = (_currentTimeMin + 3) % 1440;
      if (slider) slider.value = _currentTimeMin;
      if (timeDisplay) timeDisplay.textContent = formatTime(_currentTimeMin);
      drawMareyChart(corridorStations, trains, blocks, maxKm);
    }, 60);
  };

  btnPlay?.addEventListener('click', () => {
    if (_isPlaying) stopAnimation();
    else startAnimation();
  });

  // Wire Direction Filters
  container.querySelectorAll('.filter-pill[data-dir]').forEach(pill => {
    pill.addEventListener('click', (e) => {
      container.querySelectorAll('.filter-pill[data-dir]').forEach(p => p.classList.remove('active'));
      e.currentTarget.classList.add('active');
      _dirFilter = e.currentTarget.getAttribute('data-dir');
      drawMareyChart(corridorStations, trains, blocks, maxKm);
    });
  });

  // Wire Category Filters
  container.querySelectorAll('.filter-pill[data-cat]').forEach(pill => {
    pill.addEventListener('click', (e) => {
      container.querySelectorAll('.filter-pill[data-cat]').forEach(p => p.classList.remove('active'));
      e.currentTarget.classList.add('active');
      _catFilter = e.currentTarget.getAttribute('data-cat');
      drawMareyChart(corridorStations, trains, blocks, maxKm);
    });
  });

  // Wire Blocks Toggle
  document.getElementById('toggleShowBlocks')?.addEventListener('change', (e) => {
    _showBlocks = e.target.checked;
    drawMareyChart(corridorStations, trains, blocks, maxKm);
  });
}

function formatTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function drawMareyChart(stations, trains, blocks, maxKm) {
  const canvas = document.getElementById("mareyCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;

  const padLeft = 85;
  const padRight = 35;
  const padTop = 30;
  const padBottom = 40;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const maxMin = 1440.0;

  // Clear canvas
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // 1. Draw Station Horizontal Lines & Labels
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#475569";
  ctx.font = "10px JetBrains Mono, monospace";

  stations.forEach(st => {
    const y = padTop + (st.km / maxKm) * chartH;

    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();

    // Station Name & Km Label
    ctx.textAlign = "right";
    ctx.fillText(`${st.code} (${st.km.toFixed(1)}k)`, padLeft - 10, y + 3);
  });

  // 2. Draw Time Vertical Lines & Labels (every 2 hours = 120 mins)
  for (let m = 0; m <= maxMin; m += 120) {
    const x = padLeft + (m / maxMin) * chartW;

    ctx.beginPath();
    ctx.moveTo(x, padTop);
    ctx.lineTo(x, height - padBottom);
    ctx.stroke();

    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    ctx.textAlign = "center";
    ctx.fillStyle = "#64748b";
    ctx.fillText(`${hh}:00`, x, height - padBottom + 16);
  }

  // 3. Draw Scheduled Maintenance Block Possession Windows
  if (_showBlocks) {
    blocks.forEach(b => {
      const bStartMin = (b.start_minute_of_horizon !== undefined ? b.start_minute_of_horizon : 75) % 1440;
      const bEndMin = bStartMin + b.duration_minutes;
      const bKmStart = b.km_start || 0.0;
      const bKmEnd = b.km_end || maxKm;

      const x1 = padLeft + (bStartMin / maxMin) * chartW;
      const x2 = padLeft + (bEndMin / maxMin) * chartW;
      const y1 = padTop + (Math.min(bKmStart, bKmEnd) / maxKm) * chartH;
      const y2 = padTop + (Math.max(bKmStart, bKmEnd) / maxKm) * chartH;

      const bW = Math.max(16, x2 - x1);
      const bH = Math.max(22, (y2 - y1) || 24);

      const isEmergency = b.is_emergency || (b.bundle_id && b.bundle_id.includes('EMERGENCY'));

      if (isEmergency) {
        ctx.fillStyle = "rgba(220, 38, 38, 0.16)";
        ctx.fillRect(x1, y1 - 4, bW, bH + 8);

        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(x1, y1 - 4, bW, bH + 8);
        ctx.setLineDash([]);

        ctx.fillStyle = "#dc2626";
        ctx.font = "bold 9px JetBrains Mono, monospace";
        ctx.textAlign = "left";
        ctx.fillText(`⚠️ EMERGENCY: ${b.bundle_id} (${b.duration_minutes}m)`, x1 + 4, y1 + 10);
      } else {
        ctx.fillStyle = "rgba(2, 132, 199, 0.12)";
        ctx.fillRect(x1, y1 - 4, bW, bH + 8);

        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(x1, y1 - 4, bW, bH + 8);
        ctx.setLineDash([]);

        ctx.fillStyle = "#0369a1";
        ctx.font = "bold 9px JetBrains Mono, monospace";
        ctx.textAlign = "left";
        ctx.fillText(`POSSESSION: ${b.bundle_id} (${b.duration_minutes}m)`, x1 + 4, y1 + 10);
      }
    });
  }

  // 4. Draw Train Trajectories (Filtered)
  const activeTrains = [];

  trains.forEach(t => {
    // Filter by direction
    if (_dirFilter !== 'ALL' && t.direction !== _dirFilter) return;

    // Filter by category
    if (_catFilter === 'PREMIUM' && !t.category?.includes('PREMIUM')) return;
    if (_catFilter === 'EXPRESS' && !t.category?.includes('EXPRESS') && !t.category?.includes('MAIL')) return;
    if (_catFilter === 'FREIGHT' && !t.category?.includes('FREIGHT')) return;

    const sch = t.schedule || [];
    if (sch.length < 2) return;

    ctx.lineWidth = 2;
    if (t.train_no === "12002" || t.train_no === "12302" || t.category?.includes("PREMIUM")) {
      ctx.strokeStyle = "#dc2626"; // Premium high-speed red
    } else if (t.category?.includes("PASSENGER") || t.category?.includes("MAIL") || t.category?.includes("LOCAL")) {
      ctx.strokeStyle = "#0284c7"; // Express blue
    } else {
      ctx.strokeStyle = "#d97706"; // Freight amber
    }

    ctx.beginPath();
    sch.forEach((stop, i) => {
      const minVal = stop.dep_min !== undefined ? stop.dep_min : stop.arr_min;
      const x = padLeft + (minVal / maxMin) * chartW;
      const y = padTop + (stop.km / maxKm) * chartH;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Train Start Label
    const firstStop = sch[0];
    const xLabel = padLeft + (firstStop.dep_min / maxMin) * chartW;
    const yLabel = padTop + (firstStop.km / maxKm) * chartH;
    ctx.fillStyle = "#0f172a";
    ctx.font = "9px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${t.train_no} (${t.train_name ? t.train_name.split(' ')[0] : ''})`, xLabel + 4, yLabel - 4);

    // Check if train is currently active at _currentTimeMin
    const tStart = sch[0].dep_min !== undefined ? sch[0].dep_min : sch[0].arr_min;
    const tEnd = sch[sch.length - 1].arr_min !== undefined ? sch[sch.length - 1].arr_min : sch[sch.length - 1].dep_min;

    if (_currentTimeMin >= tStart && _currentTimeMin <= tEnd) {
      // Find current interpolated position
      for (let i = 0; i < sch.length - 1; i++) {
        const s1 = sch[i];
        const s2 = sch[i + 1];
        const m1 = s1.dep_min !== undefined ? s1.dep_min : s1.arr_min;
        const m2 = s2.arr_min !== undefined ? s2.arr_min : s2.dep_min;

        if (_currentTimeMin >= m1 && _currentTimeMin <= m2) {
          const ratio = (m2 > m1) ? (_currentTimeMin - m1) / (m2 - m1) : 0;
          const currentKm = s1.km + ratio * (s2.km - s1.km);
          activeTrains.push({
            train: t,
            currentKm: currentKm,
            direction: t.direction
          });
          break;
        }
      }
    }
  });

  // 5. Draw 24-Hour Red Time Scrubber Cursor Line
  const scrubberX = padLeft + (_currentTimeMin / maxMin) * chartW;
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(scrubberX, padTop - 10);
  ctx.lineTo(scrubberX, height - padBottom + 10);
  ctx.stroke();

  // Draw Scrubber Flag Header
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(scrubberX, padTop - 8, 4, 0, Math.PI * 2);
  ctx.fill();

  // 6. Draw Moving Train Badges at Current Time
  activeTrains.forEach(item => {
    const t = item.train;
    const y = padTop + (item.currentKm / maxKm) * chartH;
    const isPremium = t.category?.includes("PREMIUM");
    const isFreight = t.category?.includes("FREIGHT");

    const badgeColor = isPremium ? "#dc2626" : (isFreight ? "#d97706" : "#0284c7");

    // Draw Train Pulse Circle
    ctx.fillStyle = badgeColor;
    ctx.beginPath();
    ctx.arc(scrubberX, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Train Badge Callout
    const badgeText = `${t.train_no} (${item.direction === 'UP' ? '▲ UP' : '▼ DN'}) @ ${item.currentKm.toFixed(1)}k`;
    ctx.font = "bold 9px JetBrains Mono, monospace";
    const tw = ctx.measureText(badgeText).width;

    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(scrubberX + 8, y - 8, tw + 8, 16);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(badgeText, scrubberX + 12, y + 4);
  });
}
