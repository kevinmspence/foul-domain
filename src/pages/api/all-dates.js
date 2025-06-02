import sql from '@/lib/sql';
import { getOrCacheForever } from '@/lib/cache';

export default async function handler(req, res) {
  const cacheKey = 'all-show-dates';

  try {
    const dates = await getOrCacheForever(cacheKey, async () => {
      console.log('🟡 Cache miss: fetching all show dates from DB');

      const { rows } = await sql`
        SELECT "showdate" FROM "Show";
      `;

      return rows.map((row) =>
        new Date(row.showdate).toISOString().split('T')[0]
      );
    });

    console.log('🟢 Cache hit: using all-show-dates from memory');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    return res.status(200).json(dates);
  } catch (error) {
    console.error('❌ Error in /api/all-dates:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
