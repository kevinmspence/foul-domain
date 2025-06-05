import Head from 'next/head';
import SearchBox from '@/components/SearchBox';

export default function Home() {
  return (
    <>
      <Head>
        <title>Foul Domain – Phish Setlists and Shows</title>
        <meta
          name="description"
          content="A searchable archive of Phish songs and performances."
        />
        <meta property="og:title" content="Foul Domain – Phish Setlists and Shows" />
        <meta
          property="og:description"
          content="A searchable archive of Phish songs and performances."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://fouldomain.com/" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className="min-h-screen bg-gray-950 text-gray-100 font-sans px-4 py-24">
        <div className="max-w-xl mx-auto flex flex-col items-center text-center space-y-6">
          {/* Logo */}
          <h1
            className="text-4xl sm:text-5xl font-semibold tracking-widest uppercase"
            style={{ fontFamily: '"Space Mono", monospace', letterSpacing: '1px' }}
          >
            FOUL DOMAIN
          </h1>

          {/* Divider */}
          <div className="w-16 border-t border-gray-700" />

          {/* Tagline */}
          <p className="text-gray-400 text-sm sm:text-base font-mono tracking-wide">
            A searchable archive of Phish songs and performances.
          </p>

          {/* Search */}
          <SearchBox containerClass="w-full max-w-md mt-4" />
        </div>
      </main>
    </>
  );
}
