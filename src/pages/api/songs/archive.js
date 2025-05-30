import prisma from "@/lib/prisma";
import { getCached, setCached } from "@/lib/cache";

export default async function handler(req, res) {
  const cacheKey = "songs-archive";
  const cached = getCached(cacheKey);
  if (cached) {
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
    return res.status(200).json(cached);
  }

  try {
    const entries = await prisma.setlistEntry.findMany({
      select: { song: true },
    });

    const seen = new Map();
    for (const entry of entries) {
      const raw = entry.song?.trim();
      if (!raw) continue;
      const key = raw.toLowerCase();
      if (!seen.has(key)) seen.set(key, raw);
    }

    const uniqueSongs = Array.from(seen.values());

    const songToSlug = (name) =>
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const result = uniqueSongs.map((name) => ({
      name,
      slug: songToSlug(name),
    }));

    setCached(cacheKey, result);
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error in /api/songs/archive:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
