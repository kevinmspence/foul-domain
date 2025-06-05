import { useRouter } from "next/router";
import { useEffect, useState, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import { useAudioPlayer } from "@/components/AudioPlayerContext";

export default function YearPage() {
  const router = useRouter();
  const { year } = router.query;

  const {
    playTrack,
    currentTrack,
    queue,
    nowPlayingShowId,
  } = useAudioPlayer();

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
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${m}:${s.toString().padStart(2, "0")}`;
  };

  async function playShow(showId) {
    try {
      const res = await axios.get(`/api/shows/${showId}/setlist`);
      const setlist = res.data;
      const show = shows.find((s) => s.id === showId);

      const showMeta = {
        id: show.id,
        venue: show?.venue || "",
        city: show?.city || "",
        state: show?.state || "",
        date: show?.showDate
          ? new Date(show.showDate).toISOString().split("T")[0]
          : "",
      };

      const tracksWithAudio = setlist
        .filter((track) => track.audioUrl)
        .map((track) => ({
          title: track.song,
          url: track.audioUrl,
          ...showMeta,
        }));

      if (tracksWithAudio.length === 0) {
        alert("No playable audio tracks found for this show.");
        return;
      }

      playTrack(tracksWithAudio[0], tracksWithAudio, showMeta);
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

      <main className="min-h-screen bg-gray-950 text-gray-100 font-mono px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-wide text-center mb-10">
            Shows from {year}
          </h1>

          <div className="overflow-x-auto border border-gray-800 rounded">
            <table className="min-w-full text-sm sm:text-base text-left border-collapse table-fixed font-mono">
              <thead>
                <tr className="bg-gray-800 text-gray-200">
                  <th onClick={() => handleSort("showDate")} className="w-32 px-4 py-3 border-b border-gray-700 text-center cursor-pointer">
                    Date<SortArrow column="showDate" />
                  </th>
                  <th onClick={() => handleSort("venue")} className="w-48 px-4 py-3 border-b border-gray-700 text-center cursor-pointer">
                    Venue<SortArrow column="venue" />
                  </th>
                  <th onClick={() => handleSort("city")} className="hidden sm:table-cell w-36 px-4 py-3 border-b border-gray-700 text-center cursor-pointer">
                    City<SortArrow column="city" />
                  </th>
                  <th onClick={() => handleSort("state")} className="hidden sm:table-cell w-24 px-4 py-3 border-b border-gray-700 text-center cursor-pointer">
                    State<SortArrow column="state" />
                  </th>
                  <th onClick={() => handleSort("total_duration")} className="w-32 px-4 py-3 border-b border-gray-700 text-center cursor-pointer">
                    Duration<SortArrow column="total_duration" />
                  </th>
                  <th className="w-24 px-4 py-3 border-b border-gray-700 text-center">
                    Play
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleShows.map((show) => {
                  const date = new Date(show.showDate).toISOString().split("T")[0];
                  const playing = show.id === nowPlayingShowId;

                  return (
                    <tr
                      key={show.id}
                      className={show.id % 2 === 0 ? "bg-gray-900/50" : "bg-gray-900/30"}
                    >
                      <td className="px-4 py-2 border-t border-gray-800 text-center">
                        <Link href={`/shows/${date}`} className="text-indigo-300 hover:underline">
                          {date}
                        </Link>
                      </td>
                      <td className="px-4 py-2 border-t border-gray-800 text-center">{show.venue}</td>
                      <td className="hidden sm:table-cell px-4 py-2 border-t border-gray-800 text-center">{show.city}</td>
                      <td className="hidden sm:table-cell px-4 py-2 border-t border-gray-800 text-center">{show.state}</td>
                      <td className="px-4 py-2 border-t border-gray-800 text-center">
                        {formatDuration(show.total_duration)}
                      </td>
                      <td className="px-4 py-2 border-t border-gray-800 text-center">
                        {show.has_audio ? (
                          playing ? (
                            <span className="text-green-400">Now Playing</span>
                          ) : (
                            <button
                              onClick={() => playShow(show.id)}
                              title="Play show audio"
                              className="text-indigo-400 hover:text-indigo-200 transition"
                            >
                              ▶
                            </button>
                          )
                        ) : (
                          <span className="text-gray-600">—</span>
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
      </main>
    </>
  );
}
