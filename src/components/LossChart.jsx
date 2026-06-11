import { motion } from 'framer-motion'; // Анимация появления графика и линии
import { useMemo } from 'react'; // Мемоизация расчёта пути SVG

export default function LossChart({ sseHistory }) { // График SSE (функции потерь) по итерациям
  const W = 320; // Ширина viewBox SVG
  const H = 120; // Высота viewBox SVG
  const PAD = { top: 12, right: 12, bottom: 28, left: 48 }; // Отступы области построения

  const chartW = W - PAD.left - PAD.right; // Ширина графика без полей
  const chartH = H - PAD.top - PAD.bottom; // Высота графика без полей

  const { path, dots, yTicks, xTicks, minY, maxY } = useMemo(() => { // Пересчёт геометрии при смене sseHistory
    if (sseHistory.length === 0) return { path: '', dots: [], yTicks: [], xTicks: [], minY: 0, maxY: 1 }; // Пустые данные

    const minY = Math.min(...sseHistory) * 0.95; // Нижняя граница оси Y с запасом 5%
    const maxY = Math.max(...sseHistory) * 1.05; // Верхняя граница оси Y
    const range = maxY - minY || 1; // Диапазон значений (минимум 1, чтобы не делить на 0)

    const sx = (i) => PAD.left + (i / Math.max(sseHistory.length - 1, 1)) * chartW; // X-координата точки i
    const sy = (v) => PAD.top + chartH - ((v - minY) / range) * chartH; // Y-координата значения v

    const dots = sseHistory.map((v, i) => ({ x: sx(i), y: sy(v), v })); // Массив точек {x,y,v}

    let path = ''; // SVG path для кривой
    if (dots.length === 1) {
      path = `M ${dots[0].x} ${dots[0].y}`; // Одна точка — только Move
    } else {
      path = dots.reduce((acc, d, i) => { // Сглаженная кривая Безье между точками
        if (i === 0) return `M ${d.x},${d.y}`;
        const prev = dots[i - 1];
        const cpx = (prev.x + d.x) / 2;
        return `${acc} C ${cpx},${prev.y} ${cpx},${d.y} ${d.x},${d.y}`;
      }, '');
    }

    const ySteps = 4; // Число делений по оси Y
    const yTicks = Array.from({ length: ySteps + 1 }, (_, i) => {
      const v = minY + (range * i) / ySteps;
      return { y: sy(v), label: formatSSE(v) };
    });

    const xTicks = sseHistory.length <= 8
      ? sseHistory.map((_, i) => ({ x: sx(i), label: String(i + 1) }))
      : [0, Math.floor((sseHistory.length - 1) / 2), sseHistory.length - 1].map((i) => ({
          x: sx(i),
          label: String(i + 1),
        }));

    return { path, dots, yTicks, xTicks, minY, maxY };
  }, [sseHistory]);

  const totalLength = useMemo(() => { // Длина для анимации pathLength (не используется напрямую в JSX)
    if (sseHistory.length < 2) return 0;
    return sseHistory.reduce((acc, _, i) => {
      if (i === 0) return 0;
      return acc + 50;
    }, 0);
  }, [sseHistory.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Функция потерь</h3>
          <p className="text-xs text-slate-500 mt-0.5">SSE по итерациям</p>
        </div>
        {sseHistory.length > 0 && (
          <div className="text-right">
            <div className="text-xs text-slate-500">Δ</div>
            <div className="text-xs font-mono font-semibold text-amber-400">
              {sseHistory.length > 1
                ? `−${formatSSE(sseHistory[0] - sseHistory[sseHistory.length - 1])}`
                : '—'}
            </div>
          </div>
        )}
      </div>

      {sseHistory.length === 0 ? (
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ height: H, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)' }}
        >
          <p className="text-xs text-slate-600">Запустите алгоритм</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
            {yTicks.map((t, i) => (
              <g key={i}>
                <line
                  x1={PAD.left}
                  y1={t.y}
                  x2={W - PAD.right}
                  y2={t.y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 6}
                  y={t.y + 4}
                  textAnchor="end"
                  fill="#475569"
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {t.label}
                </text>
              </g>
            ))}

            {xTicks.map((t, i) => (
              <text
                key={i}
                x={t.x}
                y={H - 8}
                textAnchor="middle"
                fill="#475569"
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
              >
                {t.label}
              </text>
            ))}

            <defs>
              <linearGradient id="sse-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>

            {sseHistory.length > 1 && (
              <path
                d={`${path} L ${dots[dots.length - 1].x},${PAD.top + chartH} L ${dots[0].x},${PAD.top + chartH} Z`}
                fill="url(#sse-fill)"
              />
            )}

            {path && (
              <motion.path
                d={path}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.5))' }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            )}

            {dots.map((d, i) => (
              <motion.circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={i === dots.length - 1 ? 4 : 2.5}
                fill={i === dots.length - 1 ? '#f59e0b' : '#d97706'}
                stroke={i === dots.length - 1 ? '#fde68a' : 'none'}
                strokeWidth="1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                style={
                  i === dots.length - 1
                    ? { filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.8))' }
                    : {}
                }
              />
            ))}

            <line
              x1={PAD.left}
              y1={PAD.top}
              x2={PAD.left}
              y2={PAD.top + chartH}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
            <line
              x1={PAD.left}
              y1={PAD.top + chartH}
              x2={W - PAD.right}
              y2={PAD.top + chartH}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          </svg>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ background: '#f59e0b' }} />
          <span className="text-xs text-slate-600">SSE</span>
        </div>
        {sseHistory.length > 0 && (
          <span className="text-xs font-mono text-slate-500">{sseHistory.length} итер.</span>
        )}
      </div>
    </motion.div>
  );
}

function formatSSE(v) { // Форматирование больших чисел SSE для подписей оси
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toFixed(0);
}
