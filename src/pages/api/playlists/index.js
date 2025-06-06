import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import sql from "@/lib/sql";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // 🚫 If no session, return an empty array (instead of 401)
  if (!session) {
    return res.status(200).json([]); // important: always return consistent type
  }

  const userId = session.user.userid;

  // ✅ Check if "Favorites" playlist exists
  const existing = await sql`
    SELECT * FROM "Playlist"
    WHERE userid = ${userId} AND name = 'Favorites';
  `;

  // ✅ Create it if missing
  if (existing.length === 0) {
    await sql`
      INSERT INTO "Playlist" (name, userid)
      VALUES ('Favorites', ${userId});
    `;
  }

  // ✅ Return user's playlists
  const playlists = await sql`
    SELECT id, name FROM "Playlist"
    WHERE userid = ${userId}
    ORDER BY created_at ASC;
  `;

  return res.status(200).json(playlists);
}
