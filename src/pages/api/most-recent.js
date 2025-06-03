import sql from '@/lib/sql';

export default async function handler(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const result = await sql`
      SELECT "showdate"
      FROM "Show"
      WHERE "showdate" <= ${today}
      ORDER BY "showdate" DESC
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      console.warn('⚠️ No shows found before today.');
      return res.status(404).json({ error: 'No past shows found' });
    }

    const mostRecent = result[0];

    res.status(200).json({
      showDate: mostRecent.showdate.toISOString().split('T')[0]
    });
  } catch (err) {
    console.error('❌ Failed to fetch most recent show:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
