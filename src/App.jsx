import { useEffect } from 'react'; // Хук для побочных эффектов при монтировании
import { motion } from 'framer-motion'; // Компоненты анимации Framer Motion
import Header from './components/Header'; // Шапка сайта
import VisualizationCanvas from './components/VisualizationCanvas'; // SVG-канвас с точками и центроидами
import ControlPanel from './components/ControlPanel'; // Панель управления параметрами
import StepCard from './components/StepCard'; // Карточка текущего шага алгоритма
import LossChart from './components/LossChart'; // График SSE
import TheorySection from './components/TheorySection'; // Блок теории K-Means
import { useKMeans } from './hooks/useKMeans'; // Хук с логикой кластеризации

const CANVAS_W = 800; // Логическая ширина области визуализации (пиксели)
const CANVAS_H = 560; // Логическая высота области визуализации

export default function App() { // Корневой компонент приложения
  const kmeans = useKMeans(CANVAS_W, CANVAS_H); // Состояние и методы K-Means

  useEffect(() => { // При первом монтировании генерируем начальные точки
    kmeans.generatePoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Пустой массив deps — только mount

  return (
    <div className="min-h-screen" style={{ background: '#050508' }}> {/* Корневой контейнер на тёмном фоне */}
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden"> {/* Декоративные градиенты без кликов */}
        <div style={{ position: 'absolute', top: '-20%', left: '10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)' }} /> {/* Фиолетовое пятно сверху */}
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)' }} /> {/* Пятно справа снизу */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', width: '800px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.03) 0%, transparent 70%)', transform: 'translateX(-50%)' }} /> {/* Голубое пятно по центру */}
      </div>

      <Header /> {/* Верхняя навигация и логотип */}

      <main className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6"> {/* Основной контент с отступами */}
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} // Начальное состояние анимации: прозрачность 0, сдвиг вниз
          animate={{ opacity: 1, y: 0 }} // Конечное: полная видимость
          transition={{ duration: 0.5 }} // Длительность появления заголовка
          className="text-center pt-2 pb-4"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
            <span className="text-gradient">K-Means Clustering</span> {/* Градиентный заголовок */}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Интерактивная визуализация алгоритма кластеризации. Наблюдайте каждый шаг EM-алгоритма в реальном времени.
          </p>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-4 xl:gap-5"> {/* Трёхколоночная сетка на больших экранах */}
          {/* Controls */}
          <div className="order-2 lg:order-1"> {/* На мобильных панель ниже канваса */}
            <ControlPanel
              k={kmeans.k}
              setK={kmeans.setK}
              numPoints={kmeans.numPoints}
              setNumPoints={kmeans.setNumPoints}
              speed={kmeans.speed}
              setSpeed={kmeans.setSpeed}
              showDistances={kmeans.showDistances}
              setShowDistances={kmeans.setShowDistances}
              phase={kmeans.phase}
              isRunning={kmeans.isRunning}
              generatePoints={kmeans.generatePoints}
              start={kmeans.start}
              pause={kmeans.pause}
              reset={kmeans.reset}
              stepForward={kmeans.stepForward}
              points={kmeans.points}
            />
          </div>

          {/* Canvas */}
          <div className="order-1 lg:order-2"> {/* Канвас первым на мобильных */}
            <VisualizationCanvas
              points={kmeans.points}
              centroids={kmeans.centroids}
              prevCentroids={kmeans.prevCentroids}
              assignments={kmeans.assignments}
              phase={kmeans.phase}
              showDistances={kmeans.showDistances}
            />
          </div>

          {/* Info */}
          <div className="order-3 flex flex-col gap-4"> {/* Правая колонка: шаг и график */}
            <StepCard
              phase={kmeans.phase}
              iteration={kmeans.iteration}
              sseHistory={kmeans.sseHistory}
              assignments={kmeans.assignments}
              k={kmeans.k}
            />
            <LossChart sseHistory={kmeans.sseHistory} />
          </div>
        </div>

        {/* Theory */}
        <TheorySection /> {/* Секция с теорией и вкладками */}

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center py-6 border-t border-white/5"
        >
          <p className="text-xs text-slate-600">
            K-Means Visualizer — Interactive ML Platform &bull; Built with React + Framer Motion + Tailwind CSS
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
