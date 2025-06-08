import { motion } from 'framer-motion';

export default function TranslationArea({
  text,
  setText,
  translated,
  loading,
  error,
  charCount,
  isListening,
  onStartListening,
  onStopListening,
  onSpeak,
  onClear,
  onCopy,
  sourceLang,
  targetLang,
  sourceDialect,
  targetDialect,
  isSpeaking,
  onStopSpeaking,
  isProcessingFile
}) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Source Text */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="font-semibold text-gray-700 dark:text-gray-300">Source Text</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{charCount}/5000</span>
            <button
              onClick={isListening ? onStopListening : onStartListening}
              className={`p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
                            title={isListening ? "Stop recording" : "Start voice input"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="relative">
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 5000))}
            placeholder={isListening ? "Listening... Speak now" : "Enter text to translate or use voice input..."}
            className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl p-4 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none resize-none"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            {text && (
              <button
                onClick={onClear}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                title="Clear all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={() => onSpeak(text, sourceLang, sourceDialect)}
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
                onClick={() => onCopy(translated)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
              >
                <span>📋</span> Copy
              </button>
              {!isSpeaking ? (
                <button
                  onClick={() => onSpeak(translated, targetLang, targetDialect)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <span>🔊</span> Listen
                </button>
              ) : (
                <button
                  onClick={onStopSpeaking}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
                >
                  <span>⏹️</span> Stop
                </button>
              )}
            </div>
          )}
        </div>
        <div className="relative">
          <div className="w-full min-h-[260px] border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/50">
            {loading || isProcessingFile ? (
              <div className="flex items-center justify-center h-52">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {isProcessingFile ? 'Processing file...' : 'Translating...'}
                  </span>
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
  );
}