export const DEFAULT_WORDS = [
  "Jazz", "Techno", "Classical", "Hip Hop", "Rock", "Country", "Disco", "Opera",
  "Rainy Day", "Workout", "Party", "Sleepy", "Summer Vibes", "Deep Space", "Cyberpunk",
  "Coffee Shop", "Road Trip", "Underwater", "Fireplace", "High Speed", "Minimalism",
  "Retro", "Futuristic", "Nature", "Urban", "Medieval", "Magic", "Spooky", "Victory", "Heartbreak"
];

export const getRandomWord = (customWords = []) => {
  const pool = (customWords && customWords.length > 0) ? customWords : DEFAULT_WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
};
