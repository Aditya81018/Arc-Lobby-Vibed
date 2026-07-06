# Lobby Room QA Test Checklist

This checklist covers the lifecycle of the Lobby Room page (`/[lobbyId]`), including entry/connection, live members panel, real-time chat, and lobby-level presence cleanup. For game session tests, see [game-session.test.md](./game-session.test.md).

## Code References
- **Lobby Page UI:** [+page.svelte](../client/src/routes/%5BlobbyId%5D/+page.svelte)
- **Lobby Layout (Socket Setup):** [+layout.svelte](../client/src/routes/%5BlobbyId%5D/+layout.svelte)
- **Lobby Controllers:** [controllers.ts](../client/src/features/lobby/controllers.ts)
- **Lobby Store:** [store.ts](../client/src/features/lobby/store.ts)
- **Messages Controller:** [controller.ts](../client/src/features/messages/controller.ts)
- **Messages Store:** [store.ts](../client/src/features/messages/store.ts)
- **LeaveLobbyButton:** [LeaveLobbyButton.svelte](../client/src/features/lobby/LeaveLobbyButton.svelte)
- **Server Lobbies Feature:** [lobbies.ts](../server/src/features/lobbies.ts)

---

## 1. Lobby Entry & Connection Lifecycle

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-ENTRY-01** | Navigate to a Valid Lobby URL (`/[lobbyId]`) | The lobby layout mounts. `GET /lobbies/:id` is called. On success, the socket emits `join-lobby`. The loading screen is displayed until the join completes, then lobby UI is rendered. | `[ ]` |
| **TC-ENTRY-02** | Navigate to a Non-existent Lobby URL | `GET /lobbies/:id` returns `null`. The client is immediately redirected back to the Landing Page (`/`). | `[ ]` |
| **TC-ENTRY-03** | Page Load While Socket is Not Yet Connected | The loading screen persists until both the socket handshake and `joinLobby` resolve. The main UI must not flash before data is ready. | `[ ]` |
| **TC-ENTRY-04** | Joining a Lobby Registers Socket in Room | After `join-lobby` is emitted, the server calls `socket.join(lobbyId)`. All subsequent `member-update` events are correctly scoped to only that lobby room. | `[ ]` |
| **TC-ENTRY-05** | Initial Members List is Fetched on Mount | After `joinLobby` resolves, `GET /lobbies/:id/members` is called. The members sidebar populates with the correct list of users (including the newly joined user). | `[ ]` |
| **TC-ENTRY-06** | Browser Back Button from Lobby | Navigating back triggers the Svelte layout's `onDestroy` cleanup. `leave-lobby` is emitted to the server, socket listeners are detached, and the server removes the user from the lobby room. | `[ ]` |

> [!WARNING]
> **Breakage Point (Invalid Lobby):** If `joinLobby` fails (e.g., the lobby was deleted between the link being shared and a new user clicking it), the redirect to `/` is the only guard. There is no user-facing error message explaining *why* the redirect occurred.

---

## 2. Members Sidebar & Real-Time Presence

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-MBR-01** | New Member Joins Lobby | When a second user joins, the server emits `member-update` with the full updated member ID list. All existing members' sidebars update to show the new user's name and avatar without a page reload. | `[ ]` |
| **TC-MBR-02** | Member Leaves Lobby (Click Leave Button) | Clicking the Leave button triggers `leave-lobby` socket event. The server broadcasts `member-update`. The leaving user is removed from all other members' sidebars. | `[ ]` |
| **TC-MBR-03** | Member Count Badge Updates | The member count badge in the sidebar header increments/decrements accurately as members join and leave. | `[ ]` |
| **TC-MBR-04** | "You" Badge Rendering | The currently logged-in user's entry in the members list is styled distinctly with a **"You"** badge and bold font. | `[ ]` |
| **TC-MBR-05** | User Avatar Color Rendering in Sidebar | Each member's name text color in the sidebar matches their assigned user `foreground` color from their profile schema. | `[ ]` |
| **TC-MBR-06** | Member Disconnects Abruptly (Tab Closed) | Server handles `disconnect`. User is removed from the lobby's `members` array, `member-update` is broadcast, and the disconnected user disappears from all other members' sidebars. | `[ ]` |
| **TC-MBR-07** | Last Member Leaves — Lobby Deleted | When the last user leaves or disconnects, `lobby.members` becomes empty, and the server calls `deleteLobby()`. The lobby no longer exists in the server's in-memory Map. Any subsequent `GET /lobbies/:id` returns `null`. | `[ ]` |
| **TC-MBR-08** | Mobile: Members Drawer Toggle | On mobile viewports (`< lg` breakpoint), the Members sidebar is hidden by default. Clicking the hamburger menu icon opens the drawer overlay. Clicking outside (the `drawer-overlay` label) closes it. | `[ ]` |

> [!NOTE]
> **Member Data Resolution:** When `member-update` fires, the layout calls `GET /lobbies/:id/members` to resolve full `UserData` objects. If a member's socket ID is in `members` but the server's user Map has been cleaned up (race condition on disconnect), that member entry may be `undefined` in the resolved data.

---

## 3. Room Code Copy Button (Header)

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-CODE-01** | Room Code Displayed in Header | The 6-character uppercase lobby ID is correctly displayed in the room code chip in the navbar. | `[ ]` |
| **TC-CODE-02** | Click Room Code Chip — Copy URL | Clicking the room code button calls `navigator.clipboard.writeText(window.location.href)`. The full lobby URL (not just the code) is copied to the clipboard. | `[ ]` |
| **TC-CODE-03** | Copy Confirmation Feedback | After clicking, the Copy icon is replaced by a green Check icon for 2 seconds, then reverts back to the Copy icon. | `[ ]` |
| **TC-CODE-04** | Copy on Insecure Context (non-HTTPS) | If `navigator.clipboard` is unavailable (non-HTTPS localhost), the copy action silently fails or throws. Verify no unhandled error crash occurs in the UI. | `[ ]` |

---

## 4. Real-Time Chat

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-CHAT-01** | Send a Text Message (Standard Flow) | Type a message and click Send (or press Enter). The `send-message` socket event is emitted with a valid `Message` object. The message appears in the chat feed for all members. | `[ ]` |
| **TC-CHAT-02** | Send Button Disabled When Input is Empty | The Send button has the `disabled` attribute when the input field is empty or contains only whitespace. No socket event is emitted. | `[ ]` |
| **TC-CHAT-03** | Whitespace-Only Message Not Sent | Type only spaces and press Enter. `message.trim() === ''` check returns true. The socket event is not emitted and the input is not cleared. | `[ ]` |
| **TC-CHAT-04** | My Message Appears on Right (`chat-end`) | Messages sent by the current user are aligned to the right side with the DaisyUI `chat-end` class. | `[ ]` |
| **TC-CHAT-05** | Other Members' Messages Appear on Left (`chat-start`) | Messages from other users appear left-aligned with `chat-start` class. | `[ ]` |
| **TC-CHAT-06** | "(You)" Label on Own Messages | The current user's `chat-header` includes a faint "(You)" annotation next to their name. | `[ ]` |
| **TC-CHAT-07** | Message Bubble Styled with Sender Color | Chat bubbles are rendered with the `background-color` from the sender's `color.background` property. The header name uses `color.foreground`. | `[ ]` |
| **TC-CHAT-08** | Input Clears After Sending | After successfully emitting the `send-message` event, the text input field is cleared to an empty string. | `[ ]` |
| **TC-CHAT-09** | Receiving a Message from Another Member | When another member sends a message, `new-message` socket event arrives. The new message is appended to `lobbyMessagesStore` and rendered in the feed. | `[ ]` |
| **TC-CHAT-10** | Message Only Received for Current Lobby | The `new-message` handler in the messages store verifies `message.roomId === get(lobbyStore).id`. Messages from other lobby rooms are silently discarded. | `[ ]` |
| **TC-CHAT-11** | Unknown Sender Fallback | If `getMemberFromId(msg.senderId)` returns `null` (sender has already disconnected), the chat header renders `'Unknown'` as the fallback name. | `[ ]` |
| **TC-CHAT-12** | Messages Store Clears on Lobby Leave | When `lobbyStore` is set to `null` (user leaves), the `lobbyMessagesStore` subscription resets the message array to `[]`. Rejoining the same lobby starts with a fresh, empty chat feed. | `[ ]` |

> [!NOTE]
> **Empty State:** When there are no messages (`$lobbyMessagesStore` is empty), the `{:else}` block in the `{#each}` renders an animated "Welcome to the Lobby!" placeholder with a `MessageSquareDashed` icon and pulse animation.

---

## 5. Chat Auto-Scroll Behavior

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-SCROLL-01** | Auto-Scroll on Page Load | On `onMount`, `scrollToBottom('instant')` is called immediately, jumping the feed to the bottom without animation. | `[ ]` |
| **TC-SCROLL-02** | Auto-Scroll When I Send a Message | Sending my own message always triggers `scrollToBottom()`, even if I have scrolled up in the feed. | `[ ]` |
| **TC-SCROLL-03** | Auto-Scroll When Near Bottom (Other's Message) | If I am within 250px of the bottom when a message arrives from another user, the feed automatically smooth-scrolls to the bottom. | `[ ]` |
| **TC-SCROLL-04** | Scroll Button Appears When Scrolled Up | If I scroll up more than 250px from the bottom and a new message arrives, the "Scroll to Bottom" button (arrow-down circle) appears in the bottom-right corner. | `[ ]` |
| **TC-SCROLL-05** | Scroll Button Navigates to Bottom | Clicking the "Scroll to Bottom" button calls `scrollToBottom()` with smooth behavior and hides the button (`showScrollButton = false`). | `[ ]` |
| **TC-SCROLL-06** | Scroll Button Hides When Manually Scrolled Back | After clicking the scroll button or manually scrolling to within 250px of the bottom, the `handleScroll` event fires and hides the scroll button. | `[ ]` |

---

## 6. Lobby Presence Cleanup & Disconnect Edge Cases

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-CLN-01** | User Disconnects from Lobby (Tab Closed) | Server `disconnect` handler fires. User is removed from the lobby's `members` array via `leaveLobby`. If the lobby still has members, `member-update` is broadcast; otherwise, the lobby is deleted from memory. | `[ ]` |
| **TC-CLN-02** | Re-entering a Deleted Lobby URL | After a lobby is deleted, navigating to its old URL causes `GET /lobbies/:id` to return `null`, and the client is redirected to `/`. | `[ ]` |
| **TC-CLN-03** | `userToLobby` Map Cleared on Leave | After a user successfully leaves a lobby, `userToLobby.delete(userId)` is called. `getLobbyOfUser(userId)` should return `undefined` for that user. | `[ ]` |
| **TC-CLN-04** | Socket Listener Cleanup on Layout Destroy | When navigating away from `/[lobbyId]`, `socket.off('member-update', ...)` and `socket.off('game-session-update', ...)` are called, ensuring no stale event listeners remain for the old lobby. | `[ ]` |
| **TC-CLN-05** | Double Leave (Leave Lobby Called When Already Left) | If `leaveLobby` is called for a user who is no longer in the lobby's `members` array, `lobby.members.indexOf(userId) === -1` returns early with `false`. No error or duplicate removal occurs. | `[ ]` |

---

## 7. Theme & Visual Consistency

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-UI-01** | Theme Toggle in Navbar | Clicking the `ThemeToggle` component in the lobby header switches between `arc-light` and `arc-dark`. All token-based CSS variables (`--color-canvas`, `--color-card`, `--color-ink`) update instantly. | `[ ]` |
| **TC-UI-02** | Send Button Theme Adaptation | In dark mode (`arc-dark`), the Send button uses `bg-accent-yellow` with dark text. In light mode, it uses `bg-primary` with white text. | `[ ]` |
| **TC-UI-03** | Brand Logo Visible on Desktop | On `lg` and above breakpoints, the "Arc" + "Lobby" brand name is visible in the header with correct ink/primary color split. It is hidden on mobile with `hidden sm:flex`. | `[ ]` |
| **TC-UI-04** | Custom Scrollbar Styling in Chat Feed | The main chat container and the members sidebar display a custom 4px-wide scrollbar with `rgba(124, 92, 252, 0.15)` thumb color, becoming `0.3` on hover. | `[ ]` |
| **TC-UI-05** | Invite Card Fade-In Animation | When a new game invite card appears in the chat feed, it renders with the `animate-fade-in` class for a smooth entrance animation. | `[ ]` |
