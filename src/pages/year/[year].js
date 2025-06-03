import { useRouter } from 'next/router';
import { useEffect, useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';

export default function YearPage() {
  const router = useRouter();
  const { year } = router.query;

  const [shows, setShows] = useState([]);
  const [visibleCount, setVisibleCount] = useState(25);
  const [sortField, setSortField] = useState('showDate');
  const [sortAsc, setSortAsc] = useState(false);
  const loaderRef = useRef(null);

  useEffect(() => {
    if (!year) return;

    async function fetchShows() {
      try {
        const res = await axios.get(`/api/shows?year=${year}`);
        setShows(res.data);
      } catch (err) {
        console.error('Error fetching shows', err);
      }
    }

    fetchShows();
  }, [year]);

  const sortedShows = [...shows].sort((a, b) => {
    const valA = sortField === 'showDate' ? new Date(a[sortField]) : a[sortField]?.toLowerCase();
    const valB = sortField === 'showDate' ? new Date(b[sortField]) : b[sortField]?.toLowerCase();
    return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  const visibleShows = sortedShows.slice(0, visibleCount);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 25);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
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
    typeof window !== 'undefined'
      ? `${window.location.origin}/year/${year}`
      : `https://fouldomain.com/year/${year}`;

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

      <div
        className="min-h-screen overflow-x-hidden text-yellow-100 font-ticket"
        style={{
          backgroundImage: "url('/backgrounds/years.png')",
          backgroundColor: '#0d0d0d',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom right',
        }}
      >
        <div className="min-h-screen px-4 pb-20 pt-8 flex flex-col items-center font-ticket text-yellow-100">
          <img
            src="/phish-banner.webp"
            alt="Phish Banner"
            className="w-full max-w-2xl mx-auto mb-6"
          />

          <h1 className="text-6xl sm:text-7xl font-bold text-yellow-100 drop-shadow-md text-center mb-4">
            {year}
          </h1>
          <p className="italic text-sm text-yellow-300 mb-8 text-center">
            Each show from this year — unrolled below.
          </p>

          <div className="w-full max-w-5xl text-center">
            <img src="/scroll-top.png" alt="Scroll top" className="w-full" />
            <div className="flex justify-center">
              <div
                className="bg-repeat-y bg-center bg-[length:100%_auto] w-full max-w-[1100px]"
                style={{ backgroundImage: `url(/scroll-middle.png)` }}
              >
                <div className="px-4 sm:px-8 pb-10">
                  <div className="w-full overflow-x-auto rounded-xl">
                    <table className="table-auto border-collapse w-[90%] max-w-[740px] mx-auto text-yellow-100 text-sm sm:text-lg">
                      <thead className="align-middle">
                        <tr className="bg-yellow-300 text-black h-12">
                          <th className="px-4 border border-yellow-700 shadow-inner shadow-yellow-900 text-center">Date</th>
                          <th className="px-4 border border-yellow-700 shadow-inner shadow-yellow-900 text-center">Venue</th>
                          <th className="hidden sm:table-cell px-4 border border-yellow-700 shadow-inner shadow-yellow-900 text-center">City</th>
                          <th className="hidden sm:table-cell px-4 border border-yellow-700 shadow-inner shadow-yellow-900 text-center">State</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleShows.map((show) => {
                          const date = new Date(show.showDate).toISOString().split('T')[0];
                          return (
                            <tr
                              key={show.id}
                              className="hover:bg-yellow-300 hover:text-black transition-all duration-150 even:bg-yellow-950/10 odd:bg-yellow-900/5"
                            >
                              <td className="py-2 px-4 border border-yellow-700">
                                <Link
                                  href={`/shows/${date}`}
                                  className="text-sky-300 hover:text-sky-100 hover:underline"
                                >
                                  {date}
                                </Link>
                              </td>
                              <td className="py-2 px-4 border border-yellow-700">{show.venue}</td>
                              <td className="hidden sm:table-cell py-2 px-4 border border-yellow-700">{show.city}</td>
                              <td className="hidden sm:table-cell py-2 px-4 border border-yellow-700">{show.state}</td>
                            </tr>
                          );
                        })}
                        <tr>
                          <td ref={loaderRef} colSpan={4} className="h-8"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="italic text-xs text-yellow-300 mt-6 max-w-[240px] mx-auto">
                    Every show a chapter, every jam a paragraph.
                  </p>
                </div>
              </div>
            </div>
            <img src="/scroll-bottom.png" alt="Scroll bottom" className="w-full" />
          </div>
        </div>
      </div>
    </>
  );
}
