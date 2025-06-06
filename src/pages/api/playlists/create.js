import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import sql from "@/lib/sql";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { name } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Playlist name required" });
  }

  try {
    const result = await sql`
      INSERT INTO "Playlist" (userid, name)
      VALUES (${session.user.id}, ${name})
      RETURNING id, name;
    `;
    return res.status(200).json({ playlist: result[0] });
  } catch (err) {
    console.error("❌ Playlist creation error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
