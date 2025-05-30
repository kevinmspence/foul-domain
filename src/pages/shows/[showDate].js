import Head from 'next/head';
import prisma from '@/lib/prisma';
import SetScroll from '@/components/SetScroll';
import ShowNotes from '@/components/ShowNotes';
import Image from 'next/image';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export async function getServerSideProps(context) {
  const { showDate } = context.params;

  const parsedDate = new Date(showDate);
  const nextDay = new Date(parsedDate);
  nextDay.setDate(parsedDate.getDate() + 1);

  const show = await prisma.show.findFirst({
    where: {
      showDate: {
        gte: parsedDate,
        lt: nextDay,
      },
    },
    include: { entries: true },
  });

  if (!show) {
    return { notFound: true };
  }

  const allShows = await prisma.show.findMany({
    select: { showDate: true },
    orderBy: { showDate: 'asc' },
  });

  const allDates = allShows.map((s) => s.showDate.toISOString().split('T')[0]);
  const currentIndex = allDates.indexOf(showDate);
  const prevShow = allDates[currentIndex - 1] || null;
  const nextShow = allDates[currentIndex + 1] || null;

  function getShowBackgroundPath(show) {
    const publicDir = path.join(process.cwd(), 'public');

    const showImage = `/shows/${show.showDate.toISOString().split('T')[0]}.png`;
    const showImagePath = path.join(publicDir, showImage);
    if (fs.existsSync(showImagePath)) return showImage;

    const venueSlug = show.venue?.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const venueImage = `/venues/${venueSlug}.png`;
    const venueImagePath = path.join(publicDir, venueImage);
    if (fs.existsSync(venueImagePath)) return venueImage;

    return '/default.png';
  }

  const backgroundImage = getShowBackgroundPath(show);

  return {
    props: {
      show: {
        ...show,
        showDate: show.showDate.toISOString().split('T')[0],
      },
      allDates,
      prevShow,
      nextShow,
      backgroundImage,
    },
  };
}

export default function SetlistPage({ show, allDates, prevShow, nextShow, backgroundImage }) {
  const sets = { 1: [], 2: [], 3: [], encore: [], other: [] };

  for (const entry of show.entries) {
    const rawSet = entry.rawData?.set;
    const setNum = entry.setNumber;

    if (rawSet === 'e') {
      sets.encore.push({ ...entry });
    } else if ([1, 2, 3].includes(setNum)) {
      sets[setNum].push(entry);
    } else {
      sets.other.push(entry);
    }
  }

  Object.keys(sets).forEach((key) => {
    sets[key].sort((a, b) => a.sequence - b.sequence);
  });

  if (sets.encore.length > 0) {
    const taggedEncore = sets.encore.map((entry, i) => ({
      ...entry,
      isEncore: i === 0,
    }));

    if (sets[3].length > 0) sets[3].push(...taggedEncore);
    else if (sets[2].length > 0) sets[2].push(...taggedEncore);
    else if (sets[1].length > 0) sets[1].push(...taggedEncore);
    else sets.other.push(...taggedEncore);

    sets.encore = [];
  }

  const setGroups = [
    { title: 'Set 1', entries: sets[1] },
    { title: 'Set 2', entries: sets[2] },
    { title: 'Set 3', entries: sets[3] },
    { title: 'Other', entries: sets.other },
  ];

  const visibleSetGroups = setGroups.filter((group) => group.entries.length > 0);

  const noteEntry = show.entries.find(
    (entry) => entry.rawData?.setlistnotes?.trim()
  );
  const showNotes = noteEntry?.rawData.setlistnotes
    ?.replace(/<[^>]+>/g, '')
    ?.replace(/&nbsp;/g, ' ')
    ?.replace(/&amp;/g, '&')
    ?.replace(/&quot;/g, '"')
    ?.replace(/&lt;/g, '<')
    ?.replace(/&gt;/g, '>')
    ?.replace(/â€™/g, '’')
    ?.replace(/â€œ/g, '“')
    ?.replace(/â€�/g, '”')
    ?.replace(/â€“/g, '–')
    ?.replace(/â€”/g, '—') || null;

  const [year, month, day] = show.showDate.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const formattedDate = `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;

  const title = `${show.venue} – ${formattedDate} | Foul Domain`;
  const description = `See the full Phish setlist from ${formattedDate} at ${show.venue} in ${show.city}, ${show.state}.`;
  const canonicalUrl = `https://fouldomain.com/shows/${show.showDate}`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div
        className="min-h-screen text-yellow-100 font-ticket px-6 py-12"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="flex justify-center mb-0 animate-fade-slide">
          <Image
            src="/phish-banner.png"
            alt="PHISH Banner"
            width={400}
            height={100}
            className="drop-shadow-[0_0_25px_rgba(255,225,150,0.5)]"
          />
        </div>

        <div className="text-center mb-4 drop-shadow-[0_0_20px_rgba(255,255,200,0.6)]">
          <h2 className="text-2xl sm:text-3xl -mt-2 text-yellow-200">{show.venue}</h2>
          <h3 className="text-xl text-yellow-300 italic mt-1">
            {show.city}, {show.state} — {formattedDate}
          </h3>
        </div>

        <div className="w-full flex flex-col sm:flex-row sm:justify-center sm:gap-4 sm:space-x-4">
          {visibleSetGroups.map(({ title, entries }, idx) => (
            <div key={title} className="flex-1 max-w-[600px] sm:px-2">
              <SetScroll
                title={title}
                entries={entries}
                index={idx}
                total={visibleSetGroups.length}
              />
            </div>
          ))}
        </div>

        {showNotes && <ShowNotes notes={showNotes} />}

        {(prevShow || nextShow) && (
          <div className="mt-12 flex justify-center gap-6">
            {prevShow && (
              <Link
                href={`/shows/${prevShow}`}
                className="px-6 py-3 rounded-lg border-2 border-yellow-300 text-yellow-200 hover:bg-yellow-200 hover:text-black transition font-rock text-lg"
              >
                ⬅ Previous Show
              </Link>
            )}
            {nextShow && (
              <Link
                href={`/shows/${nextShow}`}
                className="px-6 py-3 rounded-lg border-2 border-yellow-300 text-yellow-200 hover:bg-yellow-200 hover:text-black transition font-rock text-lg"
              >
                Next Show ➡
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
