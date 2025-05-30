import prisma from '@/lib/prisma';
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

      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${parseInt(year) + 1}-01-01`);

      return await prisma.show.findMany({
        where: {
          showDate: {
            gte: startDate,
            lt: endDate,
          },
        },
        orderBy: {
          showDate: 'asc',
        },
      });
    });

    console.log(`🟢 Cache hit: using shows-${year} from memory`);
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    return res.status(200).json(shows);
  } catch (error) {
    console.error(`❌ Error fetching shows for year ${year}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
