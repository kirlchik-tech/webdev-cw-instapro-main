// Замени на свой, чтобы получить независимый от других набор данных.
// "боевая" версия инстапро лежит в ключе prod
const personalKey = "prod";
const baseHost = "https://webdev-hw-api.vercel.app";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Данные с сервера (все посты):", data.posts);

      if (data.posts && data.posts.length > 0) {
        data.posts.forEach((post, index) => {
          console.log(`Пост ${index}:`);
          console.log("   - imageUrl поста:", post.imageUrl);
          console.log("   - Пользователь:", post.user?.name);
          console.log(
            "   - Аватарка пользователя (imageUrl):",
            post.user?.imageUrl,
          );

          if (
            post.user?.imageUrl === "image.png" ||
            post.user?.imageUrl === "/image.png"
          ) {
            console.warn(
              "⚠️  НАЙДЕНА ПРОБЛЕМА! У пользователя некорректная аватарка!",
              post.user,
            );
          }
        });
      }

      return data.posts || [];
    })
    .catch((error) => {
      console.error("Ошибка загрузки постов:", error);
      // Возвращаем тестовые данные для разработки
      return [
        {
          id: "1",
          imageUrl: "https://via.placeholder.com/500x300",
          description: "Тестовый пост",
          createdAt: new Date().toISOString(),
          likes: [],
          user: {
            id: "1",
            name: "Тестовый пользователь",
            imageUrl: "https://via.placeholder.com/80",
          },
        },
      ];
    });
}

export function showNotification(message, type = "error") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;

  document.body.appendChild(notification);

  // Анимация появления
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Автоматическое скрытие через 5 секунд
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 5000);

  // Закрытие по клику
  notification
    .querySelector(".notification-close")
    .addEventListener("click", () => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    });
}

export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Такой пользователь уже существует");
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Неверный логин или пароль");
    }
    return response.json();
  });
}

// Загружает картинку в облако, возвращает url загруженной картинки
export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    return response.json();
  });
}
export function uploadPost({ token, description, imageUrl }) {
  return fetch(postsHost, {
    method: "POST",
    body: JSON.stringify({
      description,
      imageUrl,
    }),
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Заполните все поля");
    }
    return response.json();
  });
}

export function getUserPosts({ token, userId }) {
  return fetch(`${postsHost}/user-posts/${userId}`, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      if (response.status === 500) {
        throw new Error("Сервер сломался");
      }
      return response.json();
    })
    .then((responseData) => {
      if (responseData.error) {
        throw new Error(responseData.error);
      }
      return responseData.posts;
    });
}

// Поставить лайк
export function setLike({ token, postId }) {
  const requestUrl = `${postsHost}/${postId}/like`;
  console.log("[DEBUG setLike] Полный URL запроса:", requestUrl);

  return fetch(requestUrl, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Лайкать могут только авторизованные пользователи");
    }
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    return response.json();
  });
}

// Убрать лайк
export function removeLike({ token, postId }) {
  return fetch(`${postsHost}/${postId}/dislike`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Лайкать могут только авторизованные пользователи");
    }
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    return response.json();
  });
}
