export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readMinutes: number;
  body: { h?: string; p: string }[];
};

export const posts: Post[] = [
  {
    slug: "why-our-sourdough-takes-36-hours",
    title: "Why our sourdough takes 36 hours",
    description:
      "Inside the slow fermentation behind Mémoire's Pain de Campagne, and why it makes bread that tastes better and is easier to digest.",
    date: "2026-11-18",
    readMinutes: 4,
    body: [
      {
        p: "Most bread you buy in Gurgaon is made in about three hours. Ours takes thirty six. That is not stubbornness. Time is the one ingredient that changes everything else in the loaf.",
      },
      {
        h: "It starts the morning before",
        p: "Our levain, a living culture of wild yeast and bacteria, is fed at dawn. By afternoon it is bubbling and ready. We mix it with flour, water and salt, and then we mostly leave it alone.",
      },
      {
        h: "The long cold rest",
        p: "After shaping, every loaf spends the night in a cool retarder. The cold slows the yeast down while the bacteria keep working, building the gentle tang and the deep, almost nutty flavour you taste in the crumb. It also gives the crust those little blisters.",
      },
      {
        h: "Why it is kinder to your stomach",
        p: "Long fermentation breaks down more of the starches and some of the gluten before the bread ever reaches the oven. Many people who find commercial bread heavy tell us they feel fine after a slice of slow sourdough.",
      },
      {
        h: "Why we ask you to pre-order",
        p: "Because the dough is mixed the evening before, we need to know how many loaves to make by 8 pm. Pre-ordering means we bake exactly what is wanted, waste almost nothing, and your bread comes out of the oven on the morning you collect it.",
      },
    ],
  },
  {
    slug: "how-to-store-french-bread-in-gurgaon",
    title: "How to keep French bread fresh in Gurgaon's weather",
    description:
      "Simple ways to store a baguette, sourdough or brioche so it stays good through Delhi NCR's dry winters and humid monsoons.",
    date: "2026-11-20",
    readMinutes: 3,
    body: [
      {
        p: "Real bread has no preservatives, so it changes from the moment it leaves the oven. Here is how to get the most out of every loaf, whatever the season is doing outside.",
      },
      {
        h: "Never the fridge",
        p: "Refrigerators make bread stale faster than leaving it on the counter. The cold speeds up the way starch firms and dries. Keep it at room temperature or freeze it.",
      },
      {
        h: "Sourdough: cut side down",
        p: "Store a country loaf cut side down on a wooden board, or in a paper bag inside a cloth. It will keep well for three days. In the dry winter, a bread box helps hold a little moisture.",
      },
      {
        h: "Baguette: eat it today",
        p: "A baguette is at its best within hours. If you have some left, slice it, freeze it, and toast straight from frozen. Day old baguette also makes the best croutons and pain perdu.",
      },
      {
        h: "During the monsoon",
        p: "Humidity softens crusts and invites mould. Use paper, not plastic, and freeze anything you will not eat within two days. A few minutes in a hot oven brings the crust right back.",
      },
      {
        h: "Freeze smart",
        p: "Slice before freezing so you can take out only what you need. Wrapped well, our breads keep for a month in the freezer and taste almost freshly baked once toasted.",
      },
    ],
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}
