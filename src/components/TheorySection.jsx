import { motion } from 'framer-motion'; // Анимация секции и смены вкладок
import { useState } from 'react'; // Состояние активной вкладки теории

const SECTIONS = [ // Массив вкладок с контентом (JSX)
  {
    id: 'what',
    title: 'Что такое K-Means?',
    icon: '🎯',
    content: (
      <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
        <p>
          <strong className="text-slate-200">K-Means</strong> — один из наиболее популярных алгоритмов кластеризации в машинном
          обучении. Его цель — разбить набор данных из <em>n</em> объектов на <em>K</em> непересекающихся
          кластеров, минимизируя суммарное квадратичное отклонение (SSE).
        </p>
        <p>
          Алгоритм относится к методам <strong className="text-slate-200">обучения без учителя</strong> (unsupervised learning)
          и широко применяется в анализе данных, компьютерном зрении, рекомендательных системах и биоинформатике.
        </p>
      </div>
    ),
  },
  {
    id: 'algorithm',
    title: 'Алгоритм пошагово',
    icon: '⚡',
    content: (
      <div className="space-y-3">
        {[
          {
            step: '1',
            title: 'Инициализация',
            desc: 'Выбрать K начальных центроидов. В реализации K-Means++ первый центроид выбирается случайно, каждый следующий — с вероятностью пропорциональной D(x)² — квадрату расстояния до ближайшего уже выбранного центроида.',
            color: '#f59e0b',
          },
          {
            step: 'E',
            title: 'E-шаг: Назначение',
            desc: 'Каждая точка xᵢ назначается ближайшему центроиду μₖ по Евклидовому расстоянию: cᵢ = argmin_k ||xᵢ − μₖ||²',
            color: '#22d3ee',
          },
          {
            step: 'M',
            title: 'M-шаг: Обновление',
            desc: 'Каждый центроид μₖ обновляется как среднее всех точек своего кластера: μₖ = (1/|Sₖ|) × Σ xᵢ, xᵢ ∈ Sₖ',
            color: '#a78bfa',
          },
          {
            step: '✓',
            title: 'Проверка сходимости',
            desc: 'Если центроиды практически не изменились (||μₖ_new − μₖ_old|| < ε) — алгоритм завершён. Иначе повторяем с E-шага.',
            color: '#34d399',
          },
        ].map((s) => (
          <div key={s.step} className="flex gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs"
              style={{ background: `${s.color}18`, border: `1px solid ${s.color}30`, color: s.color }}
            >
              {s.step}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200 mb-0.5">{s.title}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'math',
    title: 'Математика',
    icon: '∑',
    content: (
      <div className="space-y-4">
        <div className="formula-box">
          <div className="text-xs text-indigo-400 font-semibold mb-2">Целевая функция (SSE / Inertia)</div>
          <div className="text-slate-200 text-sm">{'J = Σₖ₌₁ᴷ Σ_{xᵢ∈Sₖ} ‖xᵢ − μₖ‖²'}</div>
          <div className="text-slate-500 text-xs mt-2">
            Задача: найти разбиение S₁, ..., Sₖ, минимизирующее J
          </div>
        </div>
        <div className="formula-box">
          <div className="text-xs text-cyan-400 font-semibold mb-2">Евклидово расстояние</div>
          <div className="text-slate-200 text-sm">d(x, μ) = √(Σᵢ (xᵢ − μᵢ)²)</div>
        </div>
        <div className="formula-box">
          <div className="text-xs text-violet-400 font-semibold mb-2">Обновление центроида</div>
          <div className="text-slate-200 text-sm">{'μₖ = (1 / |Sₖ|) × Σ_{xᵢ∈Sₖ} xᵢ'}</div>
          <div className="text-slate-500 text-xs mt-2">
            Среднее арифметическое — единственная точка, минимизирующая SSE внутри кластера
          </div>
        </div>
        <div className="formula-box">
          <div className="text-xs text-emerald-400 font-semibold mb-2">Условие сходимости</div>
          <div className="text-slate-200 text-sm">‖μₖ_new − μₖ_old‖₂ &lt; ε, ∀k</div>
        </div>
      </div>
    ),
  },
  {
    id: 'complexity',
    title: 'Сложность и ограничения',
    icon: '⚠',
    content: (
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Временная сложность', value: 'O(n·K·d·i)', desc: 'n — точки, K — кластеры, d — размерность, i — итерации', color: '#22d3ee' },
            { label: 'Пространство', value: 'O(n + K)', desc: 'Хранение точек и центроидов', color: '#a78bfa' },
            { label: 'Сходимость', value: 'Гарантирована', desc: 'SSE монотонно убывает, алгоритм всегда завершается', color: '#34d399' },
            { label: 'Оптимальность', value: 'Локальный min', desc: 'Результат зависит от инициализации', color: '#f59e0b' },
          ].map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-xl"
              style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}
            >
              <div className="text-xs text-slate-500 mb-1">{item.label}</div>
              <div className="font-mono text-sm font-semibold" style={{ color: item.color }}>{item.value}</div>
              <div className="text-xs text-slate-600 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
        <div
          className="p-3 rounded-xl text-xs text-slate-400 leading-relaxed"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <strong className="text-red-400">Ограничения:</strong> K-Means чувствителен к выбросам, предполагает сферическую форму кластеров
          и может застрять в локальном минимуме. Для преодоления запускают несколько раз с разной инициализацией или используют K-Means++.
        </div>
      </div>
    ),
  },
];

export default function TheorySection() { // Нижняя секция «Теория» с вкладками
  const [activeSection, setActiveSection] = useState('algorithm'); // id активной вкладки

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          📚
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Теория K-Means</h2>
          <p className="text-xs text-slate-500 mt-0.5">Математические основы алгоритма</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background: activeSection === s.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeSection === s.id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`,
              color: activeSection === s.id ? '#a5b4fc' : '#64748b',
            }}
          >
            <span>{s.icon}</span>
            {s.title}
          </button>
        ))}
      </div>

      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {SECTIONS.find((s) => s.id === activeSection)?.content}
      </motion.div>
    </motion.section>
  );
}
