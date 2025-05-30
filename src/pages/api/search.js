import prisma from '@/lib/prisma';
import { getCached, setCached } from '@/lib/cache';

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json([]);
  }

  const rawQuery = q.toLowerCase().trim();
  const cacheKey = `search-${rawQuery}`;
  const cached = getCached(cacheKey);
  if (cached) {
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    return res.status(200).json(cached);
  }

  const tokens = rawQuery
    .split(/\s+/)
    .map((t) => t.replace(/[^\w]/g, ''))
    .filter(Boolean);

  try {
    // SONG RESULTS
    const songs = await prisma.setlistEntry.findMany({
      where: {
        song: {
          contains: rawQuery,
          mode: 'insensitive',
        },
      },
      select: { song: true },
      distinct: ['song'],
      take: 25,
    });

    const songResults = songs
      .map((s) => ({
        id: `song-${s.song}`,
        label: s.song,
        type: 'song',
        slug: s.song.toLowerCase().replace(/\s+/g, '-'),
        priority: s.song.toLowerCase().startsWith(rawQuery) ? 0 : 1,
      }))
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 10);

    // SHOW RESULTS
    const allShows = await prisma.show.findMany({
      select: {
        id: true,
        venue: true,
        city: true,
        state: true,
        showDate: true,
      },
    });

    const showResults = allShows
      .map((s) => {
        const isoDate = s.showDate.toISOString().split('T')[0]; // 'yyyy-mm-dd'
        const [year, month, day] = isoDate.split('-');

        const yearShort = year.slice(-2);

        const fields = {
          venue: s.venue.toLowerCase(),
          city: s.city.toLowerCase(),
          state: s.state.toLowerCase(),
          yearFull: year,
          yearShort,
        };

        const matchDetails = tokens.map((token) => {
          if (fields.yearFull === token || fields.yearShort === token) return 10;
          if (fields.venue.startsWith(token)) return 8;
          if (fields.city.startsWith(token)) return 8;
          if (fields.state.startsWith(token)) return 6;
          if (
            fields.venue.includes(token) ||
            fields.city.includes(token) ||
            fields.state.includes(token)
          )
            return 2;
          return 0;
        });

        const score = matchDetails.reduce((a, b) => a + b, 0);
        const allTokensMatched = matchDetails.every((s) => s > 0);

        return allTokensMatched
          ? {
              id: s.id,
              venue: s.venue,
              city: s.city,
              state: s.state,
              showDate: isoDate,
              year,
              month,
              day,
              score,
            }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((s) => {
        const formattedDate = `${s.month}/${s.day}/${s.year}`;
        const slug = `${s.year}-${s.month}-${s.day}`;

        return {
          id: `show-${s.id}`,
          label: `${s.venue} – ${s.city}, ${s.state} (${formattedDate})`,
          type: 'show',
          slug,
        };
      });

    const results = [...songResults, ...showResults];

    setCached(cacheKey, results);
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    return res.status(200).json(results);
  } catch (err) {
    console.error('Search API error:', err);
    res.status(500).json({ error: 'Failed to search' });
  }
}
