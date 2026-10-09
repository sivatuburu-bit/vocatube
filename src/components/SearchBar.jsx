import { useState } from "react";

function SearchBar({ onSearch }) {
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    if (searchText.trim() === "") {
      return;
    }

    onSearch(searchText);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search YouTube videos..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <button onClick={handleSearch}>
        🔍 Search
      </button>
    </div>
  );
}

export default SearchBar;