# Game Session QA Test Checklist

This checklist covers the full lifecycle of game sessions within a Lobby Room, including the game invite modal, session creation and invite cards in chat, joining and spectating, the in-room game session layout, the rematch system, session-specific presence cleanup, and server-side security.

## Code References
- **Game Session Layout:** [+layout.svelte](../client/src/routes/%5BlobbyId%5D/%5BgameSessionId%5D/+layout.svelte)
- **Game Sessions Controller:** [controller.ts](../client/src/features/game-sessions/controller.ts)
- **Game Sessions Store:** [store.ts](../client/src/features/game-sessions/store.ts)
- **SendGameInviteButton:** [SendGameInviteButton.svelte](../client/src/features/game-sessions/SendGameInviteButton.svelte)
- **JoinGameSessionButton:** [JoinGameSessionButton.svelte](../client/src/features/game-sessions/JoinGameSessionButton.svelte)
- **SpectateGameSessionButton:** [SpectateGameSessionButton.svelte](../client/src/features/game-sessions/SpectateGameSessionButton.svelte)
- **RematchButton:** [RematchButton.svelte](../client/src/features/game-sessions/RematchButton.svelte)
- **Lobby Page UI:** [+page.svelte](../client/src/routes/%5BlobbyId%5D/+page.svelte)
- **Lobby Layout (Socket Setup):** [+layout.svelte](../client/src/routes/%5BlobbyId%5D/+layout.svelte)
- **Server Game Sessions Feature:** [game-sessions.ts](../server/src/features/game-sessions.ts)
- **Server Lobbies Feature:** [lobbies.ts](../server/src/features/lobbies.ts)

---

## 1. Game Invite Modal (SendGameInviteButton)

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-MODAL-01** | Open Game Invite Modal | Clicking the Gamepad icon button opens the DaisyUI `dialog` modal. The game selection grid is shown. `selectedGame` is reset to `null` and `settingsValues` is cleared. | `[ ]` |
| **TC-MODAL-02** | Game Selection Grid Renders Available Games | The modal displays all games from `$gamesStore` as image cards in a 2-3 column grid. | `[ ]` |
| **TC-MODAL-03** | Select a Game — Navigate to Settings View | Clicking a game card calls `handleGameSelect`. `selectedGame` is set. Default values from `game.settings` are pre-populated into `settingsValues`. The settings configuration view is shown. | `[ ]` |
| **TC-MODAL-04** | Back Arrow Returns to Game Selection | Clicking the `ChevronLeft` back button resets `selectedGame` to `null`, returning to the games grid without closing the modal. | `[ ]` |
| **TC-MODAL-05** | `boolean` Setting Renders as Toggle | A game setting with `type: 'boolean'` renders as a DaisyUI `toggle` checkbox. Toggling updates `settingsValues[setting.id]`. | `[ ]` |
| **TC-MODAL-06** | `pick-one` Setting Renders as Exclusive Button Group | A `pick-one` setting renders option buttons. Clicking one highlights it (primary style), deselecting the previously selected option. | `[ ]` |
| **TC-MODAL-07** | `pick-many` Setting Renders as Multi-Select Buttons | A `pick-many` setting allows multiple options to be selected simultaneously. The `toggleMultiSelect` function adds/removes values from the array in `settingsValues[setting.id]`. | `[ ]` |
| **TC-MODAL-08** | Send Invite Button is Only Shown After Game Selection | The "Send Game Invite" footer button only renders when `selectedGame !== null`. It is not shown on the game selection grid view. | `[ ]` |
| **TC-MODAL-09** | Dismiss Modal via "✕" Button | Clicking the X button calls `closeModal()`. The dialog closes without creating a session or changing state. | `[ ]` |
| **TC-MODAL-10** | Dismiss Modal via Backdrop Click | Clicking the `modal-backdrop` form (outside the modal box) closes the dialog without creating a session. | `[ ]` |

---

## 2. Game Session Creation & Invite Card in Chat

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-INV-01** | Send Game Invite (Standard Flow) | Clicking "Send Game Invite": (1) `POST /game-sessions/` creates a session. (2) `socket.emit('send-message', ...)` sends a `game-session-invite` message to the lobby. (3) The user is joined as a player (`POST /game-sessions/:id/join`). (4) The user is redirected to `/[lobbyId]/[gameSessionId]`. | `[ ]` |
| **TC-INV-02** | Loading State During Invite Sending | When "Send Game Invite" is clicked, `isLoading = true` is set, the loading overlay shows, and the button is disabled to prevent double submission. | `[ ]` |
| **TC-INV-03** | Invite Card Appears in All Members' Chat Feeds | All lobby members receive the `new-message` socket event. Because the `type` is `game-session-invite`, the store fetches the session via `GET /game-sessions/:id` and stores it in `gameSessionsStore`. The invite card renders in all members' chat feeds. | `[ ]` |
| **TC-INV-04** | Invite Card Shows Game Thumbnail & Name | The invite card correctly displays the `game.image` thumbnail and `game.name` for the associated game. | `[ ]` |
| **TC-INV-05** | Invite Card Shows Settings Chips | All `gameSession.settings` key-value pairs are displayed as small badge chips. Boolean values display as "Yes"/"No". Arrays display their length. | `[ ]` |
| **TC-INV-06** | Invite Card "Waiting" State Renders Join & Spectate Buttons | When `gameSession.state === 'waiting'`, the invite card footer shows both **Join Game** and **Spectate** buttons in a 2-column grid. | `[ ]` |
| **TC-INV-07** | Invite Card "Ongoing" State Shows Only Spectate Button | When `gameSession.state === 'ongoing'` (game has started), the Join button disappears and only the **Spectate** button is shown. | `[ ]` |
| **TC-INV-08** | Invite Card "Finished" State Shows Winner or Draw | When `gameSession.state === 'finished'`: if `winner` is a player ID, show their avatar and name with "Won! 🏆". If `winner === 'draw'`, show "🤝 Game Draw". If `winner` is `undefined`, show "Game Ended". | `[ ]` |
| **TC-INV-09** | Invite Card Shows "Game Expired" If Session Deleted | If the game session was deleted from the server before the card is rendered (e.g., all spectators left), `$gameSessionsStore[msg.content]` is `undefined`. The card renders an error bubble: `"Invite expired or game not found."` | `[ ]` |
| **TC-INV-10** | Multiple Invite Cards in One Chat Feed | Sending multiple game invites creates multiple independent invite cards in the chat. Each card tracks its own session state independently via `gameSessionsStore`. | `[ ]` |
| **TC-INV-11** | Invite Card Updates Reactively | When `game-session-update` socket event arrives (e.g., a player joins making the game "ongoing"), the corresponding invite card in the chat feed reactively updates its state and buttons without any manual refresh. | `[ ]` |

> [!WARNING]
> **Race Condition (Invite Card):** The `new-message` store handler fetches the game session asynchronously (`await getGameSessionById(...)`). If the fetch is slow or the session is deleted before the fetch resolves, `gameSession` will be `null` and will not be stored, causing the invite card to render the "expired" state even if the game is still active.

---

## 3. Joining a Game Session (as Player)

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-JOIN-01** | Click "Join Game" on a Waiting Session | `handleJoinGameSession` is called. `isLoading = true`. `POST /game-sessions/:id/join` is sent with the user's socket ID. On success, the user is redirected to `/[lobbyId]/[gameSessionId]`. | `[ ]` |
| **TC-JOIN-02** | Loading Screen While Joining | After clicking "Join Game", a full-screen loading overlay appears while the HTTP request resolves, preventing double-click abuse. | `[ ]` |
| **TC-JOIN-03** | Joining Triggers `players-update` Socket Event | The server's join endpoint emits `players-update` to the game session room. All clients subscribed to that session see the updated player slots. | `[ ]` |
| **TC-JOIN-04** | Joining a Full Session Fails Gracefully | If the session is at player capacity (`isJoinable` returns false), the `POST /game-sessions/:id/join` returns a 404 error. `isLoading` is reset to `false`. The user stays on the lobby page. | `[ ]` |
| **TC-JOIN-05** | Player Already in Session Cannot Join Again | The server's `addPlayerToSession` checks `!session.players.includes(playerId)`. If the same socket ID tries to join a second time, it is rejected, and no duplicate entry is added. | `[ ]` |

---

## 4. Spectating a Game Session

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-SPEC-01** | Click "Spectate" on a Waiting Session | Clicking **Spectate** calls `goto(resolve(`/\${lobbyId}/\${gameSessionId}`))`. The user navigates to the game session page without calling `POST /game-sessions/:id/join`. | `[ ]` |
| **TC-SPEC-02** | Click "Spectate" on an Ongoing Session | The Spectate button navigates to the game session URL. The game session layout fetches the current session state and renders the live game view. | `[ ]` |
| **TC-SPEC-03** | Spectator Appears in Session `spectators` Array | On the game session layout mount, `join-game-session` is emitted. The server pushes the socket ID to `session.spectators`. The spectator receives `session-data-update` events but is not a `players` slot. | `[ ]` |
| **TC-SPEC-04** | Spectator Leaving Does Not Affect Game State | A spectator navigating away from the game session page triggers `leave-game-session`. If other spectators/players remain, the game session continues uninterrupted. | `[ ]` |

---

## 5. Game Session Room Entry & Layout

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-GSR-01** | Navigate to Game Session URL (Valid) | The game session layout fetches `GET /game-sessions/:id`. If `gameSession.lobbyId` matches the URL's `lobbyId`, the session is set in `currentGameSessionStore` and the loading screen is removed. | `[ ]` |
| **TC-GSR-02** | Navigate to Game Session URL (Invalid Session ID) | If `GET /game-sessions/:id` returns null or the `lobbyId` does not match, the user is redirected back to `/[lobbyId]`. | `[ ]` |
| **TC-GSR-03** | Socket Room Joined on Mount | On successful session load, `join-game-session` is emitted, registering the user as a spectator on the server and subscribing them to `players-update` and `session-data-update` events. | `[ ]` |
| **TC-GSR-04** | Players List Initializes from Session Fetch | `currentGameSessionPlayersStore` is populated via `getLocalMembers(gameSession.players)` from the initial fetch, resolving player socket IDs to full `UserData` objects. | `[ ]` |
| **TC-GSR-05** | `session-data-update` Event Updates Game State | When the server broadcasts `session-data-update`, the layout handler updates `$currentGameSessionStore.data`, and any reactive game UI (board state, scores, turn indicators) re-renders automatically. | `[ ]` |
| **TC-GSR-06** | Cleanup on Game Session Layout Destroy | Navigating away calls `leaveGameSession(gameSessionId)` (REST), emits `leave-game-session` socket event, clears `currentGameSessionStore` and `currentGameSessionPlayersStore`, and removes socket listeners. | `[ ]` |

---

## 6. Rematch Flow

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-RMT-01** | Player Initiates Rematch | Clicking **Rematch** calls `POST /game-sessions/:id/rematch` with the initiator's `playerId`. The server creates a new session with the same game settings and responds with the new session object. | `[ ]` |
| **TC-RMT-02** | Rematch Invite Card Appears in Lobby Chat | On the server, a `game-session-invite` message is sent to the lobby room (`sendMessage`). All lobby members see a new invite card for the rematch session in the chat feed. | `[ ]` |
| **TC-RMT-03** | `rematch` Socket Event Triggers Incoming Request UI | The server emits `rematch(newSessionId, playerId)` to the game session room. All other clients in that room receive the event and see the "Incoming Rematch Request" overlay modal with the initiator's name and avatar. | `[ ]` |
| **TC-RMT-04** | Accept Rematch (Session Still Waiting) | If the new session `state === 'waiting'`, the incoming modal shows **Accept** and **Decline** buttons. Clicking Accept calls `POST /game-sessions/[newId]/join` and redirects via `/{lobbyId}/redirect?to=...`. | `[ ]` |
| **TC-RMT-05** | Accept Rematch (Session Ongoing — Missed It) | If the new session has already started (`state === 'ongoing'`), the modal shows a **Spectate** button instead of Accept. Clicking it navigates to the new game session as a spectator. | `[ ]` |
| **TC-RMT-06** | Decline Rematch | Clicking **Decline** calls `goBackToLobby()`, navigating the user back to `/[lobbyId]`. The new session is not joined. | `[ ]` |
| **TC-RMT-07** | Idempotent Rematch (Second Click) | If a player clicks Rematch a second time before the new session is joined, the server checks `rematchRecord.get(gameSessionId)`. The existing new session is returned instead of creating a duplicate. | `[ ]` |
| **TC-RMT-08** | Rematch Initiator Auto-Joins New Session | The rematch flow immediately calls `joinGameSession(gameSession.id)` and redirects the initiator to the new game session via the redirect route. | `[ ]` |

> [!WARNING]
> **Rematch Edge Case:** If the new rematch session has already been deleted from the server by the time a player clicks **Accept** (e.g., everyone else left), `joinGameSession` will fail. The `catch` block in `handleAcceptRematch` falls back to a raw `goto` to the new session URL, which will itself be redirected back to the lobby by the session layout's validation check.

---

## 7. Game Session Presence Cleanup & Disconnect Edge Cases

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-CLN-01** | User Disconnects During Active Game | Server removes the user from their game session. `onPlayerLeave` game logic runs (e.g., forfeit, game end). `players-update` is emitted to the session room. If all spectators/players have left, the session is deleted. | `[ ]` |
| **TC-CLN-02** | Ongoing Game — One Player Disconnects | The disconnecting player's slot in `session.players` is set to `undefined` (not removed). `onPlayerLeave` may trigger a forfeit or AI takeover depending on game logic. The game session room receives a `players-update`. | `[ ]` |
| **TC-CLN-03** | All Players/Spectators Disconnect — Session Cleanup | When the last spectator leaves via `leave-game-session`, the session's `spectators` array is empty. The server marks the session `state: 'finished'`, emits `game-session-update` to the lobby, calls `onSessionEnd`, and deletes the session. | `[ ]` |
| **TC-CLN-04** | Lobby Deleted — Orphaned Sessions Not Auto-Cleaned | When a lobby is deleted (all members left), associated game sessions that are still active are not automatically cleaned up (since cleanup is spectator-driven). Any orphaned sessions remain until their last spectator disconnects. | `[ ]` |
| **TC-CLN-05** | Socket Listener Cleanup on Game Session Layout Destroy | When navigating away from `/[lobbyId]/[gameSessionId]`, `socket.off('players-update', ...)` and `socket.off('session-data-update', ...)` are called, ensuring no stale event listeners remain. | `[ ]` |

---

## 8. Server-Side Input Validation & Security

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-SEC-01** | `POST /game-sessions/:id/join` with Missing `playerId` | `POST /game-sessions/:id/join` without a `playerId` body field returns `400 { error: "Missing playerId" }`. | `[ ]` |
| **TC-SEC-02** | `POST /game-sessions/:id/join` for Non-existent Session | If the `sessionId` is not found in the server's `gameSessions` Map, `addPlayerToSession` returns `false` and the route responds with `404 { error: "Failed to join session" }`. | `[ ]` |
| **TC-SEC-03** | `POST /game-sessions/:id/rematch` for Non-existent Session | If the `gameSessionId` is not found, the handler returns early with no response body (implicit undefined response). This should be verified to not crash the server. | `[ ]` |
| **TC-SEC-04** | In-Memory Only — No Persistence Between Server Restarts | Restarting the server clears all in-memory `gameSessions` Maps. Clients with existing game session URLs can no longer join or reconnect to those sessions. | `[ ]` |
| **TC-SEC-05** | Cross-Lobby Game Session Access Attempt | Navigating to `/[lobbyIdA]/[gameSessionIdB]` where `gameSessionIdB.lobbyId !== lobbyIdA` is caught by the game session layout validation, redirecting the user to `/[lobbyIdA]`. | `[ ]` |
