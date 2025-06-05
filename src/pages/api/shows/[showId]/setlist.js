import sql from "@/lib/sql";

export default async function handler(req, res) {
  const { showId } = req.query;

  if (!showId) {
    return res.status(400).json({ error: "Missing showId" });
  }

  try {
    const tracks = await sql`
      SELECT sequence, song, "audioUrl"
      FROM "SetlistEntry"
      WHERE showid = ${showId}
      ORDER BY sequence ASC;
    `;

    res.status(200).json(tracks);
  } catch (error) {
    console.error("Error fetching setlist for show playback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
