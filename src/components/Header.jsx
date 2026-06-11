import { motion } from 'framer-motion'; // Анимированные обёртки для появления элементов

export default function Header() { // Компонент шапки приложения
  return (
    <header className="relative z-10 border-b border-white/5"> {/* Шапка поверх фона с нижней границей */}
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between"> {/* Контейнер: логотип слева, теги справа */}
        {/* Logo + Title */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }} // Появление слева
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-9 h-9"> {/* Иконка приложения */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 opacity-80" /> {/* Градиентный фон иконки */}
            <div className="absolute inset-0 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"> {/* SVG: точки и связи кластеров */}
                <circle cx="6" cy="6" r="2.5" fill="white" opacity="0.9" />
                <circle cx="14" cy="5" r="2.5" fill="white" opacity="0.9" />
                <circle cx="10" cy="14" r="2.5" fill="white" opacity="0.9" />
                <circle cx="4" cy="13" r="1.5" fill="white" opacity="0.5" />
                <circle cx="16" cy="13" r="1.5" fill="white" opacity="0.5" />
                <circle cx="10" cy="7" r="1.5" fill="white" opacity="0.5" />
                <line x1="6" y1="6" x2="14" y2="5" stroke="white" strokeWidth="0.8" opacity="0.4" />
                <line x1="6" y1="6" x2="10" y2="14" stroke="white" strokeWidth="0.8" opacity="0.4" />
                <line x1="14" y1="5" x2="10" y2="14" stroke="white" strokeWidth="0.8" opacity="0.4" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none">K-Means Visualizer</h1>
            <p className="text-xs text-slate-500 mt-0.5">Interactive ML Platform</p>
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div
          className="hidden sm:flex items-center gap-2" // Скрыто на очень узких экранах
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {['Machine Learning', 'Clustering', 'Interactive'].map((tag) => ( // Три тематических бейджа
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </header>
  );
}
