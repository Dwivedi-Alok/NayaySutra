import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  GlobeAltIcon,
  PhoneArrowDownLeftIcon,
} from '@heroicons/react/24/outline';

/* ---------- single card ---------- */
function FeatureCard({ icon: Icon, title, to, gradient, iconColor, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.1 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <li
      ref={ref}
      style={{ animationDelay: `${index * 100}ms` }}
      className={`${
        visible ? 'animate-fade-up' : 'opacity-0 translate-y-8'
      } list-none`}
    >
      <Link
        to={to}
        className={`
          group relative block h-full overflow-hidden rounded-2xl
          bg-gradient-to-br ${gradient}
          p-[2px] transition-all duration-300
          hover:scale-[1.02] hover:shadow-2xl
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400
        `}
      >
        <div className="flex h-full flex-col items-center gap-4 rounded-2xl bg-white/90 dark:bg-gray-900/90 px-8 py-10 backdrop-blur-sm transition-all group-hover:bg-white/80 dark:group-hover:bg-gray-900/80">
          <div className={`rounded-full bg-gradient-to-br ${gradient} p-4 shadow-lg`}>
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </div>
          <h3 className="text-center text-lg font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </h3>
        </div>
      </Link>
    </li>
  );
}

/* ---------- main section ---------- */
export default function KeyFeatures() {
  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'GPT-Powered Legal Chatbot',
      to: '/chatbot',
      gradient: 'from-purple-500 to-indigo-600',
      iconColor: 'text-white',
    },
    {
      icon: DocumentTextIcon,
      title: 'Document Generator',
      to: '/generate-document',
      gradient: 'from-emerald-500 to-teal-600',
      iconColor: 'text-white',
    },
    {
      icon: PuzzlePieceIcon,
      title: 'Gamified Legal Learning',
      to: '/learn-law',
      gradient: 'from-orange-500 to-pink-600',
      iconColor: 'text-white',
    },
    {
      icon: GlobeAltIcon,
      title: 'Multilingual Support',
      to: '/multilingual',
      gradient: 'from-blue-500 to-cyan-600',
      iconColor: 'text-white',
    },
    {
      icon: PhoneArrowDownLeftIcon,
      title: 'SMS & Voice Help (Offline Mode)',
      to: '/offline-help',
      gradient: 'from-rose-500 to-violet-600',
      iconColor: 'text-white',
    },
  ];

  return (
    <section
      id="features"
      className="relative w-full bg-gray-50 dark:bg-gray-900 py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-transparent to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 opacity-50" />
      
      <div className="relative">
        <h2 className="text-center text-4xl font-extrabold text-blue dark:text-blue mb-4">
          Key Features
        </h2>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
          Discover powerful tools designed to make legal assistance accessible to everyone
        </p>

        {/* responsive grid */}
        <ul className="grid mx-auto max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/* Add this to your global CSS or tailwind config */
/*
@layer utilities {
  @keyframes fade-up {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-up {
    animation: fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
}
*/