import { useRef, useEffect, useState } from 'react'; // Ref контейнера, эффект ResizeObserver, размеры canvas
import { motion, AnimatePresence } from 'framer-motion'; // Анимация точек, центроидов и линий
import { PHASE } from '../hooks/useKMeans'; // Фазы для showLines / showArrows
import { getColor, UNASSIGNED } from '../utils/colors'; // Палитра кластеров
import { euclideanDistance } from '../utils/kmeans'; // Импортирован, в файле не вызывается

const W = 800; // Логическая ширина (как в App)
const H = 560; // Логическая высота

function DiamondShape({ cx, cy, r, color, label, isNew }) { // Альтернативный ромб (не используется в export)
  const size = r;
  const pts = `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`;
  return (
    <g>
      <motion.polygon
        points={pts}
        fill="none"
        stroke={color.fill}
        strokeWidth="8"
        opacity={0.15}
        animate={{ opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <polygon points={pts} fill={color.bg} stroke={color.stroke} strokeWidth="1.5" opacity={0.4} />
      <motion.polygon
        points={pts}
        fill={color.fill}
        stroke={color.stroke}
        strokeWidth="1.5"
        initial={isNew ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        style={{ filter: `drop-shadow(0 0 8px ${color.glow})` }}
      />
      <text
        x={cx}
        y={cy - size - 8}
        textAnchor="middle"
        fill={color.fill}
        fontSize="11"
        fontWeight="700"
        fontFamily="Inter, system-ui, sans-serif"
        style={{ userSelect: 'none' }}
      >
        C{label + 1}
      </text>
    </g>
  );
}

function MovementArrow({ from, to, color }) { // Стрелка от старого к новому положению центроида
  if (!from || !to) return null;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return null;

  const angle = Math.atan2(dy, dx);
  const arrowLen = 8;
  const arrowAngle = 0.4;

  const tip = { x: to.x, y: to.y };
  const a1 = {
    x: tip.x - arrowLen * Math.cos(angle - arrowAngle),
    y: tip.y - arrowLen * Math.sin(angle - arrowAngle),
  };
  const a2 = {
    x: tip.x - arrowLen * Math.cos(angle + arrowAngle),
    y: tip.y - arrowLen * Math.sin(angle + arrowAngle),
  };

  return (
    <g>
      <motion.line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={color.fill}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity={0.7}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
      <polygon
        points={`${tip.x},${tip.y} ${a1.x},${a1.y} ${a2.x},${a2.y}`}
        fill={color.fill}
        opacity={0.8}
      />
    </g>
  );
}

export default function VisualizationCanvas({
  points, centroids, prevCentroids, assignments,
  phase, showDistances,
}) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: W, h: H });

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width } = entry.contentRect;
        setDims({ w: width, h: Math.round(width * (H / W)) });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const scaleX = dims.w / W;
  const scaleY = dims.h / H;

  const sx = (x) => x * scaleX;
  const sy = (y) => y * scaleY;

  const showLines = showDistances && (phase === PHASE.ASSIGN || phase === PHASE.INITIALIZED);
  const showArrows = phase === PHASE.UPDATE;

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        aspectRatio: `${W}/${H}`,
      }}
    >
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.15,
        }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          </pattern>
          <pattern id="grid-large" width="120" height="120" patternUnits="userSpaceOnUse">
            <rect width="120" height="120" fill="url(#grid)" />
            <path d="M 120 0 L 0 0 0 120" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-large)" />
      </svg>

      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox={`0 0 ${dims.w} ${dims.h}`}
      >
        <defs>
          {Array.from({ length: 8 }, (_, i) => {
            const c = getColor(i);
            return (
              <radialGradient key={i} id={`cluster-grad-${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={c.fill} stopOpacity="0.12" />
                <stop offset="100%" stopColor={c.fill} stopOpacity="0" />
              </radialGradient>
            );
          })}
        </defs>

        {centroids.map((c, i) => (
          <motion.circle
            key={`zone-${i}`}
            cx={sx(c.x)}
            cy={sy(c.y)}
            r={Math.min(dims.w, dims.h) * 0.22}
            fill={`url(#cluster-grad-${i})`}
            animate={{ cx: sx(c.x), cy: sy(c.y) }}
            transition={{ type: 'spring', stiffness: 60, damping: 20 }}
          />
        ))}

        <AnimatePresence>
          {showLines &&
            points.map((p, i) => {
              const cIdx = assignments[i] ?? -1;
              const centroid = cIdx >= 0 ? centroids[cIdx] : null;
              if (!centroid) return null;
              const color = getColor(cIdx);
              return (
                <motion.line
                  key={`line-${p.id}`}
                  x1={sx(p.x)}
                  y1={sy(p.y)}
                  x2={sx(centroid.x)}
                  y2={sy(centroid.y)}
                  stroke={color.fill}
                  strokeWidth="0.6"
                  opacity={0}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}
        </AnimatePresence>

        {showArrows &&
          centroids.map((c, i) => (
            <MovementArrow
              key={`arrow-${i}`}
              from={prevCentroids[i] ? { x: sx(prevCentroids[i].x), y: sy(prevCentroids[i].y) } : null}
              to={{ x: sx(c.x), y: sy(c.y) }}
              color={getColor(i)}
            />
          ))}

        {points.map((p, i) => {
          const cIdx = assignments.length > 0 ? assignments[i] : -1;
          const color = cIdx >= 0 ? getColor(cIdx) : UNASSIGNED;
          const isAssigned = cIdx >= 0;

          return (
            <motion.circle
              key={`pt-${p.id}`}
              r={4}
              cx={sx(p.x)}
              cy={sy(p.y)}
              fill={color.fill}
              stroke={color.stroke}
              strokeWidth="0.8"
              animate={{
                fill: color.fill,
                stroke: color.stroke,
                r: isAssigned ? 4.5 : 4,
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 3px ${color.glow})` }}
            />
          );
        })}

        {showArrows &&
          prevCentroids.map((c, i) => {
            if (!c) return null;
            const color = getColor(i);
            const size = 10;
            const cx = sx(c.x);
            const cy = sy(c.y);
            const pts = `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`;
            return (
              <polygon
                key={`ghost-${i}`}
                points={pts}
                fill="none"
                stroke={color.fill}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity={0.35}
              />
            );
          })}

        {centroids.map((c, i) => (
          <motion.g
            key={`centroid-${i}`}
            animate={{ x: sx(c.x) - sx(c.x), y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          >
            <AnimatedCentroid
              cx={sx(c.x)}
              cy={sy(c.y)}
              color={getColor(i)}
              label={i}
              dims={dims}
            />
          </motion.g>
        ))}
      </svg>

      {points.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="10" cy="10" r="3" fill="#475569" />
              <circle cx="22" cy="8" r="3" fill="#475569" />
              <circle cx="16" cy="22" r="3" fill="#475569" />
              <circle cx="6" cy="20" r="2" fill="#334155" />
              <circle cx="26" cy="20" r="2" fill="#334155" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-sm font-medium">Нет данных</p>
            <p className="text-slate-600 text-xs mt-1">Нажмите &ldquo;Generate Points&rdquo;</p>
          </div>
        </div>
      )}

      {phase === PHASE.CONVERGED && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400"
          style={{
            background: 'rgba(52, 211, 153, 0.1)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Converged
        </motion.div>
      )}
    </motion.div>
  );
}

function AnimatedCentroid({ cx, cy, color, label, dims }) {
  const size = Math.min(dims.w, dims.h) * 0.022;
  const pts = `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`;

  return (
    <g>
      <motion.polygon
        points={pts}
        fill="none"
        stroke={color.fill}
        strokeWidth={size * 0.7}
        opacity={0.1}
        animate={{ opacity: [0.08, 0.2, 0.08], scale: [1, 1.15, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      <polygon points={pts} fill={color.bg} />
      <motion.polygon
        points={pts}
        fill={color.fill}
        stroke={color.stroke}
        strokeWidth="1.5"
        animate={{ points: pts }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        style={{ filter: `drop-shadow(0 0 ${size}px ${color.glow})` }}
      />
      <text
        x={cx}
        y={cy - size - 7}
        textAnchor="middle"
        fill={color.fill}
        fontSize={Math.max(10, size * 0.85)}
        fontWeight="700"
        fontFamily="Inter, system-ui, sans-serif"
        style={{ userSelect: 'none' }}
      >
        C{label + 1}
      </text>
    </g>
  );
}
