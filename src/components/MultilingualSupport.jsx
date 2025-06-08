import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import LanguageSelector from './legal-translation/LanguageSelector';
import FileUpload from './legal-translation/FileUpload';
import TranslationArea from './legal-translation/TranslationArea';
import LegalTemplates from './legal-translation/LegalTemplates';
import QuickPhrases from './legal-translation/QuickPhrases';
import TranslationHistory from './legal-translation/TranslationHistory';
import { LANGUAGES } from './legal-translation/constants';
import { translateText, textToSpeech } from '../utils/translation.js';
import { performOCR, extractTextFromPDF, extractTextFromWord } from '../utils/fileProcessing';
import { exportAsPDF, exportAsWord } from '../utils/export';

export default function MultilingualSupport() {
  // State management
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [sourceDialect, setSourceDialect] = useState('');
  const [targetDialect, setTargetDialect] = useState('');
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        
        if (finalTranscript) {
          setText(prev => prev + finalTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setError('Speech recognition error. Please try again.');
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  // Character counter
  useEffect(() => {
    setCharCount(text.length);
  }, [text]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        handleTranslate();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [text, sourceLang, targetLang]);

  // Voice input handlers
  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = sourceLang === 'en' ? 'en-US' : `${sourceLang}-IN`;
      recognitionRef.current.start();
      setIsListening(true);
      setError('');
    } else {
      setError('Speech recognition not supported in your browser');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // File processing
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessingFile(true);
    setError('');
    
    try {
      const fileType = file.type;
      let extractedText = '';

      if (fileType === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 fileType === 'application/msword') {
        extractedText = await extractTextFromWord(file);
      } else if (fileType.startsWith('image/')) {
        extractedText = await performOCR(file, (progress) => setOcrProgress(progress));
        setOcrProgress(0);
      } else {
        throw new Error('Unsupported file type');
      }

      setText(extractedText);
      setUploadedFile(file);
    } catch (err) {
      setError(`File processing error: ${err.message}`);
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Translation handler
  const handleTranslate = async (inputText = text) => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setError('');
    setTranslated('');

    const result = await translateText(inputText, sourceLang, targetLang, targetDialect);
    
    if (result.success) {
      setTranslated(result.translation);
      
      // Add to history
      const newEntry = {
        id: Date.now(),
        source: inputText,
        translated: result.translation,
        sourceLang,
        targetLang,
        targetDialect,
        timestamp: new Date().toLocaleString()
      };
      setHistory(prev => [newEntry, ...prev.slice(0, 9)]);
    } else {
      setError(result.error || 'Translation failed. Please try again.');
    }
    
    setLoading(false);
  };

  // Text-to-speech handlers
  const speak = (textToSpeak, lang, dialect) => {
    const speech = textToSpeech(textToSpeak, lang, dialect);
    if (speech) {
      setIsSpeaking(true);
      speech.utterance.onend = () => setIsSpeaking(false);
      speech.speak();
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Utility functions
  const copyToClipboard = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    showToast('Copied to clipboard!');
  };

  const showToast = (message) => {
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
      
      const tempDialect = sourceDialect;
      setSourceDialect(targetDialect);
      setTargetDialect(tempDialect);
    }
  };

  const clearAll = () => {
    setText('');
    setTranslated('');
    setError('');
    setCharCount(0);
    setUploadedFile(null);
    setSelectedTemplate(null);
  };

  const handleQuickPhrase = (phrase) => {
    setText(phrase.en);
    setShowQuickPhrases(false);
    handleTranslate(phrase.en);
  };

  const handleTemplate = (template) => {
    setText(template.content);
    setShowTemplates(false);
    setSelectedTemplate(template);
    showToast(`Template "${template.name}" loaded`);
  };

  return (
    <>
      <style>
        {`
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
        `}
      </style>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-6">
        <div className="max-w-5xl mx-auto">
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
                <div className="flex gap-2 flex-wrap">
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
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span>📄</span>
                    Templates
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <LanguageSelector
                sourceLang={sourceLang}
                setSourceLang={setSourceLang}
                targetLang={targetLang}
                setTargetLang={setTargetLang}
                sourceDialect={sourceDialect}
                setSourceDialect={setSourceDialect}
                targetDialect={targetDialect}
                setTargetDialect={setTargetDialect}
                onSwap={swapLanguages}
              />

              <FileUpload
                uploadedFile={uploadedFile}
                onFileUpload={handleFileUpload}
                ocrProgress={ocrProgress}
                isProcessingFile={isProcessingFile}
              />

              <LegalTemplates
                show={showTemplates}
                onClose={() => setShowTemplates(false)}
                onSelectTemplate={handleTemplate}
              />

              <QuickPhrases
                show={showQuickPhrases}
                onClose={() => setShowQuickPhrases(false)}
                onSelectPhrase={handleQuickPhrase}
              />

              <TranslationArea
                text={text}
                setText={setText}
                translated={translated}
                loading={loading}
                error={error}
                charCount={charCount}
                isListening={isListening}
                onStartListening={startListening}
                onStopListening={stopListening}
                onSpeak={speak}
                onClear={clearAll}
                onCopy={copyToClipboard}
                sourceLang={sourceLang}
                targetLang={targetLang}
                sourceDialect={sourceDialect}
                targetDialect={targetDialect}
                isSpeaking={isSpeaking}
                onStopSpeaking={stopSpeaking}
                isProcessingFile={isProcessingFile}
                              />

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <button
                  onClick={() => handleTranslate()}
                  disabled={!text.trim() || loading || isProcessingFile}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>🌍</span>
                  {loading ? 'Translating...' : 'Translate'}
                </button>
                
                {translated && (
                  <>
                    <button
                      onClick={() => exportAsPDF(text, translated, sourceLang, targetLang, LANGUAGES)}
                      className="bg-red-600 dark:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <span>📄</span>
                      Export PDF
                    </button>
                    <button
                      onClick={() => exportAsWord(text, translated, sourceLang, targetLang, LANGUAGES)}
                      className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <span>📝</span>
                      Export Word
                    </button>
                  </>
                )}
              </div>

              <TranslationHistory
                show={showHistory}
                history={history}
                onClearHistory={() => setHistory([])}
                onUseTranslation={(item) => {
                  setText(item.source);
                  setTranslated(item.translated);
                  setSourceLang(item.sourceLang);
                  setTargetLang(item.targetLang);
                  setTargetDialect(item.targetDialect || '');
                }}
                onCopy={copyToClipboard}
                onExportPDF={() => exportAsPDF(text, translated, sourceLang, targetLang, LANGUAGES)}
              />

              {/* Features Info */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="text-3xl mb-2">🎙️</div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Voice Input</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Speak to translate</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="text-3xl mb-2">📄</div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Document Upload</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">PDF & Word files</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="text-3xl mb-2">🖼️</div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">OCR Support</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Extract from images</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <div className="text-3xl mb-2">💾</div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Export Options</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">PDF & Word export</p>
                </div>
                <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                  <div className="text-3xl mb-2">📝</div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Legal Templates</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pre-filled forms</p>
                </div>
                <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <div className="text-3xl mb-2">🗣️</div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Multi-dialect</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Regional variations</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            <p>Pro tip: Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded">Enter</kbd> to translate</p>
          </motion.div>
        </div>
      </div>
    </>
  );
}