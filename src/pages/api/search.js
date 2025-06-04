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

const nicknameMap = {
  'island tour': { range: ['1998-04-02', '1998-04-05'] },
  'big cypress': { range: ['1999-12-30', '1999-12-31'] },
  'magnaball': { range: ['2015-08-21', '2015-08-23'] },
  'festival 8': { range: ['2009-10-30', '2009-11-01'] },
  "dick's": { venue: "Dick's Sporting Goods Park" },
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

  const alias = aliasMap[rawQuery] || aliasMap[tokens.join('')];
  const songSearchTerm = (alias || rawQuery).toLowerCase();

  // SONGS
  const result1 = await sql`
    SELECT DISTINCT song
    FROM "SetlistEntry"
    WHERE LOWER(song) LIKE ${'%' + songSearchTerm + '%'}
    LIMIT 25;
  `;
  const songs = Array.isArray(result1) ? result1 : result1?.rows || [];

  const songResults = songs.map((s) => ({
    id: `song-${s.song}`,
    label: s.song,
    type: 'song',
    slug: songToSlug(s.song),
    priority: s.song.toLowerCase().startsWith(songSearchTerm) ? 0 : 1,
  })).sort((a, b) => a.priority - b.priority).slice(0, 10);

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

  const partialMatch = rawQuery.match(/(\d{1,2})[/-](\d{1,2})/);
  const partialMonth = partialMatch?.[1]?.padStart(2, '0');
  const partialDay = partialMatch?.[2]?.padStart(2, '0');

  // HOLIDAY MATCHES
  const holidayResults = allShows.flatMap((show) => {
    const date = new Date(show.showdate);
    const year = date.getFullYear();
    const shortYear = year.toString().slice(-2);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const slug = date.toISOString().split('T')[0];

    const isNYE = rawQuery.includes('nye') && month === 12 && day === 31;
    const isHalloween = rawQuery.includes('halloween') && month === 10 && day === 31;
    const yearMatch = tokens.includes(year.toString()) || tokens.includes(shortYear);

    if ((isNYE || isHalloween) && (!tokens.some(Number) || yearMatch)) {
      return [{
        id: `show-${show.showid}`,
        label: `${show.venue} – ${show.city}, ${show.state} (${date.toLocaleDateString()})`,
        type: 'show',
        slug,
        priority: 0,
      }];
    }

    return [];
  });

  // NICKNAME MATCHES
  const nicknameResults = allShows.flatMap((show) => {
    const date = new Date(show.showdate);
    const dateStr = date.toISOString().split('T')[0];
    const year = date.getFullYear();
    const shortYear = year.toString().slice(-2);

    return Object.entries(nicknameMap).flatMap(([key, config]) => {
      if (!rawQuery.includes(key)) return [];

      const yearMatch = tokens.includes(year.toString()) || tokens.includes(shortYear);

      if (config.range) {
        const [start, end] = config.range.map((d) => new Date(d));
        if (date >= start && date <= end) {
          return [{
            id: `show-${show.showid}`,
            label: `${show.venue} – ${show.city}, ${show.state} (${date.toLocaleDateString()})`,
            type: 'show',
            slug: dateStr,
            priority: 1,
          }];
        }
      }

      if (config.venue) {
        const venueMatch = show.venue.toLowerCase().includes(config.venue.toLowerCase());
        if (venueMatch && (!tokens.some(Number) || yearMatch)) {
          return [{
            id: `show-${show.showid}`,
            label: `${show.venue} – ${show.city}, ${show.state} (${date.toLocaleDateString()})`,
            type: 'show',
            slug: dateStr,
            priority: 2,
          }];
        }
      }

      return [];
    });
  });

  // FUZZY DATE/LOCATION MATCH
  const showResults = allShows.map((s) => {
    const isoDate = new Date(s.showdate).toISOString().split('T')[0];
    const [year, month, day] = isoDate.split('-');
    const fields = {
      venue: s.venue.toLowerCase(),
      city: s.city.toLowerCase(),
      state: s.state.toLowerCase(),
      yearFull: year,
      yearShort: year.slice(-2),
      month,
      day,
    };

    let score = 0;
    let tokenMatches = 0;

    for (const token of tokens) {
      if (fields.yearFull === token || fields.yearShort === token) score += 10, tokenMatches++;
      else if (fields.month === token || fields.day === token) score += 5, tokenMatches++;
      else if (fields.venue.startsWith(token) || fields.city.startsWith(token)) score += 10, tokenMatches++;
      else if (fields.venue.includes(token) || fields.city.includes(token)) score += 5, tokenMatches++;
      else if (fields.state.startsWith(token)) score += 6, tokenMatches++;
      else if (fields.state.includes(token)) score += 3, tokenMatches++;
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

    if (!parsedDate && partialMonth && partialDay &&
        fields.month === partialMonth && fields.day === partialDay) {
      score += 50;
      tokenMatches++;
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
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 10).map((s) => ({
    id: `show-${s.showid}`,
    label: `${s.venue} – ${s.city}, ${s.state} (${s.month}/${s.day}/${s.year})`,
    type: 'show',
    slug: `${s.year}-${s.month}-${s.day}`,
  }));

  const results = [
    ...songResults,
    ...holidayResults,
    ...nicknameResults,
    ...showResults,
  ];

  setCached(cacheKey, results);
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  return res.status(200).json(results);
}
