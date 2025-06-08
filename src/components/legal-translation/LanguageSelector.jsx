import { LANGUAGES } from './constants';

export default function LanguageSelector({
  sourceLang,
  setSourceLang,
  targetLang,
  setTargetLang,
  sourceDialect,
  setSourceDialect,
  targetDialect,
  setTargetDialect,
  onSwap
}) {
  return (
    <div className="flex items-center justify-between mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
      <div className="flex-1">
        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">From</label>
        <div className="space-y-2">
          <select
            value={sourceLang}
            onChange={(e) => {
              setSourceLang(e.target.value);
              setSourceDialect('');
            }}
            className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
          >
            <option value="en">English</option>
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </select>
          
          {sourceLang !== 'en' && LANGUAGES.find(l => l.code === sourceLang)?.dialects?.length > 1 && (
            <select
              value={sourceDialect}
              onChange={(e) => setSourceDialect(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
            >
              <option value="">Select Dialect (Optional)</option>
              {LANGUAGES.find(l => l.code === sourceLang)?.dialects.map((dialect) => (
                <option key={dialect.code} value={dialect.code}>
                  {dialect.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <button
        onClick={onSwap}
        className="mx-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
        title="Swap languages"
      >
        <span className="text-2xl">⇄</span>
      </button>

      <div className="flex-1">
        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">To</label>
        <div className="space-y-2">
          <select
            value={targetLang}
            onChange={(e) => {
              setTargetLang(e.target.value);
              setTargetDialect('');
            }}
            className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.label} ({lang.native})
              </option>
            ))}
          </select>
          
          {LANGUAGES.find(l => l.code === targetLang)?.dialects?.length > 1 && (
            <select
              value={targetDialect}
              onChange={(e) => setTargetDialect(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
            >
              <option value="">Select Dialect (Optional)</option>
              {LANGUAGES.find(l => l.code === targetLang)?.dialects.map((dialect) => (
                <option key={dialect.code} value={dialect.code}>
                  {dialect.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}