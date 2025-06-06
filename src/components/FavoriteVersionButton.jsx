import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { FaPlus } from "react-icons/fa"; // example icon

export default function FavoriteVersionButton({ entryId }) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (status === "unauthenticated") {
      // 🔒 Show sign-in modal
      signIn(); // opens default Google sign-in
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId }),
      });

      if (!res.ok) {
        throw new Error("Failed to update favorite.");
      }

      // Optionally: show a toast or update local state
    } catch (err) {
      console.error("Favorite toggle error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="text-white hover:text-yellow-400 transition"
      disabled={isLoading}
      title={status === "unauthenticated" ? "Sign in to add to playlist" : "Add to Favorites"}
    >
      <FaPlus />
    </button>
  );
}
