import { motion } from 'framer-motion'; // Анимация появления панели
import { Play, Pause, RotateCcw, Shuffle, SkipForward, Eye, EyeOff } from 'lucide-react'; // Иконки кнопок
import { PHASE } from '../hooks/useKMeans'; // Константы фаз для disabled/лейблов
import { CLUSTER_COLORS } from '../utils/colors'; // Цвета для превью кластеров

function SliderRow({ label, value, min, max, step = 1, onChange, format }) { // Переиспользуемый слайдер с подписью
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-slate-400">{label}</span> {/* Название параметра */}
        <span
          className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md"
          style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}
        >
          {format ? format(value) : value} {/* Текущее значение (с форматированием или без) */}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))} // Преобразование строки в число
        className="slider-custom"
      />
    </div>
  );
}

export default function ControlPanel({
  k, setK,
  numPoints, setNumPoints,
  speed, setSpeed,
  showDistances, setShowDistances,
  phase, isRunning,
  generatePoints, start, pause, reset, stepForward,
  points,
}) {
  const canStart = points.length > 0 && phase !== PHASE.CONVERGED; // Start доступен если есть точки и не converged
  const canStep = points.length > 0; // Step доступен при наличии точек
  const isActive = phase !== PHASE.IDLE && phase !== PHASE.CONVERGED; // Алгоритм «в процессе»

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card p-5 flex flex-col gap-5"
    >
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-white">Параметры</h2>
        <p className="text-xs text-slate-500 mt-0.5">Настройте алгоритм</p>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        <SliderRow
          label="Количество кластеров (K)"
          value={k}
          min={2}
          max={8}
          onChange={(v) => { setK(v); }} // Изменение K
        />

        {/* Cluster color preview */}
        <div className="flex gap-1.5">
          {CLUSTER_COLORS.slice(0, k).map((c, i) => ( // Кружки цветов для текущего K
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 rounded-full"
              style={{ background: c.fill, boxShadow: `0 0 8px ${c.glow}` }}
            />
          ))}
        </div>

        <SliderRow
          label="Количество точек"
          value={numPoints}
          min={20}
          max={200}
          step={10}
          onChange={setNumPoints}
        />

        <SliderRow
          label="Скорость анимации"
          value={speed}
          min={0.5}
          max={5}
          step={0.5}
          onChange={setSpeed}
          format={(v) => `${v}x`}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Action buttons */}
      <div className="space-y-2.5">
        <button
          onClick={generatePoints}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Shuffle size={14} />
          Generate Points
        </button>

        <button
          onClick={isRunning ? pause : start} // Переключение Start/Pause
          disabled={!canStart && !isRunning}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
          {isRunning ? 'Pause' : phase === PHASE.CONVERGED ? 'Restart' : 'Start'}
        </button>

        <div className="flex gap-2">
          <button
            onClick={stepForward}
            disabled={!canStep || isRunning} // Step недоступен во время автозапуска
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <SkipForward size={14} />
            Step
          </button>
          <button
            onClick={reset}
            disabled={phase === PHASE.IDLE && points.length === 0}
            className="btn-danger flex-1 flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      <div className="border-t border-white/5" />

      <div className="space-y-2">
        <button
          onClick={() => setShowDistances(!showDistances)} // Переключатель линий расстояний
          disabled={!isActive}
          className="btn-secondary w-full flex items-center justify-center gap-2 text-xs"
        >
          {showDistances ? <EyeOff size={13} /> : <Eye size={13} />}
          {showDistances ? 'Скрыть расстояния' : 'Показать расстояния'}
        </button>
      </div>

      <div
        className="rounded-xl p-3 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center justify-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${isRunning ? 'animate-pulse' : ''}`}
            style={{
              background: isRunning
                ? '#22d3ee'
                : phase === PHASE.CONVERGED
                ? '#34d399'
                : '#475569',
              boxShadow: isRunning ? '0 0 8px rgba(34,211,238,0.6)' : 'none',
            }}
          />
          <span className="text-xs text-slate-400">
            {isRunning
              ? 'Выполняется...'
              : phase === PHASE.CONVERGED
              ? 'Завершено'
              : points.length === 0
              ? 'Нет данных'
              : 'Остановлено'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
