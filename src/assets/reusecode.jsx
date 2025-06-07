
// /* src/components/Navbar.jsx - Complete Updated Version */
// import { useState, useEffect } from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { useLangStore } from '../store/useLangStore';
// import SearchBar from './SearchBar';
// import LogoutModal from './LogoutModal';
// import {
//   HomeIcon,
//   BookIcon,
//   HelpIcon,
//   CommunityIcon,
//   ContactIcon,
//   LanguageIcon,
//   SearchIcon,
//   LoginIcon,
//   SignupIcon,
//   LogoutIcon,
//   SunIcon,
//   MoonIcon,
//   UserIcon
// } from './Icons';

// /* ———————————————————  Enhanced SVG logo  ——————————————————— */
// const logoSvg = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     viewBox="0 0 24 24"
//     className="w-8 h-8"
//   >
//     <defs>
//       <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//         <stop offset="0%" stopColor="#3b82f6" />
//         <stop offset="100%" stopColor="#8b5cf6" />
//       </linearGradient>
//     </defs>
//     <path
//       fill="url(#logoGradient)"
//       d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
//     />
//     <path
//       fill="white"
//       d="M12 5.5L5 9v7c0 3.75 2.4 7.16 6 8.23V5.5z"
//       opacity="0.3"
//     />
//     <path
//       fill="white"
//       d="M16 10h-3v3h-2v-3H8V8h3V5h2v3h3v2z"
//     />
//   </svg>
// );

// /* ———————————————————  Route list with icons  ——————————————————— */
// const navItems = [
//   { label: 'Home', path: '/', icon: HomeIcon },
//   { label: 'Learn Law', path: '/learn-law', icon: BookIcon },
//   { label: 'Get Help', path: '/help', icon: HelpIcon },
//   { label: 'Community', path: '/community', icon: CommunityIcon },
//   { label: 'Contact Us', path: '/contact', icon: ContactIcon },
// ];

// export default function Navbar() {
//   const { lang, setLang } = useLangStore();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [scrollProgress, setScrollProgress] = useState(0);
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [darkMode, setDarkMode] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [langDropdownOpen, setLangDropdownOpen] = useState(false);
//   const navigate = useNavigate();

//   // Mock user state - replace with actual auth state
//   const [user, setUser] = useState(null); // { name: 'John Doe', avatar: '/avatar.jpg' }

//   const languages = [
//     { code: 'en', label: 'English', short: 'EN' },
//     { code: 'hi', label: 'Hindi', short: 'HI' },
//     { code: 'ta', label: 'Tamil', short: 'TA' },
//     { code: 'te', label: 'Telugu', short: 'TE' },
//     { code: 'kn', label: 'Kannada', short: 'KN' },
//     { code: 'ml', label: 'Malayalam', short: 'ML' },
//     { code: 'bn', label: 'Bengali', short: 'BN' },
//     { code: 'mr', label: 'Marathi', short: 'MR' },
//   ];

//   // Initialize dark mode from localStorage or system preference
//   useEffect(() => {
//     const savedTheme = localStorage.getItem('theme');
//     const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
//     if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
//       setDarkMode(true);
//       document.documentElement.classList.add('dark');
//     }
//   }, []);

//   // Toggle dark mode
//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode);
//     if (!darkMode) {
//       document.documentElement.classList.add('dark');
//       localStorage.setItem('theme', 'dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//       localStorage.setItem('theme', 'light');
//     }
//   };

//   // Load saved language preference
//   useEffect(() => {
//     const savedLang = localStorage.getItem('preferredLanguage');
//     if (savedLang) {
//       setLang(savedLang);
//     }
//   }, [setLang]);

//   // Save language preference
//   const handleLanguageChange = (language) => {
//     setLang(language);
//     localStorage.setItem('preferredLanguage', language);
//     setLangDropdownOpen(false);
//   };

//   // Handle scroll effect and progress
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 10);
      
//       // Calculate scroll progress
//       const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
//       const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
//       const scrolled = (winScroll / height) * 100;
//       setScrollProgress(scrolled);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Keyboard shortcut for search
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       // Cmd/Ctrl + K to open search
//       if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
//         e.preventDefault();
//         setSearchOpen(true);
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);
//     return () => document.removeEventListener('keydown', handleKeyDown);
//   }, []);

//   // Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (!e.target.closest('.lang-dropdown')) {
//         setLangDropdownOpen(false);
//       }
//     };

//     document.addEventListener('click', handleClickOutside);
//     return () => document.removeEventListener('click', handleClickOutside);
//   }, []);

//   // Handle logout
//   const handleLogout = () => {
//     setShowLogoutModal(false);
//     setUser(null);
//     navigate('/');
//   };

//   const currentLang = languages.find(l => l.label === lang) || languages[0];

//   return (
//     <>
//       {/* Scroll Progress Bar */}
//       <div 
//         className="fixed top-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 z-50"
//         style={{ width: `${scrollProgress}%` }}
//       />

//       <nav 
//         className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
//           scrolled 
//             ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md' 
//             : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6">
//           <div className="flex justify-between items-center h-16 gap-6px">
//             {/* Logo */}
//             <NavLink
//               to="/"
//               className="flex items-center space-x-3 flex-shrink-0"
//               onClick={() => setMenuOpen(false)}
//             >
//               <div className="transform transition-transform duration-200 hover:scale-105">
//                 {logoSvg}
//               </div>
//               <div className="hidden sm:block">
//                 <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                   Nayay Sutra
//                 </h1>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">Legal Assistance</p>
//               </div>
//             </NavLink>

//             {/* Desktop Navigation */}
//             <div className="hidden lg:flex items-center space-x-1">
//               {navItems.map(({ label, path, icon: Icon }) => (
//                 <NavLink
//                   key={path}
//                   to={path}
//                   className={({ isActive }) =>
//                     `flex items-center  space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//                       isActive
//                         ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
//                         : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
//                     }`
//                   }
//                   end={path === '/'}
//                 >
//                   <Icon className="w-5 h-5" />
//                   <span>{label}</span>
//                 </NavLink>
//               ))}
//             </div>

//             {/* Right Side Actions */}
//             <div className="flex items-center">
//               {/* Desktop Actions */}
//               <div className="hidden md:flex items-center space-x-2">
//                 {/* Search Button */}
//                 <button
//                   onClick={() => setSearchOpen(true)}
//                   className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
//                   aria-label="Open search"
//                 >
//                   <SearchIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
//                 </button>

//                 {/* Keyboard Shortcut Indicator */}
//                 <div className="hidden lg:flex items-center px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg">
//                   <kbd className="font-sans">⌘</kbd>
//                   <kbd className="font-sans ml-1">K</kbd>
//                 </div>

//                 {/* Dark Mode Toggle */}
//                 <button
//                   onClick={toggleDarkMode}
//                   className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//                   aria-label="Toggle dark mode"
//                 >
//                   {darkMode ? (
//                     <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//                   ) : (
//                     <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//                   )}
//                 </button>

//                 {/* Language Selector */}
//                 <div className="relative lang-dropdown">
//                   <button
//                     onClick={() => setLangDropdownOpen(!langDropdownOpen)}
//                     className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//                   >
//                     <LanguageIcon className="w-4 h-4" />
//                     <span>{currentLang.short}</span>
//                     <svg 
//                       className={`w-3 h-3 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} 
//                       fill="none" 
//                       stroke="currentColor" 
//                       viewBox="0 0 24 24"
//                     >
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </button>
                  
//                   {langDropdownOpen && (
//                     <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
//                       {languages.map((language) => (
//                         <button
//                           key={language.code}
//                           onClick={() => handleLanguageChange(language.label)}
//                           className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
//                             language.label === lang
//                               ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
//                               : 'text-gray-700 dark:text-gray-300'
//                           }`}
//                         >
//                           {language.label}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* Auth Section */}
//                 {user ? (
//                   <div className="flex items-center space-x-3">
//                     <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                       {user.avatar ? (
//                         <img 
//                           src={user.avatar} 
//                           alt={user.name}
//                           className="w-7 h-7 rounded-full"
//                         />
//                       ) : (
//                         <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
//                           <span className="text-white text-xs font-medium">
//                             {user.name?.charAt(0).toUpperCase()}
//                           </span>
//                         </div>
//                       )}
//                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                         {user.name}
//                       </span>
//                     </div>
//                     <button
//                       onClick={() => setShowLogoutModal(true)}
//                       className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//                       aria-label="Logout"
//                     >
//                       <LogoutIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//                     </button>
//                   </div>
//                               ) : (
//                   <div className="flex items-center space-x-2">
//                     <button
//                       onClick={() => navigate('/login')}
//                       className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
//                     >
//                       <LoginIcon className="w-4 h-4" />
//                       <span>Login</span>
//                     </button>
//                     <button
//                       onClick={() => navigate('/signup')}
//                       className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
//                     >
//                       <SignupIcon className="w-4 h-4" />
//                       <span>Sign up</span>
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Mobile Menu Button */}
//               <button
//                 onClick={() => setMenuOpen(!menuOpen)}
//                 className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//                 aria-label="Toggle menu"
//               >
//                 <div className="w-5 h-5 relative">
//                   <span className={`absolute inset-x-0 h-0.5 bg-gray-600 dark:bg-gray-400 transform transition-all duration-300 ${
//                     menuOpen ? 'top-2.5 rotate-45' : 'top-0.5'
//                   }`} />
//                   <span className={`absolute inset-x-0 top-2.5 h-0.5 bg-gray-600 dark:bg-gray-400 transition-opacity duration-300 ${
//                     menuOpen ? 'opacity-0' : 'opacity-100'
//                   }`} />
//                   <span className={`absolute inset-x-0 h-0.5 bg-gray-600 dark:bg-gray-400 transform transition-all duration-300 ${
//                     menuOpen ? 'top-2.5 -rotate-45' : 'top-4.5'
//                   }`} />
//                 </div>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         <div 
//           className={`lg:hidden transition-all duration-300 ease-in-out ${
//             menuOpen 
//               ? 'max-h-screen opacity-100' 
//               : 'max-h-0 opacity-0 overflow-hidden'
//           }`}
//         >
//           <div className="px-4 py-3 space-y-1 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
//             {/* Mobile Search Button */}
//             <button
//               onClick={() => {
//                 setMenuOpen(false);
//                 setSearchOpen(true);
//               }}
//               className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//             >
//               <SearchIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</span>
//             </button>

//             {/* User info (mobile) */}
//             {user && (
//               <div className="flex items-center space-x-3 px-3 py-2 mb-2 bg-white dark:bg-gray-800 rounded-lg">
//                 {user.avatar ? (
//                   <img 
//                     src={user.avatar} 
//                     alt={user.name}
//                     className="w-10 h-10 rounded-full"
//                   />
//                 ) : (
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
//                     <span className="text-white font-medium">
//                       {user.name?.charAt(0).toUpperCase()}
//                     </span>
//                   </div>
//                 )}
//                 <div className="flex-1">
//                   <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">View Profile</p>
//                 </div>
//               </div>
//             )}

//             {/* Mobile Navigation Links */}
//             {navItems.map(({ label, path, icon: Icon }) => (
//               <NavLink
//                 key={path}
//                 to={path}
//                 className={({ isActive }) =>
//                   `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                     isActive
//                       ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
//                       : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
//                   }`
//                 }
//                 onClick={() => setMenuOpen(false)}
//                 end={path === '/'}
//               >
//                 <Icon className="w-5 h-5" />
//                 <span>{label}</span>
//               </NavLink>
//             ))}

//             <hr className="my-3 border-gray-200 dark:border-gray-700" />

//             {/* Mobile Actions */}
//             <div className="space-y-2">
//               {/* Dark Mode Toggle */}
//               <button
//                 onClick={toggleDarkMode}
//                 className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//               >
//                 <div className="flex items-center space-x-3">
//                   {darkMode ? (
//                     <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//                   ) : (
//                     <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//                   )}
//                   <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {darkMode ? 'Light Mode' : 'Dark Mode'}
//                   </span>
//                 </div>
//                 <div className={`relative w-11 h-6 rounded-full transition-colors ${
//                   darkMode ? 'bg-blue-600' : 'bg-gray-300'
//                 }`}>
//                   <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
//                     darkMode ? 'translate-x-5' : 'translate-x-0'
//                   }`} />
//                 </div>
//               </button>

//               {/* Language Selection */}
//               <div className="px-3 py-2">
//                 <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
//                   Select Language
//                 </p>
//                 <div className="grid grid-cols-2 gap-2">
//                   {languages.slice(0, 4).map((language) => (
//                     <button
//                       key={language.code}
//                       onClick={() => {
//                         handleLanguageChange(language.label);
//                         setMenuOpen(false);
//                       }}
//                       className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
//                         language.label === lang
//                           ? 'bg-blue-600 text-white'
//                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
//                       }`}
//                     >
//                       {language.label}
//                     </button>
//                   ))}
//                 </div>
//                 <button
//                   className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
//                   onClick={() => setMenuOpen(false)}
//                 >
//                   View all languages →
//                 </button>
//               </div>

//               {/* Auth Buttons (Mobile) */}
//               {user ? (
//                 <button
//                   onClick={() => {
//                     setMenuOpen(false);
//                     setShowLogoutModal(true);
//                   }}
//                   className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
//                 >
//                   <LogoutIcon className="w-4 h-4" />
//                   <span>Logout</span>
//                 </button>
//               ) : (
//                 <div className="space-y-2">
//                   <button
//                     onClick={() => {
//                       setMenuOpen(false);
//                       navigate('/login');
//                     }}
//                     className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
//                   >
//                     <LoginIcon className="w-4 h-4" />
//                     <span>Login</span>
//                   </button>
//                   <button
//                     onClick={() => {
//                       setMenuOpen(false);
//                       navigate('/signup');
//                     }}
//                     className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
//                   >
//                     <SignupIcon className="w-4 h-4" />
//                     <span>Create Account</span>
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Search Bar Modal */}
//       <SearchBar 
//         isOpen={searchOpen}
//         onClose={() => setSearchOpen(false)}
//       />

//       {/* Logout Confirmation Modal */}
//       <LogoutModal 
//         isOpen={showLogoutModal}
//         onClose={() => setShowLogoutModal(false)}
//         onConfirm={handleLogout}
//       />

     

//     </>
//   );
// }
// -----------------------------------------------------------------------------------
// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import mongoose from 'mongoose';
// import helmet from 'helmet';
// import compression from 'compression';
// import rateLimit from 'express-rate-limit';

// // Load environment variables FIRST
// dotenv.config({ path: '.env.local' });

// // Verify environment variables are loaded
// console.log('🔧 Environment Check:', {
//   NODE_ENV: process.env.NODE_ENV || 'development',
//   PORT: process.env.PORT || 3001,
//   GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing',
//   PINECONE_API_KEY: process.env.PINECONE_API_KEY ? '✅ Set' : '❌ Missing',
//   PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME || 'Not set',
//   MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
//   JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'
// });

// // Warn if critical environment variables are missing
// if (!process.env.GEMINI_API_KEY) {
//   console.warn('⚠️  WARNING: GEMINI_API_KEY is not set. The chatbot will not function properly.');
//   console.warn('📝 Please add GEMINI_API_KEY to your .env.local file');
//   console.warn('🔗 Get your API key from: https://makersuite.google.com/app/apikey\n');
// }

// if (!process.env.MONGODB_URI) {
//   console.warn('⚠️  WARNING: MONGODB_URI is not set. e-Filing features will not work.');
// }

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const app = express();
// const PORT = process.env.PORT || 3001;

// // Security middleware for e-filing
// app.use(helmet());
// app.use(compression());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use('/api/efiling', limiter); // Apply rate limiting only to e-filing routes

// // CORS configuration
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URLs
//   credentials: true
// }));

// app.use(express.json({ limit: '50mb' })); // Increased for file uploads
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Request logging middleware
// app.use((req, res, next) => {
//   const service = req.path.startsWith('/api/efiling') ? '📁 e-Filing' : 
//                   req.path.startsWith('/chat') ? '🤖 Chatbot' : '🌐 General';
//   console.log(`📨 ${new Date().toISOString()} - ${service} - ${req.method} ${req.path}`);
//   next();
// });

// // Database connection for e-filing
// if (process.env.MONGODB_URI) {
//   mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log('🗄️  MongoDB connected for e-Filing'))
//   .catch(err => console.error('❌ MongoDB connection error:', err));
// }

// // Import route handlers with error handling
// let chatHandler;
// try {
//   chatHandler = (await import('./api/chat.js')).default;
// } catch (error) {
//   console.error('❌ Failed to import chat handler:', error.message);
//   chatHandler = (req, res) => {
//     res.status(500).json({ 
//       error: 'Chat handler not available',
//       message: 'Please check your api/chat.js file and dependencies'
//     });
//   };
// }

// // Import e-filing routes with error handling
// let efilingRoutes = {};
// try {
//   efilingRoutes.auth = (await import('./efiling/routes/auth.js')).default;
//   efilingRoutes.cases = (await import('./efiling/routes/cases.js')).default;
//   efilingRoutes.documents = (await import('./efiling/routes/documents.js')).default;
//   efilingRoutes.payments = (await import('./efiling/routes/payments.js')).default;
//   efilingRoutes.reports = (await import('./efiling/routes/reports.js')).default;
//   console.log('✅ e-Filing routes loaded successfully');
// } catch (error) {
//   console.warn('⚠️  e-Filing routes not available:', error.message);
//   console.warn('📁 Create efiling/routes/ directory and route files to enable e-filing features');
  
//   // Create placeholder routes
//   const createPlaceholderRouter = (serviceName) => {
//     const router = express.Router();
//     router.all('*', (req, res) => {
//       res.status(503).json({
//         error: 'Service Unavailable',
//         message: `${serviceName} service is not configured yet`,
//         setup: `Create efiling/routes/${serviceName.toLowerCase()}.js file`
//       });
//     });
//     return router;
//   };

//   efilingRoutes = {
//     auth: createPlaceholderRouter('Authentication'),
//     cases: createPlaceholderRouter('Cases'),
//     documents: createPlaceholderRouter('Documents'),
//     payments: createPlaceholderRouter('Payments'),
//     reports: createPlaceholderRouter('Reports')
//   };
// }

// // ============= EXISTING CHATBOT ROUTES =============

// // Health check endpoint with both services
// app.get('/health', (req, res) => {
//   const healthStatus = {
//     status: 'OK',
//     message: 'Nayay Sutra API is running',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development',
//     services: {
//       chatbot: {
//         status: process.env.GEMINI_API_KEY ? 'available' : 'degraded',
//         apiKeys: {
//           gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
//           pinecone: process.env.PINECONE_API_KEY ? 'configured' : 'missing'
//         }
//       },
//       efiling: {
//         status: process.env.MONGODB_URI && process.env.JWT_SECRET ? 'available' : 'degraded',
//         database: process.env.MONGODB_URI ? 'connected' : 'not configured',
//         auth: process.env.JWT_SECRET ? 'configured' : 'missing'
//       }
//     },
//     version: process.env.npm_package_version || '0.0.0'
//   };
  
//   // Set overall status based on configuration
//   if (!process.env.GEMINI_API_KEY || !process.env.MONGODB_URI) {
//     healthStatus.status = 'DEGRADED';
//     healthStatus.message = 'API is running but some services are not fully configured';
//   }
  
//   res.json(healthStatus);
// });

// // Test endpoint for debugging
// app.get('/test', (req, res) => {
//   res.json({ 
//     message: 'Nayay Sutra Backend is working!',
//     services: ['Legal Chatbot', 'e-Filing Portal'],
//     time: new Date().toISOString()
//   });
// });

// // Chat endpoint with better error handling (EXISTING)
// app.post('/chat', async (req, res) => {
//   try {
//     if (!req.body || !req.body.messages) {
//       return res.status(400).json({ 
//         error: 'Bad Request',
//         message: 'Messages array is required in request body'
//       });
//     }
    
//     if (!process.env.GEMINI_API_KEY) {
//       return res.status(503).json({ 
//         error: 'Service Unavailable',
//         message: 'AI service is not configured. Please contact administrator.'
//       });
//     }
    
//     await chatHandler(req, res);
//   } catch (error) {
//     console.error('❌ Chat endpoint error:', error);
//     res.status(500).json({ 
//       error: 'Internal server error',
//       message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
//       timestamp: new Date().toISOString()
//     });
//   }
// });

// // ============= NEW E-FILING ROUTES =============

// // e-Filing routes
// app.use('/api/efiling/auth', efilingRoutes.auth);
// app.use('/api/efiling/cases', efilingRoutes.cases);
// app.use('/api/efiling/documents', efilingRoutes.documents);
// app.use('/api/efiling/payments', efilingRoutes.payments);
// app.use('/api/efiling/reports', efilingRoutes.reports);

// // API documentation endpoint (UPDATED)
// app.get('/api', (req, res) => {
//   res.json({
//     message: 'Nayay Sutra - Legal Platform API',
//     version: '2.0.0',
//     services: ['Legal Chatbot', 'e-Filing Portal'],
//     endpoints: {
//       // General
//       'GET /health': 'Health check for all services',
//       'GET /test': 'Test endpoint',
//       'GET /api': 'API documentation',
      
//       // Chatbot
//       'POST /chat': 'Chat with AI legal assistant',
      
//       // e-Filing
//       'POST /api/efiling/auth/register': 'User registration',
//       'POST /api/efiling/auth/login': 'User login',
//       'POST /api/efiling/auth/verify-otp': 'Verify OTP',
//       'GET /api/efiling/cases': 'Get user cases',
//       'POST /api/efiling/cases': 'Create new case',
//       'POST /api/efiling/documents/upload': 'Upload documents',
//       'POST /api/efiling/payments/create': 'Process payments',
//       'GET /api/efiling/reports/cases': 'Generate reports'
//     },
//     chatbot: {
//       method: 'POST',
//       path: '/chat',
//       body: {
//         messages: [
//           { role: 'user', content: 'Your legal question here' }
//         ]
//       },
//       response: {
//         answer: 'AI response',
//         sources: ['Legal Source 1', 'Legal Source 2'],
//         confidence: 0.95
//       }
//     },
//     efiling: {
//       authentication: 'JWT based',
//       fileUpload: 'PDF only, max 25MB',
//       payments: 'Razorpay integration',
//       features: ['Case filing', 'Document management', 'Payment processing', 'Reports']
//     }
//   });
// });

// // 404 handler (UPDATED)
// app.use((req, res) => {
//   res.status(404).json({ 
//     error: 'Endpoint not found',
//     message: `The endpoint ${req.method} ${req.path} does not exist`,
//     availableEndpoints: {
//       general: ['/health', '/test', '/api'],
//       chatbot: ['/chat'],
//       efiling: ['/api/efiling/auth/*', '/api/efiling/cases/*', '/api/efiling/documents/*', '/api/efiling/payments/*', '/api/efiling/reports/*']
//     }
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('💥 Global error:', err);
//   res.status(500).json({ 
//     error: 'Internal Server Error', 
//     message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
//     timestamp: new Date().toISOString()
//   });
// });

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('📴 SIGTERM signal received: closing HTTP server');
//   mongoose.connection.close(() => {
//     console.log('🗄️  Database connection closed');
//   });
//   server.close(() => {
//     console.log('🛑 HTTP server closed');
//   });
// });

// // Start server
// const server = app.listen(PORT, () => {
//   console.log('\n🚀 Nayay Sutra Platform Started!');
//   console.log('━'.repeat(60));
//   console.log(`✅ Server running on: http://localhost:${PORT}`);
//   console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`🔍 Health check: http://localhost:${PORT}/health`);
//   console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
//   console.log(`📚 API docs: http://localhost:${PORT}/api`);
//   console.log('━'.repeat(60));
//   console.log('🤖 Chatbot: http://localhost:${PORT}/chat');
//   console.log('📁 e-Filing: http://localhost:${PORT}/api/efiling/*');
//   console.log('━'.repeat(60));
  
//   if (!process.env.GEMINI_API_KEY) {
//     console.log('\n⚠️  To enable Chatbot features:');
//     console.log('1. Get API key from: https://makersuite.google.com/app/apikey');
//     console.log('2. Add to .env.local: GEMINI_API_KEY=your_key_here');
//   }
  
//   if (!process.env.MONGODB_URI) {
//     console.log('\n⚠️  To enable e-Filing features:');
//     console.log('1. Set up MongoDB database');
//     console.log('2. Add to .env.local: MONGODB_URI=your_mongodb_connection');
//     console.log('3. Add to .env.local: JWT_SECRET=your_jwt_secret');
//   }
  
//   console.log('\n📋 Next steps to complete e-Filing setup:');
//   console.log('1. Create efiling/routes/ directory');
//   console.log('2. Add route files (auth.js, cases.js, etc.)');
//   console.log('3. Add environment variables for payments, email, etc.\n');
// });

// export default server;