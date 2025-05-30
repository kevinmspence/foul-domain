// src/pages/index.jsx
import Image from 'next/image';
import Link from 'next/link';
import SearchBox from '@/components/SearchBox';

export default function HomePage() {
  return (
    <div
      className="w-screen h-screen bg-cover bg-center flex items-center justify-start"
      style={{ backgroundImage: 'url(/gamehendge.webp)' }}
    >
      <div className="flex flex-col items-center pl-10 sm:pl-20 md:pl-32 z-10 animate-fadeInUp">
        <Image
          src="/foul-domain.png"
          alt="Foul Domain Logo"
          width={375}
          height={100}
          className="mb-2"
        />

        <p className="text-yellow-100 text-lg md:text-xl text-center font-ticket max-w-md mb-3">
          All that's been played shall be known — <br className="hidden sm:block" />
          if you ask in the tongue of the Book.
        </p>

        <SearchBox containerClass="mb-6 w-[375px]" />

        <div className="text-orange-500 font-bold text-xl tracking-widest mt-6 mb-2">
          OR
        </div>

        <Link href="/archives" className="mt-2">
          <Image
            src="/browse-the-archives.png"
            alt="Browse the Archives"
            width={285}
            height={80}
            className="transition-transform duration-200"
          />
        </Link>
      </div>
    </div>
  );
}
