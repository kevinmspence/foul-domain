import Head from 'next/head';
import Link from 'next/link';
import sql from '@/lib/sql';
import { getCollectionShows, collectionTitles } from '@/lib/collections';

export async function getServerSideProps(context) {
  const { slug } = context.params;

  const shows = await sql`
    SELECT * FROM "Show" ORDER BY "showdate" ASC;
  `;

  const allShows = shows.map((show) => ({
    id: show.id ?? null,
    venue: show.venue ?? '',
    city: show.city ?? '',
    state: show.state ?? '',
    showDate: show.showdate
      ? new Date(show.showdate).toISOString().split('T')[0]
      : '',
  }));

  const showsForCollection = getCollectionShows(slug, allShows);
  const title = collectionTitles[slug] || 'Collection';
  const description = `Explore ${title} from Phish's history — a curated set of memorable performances.`;
  const host = context.req.headers.host || 'fouldomain.com';
  const protocol = context.req.headers['x-forwarded-proto'] || 'https';
  const canonicalUrl = `${protocol}://${host}/collections/${slug}`;

  return {
    props: {
      slug,
      title,
      shows: showsForCollection,
      description,
      canonicalUrl,
    },
  };
}

export default function CollectionPage({ slug, title, shows, description, canonicalUrl }) {
  return (
    <>
      <Head>
        <title>{`Phish ${title} | Foul Domain`}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${title} | Foul Domain`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="min-h-screen bg-[#2c1a0e] px-4 pb-20 pt-8 flex flex-col items-center font-ticket text-yellow-100">
        <h1 className="text-5xl sm:text-6xl font-bold text-yellow-100 drop-shadow-md text-center mb-4">
          {title}
        </h1>
        <p className="italic text-sm text-yellow-300 mb-8 text-center">
          A special collection of memorable shows.
        </p>

        <div className="w-full max-w-5xl text-center">
          <img src="/scroll-top.png" alt="Scroll top" className="w-full" />
          <div
            className="bg-repeat-y bg-center px-4 py-10 text-yellow-100"
            style={{ backgroundImage: `url(/scroll-middle.png)` }}
          >
            <div className="overflow-x-auto rounded-xl">
              <table className="w-[90%] max-w-[825px] mx-auto table-fixed border-collapse text-base sm:text-lg">
                <colgroup>
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '42%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '15%' }} />
                </colgroup>
                <thead className="bg-gradient-to-b from-yellow-800 to-yellow-900 text-yellow-100 uppercase shadow-inner shadow-yellow-950">
                  <tr>
                    <th className="py-3 px-4 border border-yellow-700 shadow-inner shadow-yellow-900">Date</th>
                    <th className="py-3 px-4 border border-yellow-700 shadow-inner shadow-yellow-900">Venue</th>
                    <th className="py-3 px-4 border border-yellow-700 shadow-inner shadow-yellow-900">City</th>
                    <th className="py-3 px-4 border border-yellow-700 shadow-inner shadow-yellow-900">State</th>
                  </tr>
                </thead>
                <tbody>
                  {shows.map((show, idx) => (
                    <tr
                      key={show.id || `${show.showDate}-${idx}`}
                      className={`${
                        idx % 2 === 0 ? 'bg-yellow-950/10' : 'bg-yellow-900/5'
                      } hover:bg-yellow-800/40 hover:text-yellow-50 transition-all duration-150`}
                    >
                      <td className="py-2 px-4 border border-yellow-700 shadow-inner shadow-yellow-900">
                        <Link
                          href={`/shows/${show.showDate}`}
                          className="text-sky-300 hover:text-sky-100 hover:underline"
                        >
                          {show.showDate}
                        </Link>
                      </td>
                      <td className="py-2 px-4 border border-yellow-700 shadow-inner shadow-yellow-900">
                        {show.venue}
                      </td>
                      <td className="py-2 px-4 border border-yellow-700 shadow-inner shadow-yellow-900">
                        {show.city}
                      </td>
                      <td className="py-2 px-4 border border-yellow-700 shadow-inner shadow-yellow-900">
                        {show.state}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <img src="/scroll-bottom.png" alt="Scroll bottom" className="w-full" />
        </div>
      </div>
    </>
  );
}
