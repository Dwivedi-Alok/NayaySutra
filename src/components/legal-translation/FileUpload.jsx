import { useRef } from 'react';

export default function FileUpload({ 
  uploadedFile, 
  onFileUpload, 
  ocrProgress, 
  isProcessingFile 
}) {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  return (
    <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Document Upload</h3>
        {uploadedFile && (
          <span className="text-sm text-blue-700 dark:text-blue-300">
            📎 {uploadedFile.name}
          </span>
        )}
      </div>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessingFile}
          className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border-2 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <span>📄</span>
          Upload PDF/Word
        </button>
        <button
          onClick={() => imageInputRef.current?.click()}
          disabled={isProcessingFile}
          className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border-2 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <span>🖼️</span>
          Upload Image (OCR)
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={onFileUpload}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={onFileUpload}
          className="hidden"
        />
      </div>
      
      {ocrProgress > 0 && ocrProgress < 100 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Processing image...</span>
            <span>{ocrProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${ocrProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}