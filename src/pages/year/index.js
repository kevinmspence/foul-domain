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

export default function YearPage({ years }) {
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
          backgroundImage: "url('/venues/default.webp')",
          backgroundColor: "#0d0d0d",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom right",
          // ✅ REMOVE aspect ratio
        }}
      >
        <div className="px-4 sm:px-6 pt-10">
          {/* 🐟 Phish Banner */}
          <div className="flex justify-center pb-4">
            <Image
              src="/phish-banner.webp"
              alt="Phish Banner"
              width={500} // ✅ increase from 400 → 500
              height={125}
              priority
              className="w-full max-w-[500px] h-auto drop-shadow-xl"
            />
          </div>

          {/* Title */}
          <div className="flex justify-center mb-6">
            <h2 className="text-5xl sm:text-6xl font-bold text-yellow-100 drop-shadow-md text-center">
              Shows by Year
            </h2>
          </div>

          {/* Scroll */}
          <div className="w-full flex justify-center">
            <div className="w-full sm:w-[90vw] sm:max-w-[825px]">
              <ScrollWrapper size="large">
                <div className="text-center text-yellow-100 space-y-6 px-3 sm:px-6">
                  <div>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                      {years.map((year, index) => (
                        <Link
                          key={year}
                          href={`/year/${year}`}
                          className={`
                            relative inline-block px-4 py-2 sm:px-5 sm:py-2.5
                            min-w-[64px] sm:min-w-[72px]
                            text-lg sm:text-sm font-bold text-black text-center
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

                  <p className="italic text-sm text-yellow-300 pt-6">
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
