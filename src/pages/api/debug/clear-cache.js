// pages/api/debug/clear-cache.js

import { clearCached } from '@/lib/cache';

export default function handler(req, res) {
  const { key } = req.query;

  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Cache clearing is only allowed in development.' });
  }

  if (key) {
    clearCached(key);
    return res.status(200).json({ message: `Cleared cache key: ${key}` });
  }

  clearCached(); // clears everything
  return res.status(200).json({ message: 'All cache cleared.' });
}
