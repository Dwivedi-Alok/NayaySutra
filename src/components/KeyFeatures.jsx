import { useNavigate } from 'react-router-dom';

function FeatureCard({ icon, title, to }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex flex-col items-center bg-white rounded-xl shadow-md p-6 w-full max-w-xs text-center hover:shadow-lg hover:-translate-y-1 transition"
      type="button"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </button>
  );
}

export default function KeyFeatures() {
  const features = [
    { icon: '🧠', title: 'GPT-Powered Legal Chatbot',          to: '/chatbot' },
    { icon: '📜', title: 'Document Generator',                 to: '/generate-document' },
    { icon: '🧩', title: 'Gamified Legal Learning',            to: '/learn-law' },
    { icon: '🌐', title: 'Multilingual Support',               to: '/multilingual' },
    { icon: '📞', title: 'SMS & Voice Help (Offline Mode)',    to: '/offline-help' },
  ];

  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 w-full">
      <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-12">
        Key Features
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 justify-items-center">
        {features.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </section>
  );
}