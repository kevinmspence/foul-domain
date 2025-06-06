import Head from 'next/head';
import SetScroll from '@/components/SetScroll';
import ShowNotes from '@/components/ShowNotes';
import Link from 'next/link';
import sql from '@/lib/sql';
import FavoriteShowButton from '@/components/FavoriteShowButton';

export async function getServerSideProps(context) {
  const { showDate } = context.params;

  const parsedDate = new Date(showDate);
  const nextDay = new Date(parsedDate);
  nextDay.setDate(parsedDate.getDate() + 1);

  const result = await sql`
    SELECT * FROM "Show"
    WHERE "showdate" >= ${parsedDate} AND "showdate" < ${nextDay}
    LIMIT 1;
  `;

  const showRows = Array.isArray(result) ? result : result?.rows || [];
  if (!showRows.length) return { notFound: true };

  const show = {
    ...showRows[0],
    showdate: showRows[0].showdate.toISOString(),
  };

  const result2 = await sql`
    SELECT * FROM "SetlistEntry"
    WHERE "showid" = ${show.showid}
    ORDER BY sequence ASC;
  `;
  const entries = Array.isArray(result2) ? result2 : result2?.rows || [];

  const result3 = await sql`
    SELECT "showdate" FROM "Show" ORDER BY "showdate" ASC;
  `;
  const allDates = (Array.isArray(result3) ? result3 : result3?.rows || []).map(
    (r) => r.showdate.toISOString().split('T')[0]
  );

  const showDateStr = show.showdate.split('T')[0];
  const currentIndex = allDates.indexOf(showDateStr);
  const prevShow = allDates[currentIndex - 1] || null;
  const nextShow = allDates[currentIndex + 1] || null;

  return {
    props: {
      show: { ...show, showDate: showDateStr, entries },
      prevShow,
      nextShow,
    },
  };
}

export default function SetlistPage({ show, prevShow, nextShow }) {
  const sets = { 1: [], 2: [], 3: [], encore: [], other: [] };

  for (const entry of show.entries) {
    let raw = entry.rawdata || entry.raw_data || {};
    try {
      if (typeof raw === 'string') raw = JSON.parse(raw);
    } catch {}
    entry.rawdata = raw;

    const setVal = raw?.set?.toString().toLowerCase();
    if (setVal === '1') sets[1].push(entry);
    else if (setVal === '2') sets[2].push(entry);
    else if (setVal === '3') sets[3].push(entry);
    else if (setVal === 'e' || setVal === 'encore') sets.encore.push(entry);
    else sets.other.push(entry);
  }

  Object.values(sets).forEach((arr) => arr.sort((a, b) => a.sequence - b.sequence));

  if (sets.encore.length > 0) {
    const taggedEncore = sets.encore.map((entry, i) => ({ ...entry, isEncore: i === 0 }));
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
  ].filter((group) => group.entries.length > 0);

  const noteEntry = show.entries.find((e) => e.rawdata?.setlistnotes?.trim());
  const showNotes = noteEntry?.rawdata.setlistnotes
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

  const formattedDate = new Date(show.showDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const showInfo = {
    venue: show.venue,
    city: show.city,
    state: show.state,
    date: formattedDate,
  };

  return (
    <>
      <Head>
        <title>{`${show.venue} – ${formattedDate} | Foul Domain`}</title>
        <meta
          name="description"
          content={`See the full Phish setlist from ${formattedDate} at ${show.venue} in ${show.city}, ${show.state}.`}
        />
      </Head>

      <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 bg-gray-950 text-white pb-[6rem]">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-5xl font-bold text-indigo-400 text-center mb-6 tracking-wide font-sans">
            PHISH
          </h1>

          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white">{show.venue}</h2>
            <p className="text-gray-300 text-lg mt-1">
              {show.city}, {show.state} — {formattedDate}
            </p>
            <div className="mt-4">
              <FavoriteShowButton showId={show.showid} />
            </div>
          </div>

          <div className="flex justify-center flex-col sm:flex-row sm:flex-wrap sm:gap-6">
            {setGroups.map(({ title, entries }) => (
              <div
                key={title}
                className="flex-1 min-w-[250px] sm:max-w-[calc(50%-12px)] lg:max-w-[calc(33%-16px)]"
              >
                <SetScroll title={title} entries={entries} showInfo={showInfo} />
              </div>
            ))}
          </div>

          {showNotes && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white/80">
              <strong className="block text-white font-semibold mb-2">Show Notes</strong>
              <p className="whitespace-pre-line">{showNotes}</p>
            </div>
          )}

          {(prevShow || nextShow) && (
            <div className="flex justify-between items-center pt-8 border-t border-white/10">
              {prevShow ? (
                <Link
                  href={`/shows/${prevShow}`}
                  className="text-indigo-400 hover:underline"
                >
                  ⬅ Previous Show
                </Link>
              ) : (
                <span />
              )}

              {nextShow && (
                <Link
                  href={`/shows/${nextShow}`}
                  className="text-indigo-400 hover:underline"
                >
                  Next Show ➡
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
