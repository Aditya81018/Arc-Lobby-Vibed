# Technical Requirements Document (TRD)

---

## 1. System Architecture
Arc Lobby uses a client-server architecture. All real-time synchronization is driven by Socket.IO over HTTP. 

```
  +-----------------------+              +------------------------+
  |  SvelteKit App (SPA)  | <==========> |  Express TS Server     |
  |  (Tailwind + DaisyUI) |   WebSockets |  (Socket.IO Server)    |
  +-----------------------+   & REST API +------------------------+
```

---

## 2. Technology Stack

### Frontend Client
- **Framework:** SvelteKit configured as a Single Page Application (SPA) with SSR disabled (`ssr = false` in `+layout.js`).
- **Styling:** Tailwind CSS + DaisyUI component library.
- **WebSocket Client:** `socket.io-client`.
- **Icons:** `@lucide/svelte` for UI indicators.
- **Deployment Adapter:** Vercel.

### Backend Server
- **Runtime:** Node.js (v18+) with TypeScript (`tsx` for dev runtimes).
- **Web Framework:** Express.
- **WebSocket Server:** `socket.io` for bidirectional communication.
- **Transpilation:** TypeScript, target ESNext.

---

## 3. Data Models & Schemas

### User Profile (`UserData`)
```typescript
interface UserData {
  id: string; // Socket ID (refreshed per connection)
  name: string; // Display Name (randomly assigned or customized)
  emoji: string; // Profile Emoji
  color: {
    foreground: string; // CSS color string
    background: string; // CSS color string
  };
}
```

### Lobby
```typescript
interface Lobby {
  id: string; // Unique 6-character uppercase string
  members: string[]; // List of member UserData IDs (Socket IDs)
}
```

### Message (Chat & Invites)
```typescript
interface Message {
  id: string;
  roomId: string;
  senderId: string;
  type: "text" | "game-session-invite";
  content: string; // Text string or GameSession ID
  timestamp: number;
}
```

### Game Session
```typescript
interface GameSession {
  id: string; // Unique 6-character uppercase session ID
  gameId: string; // ID of the registered game (e.g. 'tic-tac-toe', 'simple-game')
  lobbyId: string; // ID of the parent lobby
  players: (string | undefined)[]; // Array of player IDs (aligned to slot index)
  spectators: string[]; // List of spectator Socket IDs
  winner: string | undefined; // Winner Socket ID, 'draw', or undefined
  settings: Record<string, unknown>; // Custom configuration variables
  data: any; // Dynamic game state variables (turn indexes, board moves, scores)
  state: "waiting" | "ongoing" | "finished";
}
```

---

## 4. REST API Endpoint Mapping

### User Management
- `PUT /users/:id` - Updates/registers the user's custom name, color, and emoji profile under their active socket ID.

### Lobbies
- `GET /lobbies/` - Lists all currently active lobbies.
- `POST /lobbies/` - Creates a new lobby with a unique 6-character uppercase ID and returns the object.
- `GET /lobbies/:id` - Retrieves lobby info for the specified ID.
- `GET /lobbies/:id/members` - Returns the full list of `UserData` objects for members currently in that lobby.

### Games & Game Sessions
- `GET /games/` - Retrieves configurations of all registered games.
- `GET /game-sessions/:id` - Retrieves the details of a specific game session.
- `POST /game-sessions/` - Creates a new game session using the payload: `{ gameId, lobbyId, settings }`.
- `POST /game-sessions/:id/join` - Adds a player to the session's player list. Triggers `players-update` socket events.
- `POST /game-sessions/:id/leave` - Removes a player from the session (handles waiting vs. ongoing states differently).
- `POST /game-sessions/:id/rematch` - Generates a new session matching the current game settings and emits a redirection event.

---

## 5. WebSockets Event Protocol

### General Connection Handshake
- **Connection Auth:** The client passes the user profile data in the handshake (`auth: { data: userData }`).
- **Connection Event:** The server creates the `UserData` entry and binds sockets. On connection, the client updates its local user ID to match the connection's socket ID (`socket.id`).

### Room Management Sockets
- `join-lobby` / `leave-lobby` (Client -> Server): Subscribes or unsubscribes a client socket from the lobby's room.
- `member-update` (Server -> Client): Dispatches the complete string list of socket IDs inside the room.

### Chat Sockets
- `send-message` (Client -> Server): Publishes a chat message object to be broadcasted to the room.
- `new-message` (Server -> Client): Relays a new message to all clients in the room.

### Game Sockets
- `join-game-session` / `leave-game-session` (Client -> Server): Registers/unregisters a client from a game session channel.
- `players-update` (Server -> Client): Broadcasts the updated array of player slots.
- `session-data-update` (Server -> Client): Broadcasts the mutated game-state variables (`session.data`).
- `game-session-update` (Server -> Client): Broadcasts configuration updates of a game session to the general lobby.
- `rematch` (Server -> Client): Broadcasts a rematch trigger, containing the new game session ID, to prompt instant redirection.
- Game-Specific Actions:
  - `place-token` (Tic-Tac-Toe): Sent by client with the selected cell index.
  - `option-select` (Simple Game): Sent by client with the selected number choice.

---

## 6. Security Requirements
- **No Database Persistence:** Storing data strictly in-memory mitigates SQL injection, database leakage, or persistent cross-site scripting (XSS) issues.
- **Input Sanitization:** Validate user-supplied lobby/session IDs to ensure they are alphanumeric and match simple formatting before performing Map lookups.
- **REST Validation:** Ensure route requests to join sessions verify that the lobby/session contains appropriate slot space and is in the correct state.

---

## 7. Performance & Cleanup Requirements
- **Low Latency:** Instant response time is achieved by keeping all active game models in-memory on the server and communicating solely via WebSockets.
- **Reactive Garbage Collection (Cleanup):**
  - Upon socket disconnection (`disconnect` event), the server removes the user from their lobby and game sessions.
  - If a lobby has 0 members remaining, it is immediately deleted.
  - If a game session has 0 spectators/players, the session timer is cleared and the session object is deleted.
- **Turn Timeout Safety:** Timeouts (e.g. 10s per turn) are handled on the server using `NodeJS.Timeout` variables per session, ensuring games do not stall due to player inactivity.
