import { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon as Send,
  ChatBubbleBottomCenterTextIcon as Bot,
  UserIcon as User,
  DocumentTextIcon as FileText,
  ArrowPathIcon as Loader2,
  ExclamationCircleIcon as AlertCircle,
  ScaleIcon as Scale,
  InformationCircleIcon as Info,
  SparklesIcon as Sparkles,
  LightBulbIcon,
  DocumentMagnifyingGlassIcon,
  HomeIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

// API Base URL - Change this to match your backend server
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
// Confidence Indicator Component
const ConfidenceIndicator = ({ confidence }) => {
  if (confidence === null || confidence === undefined) return null;
  
  const percentage = Math.round(confidence * 100);
  const getConfidenceColor = () => {
    if (percentage >= 80) return 'from-green-500 to-green-600';
    if (percentage >= 60) return 'from-blue-500 to-blue-600';
    if (percentage >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-orange-500 to-red-500';
  };
  
  const getConfidenceLabel = () => {
    if (percentage >= 80) return 'High confidence';
    if (percentage >= 60) return 'Moderate confidence';
    if (percentage >= 40) return 'Low confidence';
    return 'Very low confidence';
  };
  
  return (
    <div className="mt-3">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">{getConfidenceLabel()}</span>
            <span className="text-xs text-gray-500 font-medium">{percentage}%</span>
          </div>
          <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getConfidenceColor()} transition-all duration-700 ease-out`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <Info className="w-4 h-4 text-gray-500 cursor-help" title="AI confidence in this response" />
      </div>
    </div>
  );
};

export default function LegalChatbot() {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I am Ganesha, your AI assistant. How can I help you today?',
      timestamp: new Date()
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Suggested questions with categories
  const suggestedQuestions = [
    {
      icon: DocumentMagnifyingGlassIcon,
      title: "Criminal Law",
      question: "What is Section 302 of IPC?",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: BriefcaseIcon,
      title: "Consumer Rights",
      question: "How to file a consumer complaint?",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: HomeIcon,
      title: "Property Law",
      question: "What are my rights as a tenant?",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Scale,
      title: "Family Law",
      question: "Explain the divorce process in India",
      color: "from-orange-500 to-orange-600"
    }
  ];

  // Improved scroll behavior - only scroll when new messages are added, not when typing
  useEffect(() => {
    // Don't scroll if user is typing
    if (!isUserTyping && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isUserTyping]);

  useEffect(() => {
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
    setIsUserTyping(false);
    setIsLoading(true);
    setError(null);

    try {
      // Use the backend URL with /chatbot endpoint
      const res = await fetch(`${API_BASE_URL}/chat`, {
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
      
      // Debug logging to check what's being received
      console.log('API Response:', data);
      
      // Ensure confidence is a valid number between 0 and 1
      let confidence = data.confidence;
      if (typeof confidence === 'number') {
        // If confidence is already a percentage (0-100), convert to decimal
        if (confidence > 1) {
          confidence = confidence / 100;
        }
        // Ensure it's between 0 and 1
        confidence = Math.max(0, Math.min(1, confidence));
      } else {
        // Default confidence if not provided or invalid
        confidence = null;
      }
      
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: data.answer || 'I apologize, but I couldn\'t generate a response.',
          sources: data.sources,
          confidence: confidence,
          timestamp: new Date()
        },
      ]);
    } catch (err) {
      setError('Sorry, I encountered an error. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
      // Keep focus on input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
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

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setIsUserTyping(true);
  };

  const handleInputBlur = () => {
    // Small delay to check if user is still interacting with input
    setTimeout(() => {
      setIsUserTyping(false);
    }, 200);
  };

  const handleInputFocus = () => {
    setIsUserTyping(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Messages Container */}
      <div className="flex-1 overflow-hidden bg-gray-900">
        <div ref={messagesContainerRef} className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            {messages.length === 1 && (
              <div className="px-4 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl shadow-blue-500/25">
                    <Scale className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-3">
                    Ganesha
                  </h1>
                  <p className="text-gray-400 text-lg">
                    Get instant, AI-powered answers to your legal questions
                  </p>
                </div>
                
                {/* Suggested Questions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  {suggestedQuestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(item.question)}
                      className="group relative bg-gray-800 border border-gray-700 rounded-xl p-6 text-left hover:bg-gray-750 hover:border-gray-600 transition-all duration-300 overflow-hidden"
                    >
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 bg-gradient-to-br ${item.color} rounded-lg shadow-lg`}>
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-400 mb-1">
                              {item.title}
                            </h3>
                            <p className="text-white group-hover:text-gray-100 transition-colors">
                              {item.question}
                            </p>
                          </div>
                        </div>
                        
                        {/* Arrow Icon */}
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <Send className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Quick Tips */}
                <div className="mt-8 text-center">
                  <p className="text-gray-500 text-sm">
                    💡 Tip: You can ask follow-up questions for more detailed information
                  </p>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="px-4 py-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-6 ${
                    msg.role === 'user' ? 'flex justify-end' : ''
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    // Assistant Message
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-5 py-4">
                          <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                          {/* Sources */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                              <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Legal References
                              </p>
                              <div className="space-y-2">
                                {msg.sources.map((source, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <span className="text-xs text-gray-500 mt-0.5">•</span>
                                    <span className="text-xs text-gray-400">{source}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Confidence Indicator */}
                          <ConfidenceIndicator confidence={msg.confidence} />
                        </div>
                        <div className="flex items-center gap-3 mt-2 px-1">
                          <span className="text-xs text-gray-500">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // User Message
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm px-5 py-4 shadow-lg">
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading */}
              {isLoading && (
                <div className="flex gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-sm text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <div ref={bottomRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Input Section - Fixed at bottom */}
      <div className="border-t border-gray-800 bg-gray-900 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Type your legal question here..."
              className="w-full px-6 py-4 pr-14 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isLoading}
              maxLength={1000}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${
                isLoading || !input.trim()
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          
          {/* Character Count */}
          {input.length > 0 && (
            <div className="mt-2 text-right">
              <span className={`text-xs ${input.length > 900 ? 'text-orange-400' : 'text-gray-600'}`}>
                {input.length}/1000
              </span>
            </div>
          )}
          
          {/* Disclaimer */}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
            <AlertCircle className="w-3 h-3" />
            <span>AI responses are for informational purposes only. Always consult a qualified lawyer for legal advice.</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}