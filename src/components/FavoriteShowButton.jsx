import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function FavoriteShowButton({ showId }) {
  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      axios
        .get(`/api/favorites/show-status?showId=${showId}`)
        .then((res) => setIsFavorited(res.data.favorited))
        .catch((err) => console.error("Failed to load favorite status", err))
        .finally(() => setLoading(false));
    }
  }, [session, showId]);

  const toggleFavorite = async () => {
    const res = await axios.post("/api/favorites/toggle-show", { showId });
    setIsFavorited(res.data.favorited);
  };

  if (!session) return null;
  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <button
      onClick={toggleFavorite}
      className={`text-sm font-mono px-3 py-1 rounded border ${
        isFavorited
          ? "text-yellow-400 border-yellow-400"
          : "text-gray-400 border-gray-600"
      } hover:bg-gray-800`}
    >
      {isFavorited ? "★ Favorited" : "☆ Favorite This Show"}
    </button>
  );
}
