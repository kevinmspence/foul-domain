import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import sql from "@/lib/sql";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { showId } = req.body;
  const userId = session.user.id;

  try {
    const existing = await sql`
      SELECT * FROM "FavoriteShow"
      WHERE "userid" = ${userId} AND "showid" = ${showId};
    `;

    if (existing.length > 0) {
      // Unfavorite
      await sql`
        DELETE FROM "FavoriteShow"
        WHERE "userid" = ${userId} AND "showid" = ${showId};
      `;
      res.status(200).json({ favorited: false });
    } else {
      // Favorite
      await sql`
        INSERT INTO "FavoriteShow" ("userid", "showid")
        VALUES (${userId}, ${showId});
      `;
      res.status(200).json({ favorited: true });
    }
  } catch (err) {
    console.error("❌ Error toggling favorite:", err);
    res.status(500).json({ error: "Database error" });
  }
}
