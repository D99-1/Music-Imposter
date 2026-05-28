# Music Imposter

A P2P party game where players identify the "Imposter" through song choices.

## Features
- **P2P Multiplayer**: No server required, powered by PeerJS.
- **iTunes Search**: In-built search for millions of songs with 30-second previews.
- **Customizable**: Set number of imposters, rounds, and custom word lists.
- **Minimalist Design**: Modern, high-contrast UI with smooth transitions.

## How to Play
1. **Host a Room**: One player creates a room and shares the Room ID.
2. **Join**: Other players join using the ID and a nickname.
3. **The Role**: Everyone (except the Imposter) gets a secret theme word.
4. **The Search**: Everyone picks a song they think fits the theme.
5. **The Preview**: Listen to everyone's chosen song (Host plays them).
6. **The Vote**: Vote for who you think is the Imposter.
7. **Elimination**: If an imposter is voted out, the crew wins a point. If the crew votes out an innocent player, the imposter gets closer to winning.

## Setup
1. `npm install`
2. `npm run dev`
3. To deploy to GitHub Pages: `npm run build` and upload the `dist` folder.

## Tech Stack
- React + Vite
- PeerJS (WebRTC)
- Tailwind CSS
- Framer Motion
- Lucide Icons
