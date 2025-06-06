import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import sql from "@/lib/sql";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userId = session.user.id;

  try {
    const favorites = await sql`
      SELECT s.*
      FROM "FavoriteShow" f
      JOIN "Show" s ON f."showid" = s."showid"
      WHERE f."userid" = ${userId}
      ORDER BY s."showdate" DESC;
    `;

    res.status(200).json(favorites);
  } catch (err) {
    console.error("❌ Error fetching favorites:", err);
    res.status(500).json({ error: "Database error" });
  }
}
