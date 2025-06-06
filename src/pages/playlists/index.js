import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Head from "next/head";
import CreatePlaylistForm from "@/components/CreatePlaylistForm";

export default function PlaylistsPage() {
  const { data: session, status } = useSession();
  const [playlists, setPlaylists] = useState([]);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const fetchPlaylists = async () => {
    const res = await fetch("/api/playlists");
    const data = await res.json();
    console.log("📥 fetched playlists:", data);
    console.log("🎶 Playlist entry details:", data);
    setPlaylists(data);
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchPlaylists();
    }
  }, [status]);

  const handleRename = async (id) => {
    const res = await fetch(`/api/playlists/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renameValue }),
    });
    if (res.ok) {
      setRenamingId(null);
      fetchPlaylists();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this playlist?")) return;
    const res = await fetch(`/api/playlists/${id}`, { method: "DELETE" });
    if (res.ok) fetchPlaylists();
  };

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <div className="p-6 text-white text-center">
        <p className="mb-4">Please sign in to manage your playlists.</p>
        <button
          onClick={() =>
            signIn("google", {
              callbackUrl: window.location.href,
              redirect: false,
            }).then((res) => {
              if (res?.url) window.location.href = res.url;
            })
          }
          className="text-yellow-300 hover:text-yellow-200 underline"
        >
          Sign in with Google →
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Your Playlists</title>
      </Head>
      <div className="max-w-xl mx-auto p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Your Playlists</h1>

        {playlists.length === 0 ? (
          <p className="text-white/60 mb-4">No playlists yet.</p>
        ) : (
          <ul className="space-y-2 mb-6">
            {playlists.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between bg-white/5 p-3 rounded"
              >
                {renamingId === p.id ? (
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRename(p.id)}
                    onKeyDown={(e) => e.key === "Enter" && handleRename(p.id)}
                    autoFocus
                    className="bg-gray-800 text-white px-2 py-1 rounded w-full"
                  />
                ) : (
                  <span>{p.name}</span>
                )}
                <div className="ml-3 flex gap-2">
                  <button
                    onClick={() => {
                      setRenameValue(p.name);
                      setRenamingId(p.id);
                    }}
                    className="text-white/50 hover:text-white text-sm"
                    title="Rename"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h2 className="text-lg font-semibold mb-2">Create New Playlist</h2>
        <CreatePlaylistForm onCreated={fetchPlaylists} />
      </div>
    </>
  );
}
