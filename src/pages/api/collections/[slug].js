import prisma from '@/lib/prisma';
import { getCached, setCached, getOrCacheForever } from '@/lib/cache';

const formatDate = (date) => new Date(date).toISOString().split('T')[0];

const collections = {
  'island-tour': {
    name: 'Island Tour',
    dates: ['1998-04-02', '1998-04-03', '1998-04-04', '1998-04-05'],
  },
  halloween: {
    name: 'Halloween Shows',
    match: (dateStr) => {
      const [_, month, day] = dateStr.split('-').map(Number);
      return month === 10 && day === 31;
    },
  },
  nye: {
    name: 'New Year’s Runs',
    match: (dateStr) => {
      const [_, month, day] = dateStr.split('-').map(Number);
      return month === 12 && [31].includes(day);
    },
  },
};

export default async function handler(req, res) {
  const { slug } = req.query;
  const collection = collections[slug];

  if (!collection) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  const allShows = await getOrCacheForever('all-shows', async () => {
    console.log('🟡 Cache miss: fetching all shows from DB');
    return await prisma.show.findMany({ orderBy: { showDate: 'asc' } });
  });

  console.log('🟢 Cache hit: using all-shows from memory');

  let filteredShows = [];

  if (collection.dates) {
    filteredShows = allShows.filter((show) =>
      collection.dates.includes(formatDate(show.showDate))
    );
  } else if (collection.match) {
    filteredShows = allShows.filter((show) =>
      collection.match(formatDate(show.showDate), show)
    );
  }

  const result = filteredShows.map((show) => ({
    ...show,
    showDate: formatDate(show.showDate),
  }));

  return res.status(200).json(result);
}
