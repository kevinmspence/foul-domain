import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import sql from "@/lib/sql";

export async function getServerSideProps() {
  try {
    const result = await sql`
      SELECT
        EXTRACT(YEAR FROM s."showdate")::int AS year,
        COUNT(DISTINCT s.showid) AS show_count,
        COUNT(DISTINCT se.song) AS unique_songs,
        COUNT(DISTINCT CASE WHEN se."audioUrl" IS NOT NULL THEN s.showid END) AS shows_with_audio
      FROM "Show" s
      LEFT JOIN "SetlistEntry" se ON se.showid = s.showid
      WHERE s."showdate" IS NOT NULL
        AND s."showdate" <= CURRENT_DATE
      GROUP BY year
      ORDER BY year DESC;
    `;

    const yearsData = result.map((r) => ({
      year: r.year,
      show_count: Number(r.show_count),
      unique_songs: Number(r.unique_songs),
      shows_with_audio: Number(r.shows_with_audio),
    }));

    return { props: { yearsData: yearsData || [] } };
  } catch (error) {
    console.error("❌ Error fetching years:", error);
    return { props: { yearsData: [] } };
  }
}

export default function YearPage({ yearsData = [] }) {
  const [sortBy, setSortBy] = useState("year");
  const [sortAsc, setSortAsc] = useState(false);

  const sortedData = [...yearsData].sort((a, b) => {
    let cmp = 0;
    if (a[sortBy] < b[sortBy]) cmp = -1;
    else if (a[sortBy] > b[sortBy]) cmp = 1;
    return sortAsc ? cmp : -cmp;
  });

  const handleSort = (col) => {
    if (col === sortBy) setSortAsc(!sortAsc);
    else {
      setSortBy(col);
      setSortAsc(false);
    }
  };

  const SortArrow = ({ column }) => {
    if (sortBy !== column) return null;
    return sortAsc ? " ▲" : " ▼";
  };

  return (
    <>
      <Head>
        <title>Phish Shows by Year | Foul Domain</title>
        <meta
          name="description"
          content="Browse every Phish show by year. Explore the complete timeline of performances across decades, from Gamehendge to New Year's Runs."
        />
        <link rel="canonical" href="https://fouldomain.com/year" />
      </Head>

      <main className="min-h-screen bg-gray-950 text-gray-100 font-mono px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-wide text-center">
            Shows by Year
          </h1>

          <div className="overflow-x-auto border border-gray-800 rounded mt-10">
            <table className="min-w-full text-sm sm:text-base text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-gray-800 text-gray-200">
                  <th
                    onClick={() => handleSort("year")}
                    className="w-24 px-4 py-3 border-b border-gray-700 text-center cursor-pointer"
                  >
                    Year<SortArrow column="year" />
                  </th>
                  <th
                    onClick={() => handleSort("show_count")}
                    className="w-40 px-4 py-3 border-b border-gray-700 text-center cursor-pointer"
                  >
                    Shows Played<SortArrow column="show_count" />
                  </th>
                  <th
                    onClick={() => handleSort("unique_songs")}
                    className="w-48 px-4 py-3 border-b border-gray-700 text-center cursor-pointer"
                  >
                    Unique Songs<SortArrow column="unique_songs" />
                  </th>
                  <th
                    onClick={() => handleSort("shows_with_audio")}
                    className="w-56 px-4 py-3 border-b border-gray-700 text-center cursor-pointer"
                  >
                    Shows with Audio<SortArrow column="shows_with_audio" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map(({ year, show_count, unique_songs, shows_with_audio }, index) => (
                  <tr
                    key={year}
                    className={index % 2 === 0 ? "bg-gray-900/50" : "bg-gray-900/30"}
                  >
                    <td className="px-4 py-2 border-t border-gray-800 text-center font-semibold">
                      <Link href={`/year/${year}`} className="text-indigo-300 hover:underline">
                        {year}
                      </Link>
                    </td>
                    <td className="px-4 py-2 border-t border-gray-800 text-center">{show_count}</td>
                    <td className="px-4 py-2 border-t border-gray-800 text-center">{unique_songs}</td>
                    <td className="px-4 py-2 border-t border-gray-800 text-center">{shows_with_audio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center italic text-indigo-300 mt-6 max-w-lg mx-auto">
            Every show tells a story — this table remembers them all.
          </p>
        </div>
      </main>
    </>
  );
}
