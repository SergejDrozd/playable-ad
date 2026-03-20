declare module "matter-js" {
  // Физическое тело (снаряд, цель, препятствие)
  export interface IBody {
    position: { x: number; y: number };  // Позиция в пространстве
    angle: number;                       // Угол поворота (радианы)
    velocity: { x: number; y: number };  // Скорость движения
    label?: string;                      // Метка для идентификации (например, "projectile")
    isStatic?: boolean;                  // Статичный объект 
    restitution?: number;                // Коэффициент отскока 
    friction?: number;                   // Трение
    bounds: {                            // Границы объекта 
      min: { x: number; y: number };
      max: { x: number; y: number };
    };
    inverseMass?: number;                // Обратная масса 
    inverseInertia?: number;             // Обратная инерция
  }

  // IEngine — физический движок
  export interface IEngine {
    gravity: { x: number; y: number };   // Гравитация
    world: any;                          // Физический мир со всеми телами
    timing: { 
      timestamp: number;                 // Время симуляции
      lastDelta?: number;                // Последняя дельта времени
    };
    positionIterations: number;          // Точность расчёта позиций
    velocityIterations: number;          // Точность расчёта скоростей
  }

  // Столкновения
  export interface IEventCollision<T> {
    pairs: IPair[];                      // Массив пар столкнувшихся тел
  }

  export interface IPair {
    bodyA: IBody;                        // Первое тело
    bodyB: IBody;                        // Второе тело
  }


  // События с временными метками
  export interface IEventTimestamped {
    delta: number;                       // Дельта времени
    timestamp: number;                   // Абсолютное время
    source: IEngine;                     // Источник события (движок)
  }


  // МЕТОДЫ
  // Engine — движок
  export const Engine: {
    create(): IEngine;                             // Создать движок
    update(engine: IEngine, delta: number): void;  // Обновить симуляцию
  };

  // World — мир (контейнер для тел)
  export const World: {
    add(world: any, bodies: any): void;    // Добавить тела в мир
    remove(world: any, body: any): void;   // Удалить тело из мира
  };

  // Bodies — фабрика для создания тел
  export const Bodies: {
    rectangle(x: number, y: number, width: number, height: number, options?: any): IBody;
    circle(x: number, y: number, radius: number, options?: any): IBody;
  };

  // Events — система событий
  export const Events: {
    on(obj: any, eventName: string, callback: (event: any) => void): void;
  };

  // Vector — векторная математика
  export const Vector: {
    magnitude(vec: { x: number; y: number }): number;  // Длина вектора (скорость)
  };

  // Body — управление телами
  export const Body: {
    setPosition(body: IBody, position: { x: number; y: number }): void;
    setAngle(body: IBody, angle: number): void;
    setVelocity(body: IBody, velocity: { x: number; y: number }): void;
    setStatic(body: IBody, isStatic: boolean): void;
    setAngularVelocity(body: IBody, velocity: number): void;
  };

  // Runner — управление симуляцией
  export const Runner: {
    create(options?: any): any;
    run(runner: any, engine: IEngine): void;
  };
}