// components/LegalAidLawyers.jsx
export default function LegalAidLawyers() {
  const lawyers = [
    {
      name: "Adv. Ramesh Verma",
      qualification: "LL.B, Supreme Court",
      location: "Delhi",
      languages: ["Hindi", "English"],
      contact: "9876543210",
    },
    {
      name: "Adv. Neha Sharma",
      qualification: "LL.M, High Court Allahabad",
      location: "Uttar Pradesh",
      languages: ["Hindi"],
      contact: "9837211223",
    },
    {
      name: "Adv. Farhan Ali",
      qualification: "LL.B, District Court",
      location: "Bihar",
      languages: ["Urdu", "Hindi"],
      contact: "9123456780",
    },
    // Add more as needed
  ];

  return (
    <section className="w-full bg-white dark:bg-black py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4 text-blue-600 dark:text-blue-400">
          Legal Aid Lawyers
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          These lawyers are registered under the Legal Services Authorities Act to provide free legal services to the eligible.
        </p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {lawyers.map((lawyer, idx) => (
            <div key={idx} className="rounded-xl shadow-lg p-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{lawyer.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">{lawyer.qualification}</p>
              <p className="text-gray-600 dark:text-gray-300">📍 {lawyer.location}</p>
              <p className="text-gray-600 dark:text-gray-300">🗣️ {lawyer.languages.join(', ')}</p>
              <p className="text-gray-600 dark:text-gray-300">📞 {lawyer.contact}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
