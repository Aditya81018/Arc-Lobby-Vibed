# App Flow Document (FLOW.md)

---

## 1. Routes & Page Architecture
The client-side routing is organized in SvelteKit as follows:
- `/` - **Landing Page**
  - Prompt to verify/enter username.
  - Buttons to create a lobby or join an existing lobby by ID.
- `/[lobbyId]` - **Lobby Room Page**
  - Layout manages the primary Socket.IO connection and joins the room.
  - Displays the active chat feed, members list, and game session invitations.
- `/[lobbyId]/[gameSessionId]` - **Game Session Page**
  - Layout manages the game-session socket room connection.
  - Renders the specific game UI (e.g. Tic Tac Toe, Simple Game) dynamically based on `session.gameId`.

---

## 2. Core User Journey Flow

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

## 3. Detailed Step-by-Step Flow Details

### Phase 1: Onboarding & Entry
1. **Landing Page (`/`):**
   - The user has their random `userData` profile loaded/saved via LocalStorage. They can update their name.
   - Clicking **Create Lobby** fires `POST /lobbies/` on the server. The server returns a new lobby object. The client navigates to `/[lobbyId]`.
   - Entering a 6-character room ID and clicking **Join Lobby** triggers `joinLobby` on the client. It checks if the lobby exists (`GET /lobbies/:id`) and redirects.

### Phase 2: The Lobby Experience
2. **Connecting to Lobby (`/[lobbyId]`):**
   - Svelte route layout mounts, triggering the socket client to emit `join-lobby`.
   - The client registers socket listeners: `member-update` (updates the list of active members in state) and `game-session-update` (tracks changes to games launched within this lobby).
   - Typing in the input and clicking Send triggers the socket event `send-message`. A chat card is broadcasted to all lobby members.

### Phase 3: Game Session Lifecycle
3. **Spawning a Game:**
   - A lobby member clicks the game controller icon, chooses a game (e.g. Tic Tac Toe or Simple Game), configures settings, and submits.
   - The client triggers `POST /game-sessions/` with the selected settings.
   - The server creates a game session and automatically triggers a chat message of type `game-session-invite` containing the new session's ID.
   - The invite card displays the live status. Other users click **Join** (as players) or **Spectate**.
   - Clicking Join triggers `POST /game-sessions/:id/join` to assign the player, and redirects the client to `/[lobbyId]/[gameSessionId]`.

4. **Active Gameplay (`/[lobbyId]/[gameSessionId]`):**
   - The game session layout emits `join-game-session`.
   - The server sets up custom game-socket listeners (e.g. `place-token` for Tic Tac Toe, `option-select` for Simple Game) for the socket channel.
   - When the game state updates on the server, it broadcasts `session-data-update` to keep all clients in sync.
   - Once a win condition or draw is reached, the server marks the state as `finished`, and updates the lobby session.
   - The end-game screen displays options: **Rematch** or **Back to Lobby**.

5. **Rematch Flow:**
   - A player clicks **Rematch**.
   - The client triggers `POST /game-sessions/:id/rematch`.
   - The server spawns a new game session using the same settings, stores the mapping in `rematchRecord`, emits a `rematch` event redirecting current players, and sends a fresh invite card to the lobby chat.

---

## 4. Presence & Auto-cleanup Flows
- **Socket Disconnects (Tabs Closed / Connection Lost):**
  - The server handles `disconnect` reactively.
  - If a user dispatches from a lobby: the server leaves the room and broadcasts `member-update`. If the lobby is now empty (0 members), the lobby is deleted.
  - If a user dispatches from a game: the server runs `onPlayerLeave` for that game (e.g. forfeit/ending turn) and updates the session players list. If all players and spectators have left the session, the session is deleted.
- **Route Layout Destructions (Navigating away):**
  - When Svelte layouts unmount (navigating back to lobby or landing page), the cleanups explicitly trigger `leaveLobby` / `leaveGameSession` REST requests and remove socket event listeners.