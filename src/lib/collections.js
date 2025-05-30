// src/lib/collections.js

export const collectionTitles = {
  halloween: "Halloween Shows",
  nye: "New Year’s Runs",
  "island-tour": "Island Tour",
  bustouts: "Best Bust-outs",
  "darkness-light": "Darkness & Light",
};

export function getCollectionShows(slug, allShows) {
  switch (slug) {
    case "halloween":
      return allShows.filter((show) => show.showDate.includes("-10-31"));

    case "nye":
      return allShows.filter((show) =>
        /-12-(28|29|30|31)|-01-0[1-2]/.test(show.showDate)
      );

    case "island-tour":
      return allShows.filter((show) => show.showDate.startsWith("1998-04"));

    case "bustouts":
      return allShows.filter((show) => show.footnote?.toLowerCase().includes("bust"));

    case "darkness-light":
      return allShows.filter((show) =>
        /ghost|light|darkness|shade/i.test(show.setlistNotes || "")
      );

    default:
      return [];
  }
}
