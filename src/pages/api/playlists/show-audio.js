import sql from "@/lib/sql";

export default async function handler(req, res) {
  const rawShowId = req.query.showId;
  const showId = Number(rawShowId);

  if (!rawShowId || isNaN(showId)) {
    console.error("❌ Invalid or missing showId:", rawShowId);
    return res.status(400).json({ error: "Missing or invalid showId" });
  }

  try {
    const entries = await sql`
      SELECT song, "audioUrl"
      FROM "SetlistEntry"
      WHERE showid = ${showId} AND "audioUrl" IS NOT NULL
      ORDER BY sequence ASC;
    `;
    res.status(200).json(entries);
  } catch (err) {
    console.error("❌ Failed to load show audio:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
