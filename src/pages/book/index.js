import Head from 'next/head';
import Link from "next/link";
import ScrollWrapper from "@/components/ScrollWrapper";
import sql from "@/lib/sql";

const collectionLinks = [
  { name: "Halloween Shows", slug: "halloween" },
  { name: "New Year’s Shows", slug: "nye" },
  { name: "Island Tour", slug: "island-tour" },
  { name: "Baker's Dozen", slug: "bakers-dozen" },
  { name: "Festivals", slug: "festivals" },
  { name: "Gamehendge", slug: "gamehendge" },
];

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
        <title>The Helping Friendly Book | Foul Domain</title>
        <meta
          name="description"
          content="Explore the ancient secrets of eternal joy and never-ending splendor. Browse Phish show collections and archives."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "The Helping Friendly Book",
              description:
                "Explore ancient secrets and Phish show collections from Foul Domain.",
            }),
          }}
        />
      </Head>

      <div
        className="min-h-screen overflow-x-hidden text-yellow-100 font-ticket"
        style={{
          backgroundImage: "url('/backgrounds/library.webp')",
          backgroundColor: "#0d0d0d",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom right",
          aspectRatio: '3 / 2', // helps with layout shift
        }}
      >
        <div className="px-4 sm:px-6 py-12">
          <div className="flex justify-center mb-6">
            <h1 className="text-6xl sm:text-7xl font-bold text-yellow-100 drop-shadow-md text-center">
              The Helping<br />
              Friendly Book
            </h1>
          </div>

          <div className="flex justify-center items-center mb-6">
            <h2
              className="text-center text-lg"
              style={{
                fontFamily: "'Rock Salt', cursive",
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                lineHeight: '1.75',
              }}
            >
              Ancient secrets <br />
              of eternal joy and <br />
              never-ending splendor
            </h2>
          </div>

          <div className="flex justify-center">
            <div className="w-[90vw] max-w-[825px]">
              <ScrollWrapper size="large">
                <div className="text-center space-y-6 px-4">
                  <section className="px-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-yellow-200 mb-2">
                      Special Collections
                    </h3>
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
                  </section>

                  <section className="pt-8 px-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-yellow-200 mb-2">
                      Entries by Year
                    </h3>
                    {years.length > 0 ? (
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
                    ) : (
                      <p className="text-sm italic text-yellow-400">
                        No years found. Please check your show data.
                      </p>
                    )}
                  </section>

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
