import { useCallback, useEffect, useState } from "react";

/**
 * React hook that provides live speech-to-text using the browser's Web Speech API (SpeechRecognition).
 *
 * Initializes a SpeechRecognition instance when available, manages listening state and accumulated transcript,
 * and exposes controls to start, stop, or toggle listening. Gracefully handles unsupported environments.
 *
 * @return {{isListening: boolean, transcript: string, toggleListening: function(): void, startListening: function(): void, stopListening: function(): void, setTranscript: function(string): void, isSupported: boolean}}
 *   An object with:
 *   - isListening: true when recognition is active.
 *   - transcript: latest accumulated transcript (final or interim), trimmed.
 *   - toggleListening: starts or stops recognition; clears transcript when starting.
 *   - startListening: starts recognition if supported and not already listening; clears transcript when starting.
 *   - stopListening: stops recognition if currently listening.
 *   - setTranscript: React state setter to replace the transcript string.
 *   - isSupported: true if SpeechRecognition is available in the current browser.
 */
export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      // Configure recognition settings
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";
      recognitionInstance.maxAlternatives = 1;

      // Handle results
      recognitionInstance.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update transcript with final + interim results
        setTranscript(() => {
          const baseTranscript = finalTranscript || interimTranscript;
          return baseTranscript.trim();
        });
      };

      // Handle errors
      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);

        if (event.error === "not-allowed") {
          alert("Microphone access denied. Please allow microphone access and try again.");
        } else if (event.error === "no-speech") {
          console.log("No speech detected. Please try again.");
        }
      };

      // Handle start
      recognitionInstance.onstart = () => {
        setIsListening(true);
        console.log("Speech recognition started");
      };

      // Handle end
      recognitionInstance.onend = () => {
        setIsListening(false);
        console.log("Speech recognition ended");
      };

      setRecognition(recognitionInstance);
      setIsSupported(true);
    } else {
      console.warn("Speech Recognition API is not supported in this browser");
      setIsSupported(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognition || !isSupported) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      if (isListening) {
        recognition.stop();
      } else {
        // Clear previous transcript when starting new session
        setTranscript("");
        recognition.start();
      }
    } catch (error) {
      console.error("Error toggling speech recognition:", error);
      setIsListening(false);
    }
  }, [isListening, recognition, isSupported]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  const startListening = useCallback(() => {
    if (recognition && !isListening && isSupported) {
      try {
        setTranscript("");
        recognition.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  }, [recognition, isListening, isSupported]);

  return {
    isListening,
    transcript,
    toggleListening,
    startListening,
    stopListening,
    setTranscript,
    isSupported,
  };
}
