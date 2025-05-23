import { useState, useRef, useEffect } from 'react';

export default function LegalChatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! Ask me any legal question.' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef();

  // Scroll to bottom every new message
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // POST to your serverless /api/chat endpoint (implements RAG).
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, userMsg] }),
    });
    const data = await res.json();          // { answer: '...', sources: [...] }

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: data.answer, sources: data.sources },
    ]);
  };

  return (
    <div className="max-w-3xl mx-auto h-[70vh] flex flex-col bg-white shadow rounded">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-md whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-blue-600 text-white self-end max-w-[80%]'
                : 'bg-gray-100 text-gray-800 self-start max-w-[80%]'
            }`}
          >
            {m.content}
            {/* optional sources */}
            {m.sources && (
              <div className="mt-2 text-xs text-blue-800">
                Sources: {m.sources.join(', ')}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your question…"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}