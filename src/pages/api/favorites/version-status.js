import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import sql from "@/lib/sql";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const entryId = parseInt(req.query.entryId);
  const userId = session.user.id;

  try {
    const result = await sql`
      SELECT 1 FROM "FavoriteVersion"
      WHERE "userid" = ${userId} AND "entryid" = ${entryId};
    `;
    const favorited = result.length > 0;
    res.status(200).json({ favorited });
  } catch (err) {
    console.error("Error checking version favorite status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
