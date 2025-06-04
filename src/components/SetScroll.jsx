import Link from 'next/link';

export default function SetScroll({ title, entries }) {
  return (
    <div className="relative w-full max-w-[460px] text-yellow-100 font-ticket drop-shadow-[0_0_15px_rgba(255,255,200,0.25)] mx-auto">
      {/* Top of Scroll */}
      <div
        className="w-full h-[150px] bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/scroll-top.webp')",
          backgroundSize: '100% 100%',
        }}
      />

      {/* Middle Scroll Content */}
      <div
        className="w-full bg-repeat-y px-6 bg-center"
        style={{
          backgroundImage: "url('/scroll-middle.webp')",
          backgroundSize: '101% auto',
        }}
      >
        <h3 className="text-2xl text-center text-yellow-200 mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] font-handwritten">
          {title}
        </h3>

        <ul className="space-y-3 text-center font-handwritten text-[0.85rem] leading-snug">
          {entries.map((entry, i) => (
            <li key={i} className="text-yellow-100 tracking-wide drop-shadow-[0_0_5px_rgba(255,255,200,0.2)]">
              {entry.isEncore && (
                <span className="block text-yellow-400 italic mb-1 mt-4">Encore</span>
              )}
              <Link href={`/songs/${encodeURIComponent(entry.song.toLowerCase().replace(/\s+/g, '-'))}`}>
                <span className="hover:underline hover:text-yellow-300 transition">{entry.song}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom of Scroll */}
      <div
        className="w-full h-[160px] bg-center bg-no-repeat -mt-[1px]"
        style={{
          backgroundImage: "url('/scroll-bottom.webp')",
          backgroundSize: '100% 100%',
        }}
      />
    </div>
  );
}
