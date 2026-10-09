import { useEffect, useState } from "react";

function History() {
  const [history, setHistory] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const currentUser =
      JSON.parse(localStorage.getItem("vocatube-current-user"));

    if (!currentUser) {
      setHistory([]);
      return;
    }

    const historyKey = `vocatube-history-${currentUser.id}`;

    const savedHistory =
      JSON.parse(localStorage.getItem(historyKey)) || [];

    setHistory(savedHistory);
  }, []);

  function clearHistory() {
    const currentUser =
      JSON.parse(localStorage.getItem("vocatube-current-user"));

    if (!currentUser) return;

    const historyKey = `vocatube-history-${currentUser.id}`;

    localStorage.removeItem(historyKey);

    setHistory([]);
    setSearchText("");
  }

  const filteredHistory = history.filter((item) =>
    item.query?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <section className="history-page">
      <div className="history-header">
        <div>
          <p className="history-label">YOUR ACTIVITY</p>
          <h1>Search History</h1>
        </div>

        {history.length > 0 && (
          <button
            className="clear-history-button"
            onClick={clearHistory}
          >
            🗑️ Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="history-empty">
          <div className="history-icon">🕘</div>

          <h2>No search history yet</h2>

          <p>
            Your YouTube searches will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* History Search */}
          <div className="history-search-box">
            <span className="history-search-icon">🔎</span>

            <input
              type="text"
              placeholder="Search your history..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            {searchText && (
              <button
                className="history-search-clear"
                onClick={() => setSearchText("")}
              >
                ✕
              </button>
            )}
          </div>

          {filteredHistory.length === 0 ? (
            <div className="history-no-results">
              <div className="history-no-results-icon">🔍</div>

              <h2>No matching searches</h2>

              <p>
                We couldn't find anything matching "{searchText}".
              </p>
            </div>
          ) : (
            <div className="history-list">
              {filteredHistory.map((item) => (
                <div className="history-item" key={item.id}>
                  <div className="history-item-icon">
                    🔎
                  </div>

                  <div className="history-item-content">
                    <h3>{item.query}</h3>

                    <p>{item.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default History;