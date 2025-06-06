import { getServerSession } from "next-auth/next"; 
import { authOptions } from "../../auth/[...nextauth]";
import sql from "@/lib/sql";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const playlistInfo = await sql`
        SELECT name FROM "Playlist"
        WHERE id = ${id} AND userid = ${session.user.id};
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
        WHERE pe.playlistid = ${id}
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

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
