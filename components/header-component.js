import { goToPage, logout, user } from "../index.js";
import { ADD_POSTS_PAGE, AUTH_PAGE, POSTS_PAGE } from "../routes.js";

/**
 * Компонент заголовка страницы.
 * Этот компонент отображает шапку страницы с логотипом, кнопкой добавления постов/входа и кнопкой выхода (если пользователь авторизован).
 * 
 * @param {HTMLElement} params.element - HTML-элемент, в который будет рендериться заголовок.
 * @returns {HTMLElement} Возвращает элемент заголовка после рендеринга.
 */
export function renderHeaderComponent({ element }) {
  /**
   * Рендерит содержимое заголовка.
   */
  element.innerHTML = `
  <div class="page-header">
      <h1 class="logo">instapro</h1>
      <button class="header-button add-or-login-button">
      ${
        user
          ? `<div title="Добавить пост" class="add-post-sign"></div>`
          : "Войти"
      }
      </button>
      ${
        user
          ? `<button title="${user.name}" class="header-button logout-button">Выйти</button>`
          : ""
      }  
  </div>
  `;

  /**
   * Обработчик клика по кнопке "Добавить пост"/"Войти".
   * Если пользователь авторизован, перенаправляет на страницу добавления постов.
   * Если пользователь не авторизован, перенаправляет на страницу авторизации.
   */
  element
    .querySelector(".add-or-login-button")
    .addEventListener("click", () => {
      if (user) {
        goToPage(ADD_POSTS_PAGE);
      } else {
        goToPage(AUTH_PAGE);
      }
    });

  /**
   * Обработчик клика по логотипу.
   * Перенаправляет на страницу с постами.
   */
  element.querySelector(".logo").addEventListener("click", () => {
    goToPage(POSTS_PAGE);
  });

  /**
   * Обработчик клика по кнопке "Выйти".
   * Если кнопка существует (т.е. пользователь авторизован), вызывает функцию `logout`.
   */
  element.querySelector(".logout-button")?.addEventListener("click", logout);

  return element;
}
