import sql from '@/lib/sql';
import ScrollWrapper from '@/components/ScrollWrapper';
import Link from 'next/link';

export async function getServerSideProps(context) {
  const { slug } = context.params;

  // ✅ Query the database using Neon SQL
  const shows = await sql`
    SELECT id, showdate, venue, city, state
    FROM "Show"
    ORDER BY showdate ASC
  `;

  // ✅ Do NOT use 'rows' — use the variable directly
  const allShows = shows.map((show) => ({
    ...show,
    showDate: new Date(show.showdate).toISOString().split('T')[0],
  }));

  return { props: { slug, shows: allShows } };
}

export default function CollectionPage({ slug, shows }) {
  return (
    <div
      className="min-h-screen overflow-x-hidden text-yellow-100 font-ticket px-4 sm:px-6 py-12"
      style={{
        backgroundImage: "url('/backgrounds/library.png')",
        backgroundColor: '#0d0d0d',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom right',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <ScrollWrapper size="large">
          <h1 className="text-4xl sm:text-5xl font-bold text-yellow-100 drop-shadow-md text-center mb-6 capitalize">
            {slug.replace(/-/g, ' ')}
          </h1>

          <div className="space-y-4 text-center">
            {shows.map((show) => (
              <Link
                key={show.id}
                href={`/shows/${show.showDate}`}
                className="block bg-parchment text-black font-bold text-sm px-4 py-3 rounded-md border border-edge shadow-inset-subtle hover:brightness-105 transition"
              >
                {show.showDate} — {show.venue}, {show.city}, {show.state}
              </Link>
            ))}
          </div>
        </ScrollWrapper>
      </div>
    </div>
  );
}
