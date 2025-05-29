import { useEffect, useRef, useState } from 'react';
import ViewB from './Back';
import { ArrowDownIcon } from '@heroicons/react/24/outline';

export default function HeroSection() {
  const heroRef  = useRef(null);
  const [showHint, setShowHint] = useState(true);

  /* ─── Hide scroll-indicator when hero leaves viewport ─── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowHint(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  /* ─── Prefer-reduced-motion users: don’t auto-play video ─── */
  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Scroll to #features on “Get Started” ─── */
  const handleGetStarted = () => {
    const features = document.getElementById('features');
    if (features) {
      features.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      ref={heroRef}
      className="relative isolate flex flex-col items-center justify-center overflow-hidden py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center min-h-screen"
    >
      {/* Video backdrop */}
      <ViewB
        muted
        autoPlay={!prefersReducedMotion}
        playsInline
        loop
        poster="/fallback.jpg"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover -z-20"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 -z-10" />

      {/* Copy */}
      <div className="mx-auto max-w-5xl">
        <h1 className="sr-only">Justice in your language — at your fingertips</h1>

        <p className="text-[clamp(2rem,5vw,4rem)] font-extrabold tracking-tight text-white drop-shadow-sm leading-tight mb-6">
          Justice in&nbsp;Your&nbsp;Language,
          <br />
          <span className="text-indigo-300">At&nbsp;Your&nbsp;Fingertips</span>
        </p>

        <p className="mx-auto max-w-2xl text-lg sm:text-xl md:text-2xl text-gray-100/90 mb-10">
          Get the legal help you need, exactly in the language you speak.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGetStarted}   /* 👈  scrolls instead of routing */
            className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 transition"
          >
            Get Started
          </button>

          {/* keep Learn More as external / router navigation if you want */}
          <button
            onClick={() => window.open('/learn-more', '_self')}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white/20 px-6 py-3 text-base font-semibold text-white ring-1 ring-inset ring-white/40 hover:bg-white/30 backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition"
          >
            Learn&nbsp;More
          </button>
        </div>
      </div>

      {/* Scroll-down hint */}
      {showHint && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-white/70">
          <ArrowDownIcon className="h-8 w-8" aria-hidden="true" />
          <span className="sr-only">Scroll to explore</span>
        </div>
      )}
    </header>
  );
}