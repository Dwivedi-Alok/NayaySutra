// src/services/translation.js

// Get API URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL || 'https://nayaysutra.onrender.com';

export const translateText = async (text, sourceLang, targetLang, dialect) => {
  try {
    // Call YOUR backend endpoint, not Bhashini directly
    const response = await fetch(`${API_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang,
        dialect // Your backend handles dialect if needed
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Translation API error:', response.status, errorData);
      throw new Error(`Translation failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Your backend returns { success, translation, metadata }
    if (data.success) {
      return { 
        success: true, 
        translation: data.translation 
      };
    } else {
      return { 
        success: false, 
        error: data.error || 'Translation failed' 
      };
    }
    
  } catch (error) {
    console.error('Translation error:', error);
    return { 
      success: false, 
      error: error.message || 'Network error' 
    };
  }
};

export const textToSpeech = (text, lang, dialect) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = dialect || `${lang}-IN`;
    
    // Add some configuration for better speech
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    
    return {
      speak: () => window.speechSynthesis.speak(utterance),
      stop: () => window.speechSynthesis.cancel(),
      pause: () => window.speechSynthesis.pause(),
      resume: () => window.speechSynthesis.resume(),
      utterance
    };
  }
  return null;
};

// Additional helper function to check if translation service is available
export const checkTranslationService = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    return {
      available: data.apiKeys?.bhashini_inference === 'configured',
      status: data.status
    };
  } catch (error) {
    return {
      available: false,
      status: 'error',
      error: error.message
    };
  }
};