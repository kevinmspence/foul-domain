import { useState } from "react";

export default function CreatePlaylistForm({ onCreated }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  const createPlaylist = async () => {
    if (!name.trim()) return;

    setStatus("Creating...");
    try {
      const res = await fetch("/api/playlists/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("✅ Created");
        setName("");
        onCreated?.(data.playlist);
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to create playlist");
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Playlist name"
        className="w-full px-3 py-2 rounded bg-white/10 text-white focus:outline-none"
      />
      <div className="flex items-center gap-4">
        <button
          onClick={createPlaylist}
          className="bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 rounded"
        >
          Create
        </button>
        {status && <div className="text-sm text-white/60">{status}</div>}
      </div>
    </div>
  );
}
