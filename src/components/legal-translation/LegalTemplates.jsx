import { motion, AnimatePresence } from 'framer-motion';
import { LEGAL_TEMPLATES } from './constants';

export default function LegalTemplates({ show, onClose, onSelectTemplate }) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="mb-4 overflow-hidden"
      >
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
          <h3 className="font-semibold mb-3 text-purple-900 dark:text-purple-100">Legal Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LEGAL_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{template.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.category}</p>
                  </div>
                  <span className="text-purple-600 dark:text-purple-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}