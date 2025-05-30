import Link from "next/link";
import ScrollWrapper from "@/components/ScrollWrapper";
import prisma from "@/lib/prisma"; // adjust this path if your prisma client is elsewhere

const collectionLinks = [
  { name: "Halloween Shows", slug: "halloween" },
  { name: "New Year’s Shows", slug: "nye" },
  { name: "Island Tour", slug: "island-tour" },
  { name: "A–Z Song Archive", slug: "songs" },
];

export async function getServerSideProps() {
  const shows = await prisma.show.findMany({
    select: { showDate: true },
  });

  const yearSet = new Set(shows.map((s) => new Date(s.showDate).getFullYear()));
  const years = Array.from(yearSet).sort((a, b) => a - b);

  return { props: { years } };
}

export default function BookPage({ years }) {
  return (
    <div
      className="min-h-screen overflow-x-hidden text-yellow-100 font-ticket"
      style={{
        backgroundImage: "url('/backgrounds/library.png')",
        backgroundColor: '#0d0d0d',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom right',
      }}
    >
      <div className="min-h-screen text-yellow-100 font-ticket px-4 sm:px-6 py-12">
        <div className="flex justify-center mb-6">
          <h1 className="text-6xl sm:text-7xl font-bold text-yellow-100 drop-shadow-md text-center">
            The Helping Friendly Book
          </h1>
        </div>

        <div className="w-full flex justify-center">
          <div className="w-[90vw] max-w-[825px]">
            <ScrollWrapper size="large">
              <div className="text-center text-yellow-100 space-y-6 px-4">
                <div className="px-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-yellow-200 mb-2">
                    Special Collections
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 justify-center">
                    {collectionLinks.map(({ name, slug }, index) => (
                      <Link
                        key={slug}
                        href={`/collection/${slug}`}
                        className="bg-parchment text-black font-bold text-sm text-center px-3 py-2 w-full max-w-[160px] mx-auto rounded-md-lg border border-edge shadow-inset-subtle transition-all duration-200 hover:brightness-105"
                        style={{ transitionDelay: `${index * 40}ms` }}
                      >
                        {name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-8 px-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-yellow-200 mb-2">
                    Browse by Year
                  </h2>
                  <div className="flex flex-wrap justify-center gap-2">
                    {years.map((year, index) => (
                      <Link
                        key={year}
                        href={`/year/${year}`}
                        className="bg-parchment text-black font-bold text-sm text-center px-5 py-2.5 min-w-[72px] rounded-md-lg border border-edge shadow-inset-subtle transition-all duration-200 hover:brightness-105"
                        style={{ transitionDelay: `${index * 20}ms` }}
                      >
                        {year}
                      </Link>
                    ))}
                  </div>
                </div>

                <p className="italic text-xs text-yellow-300 pt-6">
                  Every show tells a story — this scroll remembers them all.
                </p>
              </div>
            </ScrollWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}
