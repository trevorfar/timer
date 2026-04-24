import type { Theme } from "./types";

export const themes: Theme[] = [
  { name: "Snoopy", id: NaN, directLink: "https://ia600506.us.archive.org/26/items/snoopy_complete/snoopy_complete.mp4" },
  { name: "Lighthouse", id: 30685081 },
  { name: "City", id: 10024586 },
  { name: "Ducks", id: 30510515 },
  { name: "Sail Boats", id: 30123393},
  { name: "Ferris Wheel", id: 32072283},
  { name: "Squirrel Munchin", id: 36577961},
  { name: "Butter Flyin", id: 36520697},
  { name: "Rabbit Resting", id: 31105801},
  { name: "Receding Waves", id: 1321208 },
  { name: "Misty Mountain", id: 37014696 },
  { name: "Venitian Canal", id: 36844982 },
  { name: "Trippy Tunnel", id: 2759477 },
  { name: "Colorful Forest", id: 3217937 },
  { name: "Storm Castle", id: 4167691 },


];

export const DEFAULT_THEME_INDEX = themes.findIndex((t) => t.id === 10024586);
