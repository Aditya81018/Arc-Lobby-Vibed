# Product Requirements Document (PRD)

**Project Name:** Arc Lobby

---

## 1. Description
Arc Lobby is a web-based, real-time social gaming platform designed for groups of friends. It features immediate, anonymous room-based onboarding, a live chat, and a collection of casual, multiplayer games. Users can create a lobby and invite friends instantly via a unique room code.

## 2. Target Users
- GenZ youth and casual gamers who want to hang out online and play light-hearted, quick games with friends without the friction of account creation, logins, or downloads.

## 3. Problem Statement
Many online party games require tedious account setups, app installations, or heavy web onboarding. Arc Lobby solves this by providing a single web-based hub with low-friction, instant-play casual games. Anyone can host a lobby, share a short link/code, and start playing with friends immediately.

## 4. Key Features
- **Zero-friction Onboarding:** No signup or login. A user visiting the site is instantly assigned a random username, emoji, and color profile stored in their browser's LocalStorage, which they can customize.
- **Lobby System:**
  - Create a private lobby with a unique 6-character room code.
  - Join an existing lobby using a room code.
  - Live members list showing who is currently in the lobby.
  - Auto-deletion of lobbies when all members leave (self-cleanup).
- **Lobby Chat:**
  - Real-time text messaging between members in the room.
  - Custom-colored messages dynamically styled according to the sender's color scheme.
  - Auto-scroll mechanisms for new messages, with manual scroll-back override.
- **Casual Game Hub & Invites:**
  - Host can create and send game sessions (invites) directly to the lobby chat.
  - Game invite cards in chat display the game name, thumbnail, selected game settings, and dynamic play buttons based on session state (Join, Spectate, Ended).
  - Support for multiple active game sessions.
- **Multiplayer Gameplay:**
  - Direct route transitions into active game screens.
  - Spectator mode for users who join ongoing games.
  - Post-game rematch button that spawns a new session and sends a new invitation card.
  - Graceful handling of player disconnections (automatic loss of turns, player removal, or session termination if all leave).

## 5. User Roles
- **Players:** Active participants in a lobby and associated games.
- **Spectators:** Lobby members who choose to watch an ongoing game instead of playing.

## 6. Core User Stories
- As a **host**, I want to click one button to get a lobby room code so I can quickly invite my friends.
- As a **guest**, I want to paste a lobby code to join my friend's room instantly without creating an account.
- As a **lobby member**, I want to chat in real-time and see who is online.
- As a **lobby member**, I want to send game invites with custom settings (e.g. lives, points, or modes) so my friends can click "Join" to start playing.
- As a **player**, I want a rematch option when a game finishes to immediately start a new match of the same game with the same settings.
- As a **spectator**, I want to click "Spectate" on an active game invite in chat to watch my friends play.