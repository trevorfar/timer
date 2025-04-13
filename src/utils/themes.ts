import { Theme } from "./types";

export const themes: Theme[] = [
  { name: "Highway", id: 31315701 },
  { name: "Coastal Cliffs", id: 30457635 },
  { name: "Hot Air Balloons", id: 30707440 },
  { name: "Orange Sky", id: 30871873 },
  { name: "Lighthouse", id: 30685081 },
  { name: "Country Road", id: 8965253 },
  { name: "Sparkly Water", id: 27592976 },
  { name: "Winter Forest", id: 30825914 },
  { name: "Fishing Village", id: 30854811 },
  { name: "City", id: 10024586 },
  { name: "Subway Surfer", id: NaN, directLink: "https://ia601307.us.archive.org/35/items/subway_surfer/subway_surfer.mp4" },
  { name: "Ducks", id: 30510515 },
  { name: "Starry Night", id: 857134 },
  { name: "Receding Waves", id: 1321208 },
  { name: "Rocky River", id: 5896379 },
  { name: "Trippy Tunnel", id: 2759477 },
  { name: "Colorful Forest", id: 3217937 },
  { name: "Waterfall", id: 7297870 },
  { name: "Storm Castle", id: 4167691 }
];

export const themeMap = new Map<number, Theme>(
    themes.filter((t) => !isNaN(t.id)).map((t) => [t.id, t])
  );