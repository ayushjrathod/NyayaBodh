import { Button } from "@nextui-org/react";
import { Mic, MicOff } from "lucide-react";
import { useSpeechToText } from "./useSpeechToText";

const SpeechToTextTest = () => {
  const { isListening, transcript, toggleListening, isSupported } = useSpeechToText();

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Speech-to-Text Test</h3>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Browser Support: {isSupported ? "✅ Supported" : "❌ Not Supported"}
        </p>
        <p className="text-sm text-gray-600 mb-2">Status: {isListening ? "🎤 Listening..." : "🔇 Not Listening"}</p>
      </div>

      <Button
        color={isListening ? "danger" : "primary"}
        variant={isListening ? "solid" : "bordered"}
        onClick={toggleListening}
        disabled={!isSupported}
        startContent={isListening ? <Mic /> : <MicOff />}
        className="mb-4"
      >
        {isListening ? "Stop Listening" : "Start Listening"}
      </Button>

      <div className="border p-3 rounded bg-gray-50 min-h-[100px]">
        <p className="text-sm text-gray-600 mb-2">Transcript:</p>
        <p className="text-gray-800">{transcript || "No speech detected yet..."}</p>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>Instructions:</p>
        <ul className="list-disc list-inside">
          <li>Click &ldquo;Start Listening&rdquo; and allow microphone access</li>
          <li>Speak clearly into your microphone</li>
          <li>Your speech should appear in the transcript area</li>
          <li>Works best in Chrome, Edge, or Safari</li>
        </ul>
      </div>
    </div>
  );
};

export default SpeechToTextTest;
