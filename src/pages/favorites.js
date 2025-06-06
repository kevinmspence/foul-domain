import Head from "next/head";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import sql from "@/lib/sql";

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) return { redirect: { destination: "/auth/signin", permanent: false } };

  const userId = session.user.id;
  const result = await sql`
    SELECT s.*
    FROM "FavoriteShow" f
    JOIN "Show" s ON f."showid" = s."showid"
    WHERE f."userid" = ${userId}
    ORDER BY s."showdate" DESC;
  `;

  const favoriteShows = result.map((row) => ({
    ...row,
    showdate: typeof row.showdate === "string"
      ? row.showdate
      : new Date(row.showdate).toISOString().split("T")[0],
  }));

  return {
    props: {
      favoriteShows,
    },
  };
}

export default function FavoritesPage({ favoriteShows }) {
  return (
    <>
      <Head>
        <title>My Favorite Shows | Foul Domain</title>
      </Head>

      <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 bg-gray-950 text-white">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-indigo-400 text-center">My Favorite Shows</h1>

          {favoriteShows.length === 0 ? (
            <p className="text-center text-white/70">You haven’t favorited any shows yet.</p>
          ) : (
            <ul className="space-y-2">
              {favoriteShows.map((show) => (
                <li key={show.showid} className="py-4 border-b border-white/10">
                  <Link
                    href={`/shows/${show.showdate}`}
                    className="text-indigo-400 hover:underline"
                  >
                    {show.showdate} – {show.venue} ({show.city}, {show.state})
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
