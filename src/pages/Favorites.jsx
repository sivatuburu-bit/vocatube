import { useEffect, useState } from "react";

function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const currentUser =
      JSON.parse(
        localStorage.getItem("vocatube-current-user")
      );

    if (!currentUser) {
      return;
    }

    const bookmarksKey =
      `vocatube-bookmarks-${currentUser.id}`;

    const savedBookmarks =
      JSON.parse(
        localStorage.getItem(bookmarksKey)
      ) || [];

    setFavorites(savedBookmarks);
  }, []);

  function removeFavorite(id) {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this favorite?"
    );

    if (!confirmRemove) {
      return;
    }

    const currentUser =
      JSON.parse(
        localStorage.getItem("vocatube-current-user")
      );

    if (!currentUser) {
      return;
    }

    const bookmarksKey =
      `vocatube-bookmarks-${currentUser.id}`;

    const updatedFavorites = favorites.filter(
      (item) => item.id !== id
    );

    localStorage.setItem(
      bookmarksKey,
      JSON.stringify(updatedFavorites)
    );

    setFavorites(updatedFavorites);
  }

  function clearAllFavorites() {
    if (favorites.length === 0) {
      return;
    }

    const confirmClear = window.confirm(
      "Are you sure you want to remove all favorite videos?"
    );

    if (!confirmClear) {
      return;
    }

    const currentUser =
      JSON.parse(
        localStorage.getItem("vocatube-current-user")
      );

    if (!currentUser) {
      return;
    }

    const bookmarksKey =
      `vocatube-bookmarks-${currentUser.id}`;

    localStorage.removeItem(bookmarksKey);

    setFavorites([]);
  }

  function watchVideo(videoId) {
    window.open(
      `https://www.youtube.com/watch?v=${videoId}`,
      "_blank"
    );
  }

  return (
    <section className="favorites-page">
      <div className="favorites-header">
        <div>
          <p className="favorites-label">
            YOUR COLLECTION
          </p>

          <h1>Favorite Videos ❤️</h1>
        </div>

        <div className="favorites-header-actions">
          <span>{favorites.length} saved</span>

          {favorites.length > 0 && (
            <button
              className="clear-favorites-button"
              onClick={clearAllFavorites}
            >
              🧹 Clear All
            </button>
          )}
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <div className="favorites-icon">❤️</div>

          <h2>No favorite videos yet</h2>

          <p>
            Bookmark your favorite YouTube videos and
            they will appear here.
          </p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((item) => (
            <article
              className="favorite-card"
              key={item.id}
            >
              <div className="favorite-thumbnail">
                <img
                  src={item.thumbnail}
                  alt={item.videoTitle}
                />

                <button
                  className="watch-button"
                  onClick={() =>
                    watchVideo(item.videoId)
                  }
                >
                  ▶ Watch Video
                </button>
              </div>

              <div className="favorite-info">
                <h3>{item.videoTitle}</h3>

                <p>👤 {item.channel}</p>

                <small>🕒 {item.createdAt}</small>

                <div className="favorite-actions">
                  <button
                    className="watch-button-mobile"
                    onClick={() =>
                      watchVideo(item.videoId)
                    }
                  >
                    ▶ Watch
                  </button>

                  <button
                    className="remove-favorite-button"
                    onClick={() =>
                      removeFavorite(item.id)
                    }
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Favorites;