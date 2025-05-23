/*  src/components/Navbar.jsx  */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLangStore } from '../store/useLangStore';

/* ———————————————————  SVG logo  ——————————————————— */
const logoSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className="inline-block w-6 h-6 mr-1 text-blue-600"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 21h6M12 3v18m-3-3H6a2 2 0 01-2-2v-2a2 2 0 012-2h6m3 6h3a2 2 0 002-2v-2a2 2 0 00-2-2h-3"
    />
  </svg>
);

/* ———————————————————  Route list  ——————————————————— */
const navItems = [
  { label: 'Home',       path: '/' },
  { label: 'Features',   path: '/features' },
  { label: 'Learn Law',  path: '/learn-law' },
  { label: 'Get Help',   path: '/help' },
  { label: 'Community',  path: '/community' },
  { label: 'Contact Us', path: '/contact' },
];

export default function Navbar() {
  /* global language store */
  const { lang, setLang } = useLangStore();

  /* local UI state */
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const languages = [
    'English',
    'Hindi',
    'Tamil',
    'Telugu',
    'Kannada',
    'Malayalam',
    'Bengali',
    'Marathi',
  ];

  /* Tailwind classes for active vs inactive links */
  const navLinkClasses = ({ isActive }) =>
    `text-gray-700 font-medium px-1 py-0.5 transition-colors duration-200
     ${isActive ? 'border-b-2 border-blue-700 text-blue-700'
                : 'hover:text-blue-700'}`;

  /* ———————————————————  JSX  ——————————————————— */
  return (
    <nav className="bg-white shadow sticky top-0 z-30 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / brand */}
          <NavLink
            to="/"
            className="flex items-center text-xl font-bold text-blue-700 hover:text-blue-900 select-none"
            onClick={() => setMenuOpen(false)}
          >
            {logoSvg} Nayay Sutra
          </NavLink>

          {/* Desktop links */}
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map(({ label, path }) => (
              <NavLink
                key={label}
                to={path}
                className={navLinkClasses}
                end={path === '/'}
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right-side actions */}
          <div className="flex items-center space-x-4">
            {/* Language selector */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>

            {/* Auth buttons (desktop) */}
            <button
              onClick={() => navigate('/login')}
              className="hidden md:inline-block bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 font-semibold"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="hidden md:inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 font-semibold"
            >
              Signup
            </button>

            {/* Hamburger (mobile) */}
            <button
              className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg py-2 space-y-1">
          {navItems.map(({ label, path }) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) =>
                `block px-4 py-2 font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-700 hover:bg-blue-50'
                }`
              }
              end={path === '/'}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}

          {/* Language + auth (mobile) */}
          <div className="border-t border-gray-200 mt-1 pt-2 px-4">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>

            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/login');
                }}
                className="flex-grow bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 font-semibold"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/signup');
                }}
                className="flex-grow bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 font-semibold"
              >
                Signup
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}