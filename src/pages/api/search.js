import sql from '@/lib/sql';
import { getCached, setCached } from '@/lib/cache';
import { parse } from 'date-fns';

function safeParseDate(input) {
  const formats = ['MM/dd/yy', 'MM/dd/yyyy', 'yyyy/MM/dd', 'yyyy-MM-dd'];
  for (const format of formats) {
    try {
      const parsed = parse(input, format, new Date());
      if (!isNaN(parsed)) return parsed;
    } catch {}
  }
  return null;
}

function songToSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const aliasMap = {
  '2001': 'also sprach zarathustra',
};

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q || q.length < 2) return res.status(200).json([]);

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
    // SONGS
    const alias = aliasMap[rawQuery] || aliasMap[tokens.join('')];
    const songSearchTerm = (alias || rawQuery).toLowerCase();

    const result1 = await sql`
      SELECT DISTINCT song
      FROM "SetlistEntry"
      WHERE LOWER(song) LIKE ${'%' + songSearchTerm + '%'}
      LIMIT 25;
    `;
    const songs = Array.isArray(result1) ? result1 : result1?.rows || [];

    const songResults = songs
      .map((s) => ({
        id: `song-${s.song}`,
        label: s.song,
        type: 'song',
        slug: songToSlug(s.song),
        priority: s.song.toLowerCase().startsWith(songSearchTerm) ? 0 : 1,
      }))
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 10);

    // SHOWS
    const result2 = await sql`
      SELECT "showid", venue, city, state, "showdate"
      FROM "Show";
    `;
    const allShows = Array.isArray(result2) ? result2 : result2?.rows || [];

    const parsedDate = safeParseDate(rawQuery);
    const parsedYear = parsedDate?.getFullYear().toString();
    const parsedMonth = (parsedDate?.getMonth() + 1)?.toString().padStart(2, '0');
    const parsedDay = parsedDate?.getDate()?.toString().padStart(2, '0');

    const partialMonthDay = rawQuery.match(/(\d{1,2})[\/\-](\d{1,2})/);
    const partialMonth = partialMonthDay?.[1]?.padStart(2, '0');
    const partialDay = partialMonthDay?.[2]?.padStart(2, '0');

    const showResults = allShows
      .map((s) => {
        const isoDate = new Date(s.showdate).toISOString().split('T')[0];
        const [year, month, day] = isoDate.split('-');
        const yearShort = year.slice(-2);

        const fields = {
          venue: s.venue.toLowerCase(),
          city: s.city.toLowerCase(),
          state: s.state.toLowerCase(),
          yearFull: year,
          yearShort,
          month,
          day,
        };

        let score = 0;
        let tokenMatches = 0;

        for (const token of tokens) {
          if (fields.yearFull === token || fields.yearShort === token) {
            score += 10;
            tokenMatches++;
          } else if (fields.month === token || fields.day === token) {
            score += 5;
            tokenMatches++;
          } else if (fields.venue.startsWith(token) || fields.city.startsWith(token)) {
            score += 10;
            tokenMatches++;
          } else if (fields.venue.includes(token) || fields.city.includes(token)) {
            score += 5;
            tokenMatches++;
          } else if (fields.state.startsWith(token)) {
            score += 6;
            tokenMatches++;
          } else if (fields.state.includes(token)) {
            score += 3;
            tokenMatches++;
          }
        }

        if (
          parsedDate &&
          fields.yearFull === parsedYear &&
          fields.month === parsedMonth &&
          fields.day === parsedDay
        ) {
          score += 100;
          tokenMatches++;
        }

        if (!parsedDate && partialMonth && partialDay) {
          if (fields.month === partialMonth && fields.day === partialDay) {
            score += 50;
            tokenMatches++;
          }
        }

        if (tokenMatches >= 2 || score >= 100) {
          return {
            showid: s.showid,
            venue: s.venue,
            city: s.city,
            state: s.state,
            showDate: isoDate,
            year,
            month,
            day,
            score,
          };
        }

        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((s) => {
        const formattedDate = `${s.month}/${s.day}/${s.year}`;
        const slug = `${s.year}-${s.month}-${s.day}`;
        return {
          id: `show-${s.showid}`,
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
    return res.status(500).json({ error: 'Failed to search' });
  }
}
