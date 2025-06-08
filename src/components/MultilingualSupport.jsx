import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/*
 * Enhanced language configuration with more details
 */
const LANGUAGES = [
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', label: 'Urdu', native: 'اردو', flag: '🇵🇰' }
];

// Legal domain specific phrases for quick translation
const QUICK_PHRASES = [
  { en: "I need legal assistance", category: "General" },
  { en: "Where is the nearest court?", category: "General" },
  { en: "I want to file a complaint", category: "Filing" },
  { en: "What documents do I need?", category: "Documents" },
  { en: "I need a lawyer", category: "Legal Help" },
  { en: "What are my rights?", category: "Rights" },
  { en: "I want to appeal this decision", category: "Appeal" },
  { en: "When is my next hearing?", category: "Court" },
  { en: "I need legal aid", category: "Legal Help" },
  { en: "How much are the court fees?", category: "Fees" }
];

export default function MultilingualSupport() {
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  // Character counter
  useEffect(() => {
    setCharCount(text.length);
  }, [text]);

  // Add keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        translate();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [text, sourceLang, targetLang]);

  /* ----------------------------------------
   *  Translation function
   * --------------------------------------*/
  const translate = async (inputText = text, source = sourceLang, target = targetLang) => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setError('');
    setTranslated('');

    try {
      /* 1. Get bearer token from backend */
      const tokenRes = await fetch('/api/bhashini-token');
      const { token } = await tokenRes.json();

      /* 2. Call Bhashini API */
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
                    sourceLanguage: source,
                    targetLanguage: target
                  }
                }
              }
            ],
            inputData: {
              input: [{ source: inputText }]
            }
          })
        }
      );

      const data = await bhashiniRes.json();
      const output =
        data?.pipelineResponse?.[0]?.output?.[0]?.target ||
        data?.pipelineResponse?.[0]?.output?.[0]?.translation || '';

      setTranslated(output);

      // Add to history
      if (output) {
        const newEntry = {
          id: Date.now(),
          source: inputText,
          translated: output,
          sourceLang: source,
          targetLang: target,
          timestamp: new Date().toLocaleString()
        };
        setHistory(prev => [newEntry, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      console.error(err);
      setError('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------
   *  Text-to-Speech function
   * --------------------------------------*/
  const speak = (textToSpeak, lang) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 
                      lang === 'mr' ? 'mr-IN' :
                      lang === 'ta' ? 'ta-IN' :
                      lang === 'bn' ? 'bn-IN' :
                      lang === 'gu' ? 'gu-IN' :
                      lang === 'te' ? 'te-IN' :
                      lang === 'kn' ? 'kn-IN' :
                      lang === 'ml' ? 'ml-IN' :
                      lang === 'pa' ? 'pa-IN' :
                      lang === 'ur' ? 'ur-PK' : 'en-US';
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  /* ----------------------------------------
   *  Utility functions
   * --------------------------------------*/
  const copyToClipboard = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    // Show toast notification
    showToast('Copied to clipboard!');
  };

  const showToast = (message) => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const swapLanguages = () => {
    if (sourceLang !== 'en' && targetLang !== 'en') {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
      setText(translated);
      setTranslated(text);
    }
  };

  const clearAll = () => {
    setText('');
    setTranslated('');
    setError('');
    setCharCount(0);
  };

  const handleQuickPhrase = (phrase) => {
    setText(phrase.en);
    setShowQuickPhrases(false);
    translate(phrase.en);
  };

  /* -------------- UI -------------------*/
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <span className="text-4xl">🌐</span>
                  Legal Translation Hub
                </h2>
                <p className="text-blue-100 dark:text-blue-200 mt-1">Powered by Bhashini AI</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>📜</span>
                  History
                </button>
                <button
                  onClick={() => setShowQuickPhrases(!showQuickPhrases)}
                  className="bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>⚡</span>
                  Quick Phrases
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Language Selection */}
            <div className="flex items-center justify-between mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex-1">
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">From</label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                >
                  <option value="en">English</option>
                  {LANGUAGES.map((lang) => (
                                       <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={swapLanguages}
                className="mx-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                title="Swap languages"
              >
                <span className="text-2xl">⇄</span>
              </button>

              <div className="flex-1">
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">To</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.label} ({lang.native})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Phrases Panel */}
            <AnimatePresence>
              {showQuickPhrases && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">Quick Legal Phrases</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {QUICK_PHRASES.map((phrase, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickPhrase(phrase)}
                          className="text-left p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                          <span className="font-medium text-gray-900 dark:text-gray-100">{phrase.en}</span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">{phrase.category}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Translation Area */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Source Text */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Source Text</label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{charCount}/500</span>
                </div>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    rows={8}
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, 500))}
                    placeholder="Enter text to translate..."
                    className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl p-4 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none resize-none"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    {text && (
                      <button
                        onClick={clearAll}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        title="Clear"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => speak(text, sourceLang)}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                      title="Listen"
                    >
                      <span className="text-xl">🔊</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Translated Text */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Translation</label>
                  {translated && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(translated)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                      >
                        <span>📋</span> Copy
                      </button>
                      {!isSpeaking ? (
                        <button
                          onClick={() => speak(translated, targetLang)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                        >
                          <span>🔊</span> Listen
                        </button>
                      ) : (
                        <button
                          onClick={stopSpeaking}
                          className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
                        >
                          <span>⏹️</span> Stop
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <div className="w-full min-h-[200px] border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/50">
                    {loading ? (
                      <div className="flex items-center justify-center h-40">
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                          <span className="text-gray-600 dark:text-gray-400">Translating...</span>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="text-red-600 dark:text-red-400 flex items-center gap-2">
                        <span>❌</span> {error}
                      </div>
                    ) : translated ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="whitespace-pre-wrap text-lg text-gray-900 dark:text-gray-100"
                      >
                        {translated}
                      </motion.div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500 italic">
                        Translation will appear here...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => translate()}
                disabled={!text.trim() || loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>🌍</span>
                {loading ? 'Translating...' : 'Translate'}
              </button>
            </div>

            {/* Translation History */}
            <AnimatePresence>
              {showHistory && history.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center justify-between text-gray-900 dark:text-gray-100">
                      <span>Recent Translations</span>
                      <button
                        onClick={() => setHistory([])}
                        className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        Clear History
                      </button>
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {history.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                                <span>{LANGUAGES.find(l => l.code === item.sourceLang)?.label || 'English'}</span>
                                <span>→</span>
                                <span>{LANGUAGES.find(l => l.code === item.targetLang)?.label}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.source}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.translated}</p>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => {
                                  setText(item.source);
                                  setTranslated(item.translated);
                                  setSourceLang(item.sourceLang);
                                  setTargetLang(item.targetLang);
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1"
                                title="Use this translation"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                              <button
                                onClick={() => copyToClipboard(item.translated)}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                                title="Copy translation"
                              >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">{item.timestamp}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Features Info */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Legal Domain</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Specialized for legal terminology</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-3xl mb-2">🔊</div>
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Text-to-Speech</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Listen to translations</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-3xl mb-2">📜</div>
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">History</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Access recent translations</p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Quick Phrases</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Common legal phrases</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Keyboard Shortcuts Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <p>Pro tip: Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded">Enter</kbd> to translate</p>
        </motion.div>
      </div>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}