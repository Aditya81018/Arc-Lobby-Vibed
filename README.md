# Arc Lobby

Arc Lobby is a real-time web platform where friends can gather in virtual lobby rooms and play casual games together. It requires zero signup or account configuration, getting players into rooms and games instantly.

## Key Features
- **Zero-Friction Onboarding:** Users get random, persistent nickname/avatar combinations stored locally.
- **Real-Time Lobby Chat:** Chat instantly with room members in customized chat bubbles.
- **Dynamic Game Sessions:** Launch multiplayer game sessions directly from the lobby chat (e.g. Tic Tac Toe or Simple Game).
- **Spectator Mode:** Join ongoing games as a spectator.
- **Auto-Cleanup:** In-memory lobbies and sessions are automatically cleaned up when users disconnect or rooms become empty.

---

## Directory Structure

```
├── client/          # SvelteKit, Tailwind CSS, and DaisyUI frontend
├── server/          # Express + Socket.IO TypeScript backend
├── PRD.md           # Product Requirements Document
├── DESIGN.md        # UI/UX Style and Layout guidelines
├── FLOW.md          # User journeys, route mapping, and lifecycle workflows
├── TRD.md           # Server schemas, REST routes, and WebSocket protocols
└── GEMINI.md        # Rules and documentation guides for agent pairs
```

---

## Quick Start (Local Development)

Both client and server use `pnpm` as their package manager.

### 1. Run the Backend Server
Go to the server folder, configure your port, and start the development server:
```bash
cd server
pnpm install
pnpm dev
```
By default, the server runs on `http://localhost:3000`.

### 2. Run the Client
Go to the client folder, configure the `PUBLIC_SERVER_URL` in `.env`, and start the development server:
```bash
cd client
pnpm install
pnpm dev
```
Open `http://localhost:5173` (or the address printed by Vite) in your browser.

---

## Project Documentation
For technical designs, layouts, sockets, or product flows, check:
- [PRD.md](./PRD.md)
- [DESIGN.md](./DESIGN.md)
- [FLOW.md](./FLOW.md)
- [TRD.md](./TRD.md)
