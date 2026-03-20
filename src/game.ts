import { Application, Container, Graphics } from "pixi.js";
import { CONFIG } from "./config";
import { initPhysics, projectileBody, targetBody } from "./physics";
import { setupUI, showWin, showLose } from "./ui";
import { enableDrag } from "./drag";

// ИНИЦИАЛИЗАЦИЯ ИГРЫ
// Настраиваение игрового контейнера, адаптивности, а также запускает все остальные системы

export function initGame(app: Application) {
  // Создаём контейнер для всех игровых объектов
  const gameContainer = new Container();
  app.stage.addChild(gameContainer);


  // Адаптация игры под любой размер экрана, сохраняя пропорции
  function resize() {
    //Ширина и высота браузера
    const w = app.renderer.width;   
    const h = app.renderer.height;  
    
    // Ищем такой масштаб, чтобы поле поместилось целиком
    const scaleX = w / CONFIG.world.width;
    const scaleY = h / CONFIG.world.height;
    const scale = Math.min(scaleX, scaleY);  // Берём меньший масштаб
    
    // Применяем масштаб
    gameContainer.scale.set(scale);
    
    // Центрируем игровое поле
    gameContainer.x = (w - CONFIG.world.width * scale) / 2;
    gameContainer.y = (h - CONFIG.world.height * scale) / 2;
  }

  // Включение интерактивности для сцены
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  // Вызовв resize при изменении размера окна
  app.renderer.on("resize", resize);
  resize();  

  // Фон
  const bg = new Graphics();
  bg.rect(0, 0, CONFIG.world.width, CONFIG.world.height);
  bg.fill({ color: 0x1b1b1b });  
  gameContainer.addChild(bg);

  // Запуск систем

  // Matter.js физика
  initPhysics(gameContainer, app); 
  // Win/Lose экраны
  setupUI();                       
  // Drag & release механика
  enableDrag(app, gameContainer);    
}

export let worldScale = 1;