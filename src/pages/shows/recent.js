import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function MostRecentShowRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function fetchMostRecent() {
      const res = await fetch('/api/most-recent');
      const data = await res.json();
      if (data?.showDate) {
        router.replace(`/shows/${data.showDate}`);
      } else {
        router.replace('/shows');
      }
    }

    fetchMostRecent();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d0d0d] text-yellow-100 font-ticket relative overflow-hidden">

      {/* Swirling loading animation */}
      <div className="w-20 h-20 mb-8 relative animate-spin-slow">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="5"
            fill="none"
          />
          <path
            d="M 50 5 A 45 45 0 0 1 95 50"
            stroke="gold"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Loading message */}
      <p className="text-xl sm:text-2xl text-yellow-100 text-center drop-shadow-md animate-pulse">
        Loading most recent show...
      </p>

      {/* Optional: subtle background stars */}
      <div className="absolute inset-0 bg-[url('/backgrounds/stars.png')] bg-cover bg-center opacity-10 pointer-events-none" />
    </div>
  );
}
