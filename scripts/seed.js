const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const rawData = fs.readFileSync('phish-export.json', 'utf8');
  const data = JSON.parse(rawData);

  console.log(`Found ${data.length} shows.`);

  for (const show of data) {
    const { entries, ...showData } = show;

    // Upsert show
    const createdShow = await prisma.show.upsert({
      where: { id: show.id },
      update: {},
      create: {
        ...showData,
        entries: {
          create: entries.map((entry) => ({
            sequence: entry.sequence,
            setNumber: entry.setNumber,
            song: entry.song,
            transition: entry.transition,
            rawData: entry.rawData,
            footnote: entry.footnote,
          })),
        },
      },
    });

    console.log(`Inserted show ${createdShow.id} (${createdShow.showDate})`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
