/** @type {import('tailwindcss').Config} */ // JSDoc-подсказка типа конфигурации Tailwind для IDE
export default { // Экспорт настроек Tailwind CSS
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'], // Пути к файлам, где искать className для purge/generate
  theme: { // Расширение темы по умолчанию
    extend: { // Дополнительные токены поверх базовой темы Tailwind
      fontFamily: { // Кастомные семейства шрифтов
        sans: ['Inter', 'system-ui', 'sans-serif'], // Основной UI-шрифт
        mono: ['JetBrains Mono', 'monospace'], // Моноширинный шрифт для формул и чисел
      },
      animation: { // Именованные анимации
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', // Медленная пульсация
        'float': 'float 6s ease-in-out infinite', // Плавное «парение» элемента
      },
      keyframes: { // Ключевые кадры для кастомных animation
        float: { // Определение анимации float
          '0%, 100%': { transform: 'translateY(0)' }, // Начало и конец — без смещения по Y
          '50%': { transform: 'translateY(-8px)' }, // Середина — подъём на 8px
        },
      },
    },
  },
  plugins: [], // Дополнительные плагины Tailwind (не используются)
};
