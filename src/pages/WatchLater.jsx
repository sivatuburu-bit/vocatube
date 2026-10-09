import { useEffect, useState } from "react";

function WatchLater({ onPlayVideo }) {
  const [watchLater, setWatchLater] = useState([]);

  useEffect(() => {
    loadWatchLater();
  }, []);

  function loadWatchLater() {
    const saved =
      JSON.parse(localStorage.getItem("vocatube-watch-later")) || [];

    setWatchLater(saved);
  }

  function removeFromWatchLater(id) {
    const updated = watchLater.filter(
      (video) => video.id !== id
    );

    localStorage.setItem(
      "vocatube-watch-later",
      JSON.stringify(updated)
    );

    setWatchLater(updated);
  }

  if (watchLater.length === 0) {
    return (
      <div className="watch-later-page">
        <div className="empty-state">
          <div className="empty-icon">🔖</div>

          <h2>No videos saved</h2>

          <p>
            Videos you save for later will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="watch-later-page">

      <div className="page-heading">
        <div>
          <span className="page-label">
            YOUR LIBRARY
          </span>

          <h1>🔖 Watch Later</h1>

          <p>
            {watchLater.length} video
            {watchLater.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      <div className="watch-later-grid">

        {watchLater.map((video) => (
          <div
            className="watch-later-card"
            key={video.id}
          >

            <div className="watch-later-thumbnail">

              <img
                src={video.thumbnail}
                alt={video.videoTitle}
              />

              <button
                className="watch-later-play"
                onClick={() => onPlayVideo(video)}
              >
                ▶
              </button>

            </div>

            <div className="watch-later-info">

              <h3>{video.videoTitle}</h3>

              <p>{video.channel}</p>

              <small>
                Saved on{" "}
                {new Date(
                  video.createdAt
                ).toLocaleDateString()}
              </small>

              <div className="watch-later-actions">

                <button
                  className="watch-now-btn"
                  onClick={() => onPlayVideo(video)}
                >
                  ▶ Watch Now
                </button>

                <button
                  className="remove-watch-btn"
                  onClick={() =>
                    removeFromWatchLater(video.id)
                  }
                >
                  🗑 Remove
                </button>

              </div>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}

export default WatchLater;