import * as PIXI from "pixi.js";
import * as Matter from "matter-js";
import { CONFIG } from "./config";
import { projectileBody, projectileView, createProjectile, setLaunched, engine, tutorialContainer, isLaunched } from "./physics";



// Обрабатывание оттягивание снаряда и запуск

export function enableDrag(app: PIXI.Application, gameContainer: PIXI.Container) {
  let dragging = false;  // Флаг: Касается ли пользователь мяча
  let startX = 0;        // Начальная X позиция снаряда
  let startY = 0;        // Начальная Y позиция снаряда

  // Красная линия от стартовой позиции до текущей
  const dragIndicator = new PIXI.Graphics();
  gameContainer.addChild(dragIndicator);

  // Визуализация траектории (фиолетовые точки)
  const trajectoryGraphics = new PIXI.Graphics();
  gameContainer.addChild(trajectoryGraphics);


  // Преобразование глобальных координаты мыши/тача в локальные координаты игрового мира
  function pointerToWorld(e: PIXI.FederatedPointerEvent) {
    const pos = e.global;
    return {
      x: (pos.x - gameContainer.x) / gameContainer.scale.x,
      y: (pos.y - gameContainer.y) / gameContainer.scale.y
    };
  }


  // Начало касания мяча пользователем
  app.stage.on("pointerdown", (e) => {
    // Блокировка, чтобы избежать повторного нажатия мяча после запуска
    if (isLaunched()) return;

    const world = pointerToWorld(e);
    
    const dx = world.x - projectileBody.position.x;
    const dy = world.y - projectileBody.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < CONFIG.projectile.radius * 2) {
      dragging = true;
      startX = projectileBody.position.x;
      startY = projectileBody.position.y;

      // Делаем снаряд статичным
      Matter.Body.setStatic(projectileBody, true);
      
      // Скрываем туториал при первом касании
      tutorialContainer.visible = false;
    }
  });

  //  Начинаем перемещать мяч при зажатии
  app.stage.on("pointermove", (e) => {
    if (!dragging) return;

    const world = pointerToWorld(e);
    
    // Вектор оттягивания
    const dx = world.x - startX;
    const dy = world.y - startY;

    // Ограничивание максимальной дистанции
    const dist = Math.sqrt(dx * dx + dy * dy);
    const max = CONFIG.maxDragDistance;
    const scale = Math.min(1, dist / max); 
    const angle = Math.atan2(dy, dx);

    // Вычисление новой позиции снаряда 
    const pullX = startX + Math.cos(angle) * max * scale;
    const pullY = startY + Math.sin(angle) * max * scale;

    // Двигаем снаряд
    Matter.Body.setPosition(projectileBody, { x: pullX, y: pullY });

    // Красная линия к начальной точке
    dragIndicator.clear();
    dragIndicator.setStrokeStyle({ width: 4, color: 0xff0000, alpha: 0.7 });
    dragIndicator.moveTo(startX, startY);
    dragIndicator.lineTo(pullX, pullY);
    dragIndicator.stroke();

    // Траектория
    const multiplier = CONFIG.maxLaunchForce / CONFIG.maxDragDistance;

    // Вектор скорости (противоположный направлению оттягивания)
    const velX = -(pullX - startX) * multiplier;
    const velY = -(pullY - startY) * multiplier;

    drawSimpleTrajectory(startX, startY, velX, velY);
  });

  // Отпускание мыши (полёт снаряда)
  app.stage.on("pointerup", () => {
    if (!dragging) return;
    dragging = false;

    // Вычисление вектора оттягивания
    const dx = projectileBody.position.x - startX;
    const dy = projectileBody.position.y - startY;

    const multiplier = CONFIG.maxLaunchForce / CONFIG.maxDragDistance;

    // Пересоздание снаряда как динамический объект 
    createProjectile(gameContainer, false);

    // Передача скорости мячу
    Matter.Body.setVelocity(projectileBody, {
      x: -dx * multiplier,
      y: -dy * multiplier
    });

    // Убираем красную линию и траекториб
    dragIndicator.clear();
    trajectoryGraphics.clear();
    
    // Помечаем, что снаряд запущен 
    setLaunched(true);
  });

  // Функция расчёта траектории
  function drawSimpleTrajectory(startX: number, startY: number, velX: number, velY: number) {
    trajectoryGraphics.clear();

    const gravity = engine.gravity.y * 0.8;  // Гравитация
    const steps = 50;    // Количество точек
    const dt = 0.75;     // Временной шаг

    // Рисуем точки по параболе
    for (let i = 1; i <= steps; i++) {
      const t = i * dt;
      const x = startX + velX * t;
      const y = startY + velY * t + 0.5 * gravity * t * t;  // Формула параболы

      trajectoryGraphics.circle(x, y, 6);
      trajectoryGraphics.fill({ color: 0xff00ff, alpha: 1 });
    }
  }
}