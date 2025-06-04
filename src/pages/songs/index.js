import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import ScrollWrapper from "@/components/ScrollWrapper";

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

      <div
        className="min-h-screen overflow-x-hidden text-yellow-100 font-ticket"
        style={{
          backgroundImage: "url('/backgrounds/songs.webp')",
          backgroundColor: '#0d0d0d',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom right',
        }}
      >
        {/* PHISH Banner */}
        <div className="flex justify-center pt-10">
          <Image
            src="/phish-banner.webp"
            alt="Phish Banner"
            width={500}
            height={125}
            priority
            className="w-full max-w-[500px] h-auto drop-shadow-xl"
          />
        </div>

        <div className="flex justify-center mb-6">
          <h2 className="text-5xl sm:text-6xl font-bold text-yellow-100 drop-shadow-md text-center">
            All Songs
          </h2>
        </div>

        <div className="flex justify-center">
          <div className="w-full sm:w-[90vw] sm:max-w-[825px] relative">

            {/* Floating A-Z Index */}
            <div className="fixed top-28 right-2 z-50 hidden sm:flex flex-col items-center space-y-1 text-sm font-bold text-yellow-400 bg-black/60 backdrop-blur p-2 rounded-lg border border-yellow-800 shadow-md">
              {["#", ...Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ")].map((letter) => (
                <button
                  key={letter}
                  onClick={() => scrollToLetter(letter)}
                  className="hover:text-yellow-100 transition"
                  aria-label={`Jump to ${letter}`}
                >
                  {letter}
                </button>
              ))}
            </div>

            <ScrollWrapper title="" size="large">
              <div className="space-y-12 pb-12 w-full max-w-full overflow-x-hidden">
                {Object.entries(groupedSongs)
                  .sort(([a], [b]) => {
                    if (a === "#") return -1;
                    if (b === "#") return 1;
                    return a.localeCompare(b);
                  })
                  .map(([letter, group]) => (
                    <div key={letter} ref={(el) => (sectionRefs.current[letter] = el)}>
                      <div className="w-full overflow-hidden">
                        <div className="mx-auto w-full max-w-full sm:max-w-[620px] px-4 sm:px-6 box-border">
                          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 border-b border-yellow-700 pb-1">
                            {letter}
                          </h2>
                          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-3">
                            {group.map(({ name, slug }) => (
                              <Link
                                key={slug}
                                href={`/songs/${slug}`}
                                className="block px-2 py-1 sm:px-2.5 sm:py-1.5 rounded border border-yellow-800 bg-yellow-900/10 hover:bg-yellow-700/40 transition-all text-center text-sm sm:text-base sm:text-[1.05rem] leading-snug box-border"
                              >
                                {name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollWrapper>
          </div>
        </div>
      </div>
    </>
  );
}
