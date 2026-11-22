// 1. En IOT_CONFIG: sube el timeout a 6 segundos
export const IOT_CONFIG = {
  THINGSPEAK_CHANNEL_ID: 3571130,
  THINGSPEAK_READ_API_KEY: '04E5OPZ99F8JPHVZ',
  THINGSPEAK_RESULTS: 2,
  THINGSPEAK_TIMEOUT_MS: 6000,
  CUCEI_NODE_ID: 'nodo-05',
  ADC_MAX: 4095,
  ADC_ALERT_THRESHOLD: 1200,
  ADC_MODERATE_THRESHOLD: 800,
  SIMULATION_INTERVAL_MS: 4000,
  MINUTE_DB_MAX_FRAMES: 1440,
  MAP_CENTER_ZMG: [20.6767, -103.3475] as [number, number],
  MAP_ZOOM: 11,
};

export interface ZmgNode {
  id: string;
  espId: string;
  name: string;
  shortLabel: string;
  municipality: string;
  zone: string;
  coords: [number, number];
  isPrimary: boolean;
  useThingSpeak?: boolean;
}

export interface GasLevel {
  key: 'normal' | 'warning' | 'danger';
  color: string;
  pillText: string;
  riskText: string;
  diagBadge: string;
}

export interface NodeReading {
  channel_id: number;
  entry_id?: number;
  created_at: string;
  field1: string;
  field2: string;
  field3: string;
  field4?: string;
  tempC: number;
  humidity: number;
  adc: number;
  ugm3: number;
  alertaGas: boolean;
  level: GasLevel;
  source: 'thingspeak' | 'simulated' | 'extrapolated' | 'offline';
}

export interface MinuteSensorRecord {
  nodeId: string;
  espId: string;
  name: string;
  source: 'thingspeak' | 'extrapolated';
  temperatura_C: number;
  humedad_pct: number;
  gas_adc: number;
  ugm3: number;
  alerta_gas: boolean;
  level: GasLevel;
}

export interface MinuteDbFrame {
  entry_id: number;
  fecha: string; // Formato: YYYY-MM-DD HH:mm:00
  timestamp: string; // ISO 8601 del inicio del minuto
  sampleCount: number; // Cantidad de lecturas promediadas en ese minuto
  primaryNodeId: string;
  sensors: Record<string, MinuteSensorRecord>;
}

interface ThingSpeakFeedItem {
  created_at: string;
  entry_id: number;
  field1: string | null;
  field2: string | null;
  field3: string | null;
}

interface ThingSpeakFeedsResponse {
  channel?: {
    id: number;
    name: string;
    last_entry_id?: number;
  };
  feeds?: ThingSpeakFeedItem[];
}

export const ZMG_NODES: ZmgNode[] = [
  {
    id: 'nodo-01',
    espId: 'ESP-WROOM-32 · NODO-GDL-01',
    name: 'Nodo 01 - Guadalajara Centro',
    shortLabel: 'GDL Centro',
    municipality: 'Guadalajara',
    zone: 'Zona Centro / Alcalde',
    coords: [20.6767, -103.3475],
    isPrimary: false,
  },
  {
    id: 'nodo-02',
    espId: 'ESP-WROOM-32 · NODO-ZAP-02',
    name: 'Nodo 02 - Zapopan (Andares / Patria)',
    shortLabel: 'Zapopan',
    municipality: 'Zapopan',
    zone: 'Andares / Av. Patria',
    coords: [20.7089, -103.412],
    isPrimary: false,
  },
  {
    id: 'nodo-03',
    espId: 'ESP-WROOM-32 · NODO-TLQ-03',
    name: 'Nodo 03 - Tlaquepaque Centro',
    shortLabel: 'Tlaquepaque',
    municipality: 'Tlaquepaque',
    zone: 'Centro Histórico / Parián',
    coords: [20.6409, -103.3119],
    isPrimary: false,
  },
  {
    id: 'nodo-04',
    espId: 'ESP-WROOM-32 · NODO-TON-04',
    name: 'Nodo 04 - Tonalá',
    shortLabel: 'Tonalá',
    municipality: 'Tonalá',
    zone: 'Centro / Av. Tonaltecas',
    coords: [20.6244, -103.2421],
    isPrimary: false,
  },
  {
    id: 'nodo-05',
    espId: 'ESP-WROOM-32 · NODO-CUCEI-05',
    name: 'Nodo 05 - CUCEI (UDG)',
    shortLabel: 'CUCEI',
    municipality: 'Guadalajara',
    zone: 'Blvd. Marcelino García Barragán',
    coords: [20.6548, -103.3254],
    isPrimary: true,
    useThingSpeak: true,
  },
  {
    id: 'nodo-06',
    espId: 'ESP-WROOM-32 · NODO-TLJ-06',
    name: 'Nodo 06 - Tlajomulco (López Mateos Sur)',
    shortLabel: 'Tlajomulco',
    municipality: 'Tlajomulco',
    zone: 'Santa Anita / López Mateos Sur',
    coords: [20.5485, -103.4658],
    isPrimary: false,
  },
  {
    id: 'nodo-07',
    espId: 'ESP-WROOM-32 · NODO-SAL-07',
    name: 'Nodo 07 - El Salto (Corredor Industrial)',
    shortLabel: 'El Salto',
    municipality: 'El Salto',
    zone: 'Zona Industrial / Carr. a Chapala',
    coords: [20.5256, -103.1818],
    isPrimary: false,
  },
  {
    id: 'nodo-08',
    espId: 'ESP-WROOM-32 · NODO-ZAP-08',
    name: 'Nodo 08 - Zapopan Norte (CUCEA)',
    shortLabel: 'CUCEA',
    municipality: 'Zapopan',
    zone: 'Periférico Norte / Los Belenes',
    coords: [20.7407, -103.3813],
    isPrimary: false,
  },
  {
    id: 'nodo-09',
    espId: 'ESP-WROOM-32 · NODO-GDL-09',
    name: 'Nodo 09 - Providencia / Minerva',
    shortLabel: 'Minerva',
    municipality: 'Guadalajara',
    zone: 'Glorieta Minerva / Av. Vallarta',
    coords: [20.6744, -103.3874],
    isPrimary: false,
  },
  {
    id: 'nodo-10',
    espId: 'ESP-WROOM-32 · NODO-GDL-10',
    name: 'Nodo 10 - Oblatos / Solidaridad',
    shortLabel: 'Oblatos',
    municipality: 'Guadalajara',
    zone: 'Circunvalación / Parque Solidaridad',
    coords: [20.6845, -103.2965],
    isPrimary: false,
  },
  {
    id: 'nodo-11',
    espId: 'ESP-WROOM-32 · NODO-GDL-11',
    name: 'Nodo 11 - Huentitán',
    shortLabel: 'Huentitán',
    municipality: 'Guadalajara',
    zone: 'Calz. Independencia Norte / Mirador',
    coords: [20.7225, -103.3168],
    isPrimary: false,
  },
  {
    id: 'nodo-12',
    espId: 'ESP-WROOM-32 · NODO-TLQ-12',
    name: 'Nodo 12 - Las Pintas',
    shortLabel: 'Las Pintas',
    municipality: 'El Salto',
    zone: 'Periférico Sur / Carr. a Chapala',
    coords: [20.5758, -103.3264],
    isPrimary: false,
  },
  {
    id: 'nodo-13',
    espId: 'ESP-WROOM-32 · NODO-ZAP-13',
    name: 'Nodo 13 - Tesistán',
    shortLabel: 'Tesistán',
    municipality: 'Zapopan',
    zone: 'Av. Juan Gil Preciado / Base Aérea',
    coords: [20.7662, -103.4492],
    isPrimary: false,
  },
  {
    id: 'nodo-14',
    espId: 'ESP-WROOM-32 · NODO-ZAP-14',
    name: 'Nodo 14 - Parque Metropolitano',
    shortLabel: 'Metropolitano',
    municipality: 'Zapopan',
    zone: 'Ciudad Granja / Av. Guadalupe',
    coords: [20.6716, -103.4408],
    isPrimary: false,
  },
  {
    id: 'nodo-15',
    espId: 'ESP-WROOM-32 · NODO-TLQ-15',
    name: 'Nodo 15 - Miravalle / Cerro del Cuatro',
    shortLabel: 'Miravalle',
    municipality: 'Tlaquepaque',
    zone: 'Av. Gobernador Curiel / Miravalle',
    coords: [20.6015, -103.3562],
    isPrimary: false,
  },
  {
    id: 'nodo-16',
    espId: 'ESP-WROOM-32 · NODO-TLJ-16',
    name: 'Nodo 16 - Tlajomulco Cabecera',
    shortLabel: 'Tlajomulco Centro',
    municipality: 'Tlajomulco',
    zone: 'Centro / Circuito Metropolitano Sur',
    coords: [20.4742, -103.4436],
    isPrimary: false,
  },
];

const EXTRAPOLATION_LIMITS = {
  TEMP_DELTA_MAX: 3.0,   // ±3.0 °C máximo respecto a CUCEI
  HUMIDITY_DELTA_MAX: 6, // ±6 % máximo respecto a CUCEI
  ADC_DELTA_MAX: 150,    // ±150 ADC máximo respecto a CUCEI
};

// Estado interno en vivo
let latestPrimaryReading: NodeReading | null = null;
const nodeJitterState: Record<string, { temp: number; hum: number; adc: number }> = {};

// ============================================================================
// BASE DE DATOS INTERNA (1 FRAME POR MINUTO CON PROMEDIO DE CADA SENSOR)
// ============================================================================
interface MinuteAccumulator {
  minuteStartMs: number;
  sampleCount: number;
  sumsByNode: Record<
    string,
    {
      tempSum: number;
      humSum: number;
      adcSum: number;
      source: 'thingspeak' | 'extrapolated';
    }
  >;
}

const minuteDatabase: MinuteDbFrame[] = [];
let nextMinuteEntryId = 1;
let activeMinuteBucket: MinuteAccumulator | null = null;

function getMinuteStartMs(date: Date): number {
  return Math.floor(date.getTime() / 60_000) * 60_000;
}

function formatSqlTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:00`;
}

/**
 * Cierra la cubeta del minuto anterior, calcula el promedio de cada sensor
 * y guarda un nuevo frame en `minuteDatabase`.
 */
function commitMinuteBucket(bucket: MinuteAccumulator): MinuteDbFrame {
  const frameDate = new Date(bucket.minuteStartMs);
  const sensors: Record<string, MinuteSensorRecord> = {};
  const count = Math.max(1, bucket.sampleCount);

  for (const node of ZMG_NODES) {
    const acc = bucket.sumsByNode[node.id];
    if (!acc) continue;

    const avgTemp = Number((acc.tempSum / count).toFixed(1));
    const avgHum = Number((acc.humSum / count).toFixed(1));
    const avgAdc = Math.round(acc.adcSum / count);
    const alertaGas = avgAdc >= IOT_CONFIG.ADC_ALERT_THRESHOLD;

    sensors[node.id] = {
      nodeId: node.id,
      espId: node.espId,
      name: node.name,
      source: acc.source,
      temperatura_C: avgTemp,
      humedad_pct: avgHum,
      gas_adc: avgAdc,
      ugm3: adcToUgM3(avgAdc),
      alerta_gas: alertaGas,
      level: classifyGasLevel(avgAdc, alertaGas),
    };
  }

  const frame: MinuteDbFrame = {
    entry_id: nextMinuteEntryId++,
    fecha: formatSqlTimestamp(frameDate),
    timestamp: frameDate.toISOString(),
    sampleCount: bucket.sampleCount,
    primaryNodeId: IOT_CONFIG.CUCEI_NODE_ID,
    sensors,
  };

  minuteDatabase.push(frame);
  if (minuteDatabase.length > IOT_CONFIG.MINUTE_DB_MAX_FRAMES) {
    minuteDatabase.shift();
  }

  return frame;
}

/**
 * Acumula una muestra de todos los sensores en el minuto actual.
 * Si el reloj avanzó a un minuto nuevo, cierra y guarda el frame del minuto previo.
 */
function recordSnapshotInMinuteDb(
  readingsByNode: Record<string, NodeReading>,
  nowDate: Date
) {
  const currentMinuteMs = getMinuteStartMs(nowDate);

  if (activeMinuteBucket && currentMinuteMs > activeMinuteBucket.minuteStartMs) {
    commitMinuteBucket(activeMinuteBucket);
    activeMinuteBucket = null;
  }

  if (!activeMinuteBucket) {
    activeMinuteBucket = {
      minuteStartMs: currentMinuteMs,
      sampleCount: 0,
      sumsByNode: {},
    };
  }

  activeMinuteBucket.sampleCount += 1;

  for (const node of ZMG_NODES) {
    const r = readingsByNode[node.id];
    if (!r || r.source === 'offline') continue;

    if (!activeMinuteBucket.sumsByNode[node.id]) {
      activeMinuteBucket.sumsByNode[node.id] = {
        tempSum: 0,
        humSum: 0,
        adcSum: 0,
        source: r.source === 'thingspeak' ? 'thingspeak' : 'extrapolated',
      };
    }

    activeMinuteBucket.sumsByNode[node.id].tempSum += r.tempC;
    activeMinuteBucket.sumsByNode[node.id].humSum += r.humidity;
    activeMinuteBucket.sumsByNode[node.id].adcSum += r.adc;
  }
}

/** Devuelve los frames consolidados de 1 minuto (opcionalmente los últimos `limit`). */
export function getMinuteDatabase(limit?: number): MinuteDbFrame[] {
  const nowMinuteMs = getMinuteStartMs(new Date());
  if (activeMinuteBucket && nowMinuteMs > activeMinuteBucket.minuteStartMs) {
    commitMinuteBucket(activeMinuteBucket);
    activeMinuteBucket = null;
  }

  if (limit && limit > 0) {
    return minuteDatabase.slice(-limit);
  }
  return [...minuteDatabase];
}

/** Devuelve el último frame cerrado de 1 minuto. */
export function getLatestMinuteFrame(): MinuteDbFrame | null {
  const frames = getMinuteDatabase(1);
  return frames.length > 0 ? frames[0] : null;
}

/**
 * Exporta la base de datos interna en formato CSV compatible con ThingSpeak:
 * fecha,entry_id,nodo_id,origen,temperatura_C,humedad_pct,gas_adc,alerta_gas
 */
export function exportMinuteDatabaseCsv(nodeId?: string): string {
  const frames = getMinuteDatabase();
  const header = 'fecha,entry_id,nodo_id,origen,temperatura_C,humedad_pct,gas_adc,alerta_gas';
  const rows: string[] = [header];

  for (const frame of frames) {
    const targetNodes = nodeId ? [nodeId] : ZMG_NODES.map((n) => n.id);
    for (const id of targetNodes) {
      const s = frame.sensors[id];
      if (!s) continue;
      rows.push(
        `${frame.fecha},${frame.entry_id},${s.nodeId},${s.source},${s.temperatura_C.toFixed(1)},${s.humedad_pct.toFixed(1)},${s.gas_adc},${s.alerta_gas ? 'True' : 'False'}`
      );
    }
  }

  return rows.join('\n');
}

// ============================================================================
// UTILIDADES Y CONEXIÓN A THINGSPEAK (feeds.json?results=2)
// ============================================================================

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function adcToUgM3(rawAdc: number): number {
  const clamped = Math.max(0, Math.min(IOT_CONFIG.ADC_MAX, Number(rawAdc) || 0));
  return Math.round((clamped / IOT_CONFIG.ADC_MAX) * 180);
}

export function classifyGasLevel(rawAdc: number, explicitAlert = false): GasLevel {
  if (explicitAlert || rawAdc >= IOT_CONFIG.ADC_ALERT_THRESHOLD) {
    return {
      key: 'danger',
      color: '#e74c3c',
      pillText: 'Contingencia',
      riskText: 'Contingencia · Acumulación de gas detectada',
      diagBadge: 'ALERTA GAS',
    };
  }
  if (rawAdc >= IOT_CONFIG.ADC_MODERATE_THRESHOLD) {
    return {
      key: 'warning',
      color: '#f5b041',
      pillText: 'Moderado',
      riskText: 'Calidad Moderada · Tráfico vehicular',
      diagBadge: 'MODERADO',
    };
  }
  return {
    key: 'normal',
    color: '#2ecc71',
    pillText: 'Normal',
    riskText: 'Calidad Buena · Aire limpio',
    diagBadge: 'NORMAL',
  };
}

function createZeroReading(timestampIso: string): NodeReading {
  return {
    channel_id: IOT_CONFIG.THINGSPEAK_CHANNEL_ID,
    created_at: timestampIso,
    field1: '0.0',
    field2: '0.0',
    field3: '0',
    field4: 'False',
    tempC: 0,
    humidity: 0,
    adc: 0,
    ugm3: 0,
    alertaGas: false,
    level: classifyGasLevel(0, false),
    source: 'offline',
  };
}

/**
 * Consulta `feeds.json?api_key=...&results=2` y extrae el feed válido más reciente.
 */
async function fetchPrimarySensorReading(): Promise<NodeReading | null> {
  if (!IOT_CONFIG.THINGSPEAK_CHANNEL_ID) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IOT_CONFIG.THINGSPEAK_TIMEOUT_MS);

  const params = new URLSearchParams({
    results: String(IOT_CONFIG.THINGSPEAK_RESULTS),
  });
  if (IOT_CONFIG.THINGSPEAK_READ_API_KEY) {
    params.set('api_key', IOT_CONFIG.THINGSPEAK_READ_API_KEY);
  }

  const url = `https://api.thingspeak.com/channels/${IOT_CONFIG.THINGSPEAK_CHANNEL_ID}/feeds.json?${params.toString()}`;

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;

    const data: ThingSpeakFeedsResponse = await res.json();
    const feeds = Array.isArray(data.feeds) ? data.feeds : [];
    if (feeds.length === 0) return null;

    // Recorrer desde el feed más nuevo hacia atrás por si el último paquete tiene campos nulos
    for (let i = feeds.length - 1; i >= 0; i--) {
      const feed = feeds[i];
      if (!feed || feed.field1 == null || feed.field2 == null || feed.field3 == null) {
        continue;
      }

      const tempC = parseFloat(feed.field1);
      const humidity = parseFloat(feed.field2);
      const adc = Math.round(parseFloat(feed.field3));

      if (Number.isNaN(tempC) || Number.isNaN(humidity) || Number.isNaN(adc)) {
        continue;
      }

      const alertaGas = adc >= IOT_CONFIG.ADC_ALERT_THRESHOLD;
      const timestamp = feed.created_at || new Date().toISOString();

      return {
        channel_id: data.channel?.id ?? IOT_CONFIG.THINGSPEAK_CHANNEL_ID,
        entry_id: feed.entry_id,
        created_at: timestamp,
        field1: tempC.toFixed(1),
        field2: humidity.toFixed(1),
        field3: String(adc),
        field4: alertaGas ? 'True' : 'False',
        tempC,
        humidity: Math.round(humidity),
        adc,
        ugm3: adcToUgM3(adc),
        alertaGas,
        level: classifyGasLevel(adc, alertaGas),
        source: 'thingspeak',
      };
    }

    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extrapolateFromPrimary(
  cuceiNode: ZmgNode,
  targetNode: ZmgNode,
  primary: NodeReading,
  timestampIso: string
): NodeReading {
  const distKm = haversineKm(cuceiNode.coords, targetNode.coords);
  const deltaLat = targetNode.coords[0] - cuceiNode.coords[0];
  const deltaLon = targetNode.coords[1] - cuceiNode.coords[1];
  const dirSign = deltaLon >= 0 ? 1 : -1;

  const spatialTempBias = clamp((distKm * 0.08 * dirSign) - deltaLat * 4.5, -1.8, 1.8);
  const spatialHumBias = clamp(Math.round(-spatialTempBias * 2), -4, 4);
  const spatialAdcBias = clamp(Math.round((distKm * 4.5 * dirSign) - deltaLat * 180), -95, 95);

  const prev = nodeJitterState[targetNode.id] ?? {
    temp: randomRange(-0.8, 0.8),
    hum: randomRange(-2, 2),
    adc: randomRange(-35, 35),
  };

// En extrapolateFromPrimary() — aumenta ligeramente el paso por tick (cada 4s):
  const nextJitter = {
    temp: clamp(prev.temp + randomRange(-0.45, 0.45), -1.5, 1.5),
    hum: clamp(prev.hum + randomRange(-1.2, 1.2), -3.0, 3.0),
    adc: clamp(prev.adc + randomRange(-28, 28), -75, 75),
  }
  nodeJitterState[targetNode.id] = nextJitter;

  const totalTempDelta = clamp(
    spatialTempBias + nextJitter.temp,
    -EXTRAPOLATION_LIMITS.TEMP_DELTA_MAX,
    EXTRAPOLATION_LIMITS.TEMP_DELTA_MAX
  );
  const totalHumDelta = clamp(
    spatialHumBias + nextJitter.hum,
    -EXTRAPOLATION_LIMITS.HUMIDITY_DELTA_MAX,
    EXTRAPOLATION_LIMITS.HUMIDITY_DELTA_MAX
  );
  const totalAdcDelta = clamp(
    spatialAdcBias + nextJitter.adc,
    -EXTRAPOLATION_LIMITS.ADC_DELTA_MAX,
    EXTRAPOLATION_LIMITS.ADC_DELTA_MAX
  );

  const tempC = Number(Math.max(0, primary.tempC + totalTempDelta).toFixed(1));
  const humidity = Math.round(clamp(primary.humidity + totalHumDelta, 0, 100));
  const adc = Math.round(clamp(primary.adc + totalAdcDelta, 0, IOT_CONFIG.ADC_MAX));
  const alertaGas = adc >= IOT_CONFIG.ADC_ALERT_THRESHOLD;

  return {
    channel_id: primary.channel_id,
    created_at: timestampIso,
    field1: tempC.toFixed(1),
    field2: humidity.toFixed(1),
    field3: String(adc),
    field4: alertaGas ? 'True' : 'False',
    tempC,
    humidity,
    adc,
    ugm3: adcToUgM3(adc),
    alertaGas,
    level: classifyGasLevel(adc, alertaGas),
    source: 'extrapolated',
  };
}

function buildLiveScenarioMeta(primary: NodeReading) {
  if (primary.source === 'offline') {
    return {
      id: 'thingspeak-offline',
      name: 'Sin datos de ThingSpeak · Lecturas en 0',
      label: 'Sin datos de ThingSpeak · Lecturas en 0',
      weatherCondition: 'Sensor CUCEI sin conexión',
      condition: 'Sensor CUCEI sin conexión',
      weatherIcon: 'cloud' as const,
      tempMinC: 0,
      tempMaxC: 0,
      feelsLikeOffset: 0,
    };
  }

  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 20;

  let weatherIcon: 'sun' | 'partlyCloudy' | 'cloud' | 'moon' = isNight ? 'moon' : 'sun';
  let weatherCondition = isNight ? 'Cielo despejado nocturno' : 'Despejado';
  let name = 'Telemetría en vivo · CUCEI (ThingSpeak)';

  if (primary.level.key === 'danger') {
    weatherIcon = 'cloud';
    weatherCondition = 'Alerta ambiental activa';
    name = `Contingencia en vivo · Gas elevado (ADC ${primary.adc})`;
  } else if (primary.level.key === 'warning') {
    weatherIcon = isNight ? 'moon' : 'partlyCloudy';
    weatherCondition = 'Bruma ligera · Tráfico moderado';
    name = 'Telemetría en vivo · Calidad moderada';
  } else if (primary.humidity >= 70) {
    weatherIcon = 'cloud';
    weatherCondition = 'Nublado húmedo';
  }

  return {
    id: 'live-extrapolated',
    name,
    label: name,
    weatherCondition,
    condition: weatherCondition,
    weatherIcon,
    tempMinC: Math.max(0, Math.round(primary.tempC - 5)),
    tempMaxC: Math.round(primary.tempC + 4),
    feelsLikeOffset: primary.humidity > 65 ? 1 : primary.tempC > 29 ? 2 : 0,
  };
}

// 2. Reemplaza getNextSnapshot() para no borrar a 0 ante un fallo momentáneo de red
export async function getNextSnapshot() {
  const now = new Date();
  const nowIso = now.toISOString();
  const cuceiNode =
    ZMG_NODES.find((n) => n.id === IOT_CONFIG.CUCEI_NODE_ID) ?? ZMG_NODES[4];

  const fetchedReading = await fetchPrimarySensorReading();
  if (fetchedReading) {
    latestPrimaryReading = fetchedReading;
  }

  const activeReading = fetchedReading ?? latestPrimaryReading;
  const readingsByNode: Record<string, NodeReading> = {};

  if (!activeReading) {
    for (const node of ZMG_NODES) {
      readingsByNode[node.id] = createZeroReading(nowIso);
    }

    return {
      scenario: buildLiveScenarioMeta(createZeroReading(nowIso)),
      timestamp: nowIso,
      readingsByNode,
    };
  }

  for (const node of ZMG_NODES) {
    if (node.id === cuceiNode.id) {
      readingsByNode[node.id] = activeReading;
    } else {
      readingsByNode[node.id] = extrapolateFromPrimary(
        cuceiNode,
        node,
        activeReading,
        activeReading.created_at
      );
    }
  }

  // Solo acumula en la BD por minuto cuando hubo lectura fresca de ThingSpeak
  if (fetchedReading) {
    recordSnapshotInMinuteDb(readingsByNode, now);
  }

// Al final de getNextSnapshot() — devuelve `nowIso` para que el reloj avance cada 4s:
  const scenario = buildLiveScenarioMeta(activeReading);
  const sensorTime = new Date(activeReading.created_at).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  scenario.weatherCondition = `${scenario.weatherCondition} · Sensor ${sensorTime}`;

  return {
    scenario,
    timestamp: nowIso,
    readingsByNode,
  };
}

/**
 * Mantiene la firma sin argumentos `buildLast7DaysHistory()` usada en `+server.ts`.
 */
export function buildLast7DaysHistory(baseReading?: NodeReading | null) {
  const reference = baseReading !== undefined ? baseReading : latestPrimaryReading;
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const today = new Date();

  return Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (7 - idx));

    if (!reference || reference.source === 'offline') {
      return {
        dayShort: dayNames[d.getDay()],
        dateLabel: `${d.getDate()} ${monthNames[d.getMonth()]}`,
        isYesterday: idx === 6,
        tempC: 0,
        humidity: 0,
        ugm3: 0,
        icon: 'cloud',
        condition: 'Sin datos',
      };
    }

    const tempC = Math.max(0, Math.round(reference.tempC + randomRange(-2.5, 2.5)));
    const humidity = Math.round(clamp(reference.humidity + randomRange(-5, 5), 0, 100));
    const adc = Math.round(clamp(reference.adc + randomRange(-120, 120), 0, IOT_CONFIG.ADC_MAX));
    const ugm3 = adcToUgM3(adc);
    const level = classifyGasLevel(adc);

    const icon =
      level.key === 'danger' || humidity >= 65
        ? 'cloud'
        : level.key === 'warning'
        ? 'partlyCloudy'
        : 'sun';

    const condition =
      idx === 6
        ? 'Ayer · Extrapolado'
        : level.key === 'danger'
        ? 'Alta concentración'
        : level.key === 'warning'
        ? 'Bruma ligera'
        : 'Despejado';

    return {
      dayShort: dayNames[d.getDay()],
      dateLabel: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      isYesterday: idx === 6,
      tempC,
      humidity,
      ugm3,
      icon,
      condition,
    };
  });
}