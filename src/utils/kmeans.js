export function generateRandomPoints(n, width, height) { // Генерация n точек в прямоугольнике canvas с кластерной структурой
  const padding = Math.min(width, height) * 0.1; // Отступ от краёв — 10% от меньшей стороны
  const w = width - padding * 2; // Ширина области размещения точек
  const h = height - padding * 2; // Высота области размещения точек

  // Generate naturally clustered data using Gaussian clusters
  const numNaturalClusters = Math.floor(Math.random() * 3) + 3; // Случайное число «истинных» кластеров от 3 до 5
  const centers = Array.from({ length: numNaturalClusters }, () => ({ // Массив центров гауссовых скоплений
    x: padding + Math.random() * w, // Случайная координата X центра внутри области
    y: padding + Math.random() * h, // Случайная координата Y центра внутри области
  }));

  const spread = Math.min(w, h) * 0.12; // Радиус разброса точек вокруг центра кластера

  return Array.from({ length: n }, (_, i) => { // Создание n точек с уникальным id
    const c = centers[Math.floor(Math.random() * numNaturalClusters)]; // Случайный центр кластера для каждой точки
    const angle = Math.random() * 2 * Math.PI; // Случайный угол для полярного смещения
    const r = Math.abs(gaussRandom()) * spread; // Радиус с нормальным распределением (Box–Muller)
    return { // Объект точки данных
      id: i, // Уникальный идентификатор точки
      x: Math.max(padding, Math.min(width - padding, c.x + Math.cos(angle) * r)), // X с ограничением внутри canvas
      y: Math.max(padding, Math.min(height - padding, c.y + Math.sin(angle) * r)), // Y с ограничением внутри canvas
    };
  });
}

// Box-Muller transform for Gaussian distribution
function gaussRandom() { // Вспомогательная функция: стандартное нормальное распределение N(0,1)
  const u = 1 - Math.random(); // u ∈ (0, 1] для стабильности log
  const v = Math.random(); // v ∈ [0, 1) — вторая равномерная величина
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); // Преобразование Box–Muller
}

export function euclideanDistance(a, b) { // Евклидово расстояние между двумя точками {x, y}
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); // √(Δx² + Δy²)
}

// K-Means++ initialization for better convergence
export function initializeCentroids(k, points) { // Инициализация k центроидов алгоритмом K-Means++
  const centroids = []; // Массив выбранных центроидов
  // Pick first centroid randomly
  centroids.push({ ...points[Math.floor(Math.random() * points.length)] }); // Первый центроид — случайная точка (копия координат)

  for (let i = 1; i < k; i++) { // Выбор оставшихся k-1 центроидов
    // Squared distances to nearest centroid
    const dists = points.map((p) => { // Для каждой точки — квадрат расстояния до ближайшего центроида
      const minD = Math.min(...centroids.map((c) => euclideanDistance(p, c))); // Минимальное расстояние до уже выбранных
      return minD * minD; // Вес пропорционален D² (K-Means++)
    });

    // Weighted random selection
    const total = dists.reduce((s, d) => s + d, 0); // Сумма весов для нормализации
    let rand = Math.random() * total; // Случайное число на отрезке [0, total)
    let idx = 0; // Индекс выбранной точки
    for (let j = 0; j < dists.length; j++) { // Рулеточный выбор точки по весам dists[j]
      rand -= dists[j]; // Уменьшаем rand на вес текущей точки
      if (rand <= 0) { // Когда rand пересекает ноль — точка выбрана
        idx = j; // Запоминаем индекс
        break; // Выход из цикла
      }
    }
    centroids.push({ ...points[idx] }); // Добавляем новый центроид как копию выбранной точки
  }

  return centroids; // Возврат k начальных центроидов
}

export function assignPoints(points, centroids) { // E-шаг: назначение каждой точки ближайшему центроиду
  return points.map((point) => { // Массив индексов кластеров длины points.length
    let minDist = Infinity; // Текущее минимальное расстояние
    let assignment = 0; // Индекс ближайшего центроида
    centroids.forEach((c, i) => { // Перебор всех центроидов
      const d = euclideanDistance(point, c); // Расстояние от точки до центроида i
      if (d < minDist) { // Если расстояние меньше предыдущего минимума
        minDist = d; // Обновляем минимум
        assignment = i; // Запоминаем индекс кластера
      }
    });
    return assignment; // Номер кластера для данной точки
  });
}

export function updateCentroids(points, assignments, k, oldCentroids) { // M-шаг: пересчёт положения центроидов
  return Array.from({ length: k }, (_, i) => { // Новый массив из k центроидов
    const clusterPts = points.filter((_, j) => assignments[j] === i); // Все точки, назначенные кластеру i
    if (clusterPts.length === 0) return { ...oldCentroids[i] }; // Пустой кластер — оставляем старый центроид
    return { // Новый центроид — среднее координат точек кластера
      x: clusterPts.reduce((s, p) => s + p.x, 0) / clusterPts.length, // Среднее X
      y: clusterPts.reduce((s, p) => s + p.y, 0) / clusterPts.length, // Среднее Y
    };
  });
}

export function calculateSSE(points, assignments, centroids) { // Сумма квадратов ошибок (inertia / loss)
  return points.reduce((sse, p, i) => { // Накопление SSE по всем точкам
    const c = centroids[assignments[i]]; // Центроид кластера точки i
    return sse + euclideanDistance(p, c) ** 2; // Добавляем квадрат расстояния до центроида
  }, 0); // Начальное значение аккумулятора — 0
}

export function hasConverged(oldCentroids, newCentroids, threshold = 0.3) { // Проверка сходимости по смещению центроидов
  return oldCentroids.every((old, i) => euclideanDistance(old, newCentroids[i]) < threshold); // Все смещения < порога
}
