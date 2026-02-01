import { POSTS_PAGE, USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";
import { setLike, removeLike } from "../api.js";

// Функция форматирования даты
function formatDate(date) {
  const now = new Date();
  const postDate = new Date(date);
  const diffMs = now - postDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "только что";
  if (diffMins < 60) return `${diffMins} минут назад`;
  if (diffHours < 24) return `${diffHours} часов назад`;
  if (diffDays === 1) return "вчера";
  if (diffDays < 7) return `${diffDays} дней назад`;

  return postDate.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function renderPostsPageComponent({ appEl }) {
  // Функция для защиты от XSS
  const escapeHtml = (str) => {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  /**
   * Генерируем список постов динамически на основе массива 'posts'
   */
  const postsHtml = posts
    .map((post) => {
      const createDate = formatDate(post.createdAt);
      return `
      <li class="post">
        <div class="post-header" data-user-id="${post.user.id}">
            <img src="${post.user.imageUrl.startsWith("http") ? post.user.imageUrl : "." + post.user.imageUrl}" class="post-header__user-image">
            <p class="post-header__user-name">${escapeHtml(post.user.name)}</p>
        </div>
        <div class="post-image-container">
          <img class="post-image" src="${post.imageUrl.startsWith("http") ? post.imageUrl : "." + post.imageUrl}" alt="Пост">
        </div>
        <div class="post-likes">
          <button data-post-id="${post.id}" data-liked="${post.isLiked}" class="like-button">
            <span class="like-emoji">${post.isLiked ? "❤️" : "🤍"}</span>
          </button>
          <p class="post-likes-text">
            Нравится: <strong>${post.likes.length}</strong>
          </p>
        </div>
        <p class="post-text">
          <span class="user-name">${escapeHtml(post.user.name)}</span>
          ${escapeHtml(post.description)}
        </p>
        <p class="post-date">
          ${createDate}
        </p>
      </li>`;
    })
    .join("");

  const appHtml = `
              <div class="page-container">
                <div class="header-container"></div>
                <ul class="posts">
                  ${postsHtml}
                </ul>
              </div>`;

  appEl.innerHTML = appHtml;

  // Рендерим заголовок
  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  // Клик по имени пользователя для перехода в его профиль
  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }

  /**
   * Функция лайков
   */
  for (let likeBtn of document.querySelectorAll(".like-button")) {
    likeBtn.addEventListener("click", () => {
      // Если пользователь не авторизован, лайк поставить нельзя
      if (!user) {
        alert("Лайкать посты могут только авторизованные пользователи");
        return;
      }

      const postId = likeBtn.dataset.postId;
      const isLiked = likeBtn.dataset.liked === "true";

      // Если лайк уже стоит — снимаем, если нет — ставим
      if (isLiked) {
        removeLike({ token: `Bearer ${user.token}`, postId })
          .then(() => {
            // После успешного API запроса обновляем текущую страницу
            goToPage(POSTS_PAGE);
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        setLike({ token: `Bearer ${user.token}`, postId })
          .then(() => {
            goToPage(POSTS_PAGE);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
  }
}
