export default function ConnectLawyer() {
  // hard-coded demo data
  const lawyers = [
    { id: 1, name: 'Adv. Priya Sharma',    speciality: 'Family Law' },
    { id: 2, name: 'Adv. Rajesh Kumar',    speciality: 'Property Law' },
    { id: 3, name: 'Adv. Ananya Sen',      speciality: 'Criminal Law' },
  ];

  const handleConnect = (name) => {
    alert(`We’ll arrange a free call with ${name} shortly!`);
    // TODO: hit your backend to create a ticket / chat-room
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Connect with a Free Lawyer
      </h2>

      <ul className="space-y-4">
        {lawyers.map((lawyer) => (
          <li
            key={lawyer.id}
            className="flex items-center justify-between border rounded p-4"
          >
            <div>
              <p className="font-semibold">{lawyer.name}</p>
              <p className="text-sm text-gray-600">{lawyer.speciality}</p>
            </div>
            <button
              onClick={() => handleConnect(lawyer.name)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Request Call-Back
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}