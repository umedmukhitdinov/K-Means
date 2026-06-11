import { StrictMode } from 'react' // Импорт StrictMode для строгих проверок React в разработке
import { createRoot } from 'react-dom/client' // Импорт createRoot для монтирования приложения в React 18+
import './index.css' // Подключение глобальных стилей Tailwind и кастомных классов
import App from './App.jsx' // Импорт корневого компонента приложения

createRoot(document.getElementById('root')).render( // Создание корня React и рендер в элемент #root из index.html
  <StrictMode> {/* Обёртка StrictMode: двойной вызов эффектов в dev для поиска побочных эффектов */}
    <App /> {/* Отрисовка главного компонента K-Means Visualizer */}
  </StrictMode>,
)
