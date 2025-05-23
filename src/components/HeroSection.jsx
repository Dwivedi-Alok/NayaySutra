import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ViewB from './main';

export default function HeroSection() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const buttons = [
    {
      id: 'ask',
      label: 'Ask a Legal Question',
      emoji: '🔍',
      bg: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      route: '/ask-question',
      desc: 'Get instant answers from our experts',
    },
    {
      id: 'doc',
      label: 'Generate Legal Document',
      emoji: '📄',
      bg: 'bg-green-600',
      hover: 'hover:bg-green-700',
      route: '/generate-document',
      desc: 'Create affidavits, agreements and more',
    },
    {
      id: 'lawyer',
      label: 'Connect With a Free Lawyer',
      emoji: '🧑‍⚖️',
      bg: 'bg-purple-600',
      hover: 'hover:bg-purple-700',
      route: '/connect-lawyer',
      desc: 'Schedule a no-cost consultation',
    },
  ];

  return (
    <section className="relative isolate overflow-hidden py-20 px-4 sm:px-6 lg:px-8 text-center">
      {/* Full-screen background video */}
      <ViewB />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 -z-10" />

      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow mb-6">
          Justice in Your Language,
          <br />
          <span className="text-primary-300">At Your Fingertips</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-100 mb-10">
          Ask questions, create documents and talk to real lawyers — all in one place.
        </p>

        <div className="flex justify-center flex-wrap gap-6">
          {buttons.map((b) => (
            <div
              key={b.id}
              className="group relative"
              onMouseEnter={() => setHovered(b.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <button
                type="button"
                onClick={() => navigate(b.route)}
                className={`flex items-center space-x-2 ${b.bg} ${b.hover} text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-transform duration-200 group-hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white`}
              >
                <span className="text-2xl">{b.emoji}</span>
                <span>{b.label}</span>
              </button>

              {/* tooltip */}
              {hovered === b.id && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max whitespace-nowrap bg-gray-900/90 text-gray-100 text-xs px-3 py-1 rounded">
                  {b.desc}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}