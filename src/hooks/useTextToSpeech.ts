import { useState, useCallback, useEffect, useRef } from 'react';

interface RecipeForSpeech {
  name: string;
  description?: string;
  ingredients?: Array<{ name: string; measure?: string }> | string[];
  instructions?: string[];
}

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const queueRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Stop all speech
  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    queueRef.current = [];
    currentIndexRef.current = 0;
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentSection('');
  }, [isSupported]);

  // Pause speech
  const pause = useCallback(() => {
    if (!isSupported || !isSpeaking) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported, isSpeaking]);

  // Resume speech
  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported, isPaused]);

  // Simple speak function
  const speak = useCallback((text: string) => {
    if (!isSupported) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Get voices and select one
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSection('');
    };
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  // Speak recipe with sections
  const speakRecipe = useCallback((recipe: RecipeForSpeech) => {
    if (!isSupported) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();
    
    // Build the full text
    let fullText = `${recipe.name}. `;
    
    if (recipe.description) {
      fullText += `${recipe.description}. `;
    }

    // Handle ingredients
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      fullText += 'Ingredients: ';
      recipe.ingredients.forEach((ing, i) => {
        if (typeof ing === 'string') {
          fullText += `${ing}. `;
        } else if (ing && ing.name) {
          const measure = ing.measure ? `${ing.measure} ` : '';
          fullText += `${measure}${ing.name}. `;
        }
      });
    }

    // Handle instructions
    if (recipe.instructions && recipe.instructions.length > 0) {
      fullText += 'Instructions: ';
      recipe.instructions.forEach((step, i) => {
        fullText += `Step ${i + 1}: ${step}. `;
      });
    }

    fullText += 'Enjoy your meal!';

    console.log('Speaking:', fullText);

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    // Get voices
    let voices = window.speechSynthesis.getVoices();
    
    // If no voices, wait for them
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        if (voice) utterance.voice = voice;
        setIsSpeaking(true);
        setCurrentSection('Speaking');
        window.speechSynthesis.speak(utterance);
      };
      return;
    }

    // Select voice
    const voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (voice) {
      utterance.voice = voice;
      console.log('Using voice:', voice.name);
    }

    utterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
      setCurrentSection('Speaking');
    };

    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
      setCurrentSection('');
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsSpeaking(false);
      setCurrentSection('');
    };

    // Speak!
    setIsSpeaking(true);
    setCurrentSection('Speaking');
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  // Initialize voices
  useEffect(() => {
    if (!isSupported) return;

    // Load voices
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log('Voices available:', voices.length);
    };

    // Cleanup
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  return {
    speak,
    speakRecipe,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    currentSection,
  };
}
