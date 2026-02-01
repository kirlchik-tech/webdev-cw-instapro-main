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

export default function renderUserPostsPageComponent({ appEl }) {
  const escapeHtml = (str) => {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  let postsHtml = "";
  let postUser = null;

  if (posts && posts.length > 0) {
    postUser = posts[0].user;

    // Генерируем HTML для постов
    postsHtml = posts
      .map((post) => {
        const createDate = formatDate(post.createdAt);

        return `
        <li class="post">
          <div class="post-header" data-user-id="${post.user.id}">
              <img src="${post.user.imageUrl.startsWith("http") ? post.user.imageUrl : "." + post.user.imageUrl}" class="post-header__user-image">
              <p class="post-header__user-name">${escapeHtml(post.user.name)}</p>
          </div>
          <div class="post-image-container">
            <img class="post-image" src="${post.imageUrl}" alt="Пост">
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
  }

  // Формируем HTML страницы
  let appHtml = `
  <div class="page-container">
    <div class="header-container"></div>
    <div class="page-header">
      <button class="back-button" id="back-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18l-6-6 6-6" stroke="#007AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Назад
      </button>
    </div>`;

  if (!posts || posts.length === 0) {
    appHtml += `
      <div class="user-info">
        ${
          postUser
            ? `<img src="${postUser.imageUrl.startsWith("http") ? postUser.imageUrl : "." + postUser.imageUrl}" class="user-info__image">
          <h2 class="user-info__name">${escapeHtml(postUser.name)}</h2>`
            : ""
        }
      </div>
      <div class="posts">
        <p class="no-posts-message">У этого пользователя пока нет постов</p>
      </div>
    </div>`;
  } else {
    appHtml += `
      <div class="user-info">
        <img src="${postUser.imageUrl.startsWith("http") ? postUser.imageUrl : "." + postUser.imageUrl}" class="user-info__image">
        <h2 class="user-info__name">${escapeHtml(postUser.name)}</h2>
      </div>
      <ul class="posts">
        ${postsHtml}
      </ul>
    </div>`;
  }

  appEl.innerHTML = appHtml;

  // Добавляем обработчик кнопки "Назад"
  const backButton = document.getElementById("back-button");
  if (backButton) {
    backButton.addEventListener("click", () => {
      goToPage(POSTS_PAGE);
    });
  }

  // Рендерим заголовок
  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  // Обработчики для лайков
  if (posts && posts.length > 0) {
    for (let likeBtn of document.querySelectorAll(".like-button")) {
      likeBtn.addEventListener("click", () => {
        if (!user) {
          alert("Лайкать посты могут только авторизованные пользователи");
          return;
        }

        const postId = likeBtn.dataset.postId;
        const isLiked = likeBtn.dataset.liked === "true";

        if (isLiked) {
          removeLike({ token: `Bearer ${user.token}`, postId })
            .then(() => {
              goToPage(USER_POSTS_PAGE, {
                userId: postUser.id,
              });
            })
            .catch((error) => {
              console.error(error);
              alert("Не удалось убрать лайк, попробуйте позже");
            });
        } else {
          setLike({ token: `Bearer ${user.token}`, postId })
            .then(() => {
              goToPage(USER_POSTS_PAGE, {
                userId: postUser.id,
              });
            })
            .catch((error) => {
              console.error(error);
              alert("Не удалось поставить лайк, попробуйте позже");
            });
        }
      });
    }
  }
}
