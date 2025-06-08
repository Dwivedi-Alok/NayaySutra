import { motion, AnimatePresence } from 'framer-motion';
import { LANGUAGES } from './constants';

export default function TranslationHistory({ 
  show, 
  history, 
  onClearHistory, 
  onUseTranslation, 
  onCopy,
  onExportPDF 
}) {
  if (!show || history.length === 0) return null;

  return (
    <AnimatePresence>
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
              onClick={onClearHistory}
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
                      <span>
                        {LANGUAGES.find(l => l.code === item.targetLang)?.label}
                        {item.targetDialect && ` (${LANGUAGES.find(l => l.code === item.targetLang)?.dialects.find(d => d.code === item.targetDialect)?.label})`}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.source}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.translated}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => onUseTranslation(item)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1"
                      title="Use this translation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onCopy(item.translated)}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                      title="Copy translation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={onExportPDF}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                      title="Export as PDF"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
    </AnimatePresence>
  );
}