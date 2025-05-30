export default function ShowNotes({ notes }) {
  if (!notes) return null;

  return (
    <div className="mt-12 mx-auto max-w-3xl bg-[#fdf5e6cc] border border-yellow-200 rounded-lg p-6 shadow-lg backdrop-blur-sm drop-shadow-md font-serif text-yellow-900 leading-relaxed text-lg whitespace-pre-wrap">
      <h3 className="text-2xl font-bold mb-4 text-yellow-800">Show Notes</h3>
      <div
        dangerouslySetInnerHTML={{
          __html: notes
            .replace(/â/g, "’")
            .replace(/â/g, "“")
            .replace(/â/g, "”")
            .replace(/â¦/g, "…")
            .replace(/â/g, "–")
            .replace(/â”/g, "—")
            .replace(/Â/g, "")
            .replace(/&nbsp;/g, " "),
        }}
      />
    </div>
  );
}


