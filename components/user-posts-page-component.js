import { POSTS_PAGE, USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";
import { setLike, removeLike, getPosts } from "../api.js";
import { formatDate } from "../helpers.js";

export default function renderUserPostsPageComponent({ appEl }) {
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

  // Клик по имени пользователя для перехода в его профиль
  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }

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
              // Если ответ содержит post объект
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
                  const updatedPost = allPosts.find(
                    (post) => post.id === postId,
                  );
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
}
