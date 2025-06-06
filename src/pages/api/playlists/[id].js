import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import sql from "@/lib/sql";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const userId = session.user.id;
  const playlistId = +req.query.id;

  if (!playlistId) {
    return res.status(400).json({ error: "Missing playlist ID" });
  }

  try {
    if (req.method === "GET") {
      const playlist = await sql`
        SELECT * FROM "Playlist"
        WHERE id = ${playlistId} AND "userid" = ${userId};
      `;

      if (playlist.length === 0) {
        return res.status(404).json({ error: "Playlist not found" });
      }

      const entries = await sql`
        SELECT v."entryid", se.song, se."audioUrl", se."durationSeconds", se."sequence",
               s."showdate", s.venue, s.city, s.state
        FROM "PlaylistEntry" v
        JOIN "SetlistEntry" se ON v."entryid" = se.id
        JOIN "Show" s ON se."showid" = s."showid"
        WHERE v."playlistid" = ${playlistId}
        ORDER BY s."showdate" ASC, se.sequence ASC;
      `;

      return res.status(200).json({
        playlist: playlist[0],
        entries,
      });
    }

    if (req.method === "PUT") {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: "Missing name" });

      await sql`
        UPDATE "Playlist"
        SET name = ${name}
        WHERE id = ${playlistId} AND "userid" = ${userId};
      `;
      return res.status(200).json({ success: true });
    }

    if (req.method === "POST") {
      const { entryId } = req.body;

      if (!entryId || typeof entryId !== "number") {
        return res.status(400).json({ error: "Missing or invalid entryId" });
      }

      // Optional: check if entry already exists
      const existing = await sql`
        SELECT 1 FROM "PlaylistEntry"
        WHERE "playlistid" = ${playlistId} AND "entryid" = ${entryId};
      `;
      if (existing.length > 0) {
        return res.status(409).json({ error: "Already in playlist" });
      }

      // Find the next position
      const [{ count }] = await sql`
        SELECT COUNT(*)::int as count FROM "PlaylistEntry"
        WHERE "playlistid" = ${playlistId};
      `;

      await sql`
        INSERT INTO "PlaylistEntry" ("playlistid", "entryid", "position")
        VALUES (${playlistId}, ${entryId}, ${count});
      `;

      return res.status(201).json({ success: true });
    }

    if (req.method === "DELETE") {
      await sql`
        DELETE FROM "PlaylistEntry" WHERE playlistid = ${playlistId};
      `;
      await sql`
        DELETE FROM "Playlist" WHERE id = ${playlistId} AND "userid" = ${userId};
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("❌ Playlist handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
