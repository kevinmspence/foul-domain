import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import sql from "@/lib/sql";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  console.log("🧪 Session object:", session);

  if (!session?.user?.id) {
    console.warn("🔒 No session found");
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { showId } = req.query;

  try {
    const result = await sql`
      SELECT 1 FROM "FavoriteShow"
      WHERE "userid" = ${session.user.id} AND "showid" = ${+showId};
    `;

    res.status(200).json({ favorited: result.length > 0 });
  } catch (err) {
    console.error("❌ Error checking favorite status:", err);
    res.status(500).json({ error: "Database error" });
  }
}
