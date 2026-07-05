# Landing Page Onboarding & Auth QA Test Checklist

This checklist covers the anonymous, friction-free profile onboarding, socket authentication, and lobby management logic on the Landing Page.

## Code References
- **Landing Page UI:** [+page.svelte](../client/src/routes/+page.svelte)
- **App Root Layout:** [+layout.svelte](../client/src/routes/+layout.svelte)
- **User Client Store:** [store.ts](../client/src/features/user/store.ts)
- **User Client Controllers:** [controllers.ts](../client/src/features/user/controllers.ts)
- **Socket Connection Config:** [socket.ts](../client/src/lib/socket.ts)
- **Server Socket Handlers:** [sockets.ts](../server/src/lib/sockets.ts)
- **Server Users Feature:** [users.ts](../server/src/features/users.ts)
- **Server Lobbies Feature:** [lobbies.ts](../server/src/features/lobbies.ts)

---

## 1. Onboarding & Connection Lifecycle

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-ONB-01** | First-Time Visit (LocalStorage is empty) | Page shows Loading Screen until socket connects. Upon load, random Username, Emoji, and HSL Color are generated. User data is written to LocalStorage with `id: ""`. | `[ ]` |
| **TC-ONB-02** | Return Visit (LocalStorage contains valid profile) | Initial profile is loaded from LocalStorage. Verify a new socket ID is generated and correctly merged into runtime store, but local storage stays persisted with `id: ""`. | `[ ]` |
| **TC-ONB-03** | Legacy Data Migration (LocalStorage has old HSL format) | Verify the user profile is successfully loaded, and `color` is migrated from a legacy string background to the new multi-property schema (`foregroundLight`, `backgroundLight`, etc.). | `[ ]` |
| **TC-ONB-04** | Delayed Socket Connection (Slow network) | Loading screen remains visible. Main page contents must be blocked from rendering until the socket is successfully connected and the initial games list is loaded. | `[ ]` |

> [!WARNING]
> **Breakage Point (Hang State):** If the server is offline or unreachable, Svelte's root layout [+layout.svelte](../client/src/routes/+layout.svelte) does not define any timeout for the socket connection. The page will hang indefinitely on the loading screen.

---

## 2. Profile Customization (Display Name)

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-NAME-01** | Valid Name Edit (e.g., "Alice") | Click display name input, edit, then press Enter or click outside (blur). The new name is saved locally and synced to the server (`PUT /users/:id`). | `[ ]` |
| **TC-NAME-02** | Too Short Name (< 3 chars, e.g., "Jo") | Input name, then press Enter or click outside. Verify the name is discarded and resets back to the last valid name. | `[ ]` |
| **TC-NAME-03** | Boundary Limit (max 18 chars) | Verify that typing beyond 18 characters is blocked dynamically in the input field. | `[ ]` |
| **TC-NAME-04** | Empty / Space-only Name | Trimmed name is empty. Verify it is rejected and resets back to the last valid name. | `[ ]` |
| **TC-NAME-05** | Randomize Name / Dice Click | Click the Dices button. A new random name and avatar are generated. Draft updates instantly, updating LocalStorage and the server. | `[ ]` |

---

## 3. Profile Customization (Emoji & Color Avatar)

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-AV-01** | Open Emoji Modal | Click the current emoji avatar. The dialog modal pops up showing categorized tabs. | `[ ]` |
| **TC-AV-02** | Select Emoji from Grid | Navigate categories, click an emoji. Modal closes, and the avatar changes to the selected emoji instantly. | `[ ]` |
| **TC-AV-03** | Dismiss Emoji Modal | Click the "✕" button or click/tap the backdrop. Modal closes without changing the user's current avatar. | `[ ]` |
| **TC-AV-04** | Choose Preset Color | Click any of the 20 preset color circles in the horizontal list. Avatar background, text colors, and selection outline indicator update dynamically. | `[ ]` |

> [!NOTE]
> **Aesthetic Theme Check:** Ensure the text colors inside the username input box and the avatar preview automatically adapt to light or dark theme state based on HSL lightness variables.

---

## 4. Lobby Operations (Host & Join)

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-LOB-01** | Create Lobby (Standard Flow) | Click **Create Lobby**. Button displays loader/spinner and is disabled. REST request is sent (`POST /lobbies/`). On success, redirects client to `/[lobbyId]`. | `[ ]` |
| **TC-LOB-02** | Create Lobby Fail (Offline API) | Click **Create Lobby**. If HTTP API fails, button loader disappears, button is re-enabled, and the user remains on the landing page safely. | `[ ]` |
| **TC-LOB-03** | Lobby Code Input Auto-Sanitization | Type lowercase/special characters (e.g., `abc-1 2`). Input is automatically converted to uppercase and stripped of non-alphanumeric chars (`ABC12`). | `[ ]` |
| **TC-LOB-04** | Join Lobby (Valid 6-char Room Code) | Input valid room code, click **Join Lobby**. Button disables and displays spinner. Clears previous errors, verifies code (`GET /lobbies/:id`), and redirects to `/[lobbyId]`. | `[ ]` |
| **TC-LOB-05** | Join Lobby (Non-existent Room Code) | Input invalid 6-char code. Verify it displays error message: `"Invalid room code. Please check and try again."` Button resets. | `[ ]` |
| **TC-LOB-06** | Join Lobby Fail (Network Error) | Trigger API network failure during verification. Verify it displays error message: `"An error occurred. Please try again."` Button resets. | `[ ]` |
| **TC-LOB-07** | Typing Clears Errors | Type any character in the room code input field while an error is shown. Verify the error message disappears immediately. | `[ ]` |

---

## 5. Session Synchronization & Presence Cleanup

| Test Case ID | Test Scenario / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| **TC-SYNC-01** | Profile Changes Sync to Server | Modify profile details. Verify Svelte store triggers an HTTP `PUT` request to `/users/${socket.id}` containing the modified data. | `[ ]` |
| **TC-SYNC-02** | Page Refresh / Re-connection | Refresh landing page. User keeps customized name/avatar from LocalStorage, is assigned a new Socket ID, and is registered again on the server. | `[ ]` |
| **TC-SYNC-03** | Session Disconnect Cleanup | Close tab or disconnect connection. Server must delete the user from its memory Map, remove them from any joined lobby, and broadcast a `member-update` to the lobby. | `[ ]` |
