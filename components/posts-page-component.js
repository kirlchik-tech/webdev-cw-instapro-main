import { POSTS_PAGE, USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";
import { setLike, removeLike } from "../api.js";
import { formatDate } from "../helpers.js";
import { getPosts } from "../api.js";

export default function renderPostsPageComponent({ appEl }) {
  const escapeHtml = (str) => {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  /**
   * Функция для обновления отдельного поста в массиве posts
   */
  const updatePostInList = (postId, updatedPost) => {
    const postIndex = posts.findIndex((post) => post.id === postId);
    if (postIndex !== -1) {
      const userData = posts[postIndex].user;
      posts[postIndex] = {
        ...updatedPost.post,
        user: userData,
      };
    }
  };

  /**
   * Функция для обновления UI конкретного поста
   */
  const updatePostUI = (postId, isLiked, likesCount) => {
    const likeButton = document.querySelector(
      `.like-button[data-post-id="${postId}"]`,
    );
    const likesText = likeButton
      ?.closest(".post-likes")
      ?.querySelector(".post-likes-text");

    if (likeButton) {
      likeButton.dataset.liked = isLiked;
      likeButton.querySelector(".like-emoji").textContent = isLiked
        ? "❤️"
        : "🤍";
    }

    if (likesText) {
      likesText.innerHTML = `Нравится: <strong>${likesCount}</strong>`;
    }
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

      // Визуальное обновление кнопки сразу
      const currentLikesCount = parseInt(
        likeBtn.closest(".post-likes").querySelector("strong").textContent,
      );
      const newLikesCount = isLiked
        ? currentLikesCount - 1
        : currentLikesCount + 1;
      updatePostUI(postId, !isLiked, newLikesCount);

      // Отправляем запрос к API
      const apiCall = isLiked
        ? removeLike({ token: `Bearer ${user.token}`, postId })
        : setLike({ token: `Bearer ${user.token}`, postId });

      apiCall
        .then((response) => {
          console.log("Ответ от API лайка:", response);

          if (response && response.post) {
            // Если ответ содержит post объект (как в документации)
            updatePostInList(postId, response);
            updatePostUI(
              postId,
              response.post.isLiked,
              response.post.likes.length,
            );
          } else if (
            response &&
            (response.isLiked !== undefined || response.likes !== undefined)
          ) {
            // Если ответ сам является постом
            updatePostInList(postId, { post: response });
            updatePostUI(
              postId,
              response.isLiked,
              response.likes ? response.likes.length : 0,
            );
          } else {
            // Fallback: загружаем все посты и ищем нужный
            console.log("Fallback: загружаем все посты...");
            return getPosts({ token: `Bearer ${user.token}` }).then(
              (allPosts) => {
                const updatedPost = allPosts.find((post) => post.id === postId);
                if (updatedPost) {
                  updatePostInList(postId, { post: updatedPost });
                  updatePostUI(
                    postId,
                    updatedPost.isLiked,
                    updatedPost.likes.length,
                  );
                } else {
                  throw new Error("Пост не найден после обновления");
                }
              },
            );
          }
        })
        .catch((error) => {
          console.error("Ошибка при обработке лайка:", error);
          // Откатываем визуальные изменения при ошибке
          updatePostUI(postId, isLiked, currentLikesCount);
          alert("Что-то пошло не так. Попробуйте еще раз.");
        });
    });
  }
}
