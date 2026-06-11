import js from '@eslint/js' // Базовые рекомендуемые правила ESLint для JavaScript
import globals from 'globals' // Предустановленные глобальные переменные (browser, node и т.д.)
import reactHooks from 'eslint-plugin-react-hooks' // Правила для корректного использования хуков React
import reactRefresh from 'eslint-plugin-react-refresh' // Правила совместимости с Vite Fast Refresh
import { defineConfig, globalIgnores } from 'eslint/config' // API плоской конфигурации ESLint 9+

export default defineConfig([ // Экспорт массива конфигураций ESLint
  globalIgnores(['dist']), // Игнорировать папку сборки dist при линтинге
  {
    files: ['**/*.{js,jsx}'], // Применять правила ко всем JS/JSX в проекте
    extends: [ // Наследуемые конфигурации
      js.configs.recommended, // Стандартные правила качества JS
      reactHooks.configs.flat.recommended, // Правила hooks (deps, условные вызовы)
      reactRefresh.configs.vite, // Запрет экспорта не-компонентов из модулей с Fast Refresh
    ],
    languageOptions: { // Настройки языка и окружения
      globals: globals.browser, // Разрешить window, document и другие browser globals
      parserOptions: { ecmaFeatures: { jsx: true } }, // Включить разбор JSX
    },
  },
])
