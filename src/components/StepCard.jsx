import { motion, AnimatePresence } from 'framer-motion'; // Анимация смены фаз и чисел SSE
import { PHASE, STEP_INFO } from '../hooks/useKMeans'; // Константы фаз и тексты подсказок
import { CLUSTER_COLORS } from '../utils/colors'; // Цвета для полос размера кластеров

const PHASE_FORMULAS = { // Формулы, показываемые в карточке по фазе
  [PHASE.IDLE]: null, // В режиме ожидания формул нет
  [PHASE.INITIALIZED]: {
    title: 'K-Means++ инициализация',
    formula: [
      'P(xᵢ выбран) ∝ D(xᵢ)²',
      'D(xᵢ) = min_c ||xᵢ - c||₂',
    ],
  },
  [PHASE.ASSIGN]: {
    title: 'Назначение точек',
    formula: [
      'cᵢ = argmin_k ||xᵢ - μₖ||₂²',
      '     k ∈ {1, ..., K}',
    ],
  },
  [PHASE.UPDATE]: {
    title: 'Пересчёт центроидов',
    formula: [
      'μₖ = (1/|Sₖ|) Σ xᵢ',
      '      xᵢ ∈ Sₖ',
    ],
  },
  [PHASE.CONVERGED]: {
    title: 'Целевая функция (SSE)',
    formula: [
      'J = Σₖ Σ_{xᵢ∈Sₖ} ||xᵢ - μₖ||₂²',
      'J → min (локальный минимум)',
    ],
  },
};

const PHASE_STEPS = { // Чеклист шагов алгоритма для каждой фазы
  [PHASE.IDLE]: [
    { text: 'Генерация точек', done: false, active: false },
    { text: 'Инициализация центроидов', done: false, active: false },
    { text: 'E-шаг: назначение', done: false, active: false },
    { text: 'M-шаг: пересчёт', done: false, active: false },
    { text: 'Проверка сходимости', done: false, active: false },
  ],
  [PHASE.INITIALIZED]: [
    { text: 'Генерация точек', done: true, active: false },
    { text: 'Инициализация центроидов', done: false, active: true },
    { text: 'E-шаг: назначение', done: false, active: false },
    { text: 'M-шаг: пересчёт', done: false, active: false },
    { text: 'Проверка сходимости', done: false, active: false },
  ],
  [PHASE.ASSIGN]: [
    { text: 'Генерация точек', done: true, active: false },
    { text: 'Инициализация центроидов', done: true, active: false },
    { text: 'E-шаг: назначение', done: false, active: true },
    { text: 'M-шаг: пересчёт', done: false, active: false },
    { text: 'Проверка сходимости', done: false, active: false },
  ],
  [PHASE.UPDATE]: [
    { text: 'Генерация точек', done: true, active: false },
    { text: 'Инициализация центроидов', done: true, active: false },
    { text: 'E-шаг: назначение', done: true, active: false },
    { text: 'M-шаг: пересчёт', done: false, active: true },
    { text: 'Проверка сходимости', done: false, active: false },
  ],
  [PHASE.CONVERGED]: [
    { text: 'Генерация точек', done: true, active: false },
    { text: 'Инициализация центроидов', done: true, active: false },
    { text: 'E-шаг: назначение', done: true, active: false },
    { text: 'M-шаг: пересчёт', done: true, active: false },
    { text: 'Проверка сходимости', done: true, active: false },
  ],
};

export default function StepCard({ phase, iteration, sseHistory, assignments, k }) { // Карточка текущего шага справа
  const info = STEP_INFO[phase]; // Заголовок, описание и badge для фазы
  const formula = PHASE_FORMULAS[phase]; // Математические формулы для фазы
  const steps = PHASE_STEPS[phase] || PHASE_STEPS[PHASE.IDLE]; // Список шагов с галочками
  const currentSSE = sseHistory.length > 0 ? sseHistory[sseHistory.length - 1] : null; // Последнее значение SSE

  const clusterSizes = Array.from({ length: k }, (_, i) => // Размер каждого кластера
    assignments.filter((a) => a === i).length
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card p-5 flex flex-col gap-4"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold"
              style={{
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.2)',
                color: '#a5b4fc',
              }}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  phase === PHASE.CONVERGED ? 'bg-emerald-400' : 'bg-indigo-400'
                }`}
              />
              {info.badge}
            </motion.span>
          </AnimatePresence>
          {iteration > 0 && (
            <span
              className="text-xs font-mono px-2 py-0.5 rounded-md"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#64748b',
              }}
            >
              iter {iteration}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className={`text-sm font-semibold mb-1 ${info.color}`}>{info.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{info.desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="space-y-1.5">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: step.done
                  ? 'rgba(52,211,153,0.15)'
                  : step.active
                  ? 'rgba(99,102,241,0.15)'
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${
                  step.done
                    ? 'rgba(52,211,153,0.3)'
                    : step.active
                    ? 'rgba(99,102,241,0.3)'
                    : 'rgba(255,255,255,0.07)'
                }`,
              }}
            >
              {step.done ? (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4L3 5.5L6.5 2.5" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : step.active ? (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              )}
            </div>
            <span
              className="text-xs"
              style={{
                color: step.active ? '#e2e8f0' : step.done ? '#64748b' : '#334155',
                fontWeight: step.active ? 600 : 400,
              }}
            >
              {step.text}
            </span>
          </div>
        ))}
      </div>

      {formula && (
        <div className="formula-box">
          <div className="text-xs text-indigo-400 font-semibold mb-2">{formula.title}</div>
          {formula.formula.map((line, i) => (
            <div key={i} className="text-slate-300 text-xs leading-relaxed">{line}</div>
          ))}
        </div>
      )}

      {currentSSE !== null && (
        <div
          className="rounded-xl p-3 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="text-xs text-slate-500">SSE (Loss)</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentSSE.toFixed(0)}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-mono font-semibold text-amber-400"
            >
              {currentSSE.toFixed(0)}
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      {assignments.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs text-slate-600 font-medium">Размер кластеров</span>
          <div className="space-y-1">
            {clusterSizes.map((size, i) => {
              const color = CLUSTER_COLORS[i % CLUSTER_COLORS.length];
              const pct = assignments.length > 0 ? (size / assignments.length) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: color.fill, boxShadow: `0 0 5px ${color.glow}` }}
                  />
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color.fill, opacity: 0.7 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-500 w-6 text-right">{size}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
