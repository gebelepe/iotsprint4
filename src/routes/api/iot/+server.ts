import { json } from '@sveltejs/kit';
import {
  IOT_CONFIG,
  ZMG_NODES,
  getNextSnapshot,
  buildLast7DaysHistory,
  getMinuteDatabase,
  exportMinuteDatabaseCsv,
} from '$lib/server/iot';

export async function GET({ url }) {
  const init = url.searchParams.get('init') === 'true';
  const exportFormat = url.searchParams.get('export');
  const nodeFilter = url.searchParams.get('node') ?? undefined;

  const snapshot = await getNextSnapshot();

  // Exportación directa de la base de datos en formato CSV
  if (exportFormat === 'csv') {
    let csv = exportMinuteDatabaseCsv(nodeFilter);

    // Si aún no se cierra el primer minuto desde que arrancó el servidor,
    // incluimos la lectura actual para que el CSV nunca se descargue vacío
    if (csv.split('\n').length <= 1) {
      const pad = (n: number) => String(n).padStart(2, '0');
      const now = new Date();
      const fecha = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:00`;
      const targetNodes = nodeFilter ? [nodeFilter] : ZMG_NODES.map((n) => n.id);

      const fallbackRows = targetNodes
        .map((id) => {
          const r = snapshot.readingsByNode[id];
          if (!r || r.source === 'offline') return null;
          return `${fecha},0,${id},${r.source},${r.tempC.toFixed(1)},${r.humidity.toFixed(1)},${r.adc},${r.alertaGas ? 'True' : 'False'}`;
        })
        .filter(Boolean);

      if (fallbackRows.length > 0) {
        csv = `${csv}\n${fallbackRows.join('\n')}`;
      }
    }

    const suffix = nodeFilter ? `_${nodeFilter}` : '_zmg';
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sinaica${suffix}_minutos.csv"`,
      },
    });
  }

  const minuteFrames = getMinuteDatabase(240); // Últimas 4 horas (1 frame/min)

  if (init) {
    return json({
      config: IOT_CONFIG,
      nodes: ZMG_NODES,
      weeklyHistory: buildLast7DaysHistory(),
      snapshot,
      minuteFrames,
    });
  }

  return json({ snapshot, minuteFrames });
}