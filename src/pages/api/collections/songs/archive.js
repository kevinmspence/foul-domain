import prisma from '@/lib/prisma';
import { getOrCacheForever } from '@/lib/cache';

export default async function handler(req, res) {
  const cacheKey = 'songs-archive';

  try {
    const songs = await getOrCacheForever(cacheKey, async () => {
      console.log('🟡 Cache miss: fetching distinct songs from DB');

      const entries = await prisma.setlistEntry.findMany({
        distinct: ['songName'],
        select: { songName: true, songSlug: true },
        orderBy: { songName: 'asc' },
      });

      return entries.map((song) => ({
        name: song.songName,
        slug: song.songSlug,
      }));
    });

    console.log('🟢 Cache hit: using songs-archive from memory');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    return res.status(200).json(songs);
  } catch (error) {
    console.error('❌ Error in /api/songs/archive:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
