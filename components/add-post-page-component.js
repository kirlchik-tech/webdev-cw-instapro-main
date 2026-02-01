import { POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";

  const render = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="form">
          <h3 class="form-title">Добавить пост</h3>
          <div class="form-inputs">
            <div class="upload-image-container"></div>
            <textarea id="description-textarea" class="input textarea" placeholder="Описание"></textarea>
            <div class="form-error"></div>
            <button class="button" id="add-button">Добавить</button>
          </div>
        </div>
      </div>`;

    appEl.innerHTML = appHtml;

    // Рендерим заголовок
    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    // Рендерим компонент загрузки изображения
    const uploadImageContainer = appEl.querySelector(".upload-image-container");
    renderUploadImageComponent({
      element: uploadImageContainer,
      onImageUrlChange(newImageUrl) {
        imageUrl = newImageUrl;
      },
    });

    // Обработчик кнопки "Добавить"
    document.getElementById("add-button").addEventListener("click", () => {
      const description = document
        .getElementById("description-textarea")
        .value.trim();

      if (!imageUrl) {
        alert("Не выбрана фотография");
        return;
      }

      if (!description) {
        alert("Введите описание");
        return;
      }

      // Вызываем функцию обратного вызова
      onAddPostClick({ description, imageUrl });
    });
  };

  // Инициализация
  render();
}
