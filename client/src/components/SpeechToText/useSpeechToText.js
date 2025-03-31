import { useCallback, useEffect, useState } from "react";

export function useSpeechToText() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;

            recognitionInstance.onresult = (event) => {
                let currentTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                // Ensure the transcript is always a string
                setTranscript(currentTranscript || '');
            };

            setRecognition(recognitionInstance);
        }
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            recognition?.stop();
        } else {
            recognition?.start();
        }
        setIsListening(!isListening);
    }, [isListening, recognition]);

    return {
        isListening,
        transcript,
        toggleListening,
        setTranscript,
    };
}

