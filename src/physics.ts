import * as Matter from "matter-js";
import { CONFIG } from "./config";
import {
  Graphics,
  Container,
  Application,
  Ticker,
  AnimatedSprite,
  Texture
} from "pixi.js";
import gsap from "gsap";
import { showWin, showLose } from "./ui";

// Экспорт переменных
export let engine: Matter.IEngine;          // Физический движок Matter.js
export let projectileBody: Matter.IBody;    // Физическое тело снаряда
export let targetBody: Matter.IBody;        // Физическое тело цели
export let obstacleBodies: {                // Массив препятствий
  body: Matter.IBody;
  view: Graphics;
  type: string;
  initialX?: number;
}[] = [];
export let projectileView: Graphics;        // Визуальное представление снаряда
export let tutorialContainer: Container;    // Контейнер для анимации руки

// Состояние игры
let launched = false;         // Флаг: запущен ли снаряд
let timeSinceLaunch = 0;      // Время с момента запуска (мс)
let stoppedTime = 0;          // Время остановки снаряда (мс)


// Инициализация физики
export function initPhysics(container: Container, app: Application) {
  // Создаём физический мир (гравитация)
  engine = Matter.Engine.create();
  engine.gravity.y = 1;
  (engine.gravity as any).scale = 0.002;  // Масштаб гравитации
  
  engine.positionIterations = 20;
  engine.velocityIterations = 15;

  // Границы мира
  const w = CONFIG.world.width;
  const h = CONFIG.world.height;
  
  const walls = [
    // Верхняя стена
    Matter.Bodies.rectangle(w / 2, -50, w, 100, {
      isStatic: true,
      restitution: 0.8,  // Отскок
      friction: 0.005,   // Трение
      label: "wall"
    }),
    // Нижняя стена
    Matter.Bodies.rectangle(w / 2, h + 50, w, 100, {
      isStatic: true,
      restitution: 0.8,
      friction: 0.005,
      label: "wall"
    }),
    // Левая стена
    Matter.Bodies.rectangle(-50, h / 2, 100, h, {
      isStatic: true,
      restitution: 0.8,
      friction: 0.005,
      label: "wall"
    }),
    // Правая стена
    Matter.Bodies.rectangle(w + 50, h / 2, 100, h, {
      isStatic: true,
      restitution: 0.8,
      friction: 0.005,
      label: "wall"
    })
  ];
  Matter.World.add(engine.world, walls);

  // Цель (зелёный прямоугольник)
  const t = CONFIG.target;
  targetBody = Matter.Bodies.rectangle(t.x, t.y, t.width, t.height, {
    isStatic: true,
    label: "target",
    restitution: 0.8,
    friction: 0.005
  });
  Matter.World.add(engine.world, targetBody);

  // Визуальное представление цели
  const targetView = new Graphics();
  targetView.rect(-t.width / 2, -t.height / 2, t.width, t.height);
  targetView.fill({ color: 0x4caf50 });  // Зелёный цвет
  targetView.x = t.x;
  targetView.y = t.y;
  container.addChild(targetView);


  // Препятствие (серый прямоугольник)
  CONFIG.obstacles.forEach(o => {
    // Физическое тело
    const obstacleBody = Matter.Bodies.rectangle(o.x, o.y, o.width, o.height, {
      isStatic: true,
      angle: o.angle,
      label: "obstacle",
      restitution: 0.8,
      friction: 0.005
    });

    Matter.World.add(engine.world, obstacleBody);

    // Визуальное представление препятствия
    const obstacleView = new Graphics();
    obstacleView.rect(-o.width / 2, -o.height / 2, o.width, o.height);
    obstacleView.fill({ color: 0x888888 });  // Серый цвет
    obstacleView.x = o.x;
    obstacleView.y = o.y;
    obstacleView.rotation = o.angle;
    container.addChild(obstacleView);

    obstacleBodies.push({ body: obstacleBody, view: obstacleView, type: o.type });
  });

  // Мяч (жёлтый круг)
  createProjectile(container, true);

  // Анимация туториала
  tutorialContainer = new Container();
  container.addChild(tutorialContainer);

  // Загрузка всех фреймов анимации
  const frames: Texture[] = [];
  for (let i = 1; i <= 94; i++) {
    const num = String(i).padStart(4, "0");
    frames.push(Texture.from(`assets/tutorial/frame_${num}.png`));
  }

  // Создаём анимированный спрайт
  const handAnim = new AnimatedSprite(frames);
  handAnim.anchor.set(0.5);
  handAnim.scale.set(0.5);
  handAnim.animationSpeed = 0.50;  // Скорость проигрывания
  handAnim.loop = true;             // Зацикливание
  handAnim.play();

  tutorialContainer.addChild(handAnim);

  // Позиционируем руку над снарядом
  handAnim.x = CONFIG.projectile.startX;
  handAnim.y = CONFIG.projectile.startY;
  
  // Анимация движения руки
  gsap.to(handAnim, {
    x: CONFIG.projectile.startX - 0,
    y: CONFIG.projectile.startY + 50,
    duration: 1,
    yoyo: true,
    repeat: -1,
    ease: "power1.inOut"
  });

  // Автоскрытие туториала через 10 секунд
  setTimeout(() => {
    tutorialContainer.visible = false;
  }, CONFIG.tutorialAutoHideMs);


  // Запуск физического движка
  Matter.Runner.run(Matter.Runner.create(), engine);

  // Обработка столкновений
  Matter.Events.on(engine, "collisionStart", event => {
    event.pairs.forEach((pair: Matter.IPair) => {
      const { bodyA, bodyB } = pair;
      
      // Проверяем, столкнулся ли мяч с целью
      if (
        (bodyA.label === "projectile" && bodyB.label === "target") ||
        (bodyA.label === "target" && bodyB.label === "projectile")
      ) {
        console.log("🎯 HIT TARGET!");
        showWin();
        launched = false;
      }
    });
  });

  Matter.Events.on(engine, "beforeUpdate", event => {
    obstacleBodies.forEach(({ body, view }) => {
      Matter.Body.setVelocity(body, { x: 0, y: 0 });
      Matter.Body.setAngularVelocity(body, 0);
      view.x = body.position.x;
      view.y = body.position.y;
      view.rotation = body.angle;
    });
  });


  // Игровой цикл
  app.ticker.add((ticker: Ticker) => {
    const delta = ticker.deltaMS;

    // Синхронизируем визуальное представление с физикой
    if (projectileView && projectileBody) {
      projectileView.x = projectileBody.position.x;
      projectileView.y = projectileBody.position.y;

      if (tutorialContainer.visible && handAnim) {
        handAnim.x = projectileBody.position.x - 42;
        handAnim.y = projectileBody.position.y + 5;
      }
    }

    // Проверка на поражение
    if (launched) {
      timeSinceLaunch += delta;

      // Если прошло 20 секунд - проигрышь
      if (timeSinceLaunch > CONFIG.loseTimeoutMs) {
        showLose();
        launched = false;
        return;
      }

      // Проверка скорости мяча
      const speed = Matter.Vector.magnitude(projectileBody.velocity);
      if (speed < CONFIG.loseMinSpeed) {
        stoppedTime += delta;
      } else {
        stoppedTime = 0;
      }

      // Если мяч остановился на 500мс — lose
      if (stoppedTime > 500) {
        showLose();
        launched = false;
        return;
      }
    }
  });
}


// Создание мяча
export function createProjectile(container: Container, isStatic: boolean = false) {
  const p = CONFIG.projectile;
  if (projectileBody) {
    Matter.World.remove(engine.world, projectileBody);
  }

  // Создаём новое физическое тело
  projectileBody = Matter.Bodies.circle(p.startX, p.startY, p.radius, {
    restitution: 0.8,
    friction: 0.005,
    label: "projectile",
    isStatic: isStatic 
  });

  Matter.World.add(engine.world, projectileBody);

  // Создаём визуальное представление (жёлтый круг)
  if (!projectileView) {
    projectileView = new Graphics();
    projectileView.circle(0, 0, p.radius);
    projectileView.fill({ color: 0xffc107 });  
    container.addChild(projectileView);
  }

  projectileView.x = p.startX;
  projectileView.y = p.startY;
}

// Управление состоянием запуска мяча
export function setLaunched(value: boolean) {
  launched = value;
  timeSinceLaunch = 0;
  stoppedTime = 0;
}

export function isLaunched() {
  return launched;
}

export let inputLocked = false;