import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import sql from '@/lib/sql';
import { getCollectionShows, collectionTitles } from '@/lib/collections';
import ScrollWrapper from '@/components/ScrollWrapper';

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

      <div
        className="min-h-screen overflow-x-hidden text-yellow-100 font-ticket"
        style={{
          backgroundImage: "url('/backgrounds/songs.webp')",
          backgroundColor: '#0d0d0d',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom right',
        }}
      >
        <div className="flex justify-center pt-10">
          <Image
            src="/phish-banner.webp"
            alt="Phish Banner"
            width={500}
            height={125}
            priority
            className="w-full max-w-[500px] h-auto drop-shadow-xl"
          />
        </div>

        <div className="flex justify-center mb-6">
          <h1 className="text-5xl sm:text-6xl font-bold text-yellow-100 drop-shadow-md text-center">
            {title}
          </h1>
        </div>

        <div className="flex justify-center">
          <div className="w-full sm:w-[90vw] sm:max-w-[825px] relative">
            <ScrollWrapper title="" size="large">
              <div className="w-full overflow-x-auto px-2 sm:px-6 pb-12">
                <table className="w-[90%] mx-auto table-fixed border-collapse text-base sm:text-lg">
                  <colgroup>
                    <col className="w-[30%]" />
                    <col className="w-[40%]" />
                    <col className="w-[30%]" />
                  </colgroup>
                  <thead className="bg-gradient-to-b from-yellow-800 to-yellow-900 text-yellow-100 uppercase shadow-inner shadow-yellow-950">
                    <tr>
                      <th className="py-3 px-4 border border-yellow-700 shadow-inner shadow-yellow-900 text-left">Date</th>
                      <th className="py-3 px-4 border border-yellow-700 shadow-inner shadow-yellow-900 text-left">Venue</th>
                      <th className="py-3 px-4 border border-yellow-700 shadow-inner shadow-yellow-900 text-left">Location</th>
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
                          {show.city}, {show.state}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollWrapper>
          </div>
        </div>
      </div>
    </>
  );
}
