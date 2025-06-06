import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import sql from "@/lib/sql";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const userId = session.user.userid;

  // ✅ Check if "Favorites" playlist exists for the user
  const existing = await sql`
    SELECT * FROM "Playlist"
    WHERE userid = ${userId} AND name = 'Favorites';
  `;

  // ✅ Create "Favorites" if it doesn't exist
  if (existing.length === 0) {
    await sql`
      INSERT INTO "Playlist" (name, userid)
      VALUES ('Favorites', ${userId});
    `;
  }

  // 🔄 Return all playlists
  const playlists = await sql`
    SELECT id, name FROM "Playlist"
    WHERE userid = ${userId}
    ORDER BY created_at ASC;
  `;

  return res.status(200).json(playlists);
}
