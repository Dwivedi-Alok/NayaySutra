import { useState, useRef, useEffect } from 'react';
import { 

  PaperAirplaneIcon as Send,

  ChatBubbleBottomCenterTextIcon as Bot,

  UserIcon as User,

  DocumentTextIcon as FileText,

  ArrowPathIcon as Loader2,

  ExclamationCircleIcon as AlertCircle,

  ScaleIcon as Scale,

  InformationCircleIcon as Info

} from '@heroicons/react/24/outline';

export default function LegalChatbot() {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your AI legal assistant. I can help answer questions about laws, regulations, and legal procedures. How can I assist you today?',
      timestamp: new Date()
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Suggested questions
  const suggestedQuestions = [
    "What is Section 302 of IPC?",
    "How to file a consumer complaint?",
    "What are my rights as a tenant?",
    "Explain the divorce process in India"
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Focus input on component mount
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;
    
    const userMsg = { 
      role: 'user', 
      content: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: data.answer || 'I apologize, but I couldn\'t generate a response.',
          sources: data.sources,
          confidence: data.confidence,
          timestamp: new Date()
        },
      ]);
    } catch (err) {
      setError('Sorry, I encountered an error. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">AI Legal Assistant</h1>
                <p className="text-sm text-blue-100">Powered by Advanced AI & Legal Database</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Welcome Message with Suggestions */}
            {messages.length === 1 && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-800 font-medium mb-3">
                      Try asking me about:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {suggestedQuestions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(question)}
                          className="text-left text-sm bg-white border border-blue-300 rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex flex-col max-w-[75%] ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                          : 'bg-white text-gray-800 shadow-md border border-gray-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      
                      {/* Sources Section */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold mb-2 text-gray-600">
                            📚 Legal References:
                          </p>
                          <div className="space-y-1">
                            {msg.sources.map((source, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-600">
                                <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span className="break-words">{source}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Confidence Indicator */}
                      {msg.confidence !== undefined && msg.role === 'assistant' && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${Math.round(msg.confidence * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(msg.confidence * 100)}% confident
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <span className="text-xs text-gray-400 mt-1 px-2">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-md">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl shadow-md border border-gray-100">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg max-w-[75%]">
                                   <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <div ref={bottomRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your legal question here..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                rows="1"
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2 text-xs text-gray-400">
                {input.length > 0 && `${input.length}/1000`}
              </div>
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim() || input.length > 1000}
              className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                isLoading || !input.trim() || input.length > 1000
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="hidden sm:inline">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>
          
          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center mt-3">
            <AlertCircle className="inline w-3 h-3 mr-1" />
            AI responses are for informational purposes only. Always consult a qualified lawyer for legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}