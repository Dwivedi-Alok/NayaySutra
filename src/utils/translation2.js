// utils/translation.js

// Get API URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const translateText = async (text, sourceLang, targetLang, dialect) => {
  try {
    // Don't make API call for same language
    if (sourceLang === targetLang) {
      return { success: true, translation: text };
    }

    const response = await fetch(`${API_BASE_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang,
        dialect
      })
    });

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Translation API error:', response.status, errorText);
      throw new Error(`Translation API error: ${response.status}`);
    }

    // Check content type
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Response is not JSON");
    }

    const data = await response.json();
    
    if (data.success) {
      return { success: true, translation: data.translation };
    } else {
      throw new Error(data.error || 'Translation failed');
    }
  } catch (error) {
    console.error('Translation error:', error);
    
    // Check if it's a network error
    if (error.message === 'Failed to fetch') {
      return { 
        success: false, 
        error: 'Unable to connect to translation service. Please check if the server is running.' 
      };
    }
    
    return { success: false, error: error.message };
  }
};

// Retry wrapper for translation
export const translateTextWithRetry = async (text, sourceLang, targetLang, dialect, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await translateText(text, sourceLang, targetLang, dialect);
      if (result.success) {
        return result;
      }
      lastError = result.error;
    } catch (error) {
      lastError = error.message;
    }
    
    // Wait before retrying (exponential backoff)
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  
  return { success: false, error: lastError || 'Translation failed after multiple attempts' };
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

// Get language name from code
export const getLanguageName = (code) => {
  const languageNames = {
    'en': 'English',
    'hi': 'Hindi',
    'bn': 'Bengali',
    'te': 'Telugu',
    'mr': 'Marathi',
    'ta': 'Tamil',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'or': 'Odia',
    'as': 'Assamese',
    'ur': 'Urdu'
  };
  return languageNames[code] || code;
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

  // Get the best voice for a language
export const getBestVoice = (lang) => {
  const voices = getVoicesForLanguage(lang);
  return voices.length > 0 ? voices[0] : null;
};

// Test translation API connection
export const testTranslationAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`API health check failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Translation API is healthy:', data);
    return true;
  } catch (error) {
    console.error('Translation API test failed:', error);
    return false;
  }
};

// Mock translation for testing (when API is not available)
export const mockTranslate = (text, sourceLang, targetLang) => {
  // Simple mock translations for testing
  const mockTranslations = {
    'en-hi': {
      'hello': 'नमस्ते',
      'thank you': 'धन्यवाद',
      'good morning': 'सुप्रभात',
      'good night': 'शुभ रात्रि',
      'how are you': 'आप कैसे हैं',
      'yes': 'हाँ',
      'no': 'नहीं',
      'please': 'कृपया',
      'welcome': 'स्वागत है',
      'goodbye': 'अलविदा'
    },
    'hi-en': {
      'नमस्ते': 'hello',
      'धन्यवाद': 'thank you',
      'सुप्रभात': 'good morning',
      'शुभ रात्रि': 'good night',
      'आप कैसे हैं': 'how are you',
      'हाँ': 'yes',
      'नहीं': 'no',
      'कृपया': 'please',
      'स्वागत है': 'welcome',
      'अलविदा': 'goodbye'
    }
  };
  
  const langPair = `${sourceLang}-${targetLang}`;
  const lowerText = text.toLowerCase().trim();
  
  // Check if we have a mock translation
  if (mockTranslations[langPair] && mockTranslations[langPair][lowerText]) {
    return mockTranslations[langPair][lowerText];
  }
  
  // Return a formatted mock translation
  return `[${getLanguageName(targetLang)}] ${text}`;
};

// Detect language (basic implementation)
export const detectLanguage = (text) => {
  // Basic language detection based on character sets
  const patterns = {
    hi: /[\u0900-\u097F]/,  // Devanagari
    bn: /[\u0980-\u09FF]/,  // Bengali
    te: /[\u0C00-\u0C7F]/,  // Telugu
    ta: /[\u0B80-\u0BFF]/,  // Tamil
    gu: /[\u0A80-\u0AFF]/,  // Gujarati
    kn: /[\u0C80-\u0CFF]/,  // Kannada
    ml: /[\u0D00-\u0D7F]/,  // Malayalam
    pa: /[\u0A00-\u0A7F]/,  // Gurmukhi (Punjabi)
    or: /[\u0B00-\u0B7F]/,  // Odia
    ur: /[\u0600-\u06FF]/,  // Arabic (for Urdu)
    as: /[\u0980-\u09FF]/,  // Assamese (same as Bengali)
  };
  
  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return lang;
    }
  }
  
  // Default to English if no pattern matches
  return 'en';
};

// Get supported language pairs
export const getSupportedLanguagePairs = () => {
  const languages = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur'];
  const pairs = [];
  
  for (const source of languages) {
    for (const target of languages) {
      if (source !== target) {
        pairs.push({
          source,
          target,
          sourceName: getLanguageName(source),
          targetName: getLanguageName(target)
        });
      }
    }
  }
  
  return pairs;
};

// Translate with fallback to mock if API fails
export const translateWithFallback = async (text, sourceLang, targetLang, dialect) => {
  try {
    // First try the actual API
    const result = await translateText(text, sourceLang, targetLang, dialect);
    
    if (result.success) {
      return result;
    }
    
    // If API fails, use mock translation
    console.warn('API translation failed, using mock translation');
    const mockTranslation = mockTranslate(text, sourceLang, targetLang);
    return {
      success: true,
      translation: mockTranslation,
      isMock: true
    };
  } catch (error) {
    console.error('Translation error:', error);
    // Fallback to mock
    const mockTranslation = mockTranslate(text, sourceLang, targetLang);
    return {
      success: true,
      translation: mockTranslation,
      isMock: true
    };
  }
};

// Export all language codes for easy access
export const LANGUAGE_CODES = Object.keys(LANGUAGE_MAP);

// Check if translation service is available
export const isTranslationServiceAvailable = async () => {
  try {
    const isAPIAvailable = await testTranslationAPI();
    return {
      available: isAPIAvailable,
      type: isAPIAvailable ? 'api' : 'mock'
    };
  } catch (error) {
    return {
      available: true, // Mock is always available
      type: 'mock'
    };
  }
};

// Batch translate multiple texts
export const batchTranslate = async (texts, sourceLang, targetLang, dialect) => {
  const results = [];
  
  for (const text of texts) {
    try {
      const result = await translateWithFallback(text, sourceLang, targetLang, dialect);
      results.push({
        original: text,
        translated: result.translation,
        success: result.success,
        isMock: result.isMock || false
      });
    } catch (error) {
      results.push({
        original: text,
        translated: '',
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
};

// Clear TTS queue
export const clearTTSQueue = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Get TTS status
export const getTTSStatus = () => {
  if (!('speechSynthesis' in window)) {
    return { supported: false, speaking: false, paused: false, pending: false };
  }
  
  return {
    supported: true,
    speaking: window.speechSynthesis.speaking,
    paused: window.speechSynthesis.paused,
    pending: window.speechSynthesis.pending
  };
};