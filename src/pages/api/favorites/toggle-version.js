import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import sql from "@/lib/sql";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { entryId } = req.body;
  const userId = session.user.id;

  try {
    const existing = await sql`
      SELECT * FROM "FavoriteVersion"
      WHERE "userid" = ${userId} AND "entryid" = ${entryId};
    `;

    if (existing.length > 0) {
      await sql`
        DELETE FROM "FavoriteVersion"
        WHERE "userid" = ${userId} AND "entryid" = ${entryId};
      `;
      return res.status(200).json({ favorited: false });
    } else {
      await sql`
        INSERT INTO "FavoriteVersion" ("userid", "entryid")
        VALUES (${userId}, ${entryId});
      `;
      return res.status(200).json({ favorited: true });
    }
  } catch (err) {
    console.error("❌ Error toggling version favorite:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
