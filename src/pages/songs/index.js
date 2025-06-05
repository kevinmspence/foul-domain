import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Head from "next/head";

export default function SongArchivePage() {
  const [songs, setSongs] = useState([]);
  const sectionRefs = useRef({});

  useEffect(() => {
    fetch("/api/songs/archive")
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setSongs(sorted);
      })
      .catch((err) => console.error("Error fetching songs archive:", err));
  }, []);

  const groupedSongs = songs.reduce((acc, song) => {
    const name = song.name.trim();
    const firstAlphaChar = name.match(/[A-Za-z0-9]/)?.[0] ?? "#";
    const letter = /^[0-9]$/.test(firstAlphaChar)
      ? "#"
      : firstAlphaChar.toUpperCase();

    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(song);
    return acc;
  }, {});

  const scrollToLetter = (letter) => {
    const section = sectionRefs.current[letter];
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <Head>
        <title>Songs – Foul Domain</title>
        <meta
          name="description"
          content="Browse all Phish songs performed live. Click a song to explore when and where it was played."
        />
        <link rel="canonical" href="https://fouldomain.com/songs" />
      </Head>

      <main className="min-h-screen bg-gray-950 text-gray-100 font-mono px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-widest uppercase text-center mb-2">
            Songs
          </h1>
          <p className="text-center text-sm text-gray-400 mb-10">
            Browse the full list of Phish songs performed live.
          </p>

          {/* A–Z Index */}
          <div className="fixed top-24 right-2 z-50 hidden sm:flex flex-col items-center space-y-1 text-xs font-bold text-gray-400 bg-gray-900/90 backdrop-blur p-2 rounded-md border border-gray-700 shadow-md">
            {["#", ...Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ")].map((letter) => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                className="hover:text-indigo-300 transition"
                aria-label={`Jump to ${letter}`}
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Song List */}
          <div className="space-y-12">
            {Object.entries(groupedSongs)
              .sort(([a], [b]) => {
                if (a === "#") return -1;
                if (b === "#") return 1;
                return a.localeCompare(b);
              })
              .map(([letter, group]) => (
                <section key={letter} ref={(el) => (sectionRefs.current[letter] = el)}>
                  <h2 className="text-2xl sm:text-3xl font-semibold border-b border-gray-700 pb-1 mb-4">
                    {letter}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {group.map(({ name, slug }) => (
                      <Link
                        key={slug}
                        href={`/songs/${slug}`}
                        className="block px-3 py-1.5 border border-gray-700 rounded bg-gray-900 hover:bg-indigo-800/30 transition text-sm sm:text-base text-center"
                      >
                        {name}
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
          </div>
        </div>
      </main>
    </>
  );
}
