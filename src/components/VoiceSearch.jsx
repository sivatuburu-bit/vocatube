import { useState } from "react";

function VoiceSearch({ onSearch }) {
  const [listening, setListening] = useState(false);

  const startVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;

      onSearch(voiceText);
    };

    recognition.onerror = () => {
      setListening(false);
      alert("Could not recognize your voice. Please try again.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <button
      className="voice-button"
      onClick={startVoiceSearch}
      type="button"
    >
      {listening ? "🎙️ Listening..." : "🎤 Voice Search"}
    </button>
  );
}

export default VoiceSearch;
