/* OfflineHelp.jsx -------------------------------------------------- */
import React, { useState } from 'react';
import { PhoneIcon, ChatBubbleLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'mr', name: 'मराठी' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
];

export default function OfflineHelp() {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [helpType, setHelpType] = useState('sms');
  const [language, setLanguage] = useState('en');
  const [loading, setLoad] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const isValidPhone = (p) => /^\d{10}$/.test(p);

  const requestHelp = async () => {
    if (!isValidPhone(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError(null);
    setLoad(true);

    try {
      const res = await fetch('/api/offline-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: `${countryCode.code}${phone}`,
          type: helpType,
          language: language
        }),
      });
      if (!res.ok) throw new Error('Service temporarily unavailable');
      setSent(true);
    } catch (e) {
      console.error(e);
      setError('Unable to process request. Please try again.');
    } finally {
      setLoad(false);
    }
  };

  const handleReset = () => {
    setSent(false);
    setPhone('');
    setError(null);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Request Received!
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {helpType === 'sms' 
                ? 'You will receive an SMS with legal assistance information within 2-3 minutes.'
                : 'A legal assistant will call you within 5-10 minutes.'
              }
            </p>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-800 dark:text-purple-300">
                Registered number: <strong>{countryCode.code}{phone}</strong>
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Offline Legal Help
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Get legal assistance via SMS or phone call, even without internet
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Help Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How would you like to receive help?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setHelpType('sms')}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition
                  ${helpType === 'sms' 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <ChatBubbleLeftIcon className={`w-8 h-8 ${
                  helpType === 'sms' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <span className={`font-medium ${
                  helpType === 'sms' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  SMS
                </span>
              </button>
              
              <button
                onClick={() => setHelpType('call')}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition
                  ${helpType === 'call' 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <PhoneIcon className={`w-8 h-8 ${
                  helpType === 'call' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <span className={`font-medium ${
                  helpType === 'call' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Voice Call
                </span>
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Preferred Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          {/* Phone Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Your phone number
            </label>
            
            <div className="flex gap-2">
              {/* Country Code Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                >
                  <span className="text-xl">{countryCode.flag}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{countryCode.code}</span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                </button>
                
                {showDropdown && (
                  <div className="absolute top-full mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                    {COUNTRY_CODES.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => {
                          setCountryCode(country);
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                      >
                        <span className="text-xl">{country.flag}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {country.code}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {country.country}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone Number Input */}
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) setPhone(value);
                }}
                placeholder="9876543210"
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                disabled={loading}
              />
            </div>
            
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {helpType === 'sms' 
                ? '💬 You\'ll receive legal information and guidance via SMS in your preferred language.'
                : '📞 A legal expert will call you to provide personalized assistance in your language.'
              }
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={requestHelp}
            disabled={loading || !phone}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <span>Request {helpType === 'sms' ? 'SMS' : 'Call'}</span>
            )}
          </button>

          {/* Privacy Note */}
          <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
            Your phone number will only be used for providing legal assistance
          </p>
        </div>

        {/* Features Section */}
                {/* Features Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Quick Response</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get help within minutes</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🌐</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Multi-lingual</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Support in 15+ languages</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Confidential</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your privacy protected</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
                How quickly will I receive help?
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                SMS responses are sent within 2-3 minutes. Voice calls are made within 5-10 minutes during business hours.
              </p>
            </details>
            
            <details className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
                What languages are supported?
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                We support Hindi, English, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and more.
              </p>
            </details>
            
            <details className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
                Is there any charge for this service?
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                The service is free. Standard SMS/call charges from your mobile carrier may apply.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Optional: Enhanced version with language preference and urgency level */
export function OfflineHelpEnhanced() {
  const [formData, setFormData] = useState({
    phone: '',
    countryCode: COUNTRY_CODES[0],
    helpType: 'sms',
    language: 'en',
    urgency: 'normal',
    issue: ''
  });
  
  const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  ];

  const ISSUE_TYPES = [
    'Family Dispute',
    'Property Issue',
    'Consumer Rights',
    'Employment Problem',
    'Criminal Matter',
    'Civil Rights',
    'Other Legal Issue'
  ];

  // Add this section after help type selection in the main form:
  const renderAdditionalFields = () => (
    <>
      {/* Language Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Preferred Language
        </label>
        <select
          value={formData.language}
          onChange={(e) => setFormData({...formData, language: e.target.value})}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>

      {/* Urgency Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          How urgent is your issue?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['normal', 'urgent', 'emergency'].map((level) => (
            <button
              key={level}
              onClick={() => setFormData({...formData, urgency: level})}
              className={`
                py-2 px-4 rounded-lg font-medium capitalize transition
                ${formData.urgency === level
                  ? level === 'emergency' 
                    ? 'bg-red-500 text-white' 
                    : level === 'urgent'
                    ? 'bg-orange-500 text-white'
                    : 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }
              `}
            >
              {level}
            </button>
          ))}
        </div>
        {formData.urgency === 'emergency' && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            For life-threatening emergencies, please call your local emergency number immediately.
          </p>
        )}
      </div>

      {/* Issue Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Type of legal issue (optional)
        </label>
        <select
          value={formData.issue}
          onChange={(e) => setFormData({...formData, issue: e.target.value})}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select an issue type</option>
          {ISSUE_TYPES.map(issue => (
            <option key={issue} value={issue}>{issue}</option>
          ))}
        </select>
      </div>
    </>
  );

  // Return the enhanced form with all the additional fields
  return null; // Implementation would follow similar pattern as above
}

/* Utility component for showing recent requests */
export function RecentRequests({ userId }) {
  const [requests, setRequests] = useState([]);
  
  // Mock data - replace with actual API call
  React.useEffect(() => {
    setRequests([
      { id: 1, date: '2024-01-10', type: 'sms', status: 'completed' },
      { id: 2, date: '2024-01-09', type: 'call', status: 'completed' },
    ]);
  }, [userId]);

  if (requests.length === 0) return null;

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Recent Requests
      </h3>
      <div className="space-y-3">
        {requests.map(req => (
          <div key={req.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div className="flex items-center gap-3">
              {req.type === 'sms' ? (
                <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <PhoneIcon className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(req.date).toLocaleDateString()}
              </span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              req.status === 'completed' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {req.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}