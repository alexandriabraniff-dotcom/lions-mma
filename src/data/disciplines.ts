export const disciplines = [
  { id: 'muay-thai',  name: 'Muay Thai',       short: 'MT',    tagline: 'The Art of 8 Limbs',            slug: 'muay-thai' },
  { id: 'boxing',     name: 'Boxing',           short: 'BOX',   tagline: 'The Sweet Science',              slug: 'boxing' },
  { id: 'bjj-gi',     name: 'BJJ (Gi)',         short: 'GI',    tagline: 'The Gentle Art',                 slug: 'bjj-gi' },
  { id: 'nogi',       name: 'No-Gi',            short: 'NOGI',  tagline: 'Submission Grappling',           slug: 'nogi' },
  { id: 'wrestling',  name: 'Wrestling',        short: 'WR',    tagline: 'Hardest Sport in the World',     slug: 'wrestling' },
  { id: 'mma',        name: 'MMA',              short: 'MMA',   tagline: 'Train Like a Pro',               slug: 'mma' },
  { id: 'womens',     name: "Women's Only",     short: 'WO',    tagline: 'Safe, Inclusive, Empowering',    slug: 'womens-only' },
  { id: 'kids',       name: 'Kids',             short: 'KIDS',  tagline: 'Anti-Bullying, Respect, Values', slug: 'kids' },
  { id: 'private',    name: 'Private Training', short: 'PVT',   tagline: 'Level Up',                       slug: 'private-training' },
] as const;

export type DisciplineId = typeof disciplines[number]['id'];
