import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import ScrollWrapper from "@/components/ScrollWrapper";
import sql from "@/lib/sql";

export async function getServerSideProps() {
  try {
    const result = await sql`
      SELECT DISTINCT EXTRACT(YEAR FROM "showdate")::int AS year
      FROM "Show"
      WHERE "showdate" IS NOT NULL;
    `;

    const years = result
      .map((r) => r.year)
      .filter((y) => Number.isInteger(y))
      .sort((a, b) => a - b);

    return { props: { years } };
  } catch (error) {
    console.error("❌ Error fetching years:", error);
    return { props: { years: [] } };
  }
}

export default function BookPage({ years }) {
  return (
    <>
      <Head>
        <title>Phish Shows by Year | Foul Domain</title>
        <meta
          name="description"
          content="Browse every Phish show by year. Explore the complete timeline of performances across decades, from Gamehendge to New Year's Runs."
        />
        <link rel="canonical" href="https://fouldomain.com/year" />
      </Head>

      <div
        className="min-h-screen overflow-x-hidden text-yellow-100 font-ticket"
        style={{
          backgroundImage: "url('/venues/default.webp')", // Use webp!
          backgroundColor: "#0d0d0d",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom right",
          aspectRatio: '3 / 2', // Helps CLS
        }}
      >
        <div className="px-4 sm:px-6 pt-12">
          {/* 🐟 Phish Banner */}
          <div className="flex justify-center pb-0">
            <Image
              src="/phish-banner.webp"
              alt="Phish Banner"
              width={400}
              height={100}
              priority
              className="max-w-full h-auto drop-shadow-xl"
            />
          </div>

          <div className="flex justify-center mb-6">
            <h2 className="text-6xl sm:text-4xl font-bold text-yellow-100 drop-shadow-md text-center">
              Shows by Year
            </h2>
          </div>

          <div className="w-full flex justify-center">
            <div className="w-[90vw] max-w-[825px]">
              <ScrollWrapper size="large">
                <div className="text-center text-yellow-100 space-b-6 px-4">
                  <div className="px-4">
                    <div className="flex flex-wrap justify-center gap-3">
                      {years.map((year, index) => (
                        <Link
                          key={year}
                          href={`/year/${year}`}
                          className={`
                            relative inline-block px-5 py-2.5 min-w-[72px]
                            text-sm font-bold text-black text-center
                            bg-parchment border border-edge rounded-md-lg
                            shadow-inset-subtle
                            transition duration-200 ease-in-out
                            hover:scale-105 hover:shadow-[0_0_10px_rgba(255,255,200,0.3)]
                            hover:bg-yellow-100/90
                            focus:outline-none focus:ring-2 focus:ring-yellow-300
                          `}
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
    </>
  );
}
