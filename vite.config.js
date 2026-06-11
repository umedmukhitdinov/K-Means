import { defineConfig } from 'vite' // Импорт функции конфигурации сборщика Vite
import react from '@vitejs/plugin-react' // Импорт плагина для поддержки JSX и Fast Refresh в React

// https://vite.dev/config/
export default defineConfig({ // Экспорт конфигурации Vite по умолчанию
  plugins: [react()], // Подключение плагина React для трансформации .jsx и HMR
})
