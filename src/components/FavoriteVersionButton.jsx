import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function FavoriteVersionButton({ entryId }) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    axios
      .get(`/api/favorites/version-status?entryId=${entryId}`)
      .then((res) => {
        setFavorited(res.data.favorited);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch version favorite status:", err);
        setLoading(false);
      });
  }, [entryId, session]);

  const toggleFavorite = async () => {
    try {
      const res = await axios.post("/api/favorites/toggle-version", { entryId });
      setFavorited(res.data.favorited);
    } catch (err) {
      console.error("Error toggling version favorite:", err);
    }
  };

  if (!session) return null;
  if (loading) return <span className="text-sm text-gray-400">...</span>;

  return (
    <button
      onClick={toggleFavorite}
      className={`ml-2 text-sm ${favorited ? "text-yellow-400" : "text-gray-400"} hover:text-yellow-500`}
    >
      {favorited ? "★" : "☆"}
    </button>
  );
}
