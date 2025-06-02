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

      const rows = await sql`
        SELECT 
          "showid" AS id, 
          "showdate" AS "showDate",
          venue, 
          city, 
          state
        FROM "Show"
        WHERE "showdate" >= ${startDate} AND "showdate" < ${endDate}
        ORDER BY "showdate" ASC;
      `;

      console.log(`✅ ${rows.length} rows returned from SQL query`);
      console.log(rows[0]);

      // Optionally ensure showDate is serialized (if it isn't already)
      return rows.map(row => ({
        ...row,
        showDate: row.showDate instanceof Date
          ? row.showDate.toISOString().split('T')[0]
          : row.showDate
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
