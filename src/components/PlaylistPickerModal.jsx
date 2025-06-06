import CreatePlaylistForm from "./CreatePlaylistForm";
import { toast } from "react-hot-toast";

export default function PlaylistPickerModal({ playlists, entryId, onClose, onAdd }) {
  const handleSelect = async (playlistId) => {
    toast("🎯 Attempting to add to playlist...");

    try {
      const res = await fetch(`/api/playlists/${playlistId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: Number(entryId) }), // ensure numeric
      });

      console.log("🔁 Response status:", res.status);

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Added to playlist");
        onAdd?.();
        onClose();
      } else if (res.status === 409) {
        toast("⚠️ Already in playlist", {
          icon: "⚠️",
          style: {
            background: "#1f2937",
            color: "#fff",
          },
        });
      } else {
        console.error("❌ Error adding:", data);
        toast.error(`❌ ${data.error || "Failed to add to playlist"}`);
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      toast.error("❌ Network error");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Add to Playlist</h2>

      {playlists.length === 0 ? (
        <p className="text-white/60 text-sm">You don’t have any playlists yet.</p>
      ) : (
        <ul className="space-y-2">
          {playlists.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => handleSelect(p.id)}
                className="w-full text-left px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-white"
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <hr className="border-white/20" />

      <CreatePlaylistForm
        onCreated={(newPlaylist) => {
          handleSelect(newPlaylist.id);
        }}
      />
    </div>
  );
}
