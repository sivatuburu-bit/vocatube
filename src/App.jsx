import { useEffect, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";

import { searchYouTubeVideos } from "./services/youtubeApi";
import History from "./pages/History";
import Favorites from "./pages/Favorites";
import Notes from "./pages/Notes";
import WatchLater from "./pages/WatchLater";
import VoiceControl from "./VoiceControl";
import "./App.css";

// =========================================================
// PERSONALIZED RECOMMENDATION QUERY
// =========================================================

function getRecommendationQuery() {
  const currentUser =
    JSON.parse(
      localStorage.getItem("vocatube-current-user")
    );

  if (!currentUser) {
    return "React JavaScript programming";
  }

  // =======================================================
  // SEARCH HISTORY
  // =======================================================

  const historyKey =
    `vocatube-history-${currentUser.id}`;

  const history =
    JSON.parse(
      localStorage.getItem(historyKey)
    ) || [];

  // =======================================================
  // WATCHED VIDEOS
  // =======================================================

  const watchedKey =
    `vocatube-watched-${currentUser.id}`;

  const watchedVideos =
    JSON.parse(
      localStorage.getItem(watchedKey)
    ) || [];

  // =======================================================
  // COUNT SEARCHES
  // =======================================================

  const searchCounts = {};

  history.forEach((item) => {
    const searchQuery =
      item.query?.trim().toLowerCase();

    if (!searchQuery) {
      return;
    }

    searchCounts[searchQuery] =
      (searchCounts[searchQuery] || 0) + 1;
  });

  const topSearch =
    Object.entries(searchCounts)
      .sort((a, b) => b[1] - a[1])[0];

  // =======================================================
  // COUNT WATCHED VIDEOS
  // =======================================================

  const watchedCounts = {};

  watchedVideos.forEach((item) => {
    const title =
      item.videoTitle?.trim();

    if (!title) {
      return;
    }

    const normalizedTitle =
      title.toLowerCase();

    watchedCounts[normalizedTitle] =
      (watchedCounts[normalizedTitle] || 0) + 1;
  });

  const topWatched =
    Object.entries(watchedCounts)
      .sort((a, b) => b[1] - a[1])[0];

  // =======================================================
  // NO ACTIVITY
  // =======================================================

  if (!topSearch && !topWatched) {
    return "React JavaScript programming";
  }

  // =======================================================
  // SEARCH ACTIVITY VS WATCH ACTIVITY
  // =======================================================

  if (topSearch && topWatched) {
    const searchCount = topSearch[1];
    const watchedCount = topWatched[1];

    if (searchCount >= watchedCount) {
      return topSearch[0];
    }

    return topWatched[0];
  }

  if (topSearch) {
    return topSearch[0];
  }

  if (topWatched) {
    return topWatched[0];
  }

  return "React JavaScript programming";
}

// =========================================================
// MAIN VOCATUBE APP
// =========================================================

function VocaTubeApp() {
  const navigate = useNavigate();

  function handleLogout() {
    setShowLogoutModal(true);
  }

  function confirmLogout() {
    localStorage.removeItem("vocatube-auth");
    localStorage.removeItem("vocatube-current-user");

    navigate("/login", {
      replace: true,
    });
  }

  function cancelLogout() {
    setShowLogoutModal(false);
  }

  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showNoteBox, setShowNoteBox] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [watchLater, setWatchLater] = useState([]);
  const [focusMode, setFocusMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // =========================================================
  // HOME CATEGORY STATES
  // =========================================================

  const [homeSections, setHomeSections] = useState({
    trending: [],
    programming: [],
    react: [],
    music: [],
    gaming: [],
    education: [],
  });

  const [homeSectionsLoading, setHomeSectionsLoading] =
    useState(false);

  // =========================================================
  // LOAD WATCH LATER
  // =========================================================

  useEffect(() => {
    const savedWatchLater =
      JSON.parse(
        localStorage.getItem("vocatube-watch-later")
      ) || [];

    setWatchLater(savedWatchLater);
  }, []);

  // =========================================================
  // SAVE WATCHED VIDEO
  // =========================================================

  function saveWatchedVideo(video) {
    if (!video?.id?.videoId) {
      return;
    }

    const currentUser =
      JSON.parse(
        localStorage.getItem("vocatube-current-user")
      );

    if (!currentUser) {
      return;
    }

    const watchedKey =
      `vocatube-watched-${currentUser.id}`;

    const existingWatched =
      JSON.parse(
        localStorage.getItem(watchedKey)
      ) || [];

    const videoId =
      video.id.videoId;

    const videoData = {
      id: Date.now(),
      videoId: videoId,
      videoTitle: video.snippet.title,
      channel: video.snippet.channelTitle,
      thumbnail:
        video.snippet.thumbnails?.high?.url ||
        video.snippet.thumbnails?.medium?.url ||
        "",
      createdAt:
        new Date().toLocaleString(),
    };

    const filteredWatched =
      existingWatched.filter(
        (item) =>
          item.videoId !== videoId
      );

    const updatedWatched = [
      videoData,
      ...filteredWatched,
    ].slice(0, 50);

    localStorage.setItem(
      watchedKey,
      JSON.stringify(updatedWatched)
    );
  }

  // =========================================================
  // LOAD PERSONALIZED HOME RECOMMENDATIONS
  // =========================================================

  async function loadHomeRecommendations() {
    try {
      setLoading(true);
      setError("");

      const recommendationQuery =
        getRecommendationQuery();

      console.log(
        "VocaTube Recommendation:",
        recommendationQuery
      );

      const results =
        (await searchYouTubeVideos(
          recommendationQuery
        )) || [];

      if (results.length === 0) {
        setVideos([]);

        setError(
          "No recommended videos found."
        );

        return;
      }

      setVideos(results);
    } catch (error) {
      console.error(
        "Recommendation error:",
        error
      );

      setVideos([]);

      setError(
        "Recommended videos load avvaledu. Please check API settings."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // LOAD HOME CATEGORY VIDEOS
  // =========================================================

  async function loadHomeSections() {
    try {
      setHomeSectionsLoading(true);

      const recommendationQuery =
        getRecommendationQuery();

      // -----------------------------------------------------
      // TRENDING
      // -----------------------------------------------------

      let trendingVideos = [];

      try {
        trendingVideos =
          (await searchYouTubeVideos(
            "trending popular videos"
          )) || [];
      } catch (error) {
        console.error(
          "Trending section error:",
          error
        );
      }

      // -----------------------------------------------------
      // PROGRAMMING
      // -----------------------------------------------------

      let programmingVideos = [];

      try {
        programmingVideos =
          (await searchYouTubeVideos(
            "programming coding tutorials"
          )) || [];
      } catch (error) {
        console.error(
          "Programming section error:",
          error
        );
      }

      // -----------------------------------------------------
      // REACT
      // -----------------------------------------------------

      let reactVideos = [];

      try {
        reactVideos =
          (await searchYouTubeVideos(
            "React JS tutorials"
          )) || [];
      } catch (error) {
        console.error(
          "React section error:",
          error
        );
      }

      // -----------------------------------------------------
      // MUSIC
      // -----------------------------------------------------

      let musicVideos = [];

      try {
        musicVideos =
          (await searchYouTubeVideos(
            "popular music"
          )) || [];
      } catch (error) {
        console.error(
          "Music section error:",
          error
        );
      }

      // -----------------------------------------------------
      // GAMING
      // -----------------------------------------------------

      let gamingVideos = [];

      try {
        gamingVideos =
          (await searchYouTubeVideos(
            "Gaming"
          )) || [];
      } catch (error) {
        console.error(
          "Gaming section error:",
          error
        );
      }

      // -----------------------------------------------------
      // EDUCATION
      // -----------------------------------------------------

      let educationVideos = [];

      try {
        educationVideos =
          (await searchYouTubeVideos(
            "education learning"
          )) || [];
      } catch (error) {
        console.error(
          "Education section error:",
          error
        );
      }

      // -----------------------------------------------------
      // SET ALL HOME SECTIONS
      // -----------------------------------------------------

      setHomeSections({
        trending: trendingVideos,
        programming: programmingVideos,
        react: reactVideos,
        music: musicVideos,
        gaming: gamingVideos,
        education: educationVideos,
      });

      console.log(
        "VocaTube Home Sections loaded",
        {
          recommendation:
            recommendationQuery,

          trending:
            trendingVideos.length,

          programming:
            programmingVideos.length,

          react:
            reactVideos.length,

          music:
            musicVideos.length,

          gaming:
            gamingVideos.length,

          education:
            educationVideos.length,
        }
      );
    } catch (error) {
      console.error(
        "Home sections error:",
        error
      );
    } finally {
      setHomeSectionsLoading(false);
    }
  }

  // =========================================================
  // LOAD HOME PAGE AUTOMATICALLY
  // =========================================================

  useEffect(() => {
    loadHomeRecommendations();
    loadHomeSections();
  }, []);

  // =========================
  // CURRENT PAGE
  // =========================

  const [currentPage, setCurrentPage] =
    useState("home");

  // =========================
  // USER-WISE HISTORY
  // =========================

  function saveHistory(queryText) {
    const currentUser =
      JSON.parse(
        localStorage.getItem(
          "vocatube-current-user"
        )
      );

    if (!currentUser) {
      return;
    }

    const historyKey =
      `vocatube-history-${currentUser.id}`;

    const existingHistory =
      JSON.parse(
        localStorage.getItem(historyKey)
      ) || [];

    const newHistoryItem = {
      id: Date.now(),
      query: queryText.trim(),
      createdAt:
        new Date().toLocaleString(),
    };

    const updatedHistory = [
      newHistoryItem,
      ...existingHistory,
    ];

    localStorage.setItem(
      historyKey,
      JSON.stringify(updatedHistory)
    );
  }

  // =========================================================
  // CATEGORY SEARCH
  // =========================================================

  async function handleCategorySearch(category) {
    setQuery(category);
    setCurrentPage("home");
    setSelectedVideo(null);
    setFocusMode(false);
    setError("");
    setVideos([]);

    try {
      setLoading(true);

      const results =
        (await searchYouTubeVideos(
          category
        )) || [];

      if (results.length === 0) {
        setVideos([]);

        setError(
          `No videos found for "${category}".`
        );

        return;
      }

      // SAVE CATEGORY SEARCH TO HISTORY
      saveHistory(category);

      // SHOW RELATED VIDEOS
      setVideos(results);

      // GO TO TOP WHERE SEARCH RESULTS ARE SHOWN
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Category search error:",
        error
      );

      setVideos([]);

      setError(
        `${category} videos load avvaledu. Please check API settings.`
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // VOICE CONTROL EVENTS
  // =========================================================

  // OPEN HISTORY
  useEffect(() => {
    function handleOpenHistory() {
      setCurrentPage("history");
      setSelectedVideo(null);
      setFocusMode(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    window.addEventListener(
      "open-history",
      handleOpenHistory
    );

    return () => {
      window.removeEventListener(
        "open-history",
        handleOpenHistory
      );
    };
  }, []);

  // OPEN FAVORITES
  useEffect(() => {
    function handleOpenFavorites() {
      setCurrentPage("favorites");
      setSelectedVideo(null);
      setFocusMode(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    window.addEventListener(
      "open-favorites",
      handleOpenFavorites
    );

    return () => {
      window.removeEventListener(
        "open-favorites",
        handleOpenFavorites
      );
    };
  }, []);

  // OPEN NOTES
  useEffect(() => {
    function handleOpenNotes() {
      setCurrentPage("notes");
      setSelectedVideo(null);
      setFocusMode(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    window.addEventListener(
      "open-notes",
      handleOpenNotes
    );

    return () => {
      window.removeEventListener(
        "open-notes",
        handleOpenNotes
      );
    };
  }, []);

  // OPEN WATCH LATER
  useEffect(() => {
    function handleOpenWatchLater() {
      setCurrentPage("watch-later");
      setSelectedVideo(null);
      setFocusMode(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    window.addEventListener(
      "open-watch-later",
      handleOpenWatchLater
    );

    return () => {
      window.removeEventListener(
        "open-watch-later",
        handleOpenWatchLater
      );
    };
  }, []);

  // GO HOME
  useEffect(() => {
    function handleGoHome() {
      setCurrentPage("home");
      setSelectedVideo(null);
      setFocusMode(false);
      setQuery("");

      loadHomeRecommendations();
      loadHomeSections();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    window.addEventListener(
      "go-home",
      handleGoHome
    );

    return () => {
      window.removeEventListener(
        "go-home",
        handleGoHome
      );
    };
  }, []);

  // GO BACK
  useEffect(() => {
    function handleGoBack() {
      setSelectedVideo(null);
      setFocusMode(false);
    }

    window.addEventListener(
      "go-back",
      handleGoBack
    );

    return () => {
      window.removeEventListener(
        "go-back",
        handleGoBack
      );
    };
  }, []);

  // SCROLL DOWN
  useEffect(() => {
    function handleScrollDown() {
      window.scrollBy({
        top: 600,
        behavior: "smooth",
      });
    }

    window.addEventListener(
      "scroll-down",
      handleScrollDown
    );

    return () => {
      window.removeEventListener(
        "scroll-down",
        handleScrollDown
      );
    };
  }, []);

  // SCROLL UP
  useEffect(() => {
    function handleScrollUp() {
      window.scrollBy({
        top: -600,
        behavior: "smooth",
      });
    }

    window.addEventListener(
      "scroll-up",
      handleScrollUp
    );

    return () => {
      window.removeEventListener(
        "scroll-up",
        handleScrollUp
      );
    };
  }, []);

  // FOCUS MODE ON
  useEffect(() => {
    function handleFocusOn() {
      if (selectedVideo) {
        setFocusMode(true);
        return;
      }

      if (videos.length > 0) {
        setSelectedVideo(videos[0]);
        saveWatchedVideo(videos[0]);
        setFocusMode(true);
        return;
      }

      setError(
        "Please search and open a video first."
      );
    }

    window.addEventListener(
      "focus-on",
      handleFocusOn
    );

    return () => {
      window.removeEventListener(
        "focus-on",
        handleFocusOn
      );
    };
  }, [selectedVideo, videos]);

  // FOCUS MODE OFF
  useEffect(() => {
    function handleFocusOff() {
      setFocusMode(false);
    }

    window.addEventListener(
      "focus-off",
      handleFocusOff
    );

    return () => {
      window.removeEventListener(
        "focus-off",
        handleFocusOff
      );
    };
  }, []);

  // CLOSE VIDEO
  useEffect(() => {
    function handleCloseVideo() {
      setSelectedVideo(null);
      setFocusMode(false);
      setShowNoteBox(false);
      setNoteText("");
    }

    window.addEventListener(
      "close-video",
      handleCloseVideo
    );

    return () => {
      window.removeEventListener(
        "close-video",
        handleCloseVideo
      );
    };
  }, []);

  // =========================================================
  // VOICE VIDEO SEARCH + OPEN
  // =========================================================

  useEffect(() => {
    async function handleVoiceVideoSearch(event) {
      const videoQuery =
        event.detail.query;

      if (
        !videoQuery ||
        !videoQuery.trim()
      ) {
        return;
      }

      try {
        setLoading(true);
        setError("");
        setCurrentPage("home");
        setQuery(videoQuery);

        const results =
          (await searchYouTubeVideos(
            videoQuery
          )) || [];

        if (results.length === 0) {
          setError(
            `No video found for "${videoQuery}".`
          );

          setSelectedVideo(null);
          return;
        }

        setVideos(results);

        setSelectedVideo(results[0]);

        saveHistory(videoQuery);

        saveWatchedVideo(results[0]);
      } catch (error) {
        console.error(error);

        setError(
          "Voice video search failed. Please check API settings."
        );

        setSelectedVideo(null);
      } finally {
        setLoading(false);
      }
    }

    window.addEventListener(
      "voice-video-search",
      handleVoiceVideoSearch
    );

    return () => {
      window.removeEventListener(
        "voice-video-search",
        handleVoiceVideoSearch
      );
    };
  }, []);

  // =========================
  // BOOKMARK
  // =========================

  function addBookmark() {
    if (!selectedVideo) {
      return;
    }

    const currentUser =
      JSON.parse(
        localStorage.getItem(
          "vocatube-current-user"
        )
      );

    if (!currentUser) {
      return;
    }

    const bookmarksKey =
      `vocatube-bookmarks-${currentUser.id}`;

    const existingBookmarks =
      JSON.parse(
        localStorage.getItem(
          bookmarksKey
        )
      ) || [];

    const alreadyBookmarked =
      existingBookmarks.some(
        (item) =>
          item.videoId ===
          selectedVideo.id.videoId
      );

    if (alreadyBookmarked) {
      alert(
        "⚠️ Video already bookmarked!"
      );
      return;
    }

    const newBookmark = {
      id: Date.now(),
      videoId:
        selectedVideo.id.videoId,
      videoTitle:
        selectedVideo.snippet.title,
      channel:
        selectedVideo.snippet.channelTitle,
      thumbnail:
        selectedVideo.snippet.thumbnails
          .high?.url ||
        selectedVideo.snippet.thumbnails
          .medium?.url ||
        "",
      createdAt:
        new Date().toLocaleString(),
    };

    const updatedBookmarks = [
      newBookmark,
      ...existingBookmarks,
    ];

    localStorage.setItem(
      bookmarksKey,
      JSON.stringify(
        updatedBookmarks
      )
    );

    setBookmarks(updatedBookmarks);

    alert(
      "🔖 Video bookmarked successfully!"
    );
  }

  // =========================
  // WATCH LATER
  // =========================

  function addToWatchLater(video) {
    if (!video?.id?.videoId) {
      return;
    }

    const saved =
      JSON.parse(
        localStorage.getItem(
          "vocatube-watch-later"
        )
      ) || [];

    const videoData = {
      id: video.id.videoId,
      videoId: video.id.videoId,
      videoTitle:
        video.snippet.title,
      channel:
        video.snippet.channelTitle,
      thumbnail:
        video.snippet.thumbnails
          .medium?.url ||
        video.snippet.thumbnails
          .high?.url ||
        "",
      createdAt:
        new Date().toISOString(),
    };

    const alreadySaved =
      saved.some(
        (item) =>
          item.id === videoData.id
      );

    if (alreadySaved) {
      alert(
        "Video already saved to Watch Later!"
      );
      return;
    }

    const updated = [
      videoData,
      ...saved,
    ];

    localStorage.setItem(
      "vocatube-watch-later",
      JSON.stringify(updated)
    );

    setWatchLater(updated);

    alert(
      "Video added to Watch Later!"
    );
  }

  // =========================
  // PLAY WATCH LATER VIDEO
  // =========================

  function playWatchLaterVideo(video) {
    const convertedVideo = {
      id: {
        videoId: video.videoId,
      },

      snippet: {
        title: video.videoTitle,
        channelTitle: video.channel,

        thumbnails: {
          high: {
            url: video.thumbnail,
          },

          medium: {
            url: video.thumbnail,
          },
        },
      },
    };

    setCurrentPage("home");
    setSelectedVideo(
      convertedVideo
    );
    setFocusMode(false);

    saveWatchedVideo(
      convertedVideo
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================
  // NORMAL SEARCH
  // =========================

  async function handleSearch() {
    if (!query.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const results =
        (await searchYouTubeVideos(
          query
        )) || [];

      if (results.length === 0) {
        setVideos([]);

        setError(
          `No videos found for "${query}".`
        );

        return;
      }

      saveHistory(query);

      setVideos(results);
      setSelectedVideo(null);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(error);

      setVideos([]);

      setError(
        "Videos load avvaledu. Please check API settings."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // VOICE SEARCH
  // =========================

  function startVoiceSearch() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice search is not supported in this browser."
      );
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = async (event) => {
      const spokenText =
        event.results[0][0].transcript;

      const command =
        spokenText
          .toLowerCase()
          .trim();

      console.log(
        "Voice command:",
        command
      );

      // =====================================================
      // EXIT FOCUS MODE
      // =====================================================

      const exitFocusCommands = [
        "exit focus mode",
        "close focus mode",
        "exit focus",
        "close focus",
        "focus mode off",
        "focus off",
        "turn off focus",
        "turn off focus mode",
        "disable focus",
        "disable focus mode",
        "exit fullscreen",
        "exit full screen",
        "leave focus mode",
        "stop focus mode",
        "stop focus",
      ];

      const shouldExitFocus =
        exitFocusCommands.some(
          (item) =>
            command.includes(item)
        ) ||
        command === "off" ||
        command === "disable";

      if (shouldExitFocus) {
        setFocusMode(false);
        return;
      }

      // =====================================================
      // FOCUS MODE
      // =====================================================

      const shouldEnterFocus =
        command.includes(
          "focus mode"
        ) ||
        command === "focus" ||
        command.includes(
          "turn on focus"
        ) ||
        command.includes(
          "enable focus"
        ) ||
        command.includes(
          "fullscreen"
        ) ||
        command.includes(
          "full screen"
        );

      if (shouldEnterFocus) {
        if (selectedVideo) {
          setFocusMode(true);
          return;
        }

        if (videos.length > 0) {
          setSelectedVideo(
            videos[0]
          );

          saveWatchedVideo(
            videos[0]
          );

          setFocusMode(true);
          return;
        }

        setError(
          "Please search and open a video first."
        );

        return;
      }

      // =====================================================
      // OPEN HISTORY
      // =====================================================

      if (
        command.includes(
          "open history"
        ) ||
        command.includes(
          "show history"
        ) ||
        command === "history"
      ) {
        setCurrentPage(
          "history"
        );

        setSelectedVideo(null);
        setFocusMode(false);

        return;
      }

      // =====================================================
      // OPEN FAVORITES
      // =====================================================

      if (
        command.includes(
          "open favorites"
        ) ||
        command.includes(
          "show favorites"
        ) ||
        command === "favorites"
      ) {
        setCurrentPage(
          "favorites"
        );

        setSelectedVideo(null);
        setFocusMode(false);

        return;
      }

      // =====================================================
      // OPEN NOTES
      // =====================================================

      if (
        command.includes(
          "open notes"
        ) ||
        command.includes(
          "show notes"
        ) ||
        command === "notes"
      ) {
        setCurrentPage("notes");

        setSelectedVideo(null);
        setFocusMode(false);

        return;
      }

      // =====================================================
      // OPEN WATCH LATER
      // =====================================================

      if (
        command.includes(
          "open watch later"
        ) ||
        command.includes(
          "watch later"
        ) ||
        command.includes(
          "show watch later"
        )
      ) {
        setCurrentPage(
          "watch-later"
        );

        setSelectedVideo(null);
        setFocusMode(false);

        return;
      }

      // =====================================================
      // SCROLL DOWN
      // =====================================================

      if (
        command.includes(
          "scroll down"
        ) ||
        command.includes(
          "go down"
        ) ||
        command.includes(
          "move down"
        )
      ) {
        window.scrollBy({
          top: 600,
          behavior: "smooth",
        });

        return;
      }

      // =====================================================
      // SCROLL UP
      // =====================================================

      if (
        command.includes(
          "scroll up"
        ) ||
        command.includes(
          "go up"
        ) ||
        command.includes(
          "move up"
        )
      ) {
        window.scrollBy({
          top: -600,
          behavior: "smooth",
        });

        return;
      }

      // =====================================================
      // GO HOME
      // =====================================================

      if (
        command.includes(
          "go home"
        ) ||
        command === "home" ||
        command.includes(
          "open home"
        )
      ) {
        setCurrentPage("home");
        setSelectedVideo(null);
        setFocusMode(false);
        setQuery("");

        loadHomeRecommendations();
        loadHomeSections();

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      // =====================================================
      // GO BACK
      // =====================================================

      if (
        command.includes(
          "go back"
        ) ||
        command === "back"
      ) {
        setSelectedVideo(null);
        setFocusMode(false);

        return;
      }

      // =====================================================
      // CLOSE VIDEO
      // =====================================================

      if (
        command === "stop" ||
        command === "stop video" ||
        command.includes(
          "close video"
        ) ||
        command.includes(
          "exit video"
        )
      ) {
        setSelectedVideo(null);
        setFocusMode(false);
        setShowNoteBox(false);
        setNoteText("");

        return;
      }

      // =====================================================
      // OPEN FIRST VIDEO
      // =====================================================

      if (
        command.includes(
          "open first video"
        ) ||
        command.includes(
          "play first video"
        )
      ) {
        if (videos.length > 0) {
          setSelectedVideo(
            videos[0]
          );

          saveWatchedVideo(
            videos[0]
          );
        } else {
          setError(
            "No videos available."
          );
        }

        return;
      }

      // =====================================================
      // PLAY VIDEO BY VOICE
      // =====================================================

      let videoName = "";

      if (
        command.startsWith("play ")
      ) {
        videoName =
          spokenText
            .substring(5)
            .trim();
      }

      if (
        command.startsWith("open ")
      ) {
        videoName =
          spokenText
            .substring(5)
            .trim();
      }

      if (videoName) {
        try {
          setLoading(true);
          setError("");
          setCurrentPage("home");
          setQuery(videoName);

          const results =
            (await searchYouTubeVideos(
              videoName
            )) || [];

          if (results.length === 0) {
            setError(
              `No video found for "${videoName}".`
            );

            setSelectedVideo(null);

            return;
          }

          setVideos(results);

          setSelectedVideo(
            results[0]
          );

          saveHistory(
            videoName
          );

          saveWatchedVideo(
            results[0]
          );
        } catch (error) {
          console.error(error);

          setError(
            "Voice video search failed. Please check API settings."
          );

          setSelectedVideo(null);
        } finally {
          setLoading(false);
        }

        return;
      }

      // =====================================================
      // NORMAL VOICE SEARCH
      // =====================================================

      setQuery(spokenText);

      try {
        setLoading(true);
        setError("");

        const results =
          (await searchYouTubeVideos(
            spokenText
          )) || [];

        if (results.length === 0) {
          setVideos([]);

          setError(
            `No videos found for "${spokenText}".`
          );

          return;
        }

        saveHistory(
          spokenText
        );

        setVideos(results);
        setSelectedVideo(null);
      } catch (error) {
        console.error(error);

        setVideos([]);

        setError(
          "Voice search failed. Please check API settings."
        );
      } finally {
        setLoading(false);
      }
    };

    recognition.onerror = (event) => {
      console.error(
        "Voice error:",
        event.error
      );

      setError(
        "Voice recognition failed. Please try again."
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  // =========================
  // SAVE NOTE
  // =========================

  function saveNote() {
    if (
      !noteText.trim() ||
      !selectedVideo
    ) {
      return;
    }

    const existingNotes =
      JSON.parse(
        localStorage.getItem(
          "vocatube-notes"
        )
      ) || [];

    const newNote = {
      id: Date.now(),
      videoId:
        selectedVideo.id.videoId,
      videoTitle:
        selectedVideo.snippet.title,
      channel:
        selectedVideo.snippet.channelTitle,
      note:
        noteText.trim(),
      createdAt:
        new Date().toLocaleString(),
    };

    const updatedNotes = [
      newNote,
      ...existingNotes,
    ];

    localStorage.setItem(
      "vocatube-notes",
      JSON.stringify(
        updatedNotes
      )
    );

    setNoteText("");
    setShowNoteBox(false);

    alert(
      "✅ Note saved successfully!"
    );
  }

  function toggleFocusMode() {
    setFocusMode(
      (previousMode) =>
        !previousMode
    );
  }

  // =========================================================
  // REUSABLE HOME VIDEO SECTION
  // =========================================================

  function renderHomeVideoSection(
    label,
    title,
    sectionVideos
  ) {
    if (!sectionVideos?.length) {
      return null;
    }

    return (
      <section className="home-video-section">

        <div className="section-title">

          <div>
            <p>
              {label}
            </p>

            <h2>
              {title}
            </h2>
          </div>

          <span>
            {sectionVideos.length} videos
          </span>

        </div>

        <section className="video-grid">

          {sectionVideos.map(
            (video) => (

              <article
                className="video-card"
                key={
                  video.id.videoId
                }
                onClick={() => {
                  setSelectedVideo(
                    video
                  );

                  saveWatchedVideo(
                    video
                  );
                }}
              >

                <div
                  className="thumbnail-container"
                  style={{
                    cursor:
                      "pointer",
                  }}
                >

                  <img
                    src={
                      video
                        .snippet
                        .thumbnails
                        .high?.url ||
                      video
                        .snippet
                        .thumbnails
                        .medium?.url ||
                      ""
                    }
                    alt={
                      video
                        .snippet
                        .title
                    }
                  />

                  <div className="play-overlay">
                    ▶
                  </div>

                </div>

                <div className="video-info">

                  <h3>
                    {
                      video
                        .snippet.title
                    }
                  </h3>

                  <p className="channel">
                    👤{" "}
                    {
                      video
                        .snippet
                        .channelTitle
                    }
                  </p>

                  <div className="video-footer">

                    <span>
                      🎬 YouTube
                    </span>

                    <button
                      type="button"
                      className="watch-later-btn small"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        addToWatchLater(
                          video
                        );
                      }}
                    >
                      🔖 Watch Later
                    </button>

                  </div>

                </div>

              </article>

            )
          )}

        </section>

      </section>
    );
  }

  return (
    <div
      className={`app ${
        focusMode
          ? "focus-mode"
          : ""
      }`}
    >

      {/* =====================================================
          PREMIUM LOGOUT MODAL
          ===================================================== */}

      {showLogoutModal && (
        <div
          className="logout-modal-overlay"
          onClick={cancelLogout}
        >
          <div
            className="logout-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="logout-modal-icon">
              🚪
            </div>

            <p className="logout-modal-label">
              ACCOUNT ACTION
            </p>

            <h2>
              Ready to leave?
            </h2>

            <p>
              Are you sure you want to logout from
              your VocaTube account?
            </p>

            <div className="logout-modal-actions">

              <button
                className="logout-cancel-btn"
                onClick={cancelLogout}
              >
                Stay Logged In
              </button>

              <button
                className="logout-confirm-btn"
                onClick={confirmLogout}
              >
                Logout
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Navbar */}

      <VoiceControl />

      <header className="navbar">

        <div className="logo">
          🎙️ <span>Voca</span>Tube
        </div>

        <div className="nav-links">

          <button
            className={
              currentPage === "home"
                ? "active"
                : ""
            }
            onClick={() => {
              setCurrentPage("home");
              setSelectedVideo(null);
              setFocusMode(false);
              setQuery("");

              loadHomeRecommendations();
              loadHomeSections();
            }}
          >
            🏠 Home
          </button>

          <button
            className={
              currentPage === "history"
                ? "active"
                : ""
            }
            onClick={() => {
              setCurrentPage("history");
              setSelectedVideo(null);
            }}
          >
            🕘 History
          </button>

          <button
            className={
              currentPage === "favorites"
                ? "active"
                : ""
            }
            onClick={() => {
              setCurrentPage(
                "favorites"
              );

              setSelectedVideo(null);
            }}
          >
            ❤️ Favorites
          </button>

          <button
            className={
              currentPage === "notes"
                ? "active"
                : ""
            }
            onClick={() => {
              setCurrentPage("notes");
              setSelectedVideo(null);
            }}
          >
            📝 Notes
          </button>

          <button
            className={
              currentPage ===
              "watch-later"
                ? "active"
                : ""
            }
            onClick={() => {
              setCurrentPage(
                "watch-later"
              );

              setSelectedVideo(null);
              setFocusMode(false);
            }}
          >
            🔖 Watch Later
          </button>

        </div>

        <div className="search-area">

          <input
            type="text"
            value={query}
            placeholder="Search YouTube videos..."
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                handleSearch();
              }
            }}
          />

          <button
            onClick={handleSearch}
          >
            🔍
          </button>

        </div>

        <button
          className={`voice-button ${
            isListening
              ? "listening"
              : ""
          }`}
          onClick={startVoiceSearch}
        >
          {isListening
            ? "🔴"
            : "🎤"}
        </button>

        <button
          className="user-icon logout-button"
          onClick={handleLogout}
          title="Logout"
        >
          🚪
        </button>

      </header>

      {/* Main */}

      <main className="main-content">

        {currentPage === "history" ? (
          <History />

        ) : currentPage ===
          "favorites" ? (
          <Favorites />

        ) : currentPage === "notes" ? (
          <Notes />

        ) : currentPage ===
          "watch-later" ? (
          <WatchLater
            onPlayVideo={
              playWatchLaterVideo
            }
          />

        ) : (

          <>

            {/* Video Player */}

            {selectedVideo && (
              <section className="player-section">

                <button
                  className="back-button"
                  onClick={() => {
                    setSelectedVideo(
                      null
                    );

                    setFocusMode(
                      false
                    );
                  }}
                >
                  ← Back to results
                </button>

                <div className="player-container">

                  <div className="player-video">

                    <iframe
                      src={
                        "https://www.youtube.com/embed/" +
                        selectedVideo.id.videoId +
                        "?autoplay=1&rel=0"
                      }
                      title={
                        selectedVideo.snippet.title
                      }
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>

                  </div>

                  <div className="player-details">

                    <h1>
                      {
                        selectedVideo
                          .snippet.title
                      }
                    </h1>

                    <p>
                      👤{" "}
                      {
                        selectedVideo
                          .snippet
                          .channelTitle
                      }
                    </p>

                  </div>

                  <div className="player-actions">

                    <button
                      onClick={() =>
                        setShowNoteBox(
                          true
                        )
                      }
                    >
                      📝 Add Note
                    </button>

                    <button
                      onClick={
                        addBookmark
                      }
                    >
                      🔖 Bookmark
                    </button>

                    <button
                      className="watch-later-btn"
                      onClick={() => {
                        addToWatchLater(
                          selectedVideo
                        );
                      }}
                    >
                      🔖 Watch Later
                    </button>

                    <button
                      onClick={
                        toggleFocusMode
                      }
                    >
                      {focusMode
                        ? "🎯 Exit Focus Mode"
                        : "🎯 Focus Mode"}
                    </button>

                    {showNoteBox && (
                      <div className="note-box">

                        <h3>
                          📝 Add Your Note
                        </h3>

                        <textarea
                          value={
                            noteText
                          }
                          onChange={(
                            event
                          ) =>
                            setNoteText(
                              event.target
                                .value
                            )
                          }
                          placeholder="Write something important about this video..."
                          rows="5"
                        ></textarea>

                        <div className="note-buttons">

                          <button
                            onClick={
                              saveNote
                            }
                          >
                            💾 Save Note
                          </button>

                          <button
                            onClick={() => {
                              setShowNoteBox(
                                false
                              );

                              setNoteText(
                                ""
                              );
                            }}
                          >
                            Cancel
                          </button>

                        </div>

                      </div>
                    )}

                    {focusMode && (
                      <button
                        className={`focus-voice-button ${
                          isListening
                            ? "listening"
                            : ""
                        }`}
                        onClick={
                          startVoiceSearch
                        }
                        title="Voice Control"
                      >
                        {isListening
                          ? "🔴 Listening..."
                          : "🎤 Voice Control"}
                      </button>
                    )}

                  </div>

                </div>

              </section>
            )}

            {/* =================================================
                HOME CONTENT
                ================================================= */}

            {!selectedVideo && (
              <>

                {/* Category Buttons */}

                <section className="categories">

                  <button
                    onClick={() =>
                      handleCategorySearch(
                        "Programming"
                      )
                    }
                  >
                    Programming
                  </button>

                  <button
                    onClick={() =>
                      handleCategorySearch(
                        "JavaScript"
                      )
                    }
                  >
                    JavaScript
                  </button>

                  <button
                    onClick={() =>
                      handleCategorySearch(
                        "React JS"
                      )
                    }
                  >
                    React JS
                  </button>

                  <button
                    onClick={() =>
                      handleCategorySearch(
                        "Music"
                      )
                    }
                  >
                    Music
                  </button>

                  <button
                    onClick={() =>
                      handleCategorySearch(
                        "Gaming"
                      )
                    }
                  >
                    Gaming
                  </button>

                  <button
                    onClick={() =>
                      handleCategorySearch(
                        "Education"
                      )
                    }
                  >
                    Education
                  </button>

                </section>

                {/* VOICE COMMANDS HELP */}

                <section className="voice-help">

                  <div className="voice-help-header">

                    <div>

                      <p>
                        VOICE CONTROL
                      </p>

                      <h2>
                        Voice Commands
                      </h2>

                    </div>

                    <span>
                      🎙️ Speak naturally
                    </span>

                  </div>

                  <div className="voice-command-grid">

                    <div className="voice-command-card">
                      <span>▶️</span>

                      <div>
                        <strong>
                          Play a video
                        </strong>

                        <p>
                          "Play JavaScript tutorial"
                        </p>
                      </div>

                    </div>

                    <div className="voice-command-card">
                      <span>🕘</span>

                      <div>
                        <strong>
                          Open History
                        </strong>

                        <p>
                          "Open History"
                        </p>
                      </div>

                    </div>

                    <div className="voice-command-card">
                      <span>❤️</span>

                      <div>
                        <strong>
                          Open Favorites
                        </strong>

                        <p>
                          "Open Favorites"
                        </p>
                      </div>

                    </div>

                    <div className="voice-command-card">
                      <span>📝</span>

                      <div>
                        <strong>
                          Open Notes
                        </strong>

                        <p>
                          "Open Notes"
                        </p>
                      </div>

                    </div>

                    <div className="voice-command-card">
                      <span>🔖</span>

                      <div>
                        <strong>
                          Open Watch Later
                        </strong>

                        <p>
                          "Open Watch Later"
                        </p>
                      </div>

                    </div>

                    <div className="voice-command-card">
                      <span>🎯</span>

                      <div>
                        <strong>
                          Focus Mode On
                        </strong>

                        <p>
                          "Focus Mode On"
                        </p>
                      </div>

                    </div>

                    <div className="voice-command-card">
                      <span>🚫</span>

                      <div>
                        <strong>
                          Focus Mode Off
                        </strong>

                        <p>
                          "Focus Mode Off"
                        </p>
                      </div>

                    </div>

                    <div className="voice-command-card">
                      <span>⬇️</span>

                      <div>
                        <strong>
                          Scroll Down
                        </strong>

                        <p>
                          "Scroll Down"
                        </p>
                      </div>

                    </div>

                    <div className="voice-command-card">
                      <span>⬆️</span>

                      <div>
                        <strong>
                          Scroll Up
                        </strong>

                        <p>
                          "Scroll Up"
                        </p>
                      </div>

                    </div>

                    <div className="voice-command-card">
                      <span>🏠</span>

                      <div>
                        <strong>
                          Go Home
                        </strong>

                        <p>
                          "Go Home"
                        </p>
                      </div>

                    </div>

                    <div className="voice-command-card">
                      <span>🔙</span>

                      <div>
                        <strong>
                          Go Back
                        </strong>

                        <p>
                          "Go Back"
                        </p>
                      </div>

                    </div>

                  </div>

                </section>

                {/* =================================================
                    PERSONALIZED RECOMMENDATIONS
                    ================================================= */}

                <div className="section-title">

                  <div>

                    <p>
                      {query.trim()
                        ? "SEARCH"
                        : "PERSONALIZED FOR YOU"}
                    </p>

                    <h2>
                      {query.trim()
                        ? "Search Results"
                        : "🔥 Recommended For You"}
                    </h2>

                  </div>

                  <span>
                    {videos.length} videos
                  </span>

                </div>

                {/* Loading */}

                {loading && (
                  <div className="loading">

                    <div className="loader"></div>

                    <p>
                      Finding amazing videos...
                    </p>

                  </div>
                )}

                {/* Error */}

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {/* Empty State */}

                {!loading &&
                  videos.length === 0 &&
                  !error && (
                    <div className="empty-state">

                      <div className="empty-icon">
                        🎬
                      </div>

                      <h2>
                        Search something to get started
                      </h2>

                      <p>
                        Try searching for React,
                        JavaScript, music, gaming or
                        anything you like.
                      </p>

                    </div>
                  )}

                {/* Recommended / Search Result Video Grid */}

                {!loading &&
                  videos.length > 0 && (
                    <section className="video-grid">

                      {videos.map(
                        (video) => (

                          <article
                            className="video-card"
                            key={
                              video.id.videoId
                            }
                            onClick={() => {
                              setSelectedVideo(
                                video
                              );

                              saveWatchedVideo(
                                video
                              );
                            }}
                          >

                            <div
                              className="thumbnail-container"
                              style={{
                                cursor:
                                  "pointer",
                              }}
                            >

                              <img
                                src={
                                  video
                                    .snippet
                                    .thumbnails
                                    .high?.url ||
                                  video
                                    .snippet
                                    .thumbnails
                                    .medium?.url ||
                                  ""
                                }
                                alt={
                                  video
                                    .snippet
                                    .title
                                }
                              />

                              <div className="play-overlay">
                                ▶
                              </div>

                            </div>

                            <div className="video-info">

                              <h3>
                                {
                                  video
                                    .snippet
                                    .title
                                }
                              </h3>

                              <p className="channel">
                                👤{" "}
                                {
                                  video
                                    .snippet
                                    .channelTitle
                                }
                              </p>

                              <div className="video-footer">

                                <span>
                                  🎬 YouTube
                                </span>

                                <button
                                  type="button"
                                  className="watch-later-btn small"
                                  onClick={(
                                    event
                                  ) => {
                                    event.stopPropagation();

                                    addToWatchLater(
                                      video
                                    );
                                  }}
                                >
                                  🔖 Watch Later
                                </button>

                              </div>

                            </div>

                          </article>

                        )
                      )}

                    </section>
                  )}

                {/* =================================================
                    AUTOMATIC HOME VIDEO SECTIONS
                    ================================================= */}

                {homeSectionsLoading && (
                  <div className="loading home-sections-loading">

                    <div className="loader"></div>

                    <p>
                      Loading more videos for you...
                    </p>

                  </div>
                )}

                {/* TRENDING */}

                {renderHomeVideoSection(
                  "TRENDING NOW",
                  "🔥 Trending Videos",
                  homeSections.trending
                )}

                {/* PROGRAMMING */}

                {renderHomeVideoSection(
                  "DEVELOPERS",
                  "💻 Programming",
                  homeSections.programming
                )}

                {/* REACT */}

                {renderHomeVideoSection(
                  "MODERN WEB",
                  "⚛️ React JS",
                  homeSections.react
                )}

                {/* MUSIC */}

                {renderHomeVideoSection(
                  "LISTEN & ENJOY",
                  "🎵 Music",
                  homeSections.music
                )}

                {/* GAMING */}

                {renderHomeVideoSection(
                  "LEVEL UP",
                  "🎮 Gaming",
                  homeSections.gaming
                )}

                {/* EDUCATION */}

                {renderHomeVideoSection(
                  "KEEP LEARNING",
                  "📚 Education",
                  homeSections.education
                )}

              </>
            )}

          </>
        )}

      </main>

    </div>
  );
}

// =========================================================
// APP ROUTING + AUTHENTICATION
// =========================================================

function App() {
  const location =
    useLocation();

  const users =
    JSON.parse(
      localStorage.getItem(
        "vocatube-users"
      )
    ) || [];

  const currentUser =
    JSON.parse(
      localStorage.getItem(
        "vocatube-current-user"
      )
    );

  const isLoggedIn =
    localStorage.getItem(
      "vocatube-auth"
    ) === "true";

  // =======================================================
  // SIGNUP PAGE
  // =======================================================

  if (
    location.pathname ===
    "/signup"
  ) {
    if (
      isLoggedIn &&
      currentUser
    ) {
      return (
        <Navigate
          to="/"
          replace
        />
      );
    }

    return <Signup />;
  }

  // =======================================================
  // LOGIN PAGE
  // =======================================================

  if (
    location.pathname ===
    "/login"
  ) {
    if (
      isLoggedIn &&
      currentUser
    ) {
      return (
        <Navigate
          to="/"
          replace
        />
      );
    }

    return <Login />;
  }

  // =======================================================
  // NO USERS REGISTERED YET
  // =======================================================

  if (users.length === 0) {
    return (
      <Navigate
        to="/signup"
        replace
      />
    );
  }

  // =======================================================
  // USERS EXIST BUT NOBODY IS LOGGED IN
  // =======================================================

  if (
    !isLoggedIn ||
    !currentUser
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // =======================================================
  // LOGGED-IN USER
  // =======================================================

  return <VocaTubeApp />;
}

export default App;