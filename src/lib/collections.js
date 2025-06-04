// src/lib/collections.js

export const collectionTitles = {
  halloween: "Halloween Shows",
  nye: "New Year’s Runs",
  "island-tour": "Island Tour",
gamehendge: "Gamehendge Shows",
"bakers-dozen": "Baker's Dozen"
};

export function getCollectionShows(slug, allShows) {
  switch (slug) {
    case "halloween":
      return allShows.filter((show) => show.showDate.includes("-10-31"));

    case 'nye':
      return allShows.filter((show) => /-12-31$/.test(show.showDate));


    case "island-tour":
      return allShows.filter((show) => show.showDate.startsWith("1998-04"));



    case "bakers-dozen": {
        const start = new Date("2017-07-21");
        const end = new Date("2017-08-06");
        return allShows.filter((s) => {
            const d = new Date(s.showDate);
            return d >= start && d <= end;
        });
    }

    case "gamehendge": {
        const dates = new Set([
            "1988-03-12",
            "1991-10-03",
            "1993-03-22",
            "1994-06-26",
            "1994-07-08",
            "2023-12-31"
        ]);
        return allShows.filter((s) => dates.has(s.showDate));
    }

    default:
      return [];
  }
}
