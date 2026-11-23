export const IOT_CONFIG = {
  THINGSPEAK_CHANNEL_ID: 3571130,
  CUCEI_NODE_ID: 'nodo-05',
  ADC_MAX: 4095,
  ADC_ALERT_THRESHOLD: 1200,
  ADC_MODERATE_THRESHOLD: 800,
  SIMULATION_INTERVAL_MS: 4000,
  MINUTE_DB_MAX_FRAMES: 1440, // Retiene hasta 24 horas de frames (1 por minuto)
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
  source: 'simulated' | 'offline';
}

export interface MinuteSensorRecord {
  nodeId: string;
  espId: string;
  name: string;
  source: 'simulated';
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

export const ZMG_NODES: ZmgNode[] = [
  {
    id: 'nodo-01',
    espId: 'ESP-WROOM-32 · NODO-GDL-01',
    name: 'Nodo 01 - Guadalajara Centro',
    shortLabel: 'GDL Centro',
    municipality: 'Guadalajara',
    zone: 'Zona Centro / Alcalde',
    coords: [20.6767, -103.3475],
    isPrimary: true,
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
    isPrimary: false,
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

const SCENARIOS = [
  {
    id: 'morning-clean',
    label: 'Mañana fresca · Aire limpio',
    condition: 'Mañana despejada',
    weatherIcon: 'sun',
    tempMinC: 15,
    tempMaxC: 28,
    feelsLikeOffset: 0,
    nodes: {
      'nodo-01': { field1: '21.4', field2: '56', field3: '455' },
      'nodo-02': { field1: '20.2', field2: '59', field3: '390' },
      'nodo-03': { field1: '21.8', field2: '54', field3: '480' },
      'nodo-04': { field1: '22.0', field2: '52', field3: '430' },
      'nodo-05': { field1: '21.6', field2: '55', field3: '470' },
      'nodo-06': { field1: '19.8', field2: '61', field3: '360' },
      'nodo-07': { field1: '22.3', field2: '50', field3: '610' },
      'nodo-08': { field1: '20.0', field2: '58', field3: '410' },
      'nodo-09': { field1: '20.8', field2: '57', field3: '425' },
      'nodo-10': { field1: '21.9', field2: '53', field3: '505' },
      'nodo-11': { field1: '20.5', field2: '58', field3: '385' },
      'nodo-12': { field1: '22.1', field2: '51', field3: '590' },
      'nodo-13': { field1: '19.4', field2: '62', field3: '340' },
      'nodo-14': { field1: '20.1', field2: '60', field3: '375' },
      'nodo-15': { field1: '21.7', field2: '54', field3: '530' },
      'nodo-16': { field1: '19.2', field2: '63', field3: '350' },
    },
  },
  {
    id: 'afternoon-traffic',
    label: 'Tarde cálida · Tráfico moderado',
    condition: 'Parcialmente nublado',
    weatherIcon: 'partlyCloudy',
    tempMinC: 17,
    tempMaxC: 31,
    feelsLikeOffset: 2,
    nodes: {
      'nodo-01': { field1: '29.2', field2: '34', field3: '940' },
      'nodo-02': { field1: '28.1', field2: '37', field3: '860' },
      'nodo-03': { field1: '29.8', field2: '32', field3: '1010' },
      'nodo-04': { field1: '29.5', field2: '33', field3: '780' },
      'nodo-05': { field1: '29.4', field2: '35', field3: '920' },
      'nodo-06': { field1: '27.8', field2: '38', field3: '810' },
      'nodo-07': { field1: '30.2', field2: '30', field3: '1120' },
      'nodo-08': { field1: '28.0', field2: '36', field3: '845' },
      'nodo-09': { field1: '28.7', field2: '35', field3: '890' },
      'nodo-10': { field1: '29.6', field2: '33', field3: '965' },
      'nodo-11': { field1: '28.4', field2: '36', field3: '760' },
      'nodo-12': { field1: '30.0', field2: '31', field3: '1080' },
      'nodo-13': { field1: '27.5', field2: '39', field3: '720' },
      'nodo-14': { field1: '28.2', field2: '37', field3: '790' },
      'nodo-15': { field1: '29.7', field2: '32', field3: '1040' },
      'nodo-16': { field1: '27.4', field2: '40', field3: '695' },
    },
  },
  {
    id: 'contingency-gas',
    label: 'Contingencia · Acumulación de gas (ADC > 1200)',
    condition: 'Nublado denso',
    weatherIcon: 'cloud',
    tempMinC: 18,
    tempMaxC: 31,
    feelsLikeOffset: 1,
    nodes: {
      'nodo-01': { field1: '27.4', field2: '41', field3: '1535' },
      'nodo-02': { field1: '26.5', field2: '44', field3: '1280' },
      'nodo-03': { field1: '27.9', field2: '39', field3: '990' },
      'nodo-04': { field1: '27.1', field2: '42', field3: '690' },
      'nodo-05': { field1: '27.6', field2: '40', field3: '1340' },
      'nodo-06': { field1: '25.9', field2: '46', field3: '880' },
      'nodo-07': { field1: '28.4', field2: '37', field3: '1620' },
      'nodo-08': { field1: '26.2', field2: '45', field3: '950' },
      'nodo-09': { field1: '26.9', field2: '43', field3: '1240' },
      'nodo-10': { field1: '27.7', field2: '40', field3: '1390' },
      'nodo-11': { field1: '26.6', field2: '44', field3: '870' },
      'nodo-12': { field1: '28.2', field2: '38', field3: '1580' },
      'nodo-13': { field1: '25.8', field2: '47', field3: '790' },
      'nodo-14': { field1: '26.4', field2: '45', field3: '910' },
      'nodo-15': { field1: '28.0', field2: '39', field3: '1460' },
      'nodo-16': { field1: '25.6', field2: '48', field3: '740' },
    },
  },
  {
    id: 'mild-night',
    label: 'Noche templada · Brisa ligera',
    condition: 'Cielo despejado nocturno',
    weatherIcon: 'moon',
    tempMinC: 14,
    tempMaxC: 27,
    feelsLikeOffset: -1,
    nodes: {
      'nodo-01': { field1: '20.6', field2: '63', field3: '520' },
      'nodo-02': { field1: '19.4', field2: '66', field3: '465' },
      'nodo-03': { field1: '21.0', field2: '61', field3: '560' },
      'nodo-04': { field1: '20.3', field2: '64', field3: '495' },
      'nodo-05': { field1: '20.8', field2: '62', field3: '510' },
      'nodo-06': { field1: '18.9', field2: '68', field3: '420' },
      'nodo-07': { field1: '21.2', field2: '59', field3: '675' },
      'nodo-08': { field1: '19.2', field2: '65', field3: '450' },
      'nodo-09': { field1: '19.9', field2: '64', field3: '480' },
      'nodo-10': { field1: '20.9', field2: '61', field3: '545' },
      'nodo-11': { field1: '19.6', field2: '65', field3: '435' },
      'nodo-12': { field1: '21.1', field2: '60', field3: '640' },
      'nodo-13': { field1: '18.6', field2: '69', field3: '395' },
      'nodo-14': { field1: '19.3', field2: '66', field3: '430' },
      'nodo-15': { field1: '20.7', field2: '62', field3: '580' },
      'nodo-16': { field1: '18.4', field2: '70', field3: '380' },
    },
  },
];

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
      source: 'simulated',
      temperatura_C: avgTemp,
      humedad_pct: avgHum,
      gas_adc: avgAdc,
      ugm3: adcToUgM3(avgAdc),
      alerta_gas: alertaGas,
      level: classifyGasLevel(avgAdc),
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
// SIMULACIÓN EN VIVO
// ============================================================================

export function adcToUgM3(rawAdc: number): number {
  const clamped = Math.max(0, Math.min(IOT_CONFIG.ADC_MAX, Number(rawAdc) || 0));
  return Math.round((clamped / IOT_CONFIG.ADC_MAX) * 180);
}

export function classifyGasLevel(rawAdc: number): GasLevel {
  if (rawAdc >= IOT_CONFIG.ADC_ALERT_THRESHOLD) {
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

let currentScenarioIndex = 0;

export async function getNextSnapshot() {
  const scenario = SCENARIOS[currentScenarioIndex];
  currentScenarioIndex = (currentScenarioIndex + 1) % SCENARIOS.length;

  const now = new Date();
  const nowIso = now.toISOString();
  const readingsByNode: Record<string, NodeReading> = {};

  for (const node of ZMG_NODES) {
    const raw = scenario.nodes[node.id as keyof typeof scenario.nodes];
    const tempC = parseFloat(raw.field1);
    const humidity = parseInt(raw.field2, 10);
    const adc = parseInt(raw.field3, 10);
    const alertaGas = adc >= IOT_CONFIG.ADC_ALERT_THRESHOLD;

    readingsByNode[node.id] = {
      channel_id: IOT_CONFIG.THINGSPEAK_CHANNEL_ID,
      created_at: nowIso,
      field1: raw.field1,
      field2: raw.field2,
      field3: raw.field3,
      field4: alertaGas ? 'True' : 'False',
      tempC,
      humidity,
      adc,
      ugm3: adcToUgM3(adc),
      alertaGas,
      level: classifyGasLevel(adc),
      source: 'simulated',
    };
  }

  recordSnapshotInMinuteDb(readingsByNode, now);

  return {
    scenario: {
      ...scenario,
      name: scenario.label,
      weatherCondition: scenario.condition,
    },
    timestamp: nowIso,
    readingsByNode,
  };
}

export function buildLast7DaysHistory() {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const templates = [
    { tempC: 23, humidity: 49, ugm3: 19, icon: 'sun', condition: 'Soleado' },
    { tempC: 24, humidity: 46, ugm3: 22, icon: 'sun', condition: 'Despejado' },
    { tempC: 26, humidity: 41, ugm3: 28, icon: 'partlyCloudy', condition: 'Parcialmente nublado' },
    { tempC: 25, humidity: 44, ugm3: 31, icon: 'partlyCloudy', condition: 'Bruma ligera' },
    { tempC: 22, humidity: 55, ugm3: 18, icon: 'cloud', condition: 'Nublado templado' },
    { tempC: 24, humidity: 47, ugm3: 23, icon: 'sun', condition: 'Soleado' },
    { tempC: 25, humidity: 43, ugm3: 27, icon: 'partlyCloudy', condition: 'Ayer · Cálido' },
  ];

  const today = new Date();
  return templates.map((tpl, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (7 - idx));
    return {
      dayShort: dayNames[d.getDay()],
      dateLabel: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      isYesterday: idx === templates.length - 1,
      ...tpl,
    };
  });
}