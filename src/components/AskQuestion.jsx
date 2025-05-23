import { useState } from 'react';

export default function AskQuestion() {
  const [question, setQuestion]   = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setSubmitted(true);

    // TODO: call your backend / GPT endpoint here
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Ask a Legal Question
      </h2>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={6}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your legal query here..."
            className="w-full border rounded p-3"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Submit Question
          </button>
        </form>
      ) : (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Your question:</h3>
          <p className="whitespace-pre-wrap">{question}</p>

          <p className="mt-4 italic text-gray-500">
            Thank you! A lawyer (or our AI) will respond shortly.
          </p>
        </div>
      )}
    </div>
  );
}