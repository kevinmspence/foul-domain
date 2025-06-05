import sql from '@/lib/sql';
import { getOrCacheForever } from '@/lib/cache';

export default async function handler(req, res) {
  const { year } = req.query;

  if (!year) {
    return res.status(400).json({ error: 'Missing year parameter' });
  }

  const cacheKey = `shows-${year}`;

  try {
    const shows = await getOrCacheForever(cacheKey, async () => {
      console.log(`🟡 Cache miss: fetching shows for ${year} from DB`);

      const startDate = `${year}-01-01`;
      const endDate = `${parseInt(year) + 1}-01-01`;

      // Updated query: add total_duration and has_audio per show
      const rows = await sql`
        SELECT 
          s."showid" AS id, 
          s."showdate" AS "showDate",
          s.venue, 
          s.city, 
          s.state,
          COALESCE(SUM(se."durationSeconds"), 0) AS total_duration,
          CASE WHEN COUNT(se."audioUrl") FILTER (WHERE se."audioUrl" IS NOT NULL) > 0 THEN true ELSE false END AS has_audio
        FROM "Show" s
        LEFT JOIN "SetlistEntry" se ON se.showid = s.showid
        WHERE s."showdate" >= ${startDate} AND s."showdate" < ${endDate}
          AND s."showdate" <= CURRENT_DATE
        GROUP BY s."showid", s."showdate", s.venue, s.city, s.state
        ORDER BY s."showdate" ASC;
      `;

      console.log(`✅ ${rows.length} rows returned from SQL query`);
      console.log(rows[0]);

      // Serialize showDate as YYYY-MM-DD string
      return rows.map(row => ({
        ...row,
        showDate: row.showDate instanceof Date
          ? row.showDate.toISOString().split('T')[0]
          : row.showDate,
        total_duration: Number(row.total_duration),
        has_audio: Boolean(row.has_audio),
      }));
    });

    console.log(`🟢 Cache hit: using shows-${year} from memory`);
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    return res.status(200).json(shows);
  } catch (error) {
    console.error(`❌ Error fetching shows for year ${year}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
