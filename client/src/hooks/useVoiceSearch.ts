import { useState, useCallback } from 'react';

export const useVoiceSearch = (onResult: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setError('Voice search is not supported in this browser.'); return; }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'mn-MN'; recognition.interimResults = false; recognition.maxAlternatives = 1;
    
    recognition.onstart = () => { setIsListening(true); setError(null); };
    recognition.onresult = (event: any) => { onResult(event.results[0][0].transcript); };
    recognition.onerror = (event: any) => { setError(event.error); setIsListening(false); };
    recognition.onend = () => { setIsListening(false); };
    
    recognition.start();
  }, [onResult]);

  return { isListening, error, startListening };
};
