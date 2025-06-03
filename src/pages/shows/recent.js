// pages/shows/recent.js
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
    <p className="text-white text-center mt-8">
      Loading most recent show...
    </p>
  );
}
