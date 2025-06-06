import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAudioPlayer } from "@/components/AudioPlayerContext";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  // 🔍 Debug audio state on page render
  console.log("👤 Profile loaded — currentTrack:", currentTrack?.title, "| playing:", isPlaying);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setProfileData(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const unfavoriteShow = async (showId) => {
    try {
      const res = await fetch(`/api/favorites/show-status?showId=${showId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Removed from favorites");
        setProfileData((prev) => ({
          ...prev,
          favorites: prev.favorites.filter((f) => f.showid !== showId),
        }));
      } else {
        toast.error("Failed to unfavorite");
      }
    } catch (err) {
      console.error("Unfavorite error:", err);
      toast.error("Error removing favorite");
    }
  };

  const handlePlayShow = async (showId) => {
    try {
      const res = await fetch(`/api/playlists/show-audio?showId=${showId}`);
      const data = await res.json();

      console.log("🎧 show-audio response:", data);

      if (!Array.isArray(data)) {
        toast.error("Failed to load show audio.");
        return;
      }

      const tracks = data.filter((t) => !!t.audioUrl);
      if (tracks.length === 0) {
        toast.error("No audio available for this show.");
        return;
      }

      const queue = tracks.map((t) => ({
        title: t.song,
        url: t.audioUrl,
      }));

      // ✅ Skip if already playing this exact track
      if (currentTrack?.url === queue[0].url && isPlaying) {
        console.log("🔁 Already playing this show");
        return;
      }

      playTrack(queue[0], queue);
    } catch (err) {
      console.error("Play error:", err);
      toast.error("Failed to load show audio");
    }
  };

  if (status === "loading" || loading) return null;
  if (status === "unauthenticated") return <p className="p-4 text-white">Please sign in.</p>;
  if (!profileData) return <p className="p-4 text-white">Loading profile...</p>;

  const { user, playlists, favorites } = profileData;

  return (
    <>
      <Head>
        <title>Your Profile</title>
      </Head>
      <main className="max-w-4xl mx-auto p-6 text-white space-y-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.name || user.email}</h1>

        <section>
          <h2 className="text-xl font-semibold mb-2">⭐ Favorited Shows</h2>
          {favorites.length === 0 ? (
            <p className="text-white/50 italic">You haven’t favorited any shows yet.</p>
          ) : (
            <ul className="space-y-2">
              {favorites.map((show) => (
                <li
                  key={show.showid}
                  className="bg-white/5 p-3 rounded flex items-center justify-between"
                >
                  <span>
                    {new Date(show.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    — {show.venue}, {show.city}, {show.state}
                  </span>

                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={() => handlePlayShow(show.showid)}
                      className="text-indigo-300 hover:text-indigo-100 text-lg"
                      title="Play this show"
                    >
                      ▶️
                    </button>
                    <button
                      onClick={() => unfavoriteShow(show.showid)}
                      className="text-red-400 hover:text-red-200 text-lg"
                      title="Remove from favorites"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">🎵 Your Playlists</h2>
          {playlists.length === 0 ? (
            <p className="text-white/50 italic">You haven’t created any playlists yet.</p>
          ) : (
            <ul className="space-y-2">
              {playlists.map((p) => (
                <li key={p.id} className="bg-white/5 p-3 rounded">
                  <Link
                    href={`/playlists/${p.id}`}
                    className="text-indigo-300 hover:text-indigo-100 underline"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
