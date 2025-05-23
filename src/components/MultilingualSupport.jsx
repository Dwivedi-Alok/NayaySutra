import { useState } from 'react';

export default function MultilingualSupport() {
  const [text, setText] = useState('');
  const [lang, setLang] = useState('hi');  // Hindi default
  const [translated, setTranslated] = useState('');

  const translate = async () => {
    const res = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: lang,
        format: 'text',
      }),
    });
    const data = await res.json();
    setTranslated(data.translatedText);
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Multilingual Support</h2>
      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter English text"
        className="w-full border rounded p-3"
      />
      <div className="flex items-center gap-2 mt-4">
        <label>Target language:</label>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
          <option value="ta">Tamil</option>
          <option value="bn">Bengali</option>
          <option value="gu">Gujarati</option>
        </select>
      </div>
      <button
        onClick={translate}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Translate
      </button>

      {translated && (
        <div className="mt-4 bg-gray-50 p-3 rounded whitespace-pre-wrap">
          {translated}
        </div>
      )}
    </div>
  );
}