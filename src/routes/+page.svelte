<script lang="ts">
  import { onMount } from 'svelte';
  import 'leaflet/dist/leaflet.css';

  let config = $state({
    ADC_MAX: 4095,
    ADC_ALERT_THRESHOLD: 1200,
    SIMULATION_INTERVAL_MS: 4000,
    MAP_CENTER_ZMG: [20.6767, -103.3475],
    MAP_ZOOM: 11,
  });

  let nodes = $state([]);
  let weeklyHistory = $state([]);

  let unit = $state('C');
  let selectedNodeId = $state(null);
  let showWeeklyModal = $state(false);
  let showStationsModal = $state(false);

  // --- Estado en vivo + Base de datos por minuto (Timeline Scrubber) ---
  let liveSnapshot = $state(null);
  let minuteFrames = $state([]);
  let isLiveMode = $state(true);
  let selectedFrameIndex = $state(0);

  let mapContainer;
  let L;
  let map = null;
  let mapLayers = {};

  // Modos disponibles: 'default' | 'temp' | 'humidity' | 'air'
  let mapMode = $state('default');
  let heatmapLayer = null;

  const HEATMAP_CONFIG = {
    temp: {
      label: 'Temperatura',
      min: 10,
      max: 40,
      stops: [
        [0.0, [52, 152, 219]],
        [0.35, [46, 204, 113]],
        [0.65, [241, 196, 15]],
        [1.0, [231, 76, 60]],
      ],
    },
    humidity: {
      label: 'Humedad',
      min: 15,
      max: 95,
      stops: [
        [0.0, [243, 156, 18]],
        [0.5, [52, 152, 219]],
        [1.0, [41, 128, 185]],
      ],
    },
    air: {
      label: 'PM / Gases',
      min: 0,
      max: 100,
      stops: [
        [0.0, [46, 204, 113]],
        [0.45, [241, 196, 15]],
        [0.75, [230, 126, 34]],
        [1.0, [231, 76, 60]],
      ],
    },
  };

  function interpolateColor(t, stops) {
    const clamped = Math.max(0, Math.min(1, t));
    for (let i = 0; i < stops.length - 1; i++) {
      const [t0, c0] = stops[i];
      const [t1, c1] = stops[i + 1];
      if (clamped >= t0 && clamped <= t1) {
        const f = (clamped - t0) / (t1 - t0);
        const r = Math.round(c0[0] + (c1[0] - c0[0]) * f);
        const g = Math.round(c0[1] + (c1[1] - c0[1]) * f);
        const b = Math.round(c0[2] + (c1[2] - c0[2]) * f);
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    const last = stops[stops.length - 1][1];
    return `rgb(${last[0]}, ${last[1]}, ${last[2]})`;
  }

  function createHeatmapLayer(Leaflet) {
    const HeatmapLayer = Leaflet.Layer.extend({
      initialize() {
        this._points = [];
        this._mode = 'default';
      },
      onAdd(mapInstance) {
        this._map = mapInstance;
        this._canvas = Leaflet.DomUtil.create('canvas', 'leaflet-heatmap-canvas');
        this._canvas.style.position = 'absolute';
        this._canvas.style.pointerEvents = 'none';
        this._canvas.style.zIndex = '250';
        mapInstance.getPanes().overlayPane.appendChild(this._canvas);
        mapInstance.on('moveend zoomend resize', this._redraw, this);
        this._redraw();
      },
      onRemove(mapInstance) {
        mapInstance.off('moveend zoomend resize', this._redraw, this);
        this._canvas?.remove();
      },
      setData(points, mode) {
        this._points = points;
        this._mode = mode;
        this._redraw();
      },
      _redraw() {
        if (!this._map || !this._canvas) return;
        const size = this._map.getSize();
        const topLeft = this._map.containerPointToLayerPoint([0, 0]);
        Leaflet.DomUtil.setPosition(this._canvas, topLeft);

        this._canvas.width = size.x;
        this._canvas.height = size.y;

        const ctx = this._canvas.getContext('2d');
        ctx.clearRect(0, 0, size.x, size.y);

        if (this._mode === 'default' || !this._points.length) return;

        const cfg = HEATMAP_CONFIG[this._mode];
        if (!cfg) return;

        const zoom = this._map.getZoom();
        const radiusPx = Math.max(45, Math.min(220, 40 * Math.pow(2, zoom - 10)));

        ctx.globalCompositeOperation = 'screen';

        for (const p of this._points) {
          const pt = this._map.latLngToContainerPoint(p.coords);
          const norm = (p.value - cfg.min) / (cfg.max - cfg.min);
          const color = interpolateColor(norm, cfg.stops);

          const grad = ctx.createRadialGradient(pt.x, pt.y, 4, pt.x, pt.y, radiusPx);
          grad.addColorStop(0, color.replace('rgb(', 'rgba(').replace(')', ', 0.78)'));
          grad.addColorStop(0.5, color.replace('rgb(', 'rgba(').replace(')', ', 0.35)'));
          grad.addColorStop(1, color.replace('rgb(', 'rgba(').replace(')', ', 0)'));

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radiusPx, 0, Math.PI * 2);
          ctx.fill();
        }
      },
    });

    return new HeatmapLayer();
  }

  function formatTemp(tempC, currentUnit = unit, decimals = 0) {
    if (tempC == null) return `--°${currentUnit}`;
    const value = currentUnit === 'F' ? (tempC * 9) / 5 + 32 : tempC;
    return `${value.toFixed(decimals)}°${currentUnit}`;
  }

// 1. Agrega `rain` dentro de tu objeto SVG_ICONS:
  const SVG_ICONS = {
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
    partlyCloudy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg>`,
    cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
    rain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6M8 14v6M12 16v6"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
    alertTriangle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
  };

  function frameToSnapshot(frame) {
    const readingsByNode = {};
    for (const [nodeId, s] of Object.entries(frame.sensors ?? {})) {
      readingsByNode[nodeId] = {
        channel_id: config?.THINGSPEAK_CHANNEL_ID ?? 3571130,
        created_at: frame.timestamp,
        field1: Number(s.temperatura_C).toFixed(1),
        field2: Number(s.humedad_pct).toFixed(1),
        field3: String(s.gas_adc),
        field4: s.alerta_gas ? 'True' : 'False',
        tempC: s.temperatura_C,
        humidity: Math.round(s.humedad_pct),
        adc: s.gas_adc,
        ugm3: s.ugm3,
        alertaGas: s.alerta_gas,
        level: s.level,
        source: s.source,
      };
    }

    const primary =
      readingsByNode[frame.primaryNodeId] ?? Object.values(readingsByNode)[0];

    const hour = new Date(frame.timestamp).getHours();
    const isNight = hour < 6 || hour >= 20;
    const humidity = primary?.humidity ?? 0;

    let weatherIcon = isNight ? 'moon' : 'sun';
    let weatherCondition = isNight ? 'Despejado nocturno' : 'Despejado';

    if (humidity >= 85) {
      weatherIcon = 'cloud';
      weatherCondition = 'Lluvia ligera';
    } else if (humidity >= 68) {
      weatherIcon = 'cloud';
      weatherCondition = 'Nublado';
    } else if (humidity >= 48) {
      weatherIcon = isNight ? 'moon' : 'partlyCloudy';
      weatherCondition = 'Parcialmente nublado';
    }

    const feelsLikeOffset =
      humidity > 65 ? 1 : (primary?.tempC ?? 0) > 29 ? 2 : 0;

    return {
      scenario: {
        id: 'db-historical-minute',
        name: `Historial BD · ${frame.fecha}`,
        label: `Historial BD · ${frame.fecha}`,
        weatherCondition,
        condition: weatherCondition,
        weatherIcon,
        tempMinC: primary ? Math.max(0, Math.round(primary.tempC - 5)) : 0,
        tempMaxC: primary ? Math.round(primary.tempC + 4) : 0,
        feelsLikeOffset,
      },
      timestamp: frame.timestamp,
      readingsByNode,
    };
  }

  const activeFrame = $derived(
    !isLiveMode && minuteFrames.length > 0
      ? minuteFrames[Math.min(selectedFrameIndex, minuteFrames.length - 1)]
      : null
  );

  // Toda la app (mapa, tarjetas, diagnóstico) lee `latestSnapshot`
  const latestSnapshot = $derived(
    activeFrame ? frameToSnapshot(activeFrame) : liveSnapshot
  );

  const sliderMax = $derived(minuteFrames.length);
  const sliderValue = $derived(
    isLiveMode ? sliderMax : Math.min(selectedFrameIndex, Math.max(0, sliderMax - 1))
  );
  const sliderProgressPct = $derived(
    sliderMax > 0 ? Math.round((sliderValue / sliderMax) * 100) : 100
  );

  function handleTimelineInput(e) {
    const val = Number(e.currentTarget.value);
    if (val >= minuteFrames.length || minuteFrames.length === 0) {
      isLiveMode = true;
    } else {
      isLiveMode = false;
      selectedFrameIndex = val;
    }
  }

  function downloadDatabaseCsv() {
    window.location.href = '/api/iot?export=csv';
  }

  let quickNodes = $derived(nodes.filter((n) => n.id === 'nodo-02' || n.id === 'nodo-03'));
  let primaryReading = $derived(latestSnapshot?.readingsByNode?.['nodo-05'] ?? null);

  // 2. Estado meteorológico puro para `.condition-badge` (debajo de `primaryReading`):
  let weatherBadge = $derived.by(() => {
    const refDate = latestSnapshot?.timestamp ? new Date(latestSnapshot.timestamp) : new Date();
    const hour = refDate.getHours();
    const isNight = hour < 6 || hour >= 20;
    const humidity = primaryReading?.humidity ?? 0;

    if (humidity >= 85) {
      return { icon: 'rain', text: 'Lluvia' };
    }
    if (humidity >= 68) {
      return { icon: 'cloud', text: 'Nublado' };
    }
    if (humidity >= 45) {
      return {
        icon: isNight ? 'moon' : 'partlyCloudy',
        text: 'Parcialmente nublado',
      };
    }
    return {
      icon: isNight ? 'moon' : 'sun',
      text: isNight ? 'Despejado' : 'Soleado',
    };
  });

  let anyContingency = $derived(
    latestSnapshot
      ? Object.values(latestSnapshot.readingsByNode).some(
          (r) => r.adc >= config.ADC_ALERT_THRESHOLD
        )
      : false
  );

  let effectiveLevel = $derived(
    anyContingency
      ? {
          key: 'danger',
          color: '#e74c3c',
          pillText: 'Contingencia',
          riskText: 'Contingencia · Acumulación de gas detectada',
          diagBadge: 'ALERTA GAS',
        }
      : primaryReading?.level ?? {
          key: 'normal',
          color: '#2ecc71',
          pillText: 'Conectando...',
          riskText: 'Esperando lecturas de red',
          diagBadge: 'NOMINAL',
        }
  );

  let riskPercent = $derived(
    primaryReading ? Math.min(100, Math.max(8, Math.round((primaryReading.ugm3 / 100) * 100))) : 0
  );

  let selectedNode = $derived(nodes.find((n) => n.id === selectedNodeId) ?? null);
  let selectedReading = $derived(
    selectedNodeId && latestSnapshot ? latestSnapshot.readingsByNode[selectedNodeId] : null
  );
  let diagAdcPct = $derived(
    selectedReading ? Math.min(100, Math.round((selectedReading.adc / config.ADC_MAX) * 100)) : 0
  );
  let diagThresholdPct = $derived(
    Math.round((config.ADC_ALERT_THRESHOLD / config.ADC_MAX) * 100)
  );
  let diagIsAlert = $derived(
    selectedReading ? selectedReading.adc >= config.ADC_ALERT_THRESHOLD : false
  );

  let avgTempC = $derived(
    weeklyHistory.length
      ? weeklyHistory.reduce((acc, d) => acc + d.tempC, 0) / weeklyHistory.length
      : null
  );
  let avgUgm3 = $derived(
    weeklyHistory.length
      ? Math.round(weeklyHistory.reduce((acc, d) => acc + d.ugm3, 0) / weeklyHistory.length)
      : 0
  );
  let yesterdayData = $derived(weeklyHistory[weeklyHistory.length - 1] ?? null);

  function createRadarIcon(node, stateKey, isSelected) {
    return L.divIcon({
      className: 'sensor-marker-wrapper',
      iconSize: [42, 42],
      iconAnchor: [21, 21],
      html: `
        <div class="sensor-radar state-${stateKey} ${isSelected ? 'is-selected' : ''}" title="${node.name}">
          <span class="radar-ring"></span>
          <span class="radar-ring radar-ring-2"></span>
          <span class="radar-core"></span>
          <span class="sensor-radar-label">${node.shortLabel}</span>
        </div>
      `,
    });
  }

  function updateMapVisuals(snapshot, currentUnit, currentSelectedId, currentMode) {
    if (!map || !L || !snapshot) return;

    const heatPoints = [];

    for (const node of nodes) {
      const reading = snapshot.readingsByNode[node.id];
      const layer = mapLayers[node.id];
      if (!reading || !layer) continue;

      const { level, ugm3, tempC, humidity } = reading;
      const isSelected = currentSelectedId === node.id;

      if (currentMode === 'default') {
        const radius = level.key === 'danger' ? 3500 : level.key === 'warning' ? 3000 : 2500;
        const fillOpacity = level.key === 'danger' ? 0.28 : level.key === 'warning' ? 0.22 : 0.16;
        layer.circle.setStyle({
          color: level.color,
          fillColor: level.color,
          opacity: 0.65,
          fillOpacity,
        });
        layer.circle.setRadius(radius);
      } else {
        layer.circle.setStyle({ opacity: 0, fillOpacity: 0 });
        const value =
          currentMode === 'temp' ? tempC : currentMode === 'humidity' ? humidity : ugm3;
        heatPoints.push({ coords: node.coords, value });
      }

      layer.marker.setIcon(createRadarIcon(node, level.key, isSelected));
      layer.marker.setTooltipContent(
        `<strong>${node.name}</strong><br>${formatTemp(tempC, currentUnit, 1)} · ${humidity}% HR · ${ugm3} µg/m³`
      );
    }

    if (heatmapLayer) {
      heatmapLayer.setData(heatPoints, currentMode);
    }
  }

  $effect(() => {
    updateMapVisuals(latestSnapshot, unit, selectedNodeId, mapMode);
  });

  function setTemperatureUnit(newUnit) {
    if (newUnit === 'C' || newUnit === 'F') unit = newUnit;
  }

  function openNodeDiagnostics(nodeId, panMap = false) {
    selectedNodeId = nodeId;
    showStationsModal = false;
    const node = nodes.find((n) => n.id === nodeId);
    if (panMap && map && node) {
      map.panTo(node.coords, { animate: true, duration: 0.5 });
    }
  }

  function closeNodeDiagnostics() {
    selectedNodeId = null;
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      showWeeklyModal = false;
      showStationsModal = false;
      closeNodeDiagnostics();
    }
  }

  onMount(() => {
    let timerId;

    async function bootstrap() {
      const res = await fetch('/api/iot?init=true');
      const data = await res.json();

      config = data.config;
      nodes = data.nodes;
      weeklyHistory = data.weeklyHistory;
      liveSnapshot = data.snapshot;
      minuteFrames = data.minuteFrames ?? [];

      const leafletModule = await import('leaflet');
      L = leafletModule.default;

      map = L.map(mapContainer, {
        center: config.MAP_CENTER_ZMG,
        zoom: config.MAP_ZOOM,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 16,
        attribution: '&copy; OpenStreetMap · OpenTopoMap',
      }).addTo(map);

      heatmapLayer = createHeatmapLayer(L);
      heatmapLayer.addTo(map);

      for (const node of nodes) {
        const circle = L.circle(node.coords, {
          radius: 2600,
          color: '#2ecc71',
          weight: 1.5,
          opacity: 0.65,
          fillColor: '#2ecc71',
          fillOpacity: 0.18,
        }).addTo(map);

        const marker = L.marker(node.coords, {
          icon: createRadarIcon(node, 'normal', false),
        }).addTo(map);

        marker.bindTooltip(node.name, {
          direction: 'top',
          offset: [0, -18],
          className: 'zmg-tooltip',
        });

        marker.on('click', () => openNodeDiagnostics(node.id, true));
        mapLayers[node.id] = { marker, circle };
      }

      updateMapVisuals(latestSnapshot, unit, selectedNodeId, mapMode);

      timerId = setInterval(async () => {
        const pollRes = await fetch('/api/iot', { cache: 'no-store' });
        const pollData = await pollRes.json();
        liveSnapshot = pollData.snapshot;
        if (pollData.minuteFrames) {
          minuteFrames = pollData.minuteFrames;
        }
      }, config.SIMULATION_INTERVAL_MS);
    }

    bootstrap();

    return () => {
      clearInterval(timerId);
      if (map) {
        map.remove();
        map = null;
      }
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="app-shell">
  <!-- Topbar -->
  <header class="topbar">
    <div class="brand">
      <span class="brand-dot"></span>
      <span class="brand-title"><strong>SINAICA</strong> ZMG</span>
      <span class="brand-divider">|</span>
      <span class="brand-subtitle">Red de Monitoreo Ambiental en Tiempo Real</span>
    </div>

    <div class="topbar-meta">
      <div class="scenario-indicator">
        <span class="pulse-mini"></span>
        <span>{latestSnapshot?.scenario?.name ?? 'Conectando...'}</span>
      </div>
      <span class="update-stamp">
        Última lectura: {latestSnapshot?.timestamp
          ? new Date(latestSnapshot.timestamp).toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          : '--:--:--'}
      </span>
    </div>
  </header>

  <!-- Bento Grid (2 Columnas) -->
  <main class="bento-layout">
    <!-- Columna Izquierda -->
    <div class="col-left">
      <!-- Tarjeta 1: Clima y Calidad del Aire Ahora -->
      <section class="bento-card" class:alert-border={effectiveLevel.key === 'danger'}>
        <div class="card-header">
          <div class="location-group">
            <span class="location-badge">
              <svg class="icon-xs icon-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              ZMG, Jalisco
            </span>

            <span class="status-pill status-{effectiveLevel.key}">
              <span class="status-icon">
                {@html effectiveLevel.key === 'danger' ? SVG_ICONS.alertTriangle : SVG_ICONS.checkCircle}
              </span>
              <span>{effectiveLevel.pillText}</span>
            </span>
          </div>

          <div class="unit-switch" role="group" aria-label="Unidad de temperatura">
            <button
              type="button"
              class="unit-btn"
              class:active={unit === 'C'}
              onclick={() => setTemperatureUnit('C')}
            >
              °C
            </button>
            <button
              type="button"
              class="unit-btn"
              class:active={unit === 'F'}
              onclick={() => setTemperatureUnit('F')}
            >
              °F
            </button>
          </div>
        </div>

        <div class="hero-body">
          <div class="thermal-panel">
            <div class="temp-row">
              <span class="temp-main">{formatTemp(primaryReading?.tempC, unit)}</span>
              <div class="temp-meta">
                <span class="feels-like">
                  Sensación térmica: {formatTemp(primaryReading ? primaryReading.tempC + 1 : null, unit)}
                </span>
                <div class="temp-range">
                  <span class="range-item">
                    Máx <strong>{formatTemp(primaryReading ? primaryReading.tempC + 4 : null, unit)}</strong>
                  </span>
                  <span>·</span>
                  <span class="range-item">
                    Mín <strong>{formatTemp(primaryReading ? primaryReading.tempC - 6 : null, unit)}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div class="metrics-strip">
              <div class="humidity-badge">
                <svg class="icon-xs icon-drop" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                </svg>
                <span class="metric-label">Humedad</span>
                <span class="metric-value">{primaryReading?.humidity ?? '--'}%</span>
              </div>

                <div class="condition-badge">
                  <span class="condition-icon">{@html SVG_ICONS[weatherBadge.icon]}</span>
                  <span>{weatherBadge.text}</span>
                </div>
            </div>
          </div>

          <div class="air-quality-panel level-{effectiveLevel.key}">
            <svg class="aq-illustration" viewBox="0 0 64 64" fill="none">
              <circle class="aq-ring" cx="32" cy="32" r="28" stroke-width="3" />
              <circle cx="32" cy="32" r="20" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
              <circle cx="32" cy="32" r="7" fill="currentColor" />
            </svg>

            <div class="aq-details">
              <span class="aq-label">Concentración PM / Gases</span>
              <div class="aq-value-row">
                <span class="aq-value">{primaryReading?.ugm3 ?? '--'}</span>
                <span class="aq-unit">µg/m³</span>
              </div>
              <div class="aq-risk-bar">
                <div class="aq-risk-fill" style="width: {riskPercent}%;"></div>
              </div>
              <span class="aq-risk-text">{effectiveLevel.riskText}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Tarjeta 2: Historial de la Última Semana y Ciclo Solar -->
      <section class="bento-card history-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Historial de la Última Semana</h2>
            <p class="card-subtitle">Promedios diarios de temperatura y partículas en ZMG</p>
          </div>
          <button
            type="button"
            class="btn-secondary"
            onclick={() => (showWeeklyModal = true)}
          >
            Ver más
          </button>
        </div>

        <div class="weekly-strip">
          {#each weeklyHistory as day}
            <div class="day-pill" class:is-yesterday={day.isYesterday}>
              <span class="day-name">{day.dayShort}</span>
              <span class="day-date">{day.dateLabel}</span>
              <span class="day-icon">
                {@html SVG_ICONS[day.icon ?? 'partlyCloudy']}
              </span>
              <span class="day-temp">{formatTemp(day.tempC, unit)}</span>
              <span class="day-ug">{day.ugm3} µg</span>
            </div>
          {/each}
        </div>

        <div class="history-bottom-grid">
          <div class="sub-card">
            <div class="sub-card-header">
              <span class="sub-card-tag">Resumen Semanal</span>
              <span class="summary-period">Últimos 7 días</span>
            </div>

            <div class="summary-metrics">
              <div class="summary-metric">
                <span class="summary-label">Ayer ({yesterdayData?.dayShort ?? '--'})</span>
                <span class="summary-val">
                  {formatTemp(yesterdayData?.tempC, unit)}
                </span>
                <span class="summary-sub">{yesterdayData?.ugm3 ?? '--'} µg/m³</span>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-metric">
                <span class="summary-label">Promedio 7d</span>
                <span class="summary-val accent-green">{avgUgm3} µg/m³</span>
                <span class="summary-sub">{formatTemp(avgTempC, unit)} media</span>
              </div>
            </div>
          </div>

          <div class="sub-card timeline-db-card">
            <div class="sub-card-header">
              <span class="sub-card-tag">Base de Datos · Por Minuto</span>
              <button
                type="button"
                class="btn-export-csv"
                title="Descargar base de datos en CSV"
                onclick={downloadDatabaseCsv}
              >
                <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Exportar CSV</span>
              </button>
            </div>

            <div class="timeline-status-row">
              {#if activeFrame}
                <span class="timeline-mode-pill is-history">
                  HISTÓRICO · #{activeFrame.entry_id}
                </span>
                <span class="timeline-stamp mono-inline">{activeFrame.fecha.slice(11, 16)} hrs</span>
              {:else}
                <span class="timeline-mode-pill is-live">
                  <span class="dot-live"></span> EN VIVO
                </span>
                <span class="timeline-stamp">{minuteFrames.length} min guardados</span>
              {/if}
            </div>

            <div class="timeline-scrubber-wrap">
              <div class="timeline-track-visual">
                <div
                  class="timeline-track-fill"
                  class:is-history={!isLiveMode}
                  style="width: {sliderProgressPct}%;"
                ></div>
                <div
                  class="timeline-thumb-visual"
                  class:is-history={!isLiveMode}
                  style="left: {sliderProgressPct}%;"
                ></div>
              </div>

              <input
                type="range"
                class="timeline-range-input"
                min="0"
                max={sliderMax}
                step="1"
                value={sliderValue}
                aria-label="Línea de tiempo de la base de datos por minuto"
                oninput={handleTimelineInput}
              />
            </div>

            <div class="timeline-axis-labels">
              <span>{minuteFrames[0]?.fecha?.slice(11, 16) ?? '--:--'}</span>
              <span class="timeline-hint">
                {minuteFrames.length === 0 ? 'Acumulando 1er min...' : 'Arrastra para viajar'}
              </span>
              <button
                type="button"
                class="timeline-live-jump"
                class:active={isLiveMode}
                onclick={() => (isLiveMode = true)}
              >
                En vivo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Columna Derecha -->
    <div class="col-right">
      <!-- Tarjeta 3: Mapa Topográfico Interactivo ZMG -->
      <section class="bento-card map-card">
        <div class="card-header map-header">
          <div>
            <h2 class="card-title">Mapa Topográfico de Sensores</h2>
            <p class="card-subtitle">Selecciona un nodo ESP32 para inspeccionar telemetría</p>
          </div>

          <div class="map-legend">
            <span class="legend-item"><span class="dot dot-green"></span> Óptimo</span>
            <span class="legend-item"><span class="dot dot-amber"></span> Moderado</span>
            <span class="legend-item"><span class="dot dot-red"></span> Alerta</span>
          </div>
        </div>

        <div class="map-stage">
          <div class="zmg-map" bind:this={mapContainer}></div>

            <!-- Botones de vista y heatmaps debajo del control de zoom -->
          <div class="map-mode-controls" role="group" aria-label="Capas del mapa">
            <button
              type="button"
              class="map-mode-btn"
              class:active={mapMode === 'default'}
              title="Vista actual (Radar)"
              onclick={() => (mapMode = 'default')}
            >
              <!-- Radar / Vista actual -->
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>

            <button
              type="button"
              class="map-mode-btn"
              class:active={mapMode === 'temp'}
              title="Heatmap: Temperatura"
              onclick={() => (mapMode = 'temp')}
            >
              <!-- Termómetro -->
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
              </svg>
            </button>

            <button
              type="button"
              class="map-mode-btn"
              class:active={mapMode === 'humidity'}
              title="Heatmap: Humedad"
              onclick={() => (mapMode = 'humidity')}
            >
              <!-- Gota -->
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </button>

            <button
              type="button"
              class="map-mode-btn"
              class:active={mapMode === 'air'}
              title="Heatmap: Calidad del Aire (PM / Gases)"
              onclick={() => (mapMode = 'air')}
            >
              <!-- Viento / Partículas -->
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
              </svg>
            </button>
          </div>
          <!-- Panel de Diagnóstico Técnico (Drawer Superpuesto) -->
          <aside class="diag-drawer" class:is-open={!!selectedNode && !!selectedReading}>
            {#if selectedNode && selectedReading}
              <div class="diag-header">
                <div>
                  <span class="diag-eyebrow">DIAGNÓSTICO DE NODO</span>
                  <h3 class="diag-node-name">{selectedNode.name}</h3>
                  <span class="diag-node-id mono-inline">{selectedNode.id} · {selectedNode.zone ?? selectedNode.municipality}</span>
                </div>
                <button
                  type="button"
                  class="btn-icon-close"
                  aria-label="Cerrar diagnóstico"
                  onclick={closeNodeDiagnostics}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div class="diag-body">
                <div class="diag-net-row">
                  <span class="diag-net-dot"></span>
                  <div>
                    <span class="diag-net-status">ESP32 conectado · Telemetría activa</span>
                    <span class="diag-net-prep">Protocolo HTTP / JSON · 12-bit ADC</span>
                  </div>
                </div>

                <div class="diag-section-title">
                  <span>Sensor Ambiental DHT22</span>
                </div>

                <div class="diag-dht-grid">
                  <div class="diag-metric-box">
                    <span class="diag-box-label">Temperatura</span>
                    <span class="diag-box-value">{formatTemp(selectedReading.tempC, unit, 1)}</span>
                  </div>
                  <div class="diag-metric-box">
                    <span class="diag-box-label">Humedad Rel.</span>
                    <span class="diag-box-value">{selectedReading.humidity}%</span>
                  </div>
                </div>

                <div class="diag-section-title">
                  <span>Sensor de Gas MQ-135</span>
                  <span class="diag-gas-badge" class:badge-alert={diagIsAlert} class:badge-normal={!diagIsAlert}>
                    {diagIsAlert ? 'ALERTA UMBRAL' : 'NOMINAL'}
                  </span>
                </div>

                <div class="diag-adc-card">
                  <div class="diag-adc-top">
                    <span class="diag-adc-value mono-inline">{selectedReading.adc}</span>
                    <span class="diag-adc-max mono-inline">/ {config.ADC_MAX} ADC</span>
                  </div>

                  <div class="adc-meter">
                    <div class="adc-bar-track">
                      <div
                        class="adc-bar-fill"
                        class:fill-danger={diagIsAlert}
                        class:fill-warning={!diagIsAlert && selectedReading.adc >= config.ADC_ALERT_THRESHOLD * 0.7}
                        style="width: {diagAdcPct}%;"
                      ></div>
                      <div class="adc-threshold-marker" style="left: {diagThresholdPct}%;"></div>
                    </div>

                    <div class="adc-scale mono-inline">
                      <span>0</span>
                      <span class="adc-threshold-label">Umbral {config.ADC_ALERT_THRESHOLD}</span>
                      <span>{config.ADC_MAX}</span>
                    </div>
                  </div>

                  <div class="diag-converted-row">
                    <span>Equivalencia estimada</span>
                    <strong class="mono-inline">{selectedReading.ugm3} µg/m³</strong>
                  </div>
                </div>
              </div>
            {/if}
          </aside>
        </div>
      </section>

      <!-- Tarjeta 4: Estaciones / Municipios ZMG -->
      <section class="bento-card stations-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Estaciones ZMG</h2>
            <p class="card-subtitle">Acceso rápido a municipios monitoreados</p>
          </div>
          <button
            type="button"
            class="btn-secondary"
            onclick={() => (showStationsModal = true)}
          >
            Ver todas
          </button>
        </div>

        <div class="stations-grid">
          {#each quickNodes as node}
            {@const reading = latestSnapshot?.readingsByNode?.[node.id]}
            {@const nodeLevel = reading?.level ?? { key: 'normal', color: '#2ecc71' }}
            <button
              type="button"
              class="station-mini-card"
              class:state-danger={nodeLevel.key === 'danger'}
              onclick={() => openNodeDiagnostics(node.id, true)}
            >
              <div class="station-info">
                <span class="station-muni">{node.municipality ?? node.name}</span>
                <span class="station-zone">{node.zone ?? node.shortLabel}</span>
                <span class="station-ug level-{nodeLevel.key}">
                  <span class="dot" style="background: {nodeLevel.color};"></span>
                  {reading?.ugm3 ?? '--'} µg/m³
                </span>
              </div>
              <div class="station-temp-block">
                <span class="station-temp">{formatTemp(reading?.tempC, unit, 1)}</span>
                <span class="station-hum">{reading?.humidity ?? '--'}% HR</span>
              </div>
            </button>
          {/each}
        </div>
      </section>
    </div>
  </main>
</div>

<!-- Modal: Todas las Estaciones ZMG -->
<div
  class="modal-backdrop"
  class:is-open={showStationsModal}
  role="presentation"
  onclick={() => (showStationsModal = false)}
>
  <div
    class="modal-dialog"
    role="dialog"
    aria-modal="true"
    aria-label="Estaciones ZMG"
    onclick={(e) => e.stopPropagation()}
  >
    <div class="modal-header">
      <div>
        <h2 class="modal-title">Todas las Estaciones ZMG</h2>
        <p class="modal-subtitle">Selecciona cualquier estación para centrarla en el mapa</p>
      </div>
      <button
        type="button"
        class="btn-icon-close"
        aria-label="Cerrar modal"
        onclick={() => (showStationsModal = false)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <div class="modal-body">
      <div class="all-stations-grid">
        {#each nodes as node}
          {@const reading = latestSnapshot?.readingsByNode?.[node.id]}
          {@const nodeLevel = reading?.level ?? { key: 'normal', color: '#2ecc71' }}
          <button
            type="button"
            class="station-mini-card"
            class:state-danger={nodeLevel.key === 'danger'}
            onclick={() => openNodeDiagnostics(node.id, true)}
          >
            <div class="station-info">
              <span class="station-muni">{node.municipality ?? node.name}</span>
              <span class="station-zone">{node.zone ?? node.shortLabel}</span>
              <span class="station-ug level-{nodeLevel.key}">
                <span class="dot" style="background: {nodeLevel.color};"></span>
                {reading?.ugm3 ?? '--'} µg/m³
              </span>
            </div>
            <div class="station-temp-block">
              <span class="station-temp">{formatTemp(reading?.tempC, unit)}</span>
              <span class="station-hum">{reading?.humidity ?? '--'}% HR</span>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>

<!-- Modal: Historial Semanal Completo -->
<div
  class="modal-backdrop"
  class:is-open={showWeeklyModal}
  role="presentation"
  onclick={() => (showWeeklyModal = false)}
>
  <div
    class="modal-dialog"
    role="dialog"
    aria-modal="true"
    aria-label="Historial Semanal"
    onclick={(e) => e.stopPropagation()}
  >
    <div class="modal-header">
      <div>
        <h2 class="modal-title">Historial Detallado (Últimos 7 Días)</h2>
        <p class="modal-subtitle">
          Promedio semanal: {avgUgm3} µg/m³ · {formatTemp(avgTempC, unit)}
        </p>
      </div>
      <button
        type="button"
        class="btn-icon-close"
        aria-label="Cerrar modal"
        onclick={() => (showWeeklyModal = false)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <div class="modal-body">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Día</th>
              <th>Fecha</th>
              <th>Temperatura</th>
              <th>Concentración</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {#each weeklyHistory as day}
              <tr>
                <td><strong>{day.dayShort}</strong></td>
                <td>{day.dateLabel}</td>
                <td class="mono-inline">{formatTemp(day.tempC, unit)}</td>
                <td class="mono-inline">{day.ugm3} µg/m³</td>
                <td>
                  <span class="table-status-chip" class:good={day.ugm3 <= 50} class:moderate={day.ugm3 > 50}>
                    {day.ugm3 <= 50 ? 'Buena' : 'Moderada'}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
