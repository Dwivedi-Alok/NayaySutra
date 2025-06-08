// utils/translation.js

export const translateText = async (text, sourceLang, targetLang, dialect) => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang,
        dialect
      })
    });

    const data = await response.json();
    
    if (data.success) {
      return { success: true, translation: data.translation };
    } else {
      throw new Error(data.error || 'Translation failed');
    }
  } catch (error) {
    console.error('Translation error:', error);
    return { success: false, error: error.message };
  }
};

// Language code mapping for Indian languages
const LANGUAGE_MAP = {
  'en': 'en-IN',
  'hi': 'hi-IN',
  'bn': 'bn-IN',
  'te': 'te-IN',
  'mr': 'mr-IN',
  'ta': 'ta-IN',
  'gu': 'gu-IN',
  'kn': 'kn-IN',
  'ml': 'ml-IN',
  'pa': 'pa-IN',
  'or': 'or-IN',
  'as': 'as-IN',
  'ur': 'ur-IN',
};

export const textToSpeech = (text, lang, dialect) => {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported');
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Get the appropriate language code
  let voiceLang = dialect || LANGUAGE_MAP[lang] || `${lang}-IN`;
  
  // Get available voices
  const voices = window.speechSynthesis.getVoices();
  
  if (voices.length === 0) {
    console.warn('No voices loaded yet. Trying with default language setting.');
    utterance.lang = voiceLang;
    return {
      speak: () => window.speechSynthesis.speak(utterance),
      stop: () => window.speechSynthesis.cancel(),
      utterance
    };
  }
  
  // Find the best voice for the language
  let selectedVoice = null;
  
  // Priority 1: Try to find Microsoft Online Natural voices (best quality)
  selectedVoice = voices.find(voice => 
    voice.lang === voiceLang && voice.name.includes('Online (Natural)')
  );
  
  // Priority 2: Try any Microsoft voice with exact language match
  if (!selectedVoice) {
    selectedVoice = voices.find(voice => 
      voice.lang === voiceLang && voice.name.includes('Microsoft')
    );
  }
  
  // Priority 3: Try exact language match
  if (!selectedVoice) {
    selectedVoice = voices.find(voice => voice.lang === voiceLang);
  }
  
  // Priority 4: Try to find any voice that starts with the language code
  if (!selectedVoice) {
    selectedVoice = voices.find(voice => voice.lang.startsWith(lang));
  }
  
  // Priority 5: For English, try any English voice
  if (!selectedVoice && lang === 'en') {
    selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
  }
  
  // Priority 6: Try to find any voice that includes the language code
  if (!selectedVoice) {
    selectedVoice = voices.find(voice => 
      voice.lang.toLowerCase().includes(lang.toLowerCase())
    );
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
    console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
  } else {
    // Fallback to the mapped language code
    utterance.lang = voiceLang;
    console.warn(`No voice found for ${lang}, using language code ${voiceLang}`);
  }

  // Set speech parameters for better quality
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1;
  utterance.volume = 1;

  // Add error handling
  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
  };

  return {
    speak: () => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error speaking:', error);
        throw error;
      }
    },
    stop: () => window.speechSynthesis.cancel(),
    utterance
  };
};

// Helper function to check if TTS is available for a language
export const isTTSAvailable = (lang) => {
  if (!('speechSynthesis' in window)) return false;
  
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return false; // Voices not loaded yet
  
  const targetLang = LANGUAGE_MAP[lang] || `${lang}-IN`;
  
  return voices.some(voice => 
    voice.lang === targetLang || 
    voice.lang.startsWith(lang) ||
    voice.lang.toLowerCase().includes(lang.toLowerCase())
  );
};

// Helper function to get available voices for a language
export const getVoicesForLanguage = (lang) => {
  if (!('speechSynthesis' in window)) return [];
  
  const voices = window.speechSynthesis.getVoices();
  const targetLang = LANGUAGE_MAP[lang] || `${lang}-IN`;
  
  return voices.filter(voice => 
    voice.lang === targetLang || 
    voice.lang.startsWith(lang) ||
    voice.lang.toLowerCase().includes(lang.toLowerCase())
  ).sort((a, b) => {
    // Prioritize Online Natural voices
    if (a.name.includes('Online (Natural)') && !b.name.includes('Online (Natural)')) return -1;
    if (!a.name.includes('Online (Natural)') && b.name.includes('Online (Natural)')) return 1;
    // Then prioritize Microsoft voices
    if (a.name.includes('Microsoft') && !b.name.includes('Microsoft')) return -1;
    if (!a.name.includes('Microsoft') && b.name.includes('Microsoft')) return 1;
    return 0;
  });
};

// Function to preload voices (call this on app init)
export const preloadVoices = () => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve(false);
      return;
    }

    // Get voices
    let voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(true);
      return;
    }

    // Chrome loads voices asynchronously
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices.length > 0);
    }, { once: true });

    // Timeout fallback
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices().length > 0);
    }, 1000);
  });
};

// Get all available languages for TTS
export const getAvailableTTSLanguages = () => {
  if (!('speechSynthesis' in window)) return [];
  
  const voices = window.speechSynthesis.getVoices();
  const availableLanguages = new Set();
  
  voices.forEach(voice => {
    // Extract language code (e.g., 'hi' from 'hi-IN')
    const langCode = voice.lang.split('-')[0];
    availableLanguages.add(langCode);
  });
  
  return Array.from(availableLanguages);
};

// Get voice info for debugging
export const getVoiceInfo = () => {
  if (!('speechSynthesis' in window)) return 'Speech synthesis not supported';
  
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return 'No voices loaded';
  
  const voiceInfo = {};
  voices.forEach(voice => {
    const langCode = voice.lang.split('-')[0];
    if (!voiceInfo[langCode]) {
      voiceInfo[langCode] = [];
    }
    voiceInfo[langCode].push({
      name: voice.name,
      lang: voice.lang,
      local: voice.localService
    });
  });
  
  return voiceInfo;
};

// Fallback TTS using browser's default voice
export const fallbackTTS = (text, lang) => {
  if (!('speechSynthesis' in window)) return null;
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Use basic language code
  utterance.lang = LANGUAGE_MAP[lang] || lang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  
  return {
    speak: () => {
      try {
        window.speechSynthesis.speak(utterance);
        return true;
      } catch (error) {
        console.error('Fallback TTS error:', error);
        return false;
      }
    },
    stop: () => window.speechSynthesis.cancel(),
    utterance
  };
};

// Check if a specific voice is available
export const isVoiceAvailable = (voiceName) => {
  if (!('speechSynthesis' in window)) return false;
  
  const voices = window.speechSynthesis.getVoices();
  return voices.some(voice => voice.name === voiceName);
};

// Get the best voice for a language
export const getBestVoice = (lang) => {
  const voices = getVoicesForLanguage(lang);
  return voices.length > 0 ? voices[0] : null;
};