import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import sql from "@/lib/sql";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;

  try {
    const [playlists, favorites] = await Promise.all([
      sql`
        SELECT id, name, created_at
        FROM "Playlist"
        WHERE userid = ${userId}
        ORDER BY created_at DESC;
      `,
      sql`
        SELECT s.showid, s.showdate AS date, s.venue, s.city, s.state
        FROM "FavoriteShow" f
        JOIN "Show" s ON f.showid = s.showid
        WHERE f.userid = ${userId}
        ORDER BY s.showdate DESC;
      `
    ]);

    return res.status(200).json({
      user: {
        name: session.user.name,
        email: session.user.email,
      },
      playlists,
      favorites,
    });
  } catch (err) {
    console.error("❌ Failed to load profile:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
