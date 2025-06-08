import { motion, AnimatePresence } from 'framer-motion';
import { QUICK_PHRASES } from './constants';

export default function QuickPhrases({ show, onClose, onSelectPhrase }) {
  if (!show) return null;

  return (
    <AnimatePresence>
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
                onClick={() => onSelectPhrase(phrase)}
                className="text-left p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">{phrase.en}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">{phrase.category}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}