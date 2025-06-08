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

export const textToSpeech = (text, lang, dialect) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = dialect || `${lang}-IN`;
    
    return {
      speak: () => window.speechSynthesis.speak(utterance),
      stop: () => window.speechSynthesis.cancel(),
      utterance
    };
  }
  return null;
};