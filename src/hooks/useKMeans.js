import { useState, useCallback, useEffect, useRef } from 'react'; // Хуки React для состояния, мемоизации и ref
import {
  generateRandomPoints, // Генерация случайных точек на canvas
  initializeCentroids, // K-Means++ инициализация
  assignPoints, // E-шаг
  updateCentroids, // M-шаг
  calculateSSE, // Расчёт функции потерь
  hasConverged, // Проверка сходимости
} from '../utils/kmeans';

export const PHASE = { // Константы фаз алгоритма для UI и таймера
  IDLE: 'idle', // Ожидание: точки есть, кластеризация не запущена
  INITIALIZED: 'initialized', // Центроиды инициализированы (используется косвенно через ASSIGN)
  ASSIGN: 'assign', // E-шаг: назначение точек кластерам
  UPDATE: 'update', // M-шаг: обновление центроидов
  CONVERGED: 'converged', // Алгоритм сошёлся
};

export const STEP_INFO = { // Тексты подсказок для карточки шага по каждой фазе
  [PHASE.IDLE]: {
    title: 'Готов к работе',
    desc: 'Сгенерируйте точки и нажмите Start, чтобы начать пошаговую визуализацию алгоритма K-Means.',
    color: 'text-slate-400',
    badge: 'Ожидание',
  },
  [PHASE.INITIALIZED]: {
    title: 'Инициализация (K-Means++)',
    desc: 'Начальные центроиды размещены с помощью алгоритма K-Means++. Первый центроид выбирается случайно, каждый следующий — пропорционально квадрату расстояния до ближайшего.',
    color: 'text-amber-400',
    badge: 'Шаг 0',
  },
  [PHASE.ASSIGN]: {
    title: 'E-шаг: Назначение точек',
    desc: 'Каждая точка назначается ближайшему центроиду по Евклидову расстоянию. Точки окрашиваются в цвет своего кластера.',
    color: 'text-cyan-400',
    badge: 'E-шаг',
  },
  [PHASE.UPDATE]: {
    title: 'M-шаг: Пересчёт центроидов',
    desc: 'Каждый центроид перемещается в геометрический центр (среднее арифметическое) всех точек своего кластера. Стрелки показывают направление движения.',
    color: 'text-violet-400',
    badge: 'M-шаг',
  },
  [PHASE.CONVERGED]: {
    title: 'Алгоритм сошёлся!',
    desc: 'Центроиды перестали значительно перемещаться — алгоритм достиг локального минимума функции потерь SSE. Кластеризация завершена.',
    color: 'text-emerald-400',
    badge: 'Готово',
  },
};

export function useKMeans(canvasWidth, canvasHeight) { // Кастомный хук — вся логика K-Means и UI-состояние
  const [k, setK] = useState(3); // Число кластеров K
  const [numPoints, setNumPoints] = useState(80); // Количество генерируемых точек
  const [speed, setSpeed] = useState(1.5); // Множитель скорости анимации
  const [showDistances, setShowDistances] = useState(false); // Показывать ли линии до центроидов

  const [phase, setPhase] = useState(PHASE.IDLE); // Текущая фаза алгоритма
  const [iteration, setIteration] = useState(0); // Номер итерации (счётчик циклов E/M)
  const [points, setPoints] = useState([]); // Массив точек {id, x, y}
  const [centroids, setCentroids] = useState([]); // Текущие центроиды
  const [prevCentroids, setPrevCentroids] = useState([]); // Предыдущие центроиды (для стрелок)
  const [assignments, setAssignments] = useState([]); // Назначения точек по кластерам
  const [sseHistory, setSseHistory] = useState([]); // История SSE для графика
  const [isRunning, setIsRunning] = useState(false); // Флаг автоматического проигрывания

  const kRef = useRef(k); // Ref для актуального k внутри таймера (избегаем stale closure)
  useEffect(() => { kRef.current = k; }, [k]); // Синхронизация ref при изменении k

  const generatePoints = useCallback(() => { // Перегенерация набора точек
    setIsRunning(false); // Останавливаем автозапуск
    const pts = generateRandomPoints(numPoints, canvasWidth, canvasHeight); // Новые точки
    setPoints(pts); // Сохраняем точки
    setCentroids([]); // Сбрасываем центроиды
    setPrevCentroids([]); // Сбрасываем предыдущие центроиды
    setAssignments([]); // Сбрасываем назначения
    setSseHistory([]); // Очищаем график SSE
    setIteration(0); // Сбрасываем счётчик итераций
    setPhase(PHASE.IDLE); // Возврат в режим ожидания
  }, [numPoints, canvasWidth, canvasHeight]); // Зависимости колбэка

  const reset = useCallback(() => { // Сброс кластеризации без удаления точек
    setIsRunning(false); // Стоп автопроигрывания
    setCentroids([]); // Удаляем центроиды
    setPrevCentroids([]);
    setAssignments([]);
    setSseHistory([]);
    setIteration(0);
    setPhase(points.length > 0 ? PHASE.IDLE : PHASE.IDLE); // IDLE если точки есть или нет
  }, [points.length]);

  const doInitialize = useCallback((currentPoints, currentK) => { // Первый запуск: K-Means++ и первый E-шаг
    const newCentroids = initializeCentroids(currentK, currentPoints); // Инициализация центроидов
    const newAssignments = assignPoints(currentPoints, newCentroids); // Назначение точек
    const sse = calculateSSE(currentPoints, newAssignments, newCentroids); // Начальный SSE

    setCentroids(newCentroids);
    setPrevCentroids(newCentroids); // Для первого кадра «предыдущие» = текущие
    setAssignments(newAssignments);
    setSseHistory([sse]); // Первая точка на графике
    setIteration(1); // Первая итерация
    setPhase(PHASE.ASSIGN); // Следующий автоматический шаг — M (из ASSIGN)
    return { newCentroids, newAssignments };
  }, []);

  const start = useCallback(() => { // Запуск или возобновление автопроигрывания
    if (points.length === 0) return; // Нет точек — выход

    if (phase === PHASE.IDLE || phase === PHASE.CONVERGED) { // Старт с нуля или рестарт после сходимости
      doInitialize(points, k);
    }
    setIsRunning(true); // Включаем таймер шагов
  }, [points, phase, k, doInitialize]);

  const pause = useCallback(() => { // Пауза автопроигрывания
    setIsRunning(false);
  }, []);

  // Auto-advance timer
  useEffect(() => { // Эффект автоматического перехода между фазами
    if (!isRunning) return; // Не работаем на паузе
    if (phase === PHASE.IDLE || phase === PHASE.CONVERGED) { // В терминальных фазах таймер не нужен
      setIsRunning(false);
      return;
    }

    const delay = Math.max(300, 1800 / speed); // Задержка между шагами (быстрее при большем speed)
    const timer = setTimeout(() => { // Отложенный переход на следующий шаг
      if (phase === PHASE.ASSIGN) { // После E-шага выполняем M-шаг
        // M-step: update centroids
        setPhase(prev => { // Обновление фазы внутри setState
          const newC = updateCentroids(points, assignments, kRef.current, centroids); // Новые центроиды
          const converged = hasConverged(centroids, newC); // Проверка сходимости
          setPrevCentroids([...centroids]); // Сохраняем старые для стрелок
          setCentroids(newC);
          return converged ? PHASE.CONVERGED : PHASE.UPDATE; // Следующая фаза
        });
      } else if (phase === PHASE.UPDATE) { // После M-шага — новый E-шаг
        // E-step: assign points
        const newAssign = assignPoints(points, centroids);
        const sse = calculateSSE(points, newAssign, centroids);
        setAssignments(newAssign);
        setSseHistory(prev => [...prev, sse]); // Добавляем точку на график
        setIteration(prev => prev + 1);
        setPhase(PHASE.ASSIGN); // Снова ждём M-шаг
      }
    }, delay);

    return () => clearTimeout(timer); // Очистка таймера при размонтировании или смене deps
  }, [isRunning, phase, points, assignments, centroids, speed]);

  const stepForward = useCallback(() => { // Ручной один шаг алгоритма
    if (points.length === 0) return;

    if (phase === PHASE.IDLE || phase === PHASE.CONVERGED) { // Первый шаг — инициализация
      doInitialize(points, k);
      return;
    }

    if (phase === PHASE.ASSIGN) { // M-шаг вручную
      const newC = updateCentroids(points, assignments, k, centroids);
      const converged = hasConverged(centroids, newC);
      setPrevCentroids([...centroids]);
      setCentroids(newC);
      setPhase(converged ? PHASE.CONVERGED : PHASE.UPDATE);
    } else if (phase === PHASE.UPDATE) { // E-шаг вручную
      const newAssign = assignPoints(points, centroids);
      const sse = calculateSSE(points, newAssign, centroids);
      setAssignments(newAssign);
      setSseHistory(prev => [...prev, sse]);
      setIteration(prev => prev + 1);
      setPhase(PHASE.ASSIGN);
    }
  }, [phase, points, assignments, centroids, k, doInitialize]);

  return { // Публичный API хука для компонентов
    // Settings
    k, setK,
    numPoints, setNumPoints,
    speed, setSpeed,
    showDistances, setShowDistances,
    // State
    phase,
    iteration,
    points,
    centroids,
    prevCentroids,
    assignments,
    sseHistory,
    isRunning,
    // Actions
    generatePoints,
    start,
    pause,
    reset,
    stepForward,
  };
}
