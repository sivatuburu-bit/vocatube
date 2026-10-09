import { useState } from "react";

function VoiceControl() {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");
  const [showCommands, setShowCommands] = useState(false);

  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    setListening(true);
    setMessage("🎙️ Listening...");

    recognition.start();

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      const command = spokenText.toLowerCase().trim();

      setMessage(`You said: "${spokenText}"`);

      console.log("Voice command:", spokenText);

      // ==================================
      // OPEN HISTORY
      // ==================================

      if (
        command.includes("open history") ||
        command === "history"
      ) {
        window.dispatchEvent(new Event("open-history"));
        return;
      }

      // ==================================
      // OPEN FAVORITES
      // ==================================

      if (
        command.includes("open favorites") ||
        command.includes("open favorite") ||
        command === "favorites"
      ) {
        window.dispatchEvent(new Event("open-favorites"));
        return;
      }

      // ==================================
      // OPEN NOTES
      // ==================================

      if (
        command.includes("open notes") ||
        command === "notes"
      ) {
        window.dispatchEvent(new Event("open-notes"));
        return;
      }

      // ==================================
      // OPEN WATCH LATER
      // ==================================

      if (
        command.includes("open watch later") ||
        command.includes("watch later") ||
        command.includes("open saved videos")
      ) {
        window.dispatchEvent(new Event("open-watch-later"));
        return;
      }

      // ==================================
      // GO HOME
      // ==================================

      if (
        command.includes("go home") ||
        command.includes("open home") ||
        command === "home"
      ) {
        window.dispatchEvent(new Event("go-home"));
        return;
      }

      // ==================================
      // GO BACK
      // ==================================

      if (
        command.includes("go back") ||
        command === "back"
      ) {
        window.dispatchEvent(new Event("go-back"));
        return;
      }

      // ==================================
      // SCROLL DOWN
      // ==================================

      if (
        command.includes("scroll down") ||
        command.includes("go down") ||
        command.includes("move down")
      ) {
        window.dispatchEvent(new Event("scroll-down"));
        return;
      }

      // ==================================
      // SCROLL UP
      // ==================================

      if (
        command.includes("scroll up") ||
        command.includes("go up") ||
        command.includes("move up")
      ) {
        window.dispatchEvent(new Event("scroll-up"));
        return;
      }

      // ==================================
      // FOCUS MODE ON
      // ==================================

      if (
        command.includes("focus mode on") ||
        command.includes("turn on focus mode") ||
        command === "focus on" ||
        command === "focus mode"
      ) {
        window.dispatchEvent(new Event("focus-on"));
        return;
      }

      // ==================================
      // FOCUS MODE OFF
      // ==================================

      if (
        command.includes("focus mode off") ||
        command.includes("turn off focus mode") ||
        command === "focus off" ||
        command.includes("exit focus mode")
      ) {
        window.dispatchEvent(new Event("focus-off"));
        return;
      }

      // ==================================
      // CLOSE / STOP VIDEO
      // ==================================

      if (
        command.includes("close video") ||
        command.includes("stop video") ||
        command.includes("close player") ||
        command === "stop"
      ) {
        window.dispatchEvent(new Event("close-video"));
        return;
      }

      // ==================================
      // OPEN FIRST VIDEO
      // ==================================

      if (
        command.includes("open first video") ||
        command.includes("play first video")
      ) {
        window.dispatchEvent(new Event("open-first-video"));
        return;
      }

      // ==================================
      // OPEN VIDEO BY VOICE
      // ==================================

      let videoName = "";

      if (command.startsWith("open ")) {
        videoName = spokenText.substring(5).trim();
      } else if (command.startsWith("play ")) {
        videoName = spokenText.substring(5).trim();
      }

      if (videoName) {
        window.dispatchEvent(
          new CustomEvent("voice-video-search", {
            detail: {
              query: videoName,
            },
          })
        );

        return;
      }

      // ==================================
      // NORMAL VOICE SEARCH
      // ==================================

      window.dispatchEvent(
        new CustomEvent("voice-search", {
          detail: {
            query: spokenText,
          },
        })
      );
    };

    recognition.onerror = () => {
      setListening(false);
      setMessage("❌ Voice recognition failed.");
    };

    recognition.onend = () => {
      setListening(false);
    };
  }

  return (
    <div className="voice-control">

      {/* VOICE COMMANDS MINI PANEL */}

      {showCommands && (
        <div className="voice-commands-mini">

          <div className="voice-commands-header">

            <span>🎙️ Voice Commands</span>

            <button
              type="button"
              className="voice-close-btn"
              onClick={() => setShowCommands(false)}
            >
              ×
            </button>

          </div>

          <div className="voice-command-list">

            <span>📂 "Open History"</span>

            <span>❤️ "Open Favorites"</span>

            <span>📝 "Open Notes"</span>

            <span>🔖 "Open Watch Later"</span>

            <span>🏠 "Go Home"</span>

            <span>↩️ "Go Back"</span>

            <span>⬇️ "Scroll Down"</span>

            <span>⬆️ "Scroll Up"</span>

            <span>🎯 "Focus Mode On"</span>

            <span>🚫 "Focus Mode Off"</span>

            <span>✖️ "Close Video"</span>

            <span>⏹️ "Stop Video"</span>

            <span>🎬 "Open First Video"</span>

            <span>▶️ "Play JavaScript"</span>

            <span>⚛️ "Play React"</span>

            <span>🔎 "Search YouTube"</span>

            <span>🎥 "Open [Video Name]"</span>

          </div>

        </div>
      )}

      {/* MESSAGE */}

      {message && (
        <p className="voice-message">
          {message}
        </p>
      )}

      {/* BUTTONS */}

      <div className="voice-buttons">

        <button
          type="button"
          onClick={startListening}
          className="voice-button"
        >
          {listening ? "🎙️ Listening..." : "🎤 Voice Control"}
        </button>

        <button
          type="button"
          className="voice-help-button"
          onClick={() => setShowCommands(!showCommands)}
          title="Voice Commands"
        >
          ?
        </button>

      </div>

    </div>
  );
}

export default VoiceControl;