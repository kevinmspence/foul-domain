import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import sql from "@/lib/sql";

export default async function handler(req, res) {
  console.log("📥 Incoming request to add entry to playlist");

  let session;
  try {
    session = await getServerSession(req, res, authOptions);
  } catch (err) {
    console.error("💥 Error retrieving session:", err);
    return res.status(500).json({ error: "Session error" });
  }

  if (!session) {
    console.log("⛔ No session found");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.userid; // lowercase
  const playlistId = +req.query.id;

  // 🔍 Debug logging
  console.log("🎯 playlistId from URL:", playlistId);
  console.log("👤 session user ID:", userId);

  if (req.method === "POST") {
    const { entryId } = req.body;
    if (!entryId) {
      return res.status(400).json({ error: "Missing entryId" });
    }

    try {
      const result = await sql`
        SELECT * FROM "Playlist"
        WHERE id = ${playlistId} AND userid = ${userId};
      `;

      if (result.length === 0) {
        console.log("🚫 Playlist does not belong to this user");
        return res.status(403).json({ error: "Forbidden" });
      }

      // ✅ Insert with automatic position assignment
      await sql`
        INSERT INTO "PlaylistEntry" ("playlistid", "entryid", "position")
        SELECT ${playlistId}, ${entryId},
          COALESCE(MAX("position"), 0) + 1
        FROM "PlaylistEntry"
        WHERE "playlistid" = ${playlistId}
        ON CONFLICT DO NOTHING;
      `;

      console.log("✅ Entry added to playlist with position");
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("❌ Error adding entry to playlist:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
