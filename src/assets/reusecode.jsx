
/* src/components/Navbar.jsx - Complete Updated Version */
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLangStore } from '../store/useLangStore';
import SearchBar from './SearchBar';
import LogoutModal from './LogoutModal';
import {
  HomeIcon,
  BookIcon,
  HelpIcon,
  CommunityIcon,
  ContactIcon,
  LanguageIcon,
  SearchIcon,
  LoginIcon,
  SignupIcon,
  LogoutIcon,
  SunIcon,
  MoonIcon,
  UserIcon
} from './Icons';

/* ———————————————————  Enhanced SVG logo  ——————————————————— */
const logoSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-8 h-8"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <path
      fill="url(#logoGradient)"
      d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
    />
    <path
      fill="white"
      d="M12 5.5L5 9v7c0 3.75 2.4 7.16 6 8.23V5.5z"
      opacity="0.3"
    />
    <path
      fill="white"
      d="M16 10h-3v3h-2v-3H8V8h3V5h2v3h3v2z"
    />
  </svg>
);

/* ———————————————————  Route list with icons  ——————————————————— */
const navItems = [
  { label: 'Home', path: '/', icon: HomeIcon },
  { label: 'Learn Law', path: '/learn-law', icon: BookIcon },
  { label: 'Get Help', path: '/help', icon: HelpIcon },
  { label: 'Community', path: '/community', icon: CommunityIcon },
  { label: 'Contact Us', path: '/contact', icon: ContactIcon },
];

export default function Navbar() {
  const { lang, setLang } = useLangStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Mock user state - replace with actual auth state
  const [user, setUser] = useState(null); // { name: 'John Doe', avatar: '/avatar.jpg' }

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'Hindi', short: 'HI' },
    { code: 'ta', label: 'Tamil', short: 'TA' },
    { code: 'te', label: 'Telugu', short: 'TE' },
    { code: 'kn', label: 'Kannada', short: 'KN' },
    { code: 'ml', label: 'Malayalam', short: 'ML' },
    { code: 'bn', label: 'Bengali', short: 'BN' },
    { code: 'mr', label: 'Marathi', short: 'MR' },
  ];

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Load saved language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      setLang(savedLang);
    }
  }, [setLang]);

  // Save language preference
  const handleLanguageChange = (language) => {
    setLang(language);
    localStorage.setItem('preferredLanguage', language);
    setLangDropdownOpen(false);
  };

  // Handle scroll effect and progress
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      
      // Calculate scroll progress
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.lang-dropdown')) {
        setLangDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = () => {
    setShowLogoutModal(false);
    setUser(null);
    navigate('/');
  };

  const currentLang = languages.find(l => l.label === lang) || languages[0];

  return (
    <>
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 z-50"
        style={{ width: `${scrollProgress}%` }}
      />

      <nav 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md' 
            : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6">
          <div className="flex justify-between items-center h-16 gap-6px">
            {/* Logo */}
            <NavLink
              to="/"
              className="flex items-center space-x-3 flex-shrink-0"
              onClick={() => setMenuOpen(false)}
            >
              <div className="transform transition-transform duration-200 hover:scale-105">
                {logoSvg}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Nayay Sutra
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">Legal Assistance</p>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center  space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                    }`
                  }
                  end={path === '/'}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center">
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-2">
                {/* Search Button */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  aria-label="Open search"
                >
                  <SearchIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
                </button>

                {/* Keyboard Shortcut Indicator */}
                <div className="hidden lg:flex items-center px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <kbd className="font-sans">⌘</kbd>
                  <kbd className="font-sans ml-1">K</kbd>
                </div>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? (
                    <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>

                {/* Language Selector */}
                <div className="relative lang-dropdown">
                  <button
                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <LanguageIcon className="w-4 h-4" />
                    <span>{currentLang.short}</span>
                    <svg 
                      className={`w-3 h-3 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {langDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => handleLanguageChange(language.label)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            language.label === lang
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {language.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Auth Section */}
                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-7 h-7 rounded-full"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.name}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Logout"
                    >
                      <LogoutIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                              ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate('/login')}
                      className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <LoginIcon className="w-4 h-4" />
                      <span>Login</span>
                    </button>
                    <button
                      onClick={() => navigate('/signup')}
                      className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                    >
                      <SignupIcon className="w-4 h-4" />
                      <span>Sign up</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                <div className="w-5 h-5 relative">
                  <span className={`absolute inset-x-0 h-0.5 bg-gray-600 dark:bg-gray-400 transform transition-all duration-300 ${
                    menuOpen ? 'top-2.5 rotate-45' : 'top-0.5'
                  }`} />
                  <span className={`absolute inset-x-0 top-2.5 h-0.5 bg-gray-600 dark:bg-gray-400 transition-opacity duration-300 ${
                    menuOpen ? 'opacity-0' : 'opacity-100'
                  }`} />
                  <span className={`absolute inset-x-0 h-0.5 bg-gray-600 dark:bg-gray-400 transform transition-all duration-300 ${
                    menuOpen ? 'top-2.5 -rotate-45' : 'top-4.5'
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            menuOpen 
              ? 'max-h-screen opacity-100' 
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="px-4 py-3 space-y-1 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            {/* Mobile Search Button */}
            <button
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen(true);
              }}
              className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <SearchIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</span>
            </button>

            {/* User info (mobile) */}
            {user && (
              <div className="flex items-center space-x-3 px-3 py-2 mb-2 bg-white dark:bg-gray-800 rounded-lg">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">View Profile</p>
                </div>
              </div>
            )}

            {/* Mobile Navigation Links */}
            {navItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
                onClick={() => setMenuOpen(false)}
                end={path === '/'}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            ))}

            <hr className="my-3 border-gray-200 dark:border-gray-700" />

            {/* Mobile Actions */}
            <div className="space-y-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {darkMode ? (
                    <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </div>
                <div className={`relative w-11 h-6 rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    darkMode ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </button>

              {/* Language Selection */}
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Select Language
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {languages.slice(0, 4).map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        handleLanguageChange(language.label);
                        setMenuOpen(false);
                      }}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        language.label === lang
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {language.label}
                    </button>
                  ))}
                </div>
                <button
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={() => setMenuOpen(false)}
                >
                  View all languages →
                </button>
              </div>

              {/* Auth Buttons (Mobile) */}
              {user ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <LogoutIcon className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/login');
                    }}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <LoginIcon className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/signup');
                    }}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <SignupIcon className="w-4 h-4" />
                    <span>Create Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Bar Modal */}
      <SearchBar 
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

     

    </>
  );
}
