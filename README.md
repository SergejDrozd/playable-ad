# Playable Ad - Drag and Launch

## Описание
Playable ad с механикой drag-and-release. Игрок тянет объект назад, отпускает, и объект летит к цели.

## Технологии
- TypeScript
- PixiJS v8 (рендеринг)
- Matter.js (физика)
- GSAP (tween-анимации)
- esbuild (сборка)

## Установка
```bash
npm install
```

## Запуск для разработки
```bash
npm run dev
```
Открыть http://localhost:5173 в браузере.

## Сборка финального HTML

### Шаг 1: Сборка bundle.js
```bash
npm run build
```
Создаёт `public/bundle.js`

### Шаг 2: Конвертация ассетов и создание финального HTML
```bash
node build-inline.js
```
Создаёт файл `dist/index.html` со всеми встроенными ассетами в base64.

## Конфигурация
Все ключевые параметры вынесены в `src/config.ts`:

- `maxDragDistance` - максимальная дистанция оттягивания
- `maxLaunchForce` - максимальная сила запуска
- `projectileAsset` - замена спрайта снаряда
- `tutorialAutoHideMs` - время автоскрытия туториала
- `world` - размеры игрового поля
- `projectile` - параметры снаряда (радиус, стартовая позиция)
- `target` - параметры цели (позиция, размер)
- `obstacles` - массив препятствий
- `loseMinSpeed` - минимальная скорость для проигрыша
- `loseTimeoutMs` - таймаут проигрыша

## Структура проекта
```
Playble/
├── public/
│   ├── assets/
│   │   └── tutorial/        # PNG-фреймы анимации руки (frame_0001.png - frame_0094.png)
│   ├── index.html           # HTML-шаблон
│   └── bundle.js            # Скомпилированный JS (после npm run build)
├── src/
│   ├── main.ts              # Точка входа
│   ├── config.ts            # Конфигурация
│   ├── game.ts              # Инициализация игры
│   ├── physics.ts           # Matter.js физика
│   ├── drag.ts              # Drag & release механика
│   ├── ui.ts                # Win/Lose экраны
│   └── types.d.ts           # TypeScript типы
├── dist/
│   └── index.html           # ФИНАЛЬНЫЙ ФАЙЛ (после npm run build:final)
├── package.json
├── tsconfig.json
├── build-inline.js          # Скрипт для создания inline HTML
└── README.md
```

## Механика
1. **Drag**: Оттягивание снаряда (максимум `maxDragDistance` пикселей)
2. **Release**: Полёт снаряда с силой до `maxLaunchForce`
3. **Win**: Попадание в зелёную цель
4. **Lose**: Снаряд остановился или прошло 20 секунд