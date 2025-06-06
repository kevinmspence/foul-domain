import { useEffect, useState } from "react";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/playlists")
      .then((res) => res.json())
      .then((data) => {
        setPlaylists(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading playlists:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-indigo-400">Your Playlists</h1>

        {loading ? (
          <p>Loading...</p>
        ) : playlists.length === 0 ? (
          <p className="text-white/60">You haven’t created any playlists yet.</p>
        ) : (
          <ul className="space-y-4">
            {playlists.map((p) => (
              <li key={p.id} className="border border-white/10 rounded p-4">
                <strong className="text-lg">{p.name}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
