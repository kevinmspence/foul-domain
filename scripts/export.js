// scripts/export.js
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const BATCH_SIZE = 100;
let allShows = [];
let skip = 0;

async function exportData() {
  while (true) {
    const batch = await prisma.show.findMany({
      skip,
      take: BATCH_SIZE,
      include: {
        entries: true,
      },
    });

    if (batch.length === 0) break;

    allShows = allShows.concat(batch);
    skip += BATCH_SIZE;
    console.log(`Fetched ${allShows.length} shows...`);
  }

  fs.writeFileSync('phish-export.json', JSON.stringify(allShows, null, 2));
  console.log(`✅ Exported ${allShows.length} shows to phish-export.json`);
  process.exit();
}

exportData().catch((e) => {
  console.error('❌ Export failed:', e);
  process.exit(1);
});
