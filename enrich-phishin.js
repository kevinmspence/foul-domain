const { Client } = require('pg');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

client.connect();

async function insertTrack(track, showid) {
  const song = track.title?.trim();
  if (!song) return;

  const durationRaw = track.duration;
  const durationSeconds =
    durationRaw > 1000 ? Math.round(durationRaw / 1000) : Math.round(durationRaw);

  const sequence = track.position || 0;
  const setNumber = parseInt((track.set_name || '').replace(/[^0-9]/g, '')) || null;
  const mp3Url = track.mp3_url || null;

  console.log(
    `🎵 [${sequence}] ${song} | Set: ${track.set_name} | Duration: ${durationSeconds}s | Audio: ${!!mp3Url}`
  );

  await client.query(
    `
    INSERT INTO "SetlistEntry" (
      showid, sequence, song, set, "durationSeconds", "audioUrl", "phishInSet"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7
    )
    ON CONFLICT (showid, sequence) DO UPDATE
    SET "durationSeconds" = EXCLUDED."durationSeconds",
        "audioUrl" = EXCLUDED."audioUrl",
        "phishInSet" = EXCLUDED."phishInSet"
    `,
    [showid, sequence, song, setNumber, durationSeconds, mp3Url, track.set_name || null]
  );
}

async function enrichShow() {
  const date = '1997-11-22';
  const url = `https://phish.in/api/v2/shows/${date}`;
  console.log(`📡 Fetching ${url}`);

  try {
    const res = await fetch(url);
    const json = await res.json();
    const tracks = json?.tracks || json?.data?.tracks || [];

    if (tracks.length === 0) {
      console.warn(`⚠️  No tracks found for ${date}`);
      return;
    }

    const showRes = await client.query(
      `SELECT showid FROM "Show" WHERE showdate = $1`,
      [date]
    );

    if (showRes.rows.length === 0) {
      console.error(`❌ No show found in "Show" table for ${date}`);
      return;
    }

    const showid = showRes.rows[0].showid;
    console.log(`🎶 Got ${tracks.length} tracks for showid ${showid}`);

    for (const track of tracks) {
      await insertTrack(track, showid);
    }

    console.log(`✅ Done enriching ${date}`);
  } catch (err) {
    console.error('❌ Error enriching show:', err.message);
  } finally {
    await client.end();
  }
}

enrichShow();
