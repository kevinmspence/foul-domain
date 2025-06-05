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
  const [sortAsc, setSortAsc] = useState(false); // descending by default

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
      setSortAsc(true);
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

      <main className="min-h-screen bg-gray-950 text-white font-sans px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center">
            <h1 className="text-indigo-400 text-6xl font-extrabold tracking-wide relative inline-block">
              PHISH
              <span
                className="block h-1 bg-indigo-300 rounded-full mx-auto mt-2 w-24"
                aria-hidden="true"
              />
            </h1>
          </div>

          <h2 className="text-center text-white text-4xl font-bold">Shows by Year</h2>

          <div className="overflow-x-auto rounded-lg shadow-md border border-gray-700">
            <table
              className="w-full border-collapse rounded-lg"
              style={{ tableLayout: "fixed" }}
            >
              <thead>
                <tr className="bg-indigo-600 text-left text-indigo-100 uppercase tracking-wide select-none text-sm font-semibold border-b border-indigo-500 cursor-pointer">
                  <th
                    style={{ width: "20%" }}
                    className="px-4 py-3 border border-indigo-700"
                    onClick={() => handleSort("year")}
                  >
                    Year<SortArrow column="year" />
                  </th>
                  <th
                    style={{ width: "25%" }}
                    className="px-4 py-3 border border-indigo-700"
                    onClick={() => handleSort("show_count")}
                  >
                    Shows Played<SortArrow column="show_count" />
                  </th>
                  <th
                    style={{ width: "25%" }}
                    className="px-4 py-3 border border-indigo-700"
                    onClick={() => handleSort("unique_songs")}
                  >
                    Unique Songs Played<SortArrow column="unique_songs" />
                  </th>
                  <th
                    style={{ width: "30%" }}
                    className="px-4 py-3 border border-indigo-700"
                    onClick={() => handleSort("shows_with_audio")}
                  >
                    Shows with Audio Available<SortArrow column="shows_with_audio" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map(({ year, show_count, unique_songs, shows_with_audio }) => (
                  <tr
                    key={year}
                    className="even:bg-gray-900 odd:bg-gray-800 hover:bg-indigo-500 hover:text-white cursor-pointer transition-colors duration-200"
                  >
                    <td className="border border-indigo-700 px-4 py-3 font-semibold">
                      <Link href={`/year/${year}`} className="text-indigo-300 hover:underline">
                        {year}
                      </Link>
                    </td>
                    <td className="border border-indigo-700 px-4 py-3">{show_count}</td>
                    <td className="border border-indigo-700 px-4 py-3">{unique_songs}</td>
                    <td className="border border-indigo-700 px-4 py-3">{shows_with_audio}</td>
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
