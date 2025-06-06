import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import sql from "@/lib/sql";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query;
  const playlistId = Number(id);

  if (!playlistId) {
    return res.status(400).json({ error: "Missing or invalid playlist ID" });
  }

  if (req.method === "GET") {
    try {
      const playlistInfo = await sql`
        SELECT name FROM "Playlist"
        WHERE id = ${playlistId} AND userid = ${session.user.id};
      `;

      if (playlistInfo.length === 0) {
        return res.status(404).json({ error: "Playlist not found" });
      }

      const entries = await sql`
        SELECT
          pe.id,
          pe.position,
          se.song,
          se."durationSeconds",
          se."audioUrl",
          s.showdate,
          s.venue,
          s.city,
          s.state
        FROM "PlaylistEntry" pe
        JOIN "SetlistEntry" se ON pe.entryid = se.id
        JOIN "Show" s ON se.showid = s.showid
        WHERE pe.playlistid = ${playlistId}
        ORDER BY pe.position ASC;
      `;

      return res.status(200).json({
        name: playlistInfo[0].name,
        entries,
      });
    } catch (err) {
      console.error("Failed to fetch playlist entries:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { entryId } = req.body;
      if (!entryId || typeof entryId !== "number") {
        return res.status(400).json({ error: "Missing or invalid entryId" });
      }

      // Optional: prevent duplicate entries
      const existing = await sql`
        SELECT 1 FROM "PlaylistEntry"
        WHERE playlistid = ${playlistId} AND entryid = ${entryId};
      `;
      if (existing.length > 0) {
        return res.status(409).json({ error: "Already in playlist" });
      }

      const [{ count }] = await sql`
        SELECT COUNT(*)::int as count FROM "PlaylistEntry"
        WHERE playlistid = ${playlistId};
      `;

      await sql`
        INSERT INTO "PlaylistEntry" (playlistid, entryid, position)
        VALUES (${playlistId}, ${entryId}, ${count});
      `;

      return res.status(201).json({ success: true });
    } catch (err) {
      console.error("Failed to add to playlist:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
