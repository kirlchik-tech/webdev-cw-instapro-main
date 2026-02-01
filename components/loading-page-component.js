import { renderHeaderComponent } from "./header-component.js";

/**
 * Компонент страницы загрузки.
 * Этот компонент отображает страницу с индикатором загрузки и заголовком.
 * Используется для отображения промежуточного состояния, пока выполняется загрузка данных или другой процесс.
 * 
 * @param {HTMLElement} params.appEl - Корневой элемент приложения, в который будет рендериться страница загрузки.
 * @param {Object} params.user - Объект пользователя, содержащий данные о текущем авторизованном пользователе (если он есть).
 * @param {Function} params.goToPage - Функция для навигации по страницам.
 */
export function renderLoadingPageComponent({ appEl, user, goToPage }) {
  /**
   * HTML-разметка страницы загрузки.
   * Содержит контейнер заголовка и индикатор загрузки.
   */
  const appHtml = `
              <div class="page-container">
                <div class="header-container"></div>
                <div class="loading-page">
                  <div class="loader"><div></div><div></div><div></div></div>
                </div>
              </div>`;

  // Устанавливаем разметку в корневой элемент приложения
  appEl.innerHTML = appHtml;

  /**
   * Рендеринг заголовка с использованием компонента `renderHeaderComponent`.
   * Передаются данные пользователя и функция навигации.
   */
  renderHeaderComponent({
    user,
    element: document.querySelector(".header-container"),
    goToPage,
  });
}
