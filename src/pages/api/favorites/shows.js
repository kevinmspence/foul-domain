import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import sql from "@/lib/sql";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not signed in" });

  const userId = session.user.id;

  if (req.method === "POST") {
    const { showId } = req.body;
    await sql`
      INSERT INTO "FavoriteShow" (userId, showId)
      VALUES (${userId}, ${showId})
      ON CONFLICT DO NOTHING;
    `;
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { showId } = req.body;
    await sql`
      DELETE FROM "FavoriteShow"
      WHERE userId = ${userId} AND showId = ${showId};
    `;
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
