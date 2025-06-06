import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import sql from "@/lib/sql";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const userId = session.user.id;
  const showId = parseInt(req.query.showId);

  if (!showId) return res.status(400).json({ error: "Missing or invalid showId" });

  try {
    if (req.method === "GET") {
      const [row] = await sql`
        SELECT 1 FROM "FavoriteShow"
        WHERE userid = ${userId} AND showid = ${showId};
      `;
      return res.status(200).json({ favorited: !!row });
    }

    if (req.method === "DELETE") {
      await sql`
        DELETE FROM "FavoriteShow"
        WHERE userid = ${userId} AND showid = ${showId};
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("❌ Failed to load favorite status:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
