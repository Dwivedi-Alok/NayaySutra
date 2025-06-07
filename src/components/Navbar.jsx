/*  src/components/Navbar.jsx  */
import { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLangStore } from '../store/useLangStore';

/* ———————————————————  Enhanced SVG logo  ——————————————————— */
const logoSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-7 h-7" // Slightly smaller logo
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

/* ———————————————————  Icon Components  ——————————————————— */
const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const HelpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const EFilingIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CommunityIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ContactIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LanguageIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
  </svg>
);

/* ———————————————————  Route list with icons  ——————————————————— */
const navItems = [
  { label: 'Home', path: '/', icon: HomeIcon },
  { label: 'Learn Law', path: '/learn-law', icon: BookIcon },
  { label: 'Get Help', path: '/help', icon: HelpIcon },
  { label: 'E-Filing', path: '/efiling', icon: EFilingIcon },
  { label: 'Community', path: '/community', icon: CommunityIcon },
  { label: 'Contact Us', path: '/contact', icon: ContactIcon },
];

export default function Navbar() {
  const { lang, setLang } = useLangStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const navigate = useNavigate();

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

  // Memoize current language
  const currentLang = useMemo(
    () => languages.find(l => l.label === lang) || languages[0],
    [lang]
  );

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('nav')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (menuOpen && e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const navLinkClasses = ({ isActive }) =>
    `relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap
     ${isActive 
       ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' 
       : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800'}`;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg' 
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8"> {/* Changed from max-w-7xl to w-full */}
        <div className="flex justify-between h-16 items-center">
          {/* Logo / brand */}
          <NavLink
            to="/"
            className="flex items-center gap-2 group flex-shrink-0" // Added flex-shrink-0
            onClick={() => setMenuOpen(false)}
          >
            <div className="transform transition-transform duration-300 group-hover:scale-110">
              {logoSvg}
            </div>
            <div className="hidden sm:block"> {/* Hide text on very small screens */}
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                Nayay Sutra
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Legal Assistance</p>
            </div>
          </NavLink>

          {/* Desktop navigation - adjusted breakpoint and spacing */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center mx-4"> {/* Reduced gap and added flex-1 */}
            {navItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={label}
                to={path}
                className={navLinkClasses}
                end={path === '/'}
                aria-current={({ isActive }) => isActive ? 'page' : undefined}
              >
                <Icon />
                <span className="hidden lg:inline">{label}</span> {/* Hide text on medium screens, show on large */}
              </NavLink>
            ))}
          </div>

          {/* Right-side actions - compressed */}
          <div className="flex items-center gap-2 flex-shrink-0"> {/* Reduced gap */}
            {/* Language selector (Desktop) */}
            <div className="hidden md:block relative group">
              <button 
                className="flex items-center gap-1 px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                aria-label={`Current language: ${currentLang.label}`}
                aria-expanded={isLangDropdownOpen}
                onMouseEnter={() => setIsLangDropdownOpen(true)}
                onMouseLeave={() => setIsLangDropdownOpen(false)}
              >
                <LanguageIcon />
                <span className="text-xs">{currentLang.short}</span> {/* Smaller text */}
                <svg 
                  className={`w-3 h-3 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Language dropdown */}
              <div 
                                className={`absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 ${
                  isLangDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onMouseEnter={() => setIsLangDropdownOpen(true)}
                onMouseLeave={() => setIsLangDropdownOpen(false)}
              >
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => {
                      setLang(language.label);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      language.label === lang
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Auth buttons (desktop) - compressed */}
            <div className="hidden md:flex items-center gap-1"> {/* Reduced gap */}
              <button
                onClick={() => navigate('/login')}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow hover:shadow-lg transform hover:scale-105 whitespace-nowrap"
              >
                Sign up
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden relative w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <div className="w-6 h-5 relative flex flex-col justify-center">
                <span className={`absolute h-0.5 w-6 bg-gray-600 dark:bg-gray-300 transform transition-all duration-300 ease-in-out ${
                  menuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                }`} />
                <span className={`absolute h-0.5 w-6 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ease-in-out ${
                  menuOpen ? 'opacity-0' : 'opacity-100'
                }`} />
                <span className={`absolute h-0.5 w-6 bg-gray-600 dark:bg-gray-300 transform transition-all duration-300 ease-in-out ${
                  menuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
                }`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay/backdrop */}
      {menuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu */}
      <div 
        className={`md:hidden fixed inset-x-0 top-16 transition-all duration-300 ease-in-out z-50 ${
          menuOpen 
            ? 'opacity-100 visible transform translate-y-0' 
            : 'opacity-0 invisible transform -translate-y-4'
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="bg-white dark:bg-gray-900 shadow-xl border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {/* Mobile navigation links */}
            {navItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`
                }
                end={path === '/'}
                onClick={() => setMenuOpen(false)}
                aria-current={({ isActive }) => isActive ? 'page' : undefined}
              >
                <div className={`p-2 rounded-lg ${
                  window.location.pathname === path 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Icon />
                </div>
                <span className="font-medium">{label}</span>
              </NavLink>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

            {/* Language selector (Mobile) */}
            <div className="px-4 py-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Language
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {languages.slice(0, 4).map((language) => (
                  <button
                    key={language.code}
                    onClick={() => {
                      setLang(language.label);
                      setMenuOpen(false);
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      language.label === lang
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  // Show all languages modal or expand list
                  setMenuOpen(false);
                  // You could implement a modal here or navigate to a language settings page
                }}
                className="mt-2 w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all languages →
              </button>
            </div>

            {/* Auth buttons (mobile) */}
            <div className="px-4 py-2 space-y-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Login to your account
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/signup');
                }}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Sign up
              </button>
            </div>

            {/* Social links (mobile) */}
            <div className="px-4 py-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Follow Us
              </p>
              <div className="flex gap-3">
                {[
                  { name: 'twitter', icon: 'T' },
                  { name: 'facebook', icon: 'F' },
                  { name: 'linkedin', icon: 'L' },
                  { name: 'instagram', icon: 'I' }
                ].map((social) => (
                  <a
                    key={social.name}
                    href={`#${social.name}`}
                    className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      setMenuOpen(false);
                      // Implement actual social media links
                    }}
                    aria-label={`Visit our ${social.name} page`}
                  >
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {social.icon}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}