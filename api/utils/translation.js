export const translateText = async (text, sourceLang, targetLang, dialect) => {
  try {
    // Get bearer token from backend
    const tokenRes = await fetch('/api/bhashini-token');
    const { token } = await tokenRes.json();

    // Call Bhashini API with dialect support
    const bhashiniRes = await fetch(
      'https://dhruva-api.bhashini.gov.in/services/inference/pipeline',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          pipelineTasks: [
            {
              taskType: 'translation',
              config: {
                language: {
                  sourceLanguage: sourceLang,
                  targetLanguage: targetLang,
                  ...(dialect && { targetDialect: dialect })
                }
              }
            }
          ],
          inputData: {
            input: [{ source: text }]
          }
        })
      }
    );

    const data = await bhashiniRes.json();
    const output =
      data?.pipelineResponse?.[0]?.output?.[0]?.target ||
      data?.pipelineResponse?.[0]?.output?.[0]?.translation || '';

    return { success: true, translation: output };
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