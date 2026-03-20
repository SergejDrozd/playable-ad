// Здесь расположены Win/Lose экраны
export function setupUI() {
}

// Показывает экран победы
export function showWin() {
  document.getElementById("win-overlay")!.style.display = "flex";
}

// Показывает экран поражения
export function showLose() {
  document.getElementById("lose-overlay")!.style.display = "flex";
}