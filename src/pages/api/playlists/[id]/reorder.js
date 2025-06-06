import sql from '@/lib/sql';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const playlistId = req.query.id;

  if (req.method === 'PUT') {
    console.log('📦 Incoming request body:', req.body);

    const { reordered } = req.body;

    if (!Array.isArray(reordered)) {
      return res.status(400).json({ error: 'Invalid payload: "reordered" must be an array' });
    }

    try {
      for (const entry of reordered) {
        await sql`
          UPDATE "PlaylistEntry"
          SET position = ${entry.position}
          WHERE id = ${entry.id}
            AND playlistid = ${playlistId};
        `;
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('❌ Error updating playlist order:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
