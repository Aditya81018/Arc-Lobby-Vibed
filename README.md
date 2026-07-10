# 🎮 Arc Lobby

Arc Lobby is a real-time web platform where friends can gather in virtual lobby rooms and play casual games together. It requires zero signup or account configuration, getting players into rooms and games instantly.

The platform is designed around a playful, emoji-driven interface featuring custom themes (warm cream light mode and near-black navy dark mode) and a real-time WebSocket communication layer.

---

## 🚀 Key Features

- **Zero-Friction Onboarding:** No accounts or email validation. A user is instantly assigned a random nickname, emoji, and color profile saved to the browser's `LocalStorage`.
- **Real-Time Lobby Chat:** Real-time text messaging between members in a room, dynamically styled with each user's chosen profile colors.
- **Dynamic Game Sessions:** Host launch game invites directly in the lobby chat. Lobby members can join as players or spectators.
- **Spectator Mode:** Users can spectate ongoing games at any point from the invite card.
- **Seamless Rematch Flow:** End-game screens feature a Rematch button that automatically generates a new game session using the same settings, spawns a new invite card in lobby chat, and redirects active players.
- **Reactive Self-Cleanup:** Lobbies and game sessions are held strictly in-memory. If a lobby becomes empty, or if all players/spectators leave a game session, resources are immediately garbage-collected and destroyed.
- **Turn Timeout Safety:** Server-driven turn timeouts (e.g. 10s per turn) ensure game rooms do not stall due to player inactivity.

---

## 🛠️ Technology Stack

### Frontend Client
- **Framework:** SvelteKit configured as a Single Page Application (SPA, server-side rendering disabled)
- **Styling:** Tailwind CSS + DaisyUI component library
- **WebSocket Client:** `socket.io-client` for persistent room and game subscriptions
- **Icons:** `@lucide/svelte`

### Backend Server
- **Runtime:** Node.js (v18+) with TypeScript
- **Web Framework:** Express
- **WebSocket Server:** `socket.io` for high-throughput, bi-directional events
- **Execution:** `tsx` for live hot-reloading development runtime

---

## 📁 Directory Structure

```
├── client/          # SvelteKit, Tailwind CSS, and DaisyUI frontend
│   └── src/
│       ├── components/    # Reusable UI elements (ThemeToggle, etc.)
│       ├── features/      # Feature modules (lobby, games, user, messages)
│       └── routes/        # App page router
├── server/          # Express + Socket.IO TypeScript backend
│   └── src/
│       ├── features/      # Endpoint routes and controllers (lobbies, users, games)
│       └── lib/           # Game registration and socket handlers
├── PRD.md           # Product Requirements Document
├── DESIGN.md        # UI/UX Style and Layout guidelines
├── FLOW.md          # User journeys, route mapping, and lifecycle workflows
├── TRD.md           # Server schemas, REST routes, and WebSocket protocols
└── GEMINI.md        # Rules and documentation guides for agent pairs
```

For in-depth specifications, consult the following documents:
- [PRD.md](./PRD.md) — For product specs, onboarding workflows, and core feature requirements.
- [DESIGN.md](./DESIGN.md) — For layout structure, styling theme, user-color configurations, and DaisyUI components.
- [FLOW.md](./FLOW.md) — For routing diagrams, user journey pathways, and Socket connection lifecycles.
- [TRD.md](./TRD.md) — For network data models, REST endpoints, WebSocket socket channels, and presence cleanup algorithms.

---

## 🗺️ App Routing & Lifecycle Flow

The application page structure is organized as follows:
- `/` — **Landing Page:** Handle username verification, customize color/emoji, and host or join a room.
- `/[lobbyId]` — **Lobby Room Page:** Connect to the lobby's WebSocket channel, chat with users, and spawn games.
- `/[lobbyId]/[gameSessionId]` — **Game Session Page:** Load active gameplay for a game session, handling player inputs and spectator rendering.

```mermaid
graph TD
    A[Visit Landing Page /] --> B{Choose Action}
    B -->|Create Lobby| C[Post /lobbies/ to generate ID]
    B -->|Join Lobby| D[Input Room ID]
    C --> E[Redirect to /[lobbyId]]
    D --> E
    E --> F[In Lobby: Chat & View Members]
    F -->|Invite Button| G[Post /game-sessions/ with settings]
    G --> H[Lobby Chat gets Invite Card]
    H -->|Players Join| I[Redirect players to /[lobbyId]/[gameSessionId]]
    H -->|Spectators Join| I
    I -->|Play/Spectate Game| J{Game Ends?}
    J -->|Yes| K[Show Winner / Scores / Rematch Option]
    K -->|Rematch| L[Post /rematch/ & Redirect to new Game ID]
    K -->|Back to Lobby| E
    I -->|Leave Session| E
    E -->|Leave Lobby| A
```

---

## ⚡ Quick Start (Local Development)

Both the client and server use `pnpm` as their package manager.

### 1. Run the Backend Server
Go to the server folder, install dependencies, and start the development server:
```bash
cd server
pnpm install
pnpm dev
```
By default, the server runs on `http://localhost:3000`. You can configure a custom port via a `.env` file in the server directory.

### 2. Run the Client
Go to the client folder, configure the target server URL in `.env`, install dependencies, and start the Vite dev server:
```bash
cd client
pnpm install
pnpm dev
```
Open `http://localhost:5173` (or the address printed by Vite) in your browser.

---

## 📖 Developer Guide: How to Add a New Game

Adding a new casual game to Arc Lobby requires implementing logic on both the backend server (to track turns, scores, state) and frontend client (to render the game board and UI).

### Step 1: Define the Game Logic on the Server
Every game must implement the `Game` interface defined in [`server/src/lib/games/types.ts`](./server/src/lib/games/types.ts).

1. Create a new directory under `server/src/lib/games/<your-game-id>`.
2. Implement your game controller, defining:
   - Initial game state / session variables.
   - Socket event listeners (handling player choices, turn timers, and end game state checks).
   - Rules for joinable configurations, disconnections, and game cleanups.

### Step 2: Register the Game on the Server
Add your game reference to the registration list inside [`server/src/lib/games/index.ts`](./server/src/lib/games/index.ts):
```typescript
import yourGame from "./your-game-id";

const GAMES: Record<string, Game<any>> = {
  "simple-game": simpleGame,
  "tic-tac-toe": ticTacToe,
  "your-game-id": yourGame, // Registered game
};
```

### Step 3: Implement the Game UI on the Client
1. Create a new directory under `client/src/features/games/<your-game-id>`.
2. Build a Svelte component (e.g. `YourGameUI.svelte`) to handle the UI rendering. It should accept the game state variables (such as `session`, `players`, `isPlayer`) as props.
3. Hook up client-side socket emits to trigger player moves (e.g. `socket.emit('make-move', data)`).

### Step 4: Add UI Routing Branch
Update the dynamic renderer switch inside [`client/src/routes/[lobbyId]/[gameSessionId]/+page.svelte`](./client/src/routes/[lobbyId]/[gameSessionId]/+page.svelte) to include your new game:
```svelte
<script lang="ts">
	...
	import YourGameUI from '../../../features/games/your-game-id/YourGameUI.svelte';
</script>

<div class="flex h-dvh w-screen flex-col">
	{#if $session?.gameId === 'simple-game'}
		<SimpleGameUI {...data} />
	{:else if $session?.gameId === 'tic-tac-toe'}
		<TicTacToeUI {...data} />
	{:else if $session?.gameId === 'your-game-id'}
		<YourGameUI {...data} />
	{:else}
		No session
	{/if}
</div>
```
