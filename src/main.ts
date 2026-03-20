import * as PIXI from "pixi.js";
import { Assets } from "pixi.js";
import { initGame } from "./game";

// Инициализирует PixiJS приложение и загружает ассеты
async function start() {
  // Получаем контейнер из HTML
  const container = document.getElementById("game-container")!;

  // Создаём PixiJS приложение
  const app = new PIXI.Application();
  await app.init({
    resizeTo: container,        // Автоматически подстраивается под размер контейнера
    backgroundColor: 0x222222,   // Цвет фона (тёмно-серый)
    antialias: true              // Сглаживание краёв
  });

  // Добавляем canvas в DOM
  container.appendChild(app.canvas);

  // Включаем интерактивность для всей сцены
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  //Загрузка ассетов
  const frames = [];

  // @ts-ignore - INLINE_ASSETS может быть определён в HTML
  if (typeof INLINE_ASSETS !== 'undefined') {
    console.log('Using inline assets (production build)');
    
    // Регистрируем inline ассеты с правильными путями
    for (let i = 1; i <= 94; i++) {
      const num = String(i).padStart(4, "0");
      const alias = `assets/tutorial/frame_${num}.png`;
      
      // @ts-ignore
      const assetData = INLINE_ASSETS.find(a => a.name === `frame_${num}`);
      if (assetData) {
        Assets.add({ alias, src: assetData.data });
        frames.push(alias);
      }
    }
    
    // Загружаем все фреймы
    await Assets.load(frames);
  } else {
    console.log('Loading assets from files (dev mode)');
    for (let i = 1; i <= 94; i++) {
      const num = String(i).padStart(4, "0");
      const alias = `assets/tutorial/frame_${num}.png`;
      const src = `assets/tutorial/frame_${num}.png`;

      Assets.add({ alias, src });
      frames.push(alias);
    }

    // Загружаем все фреймы
    await Assets.load(frames);
  }

  // ЗАПУСК ИГРЫ
  initGame(app);
}

start();