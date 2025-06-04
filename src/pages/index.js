import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import SearchBox from '@/components/SearchBox';

export default function Home() {
  const [bgImage, setBgImage] = useState(null);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    setBgImage(isMobile ? '/gamehendge-mobile.webp' : '/gamehendge.webp');
  }, []);

  return (
    <>
      <Head>
        <title>Foul Domain – Phish Setlists, Songs, and Shows</title>
        <meta
          name="description"
          content="Search the complete history of Phish setlists and songs. Discover every show, performance, and special moment—cataloged in the tongue of the Book."
        />
        <meta property="og:title" content="Foul Domain – Phish Setlists, Songs, and Shows" />
        <meta
          property="og:description"
          content="Search the complete history of Phish setlists and songs. Discover every show, performance, and special moment—cataloged in the tongue of the Book."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://fouldomain.com/" />
      </Head>

      <div className="w-screen h-screen relative overflow-hidden">
        {/* Background image is only rendered client-side to avoid flicker */}
        {bgImage && (
          <Image
            src={bgImage}
            alt=""
            fill
            priority
            className="object-cover object-center z-0"
          />
        )}

        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center sm:justify-start px-4 sm:px-10 md:px-20 lg:px-32 z-10">
          <div className="flex flex-col items-center w-full max-w-[480px] text-center animate-fadeInUp">
            {/* Logo */}
            <Image
              src="/foul-domain.webp"
              alt="Foul Domain Logo"
              width={375}
              height={100}
              priority
              className="w-[75%] max-w-[375px] h-auto mb-3"
            />

            {/* Tagline */}
            <p className="text-yellow-100 text-base sm:text-lg md:text-xl font-ticket max-w-xs sm:max-w-sm md:max-w-md mb-3 leading-snug">
              All that&apos;s been played shall be known — <br className="hidden sm:block" />
              if you ask in the tongue of the Book.
            </p>

            {/* Search Box */}
            <SearchBox containerClass="mb-6 w-full max-w-[90vw] sm:max-w-[375px]" />

            {/* Divider */}
            <div className="text-orange-500 font-bold text-lg sm:text-xl tracking-widest mt-6 mb-2">
              OR
            </div>

            {/* Browse Archives Button */}
            <Link href="/book" className="mt-2 w-[70%] max-w-[285px]">
              <Image
                src="/browse-the-archives.png"
                alt="Browse the Archives"
                width={285}
                height={80}
                priority
                className="w-full h-auto transition-transform duration-200"
              />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
