import prisma from '@/lib/prisma';
import { getOrCacheForever } from '@/lib/cache';

export default async function handler(req, res) {
  const cacheKey = 'all-show-dates';

  try {
    const dates = await getOrCacheForever(cacheKey, async () => {
      console.log('🟡 Cache miss: fetching all show dates from DB');
      const shows = await prisma.show.findMany({
        select: { showDate: true },
      });
      return shows.map((show) => show.showDate.toISOString().split('T')[0]);
    });

    console.log('🟢 Cache hit: using all-show-dates from memory');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    return res.status(200).json(dates);
  } catch (error) {
    console.error('❌ Error in /api/all-dates:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
