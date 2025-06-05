import { useRouter } from "next/router";
import { useEffect, useState, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import { useAudioPlayer } from "@/components/AudioPlayerContext"; // adjust path if needed

export default function YearPage() {
  const router = useRouter();
  const { year } = router.query;

  const { playTrack } = useAudioPlayer();

  const [shows, setShows] = useState([]);
  const [visibleCount, setVisibleCount] = useState(25);
  const [sortField, setSortField] = useState("showDate");
  const [sortAsc, setSortAsc] = useState(false);
  const loaderRef = useRef(null);

  useEffect(() => {
    if (!year) return;

    async function fetchShows() {
      try {
        const res = await axios.get(`/api/shows?year=${year}`);
        setShows(res.data);
      } catch (err) {
        console.error("Error fetching shows", err);
      }
    }

    fetchShows();
  }, [year]);

  const compareValues = (a, b) => {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    if (sortField === "showDate") {
      return new Date(a) - new Date(b);
    }
    if (sortField === "has_audio") {
      return a === b ? 0 : a ? -1 : 1;
    }
    if (sortField === "total_duration") {
      return a - b;
    }
    if (typeof a === "string" && typeof b === "string") {
      return a.localeCompare(b);
    }
    return 0;
  };

  const sortedShows = [...shows].sort((a, b) => {
    const cmp = compareValues(a[sortField], b[sortField]);
    return sortAsc ? cmp : -cmp;
  });

  const visibleShows = sortedShows.slice(0, visibleCount);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 25);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );

    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [loadMore]);

  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/year/${year}`
      : `https://fouldomain.com/year/${year}`;

  const formatDuration = (secs) => {
    if (!secs || secs <= 0) return "-";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  async function playShow(showId) {
    try {
      const res = await axios.get(`/api/shows/${showId}/setlist`);
      const setlist = res.data;

      if (!setlist.length) {
        alert("No playable audio tracks found for this show.");
        return;
      }

      const tracksWithAudio = setlist
        .filter((track) => track.audioUrl)
        .map((track) => ({
          title: track.song,
          url: track.audioUrl,
        }));

      if (tracksWithAudio.length === 0) {
        alert("No playable audio tracks found for this show.");
        return;
      }

      playTrack(tracksWithAudio[0], tracksWithAudio);
    } catch (error) {
      console.error("Error fetching show setlist for playback", error);
      alert("Error loading show audio.");
    }
  }

  const handleSort = (field) => {
    if (field === sortField) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const SortArrow = ({ column }) => {
    if (sortField !== column) return null;
    return sortAsc ? " ▲" : " ▼";
  };

  return (
    <>
      <Head>
        <title>{`Phish Shows Played in ${year} | Foul Domain`}</title>
        <meta
          name="description"
          content={`Explore all Phish shows from the year ${year}. View full setlists, venues, and performance history.`}
        />
        <meta property="og:title" content={`${year} – Phish Shows | Foul Domain`} />
        <meta
          property="og:description"
          content={`Explore all Phish shows from the year ${year}. View full setlists, venues, and performance history.`}
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="min-h-screen bg-gray-950 text-white font-sans px-6 py-12">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <div className="text-center mb-6">
            <h1 className="text-indigo-400 text-6xl sm:text-7xl font-extrabold tracking-wide relative inline-block">
              PHISH
              <span
                className="block h-1 bg-indigo-300 rounded-full mx-auto mt-2 w-24"
                aria-hidden="true"
              />
            </h1>
          </div>

          <h2 className="text-6xl sm:text-7xl font-extrabold text-indigo-400 drop-shadow-md mb-4 text-center">
            {year}
          </h2>
          <p className="italic text-sm text-indigo-300 mb-8 max-w-xl text-center">
            Each show from this year — unrolled below.
          </p>

          <div className="w-full overflow-x-auto rounded-lg shadow-md border border-gray-700">
            <table className="table-auto border-collapse w-full text-indigo-100 text-sm sm:text-lg">
              <thead>
                <tr className="bg-indigo-600 text-white h-12 select-none">
                  <th
                    className="px-4 border border-indigo-700 text-center cursor-pointer"
                    onClick={() => handleSort("showDate")}
                    title="Sort by Date"
                  >
                    Date<SortArrow column="showDate" />
                  </th>
                  <th
                    className="px-4 border border-indigo-700 text-center cursor-pointer"
                    onClick={() => handleSort("venue")}
                    title="Sort by Venue"
                  >
                    Venue<SortArrow column="venue" />
                  </th>
                  <th
                    className="hidden sm:table-cell px-4 border border-indigo-700 text-center cursor-pointer"
                    onClick={() => handleSort("city")}
                    title="Sort by City"
                  >
                    City<SortArrow column="city" />
                  </th>
                  <th
                    className="hidden sm:table-cell px-4 border border-indigo-700 text-center cursor-pointer"
                    onClick={() => handleSort("state")}
                    title="Sort by State"
                  >
                    State<SortArrow column="state" />
                  </th>
                  <th
                    className="px-4 border border-indigo-700 text-center cursor-pointer"
                    onClick={() => handleSort("total_duration")}
                    title="Sort by Duration"
                  >
                    Duration<SortArrow column="total_duration" />
                  </th>
                  <th
                    className="px-4 border border-indigo-700 text-center cursor-pointer"
                    onClick={() => handleSort("has_audio")}
                    title="Sort by Audio Availability"
                  >
                    Audio<SortArrow column="has_audio" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleShows.map((show) => {
                  const date = new Date(show.showDate).toISOString().split("T")[0];
                  return (
                    <tr
                      key={show.id}
                      className="hover:bg-indigo-500 hover:text-white transition-colors duration-150 even:bg-gray-900/20 odd:bg-gray-900/10 cursor-pointer"
                    >
                      <td className="py-2 px-4 border border-indigo-700 whitespace-nowrap">
                        <Link
                          href={`/shows/${date}`}
                          className="text-indigo-300 hover:text-indigo-100 hover:underline"
                        >
                          {date}
                        </Link>
                      </td>
                      <td className="py-2 px-4 border border-indigo-700">{show.venue}</td>
                      <td className="hidden sm:table-cell py-2 px-4 border border-indigo-700">{show.city}</td>
                      <td className="hidden sm:table-cell py-2 px-4 border border-indigo-700">{show.state}</td>
                      <td className="py-2 px-4 border border-indigo-700 text-center">
                        {formatDuration(show.total_duration)}
                      </td>
                      <td className="py-2 px-4 border border-indigo-700 text-center">
                        {show.has_audio ? (
                          <button
                            onClick={() => playShow(show.id)}
                            title="Play Show Audio"
                            aria-label={`Play audio for show on ${show.showDate}`}
                            className="hover:text-yellow-400 transition"
                          >
                            🎵
                          </button>
                        ) : (
                          <span title="No audio" role="img" aria-label="No audio">
                            ❌
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td ref={loaderRef} colSpan={6} className="h-8"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="italic text-indigo-300 mt-6 max-w-lg mx-auto text-center">
            Every show a chapter, every jam a paragraph.
          </p>
        </div>
      </div>
    </>
  );
}
