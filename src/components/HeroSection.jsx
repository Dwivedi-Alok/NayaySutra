import { useNavigate } from 'react-router-dom';
import ViewB from './Back';

export default function HeroSection() {
  const navigate = useNavigate();

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
          <span className="text-white">At Your Fingertips</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-100 mb-10">
          get justice in Your language
        </p>
      </div>
    </section>
  );
}
