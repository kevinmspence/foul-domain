import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import sql from './lib/sql.js'; // adjust to your setup

const DOWNLOAD_DIR = './downloads';

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR);
}

function getFileNameFromUrl(url) {
  return decodeURIComponent(url.split('/').pop().split('?')[0]);
}

async function downloadAllAudio() {
  const entries = await sql`
    SELECT "audioUrl"
    FROM "SetlistEntry"
    WHERE "audioUrl" IS NOT NULL
  `;

  console.log(`🎧 Found ${entries.length} files to download...`);

  for (const { audioUrl } of entries) {
    const fileName = getFileNameFromUrl(audioUrl);
    const filePath = path.join(DOWNLOAD_DIR, fileName);

    if (fs.existsSync(filePath)) {
      console.log(`✅ Skipping: ${fileName} (already exists)`);
      continue;
    }

    try {
      const res = await fetch(audioUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const dest = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        res.body.pipe(dest);
        res.body.on('error', reject);
        dest.on('finish', resolve);
      });

      console.log(`⬇️ Saved: ${fileName}`);
    } catch (err) {
      console.error(`❌ Failed: ${fileName} – ${err.message}`);
    }
  }

  console.log('✅ Download process complete.');
}

downloadAllAudio();
