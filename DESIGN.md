# Arc Lobby — UI/UX Design Brief & Guidelines

This document establishes the official visual language, feel, vibe, and UX principles for the **Arc Lobby** project. It is written to serve as a clear, authoritative brief for any AI app builder or developer implementing or refactoring the interface.

---

## 1. The Vibe & Design Philosophy
Arc Lobby is a digital "living room" where friends gather to play casual games. The design should feel **warm, clean, modern, and instantly alive**, without being over-engineered, cluttered, or overly flashy. 

*   **Zero-Friction Entry:** The interface must look and feel like there is nothing standing between the user and playing a game. Simple onboarding, bold call-to-actions, and clear navigation are paramount.
*   **Tactile & Cozy:** The aesthetic uses deep, dark backdrops combined with vibrant, personalized user color schemes. Interactive elements feel physical through subtle hover scaling, satisfying active states, and smooth transitions.
*   **Minimalist Retro-Modern:** We lean into a clean modern layout with thin borders and soft glassmorphism, paired with crisp monospaced room codes and stats that nod to classic arcade games.

---

## 2. Design Style & Aesthetics
*   **Theme Archetype:** Premium Dark Mode (Soft Charcoal/Indigo-Gray). A dark theme minimizes eye strain and provides a perfect canvas for high-contrast player colors.
*   **Borders & Separation:** Use thin, solid borders (`1px`) in a slightly lighter shade than the background. Avoid heavy shadows or complex gradients; rely on spatial layout and border lines to organize content.
*   **Glow & Glassmorphism:** Implement subtle backdrop blurs (`backdrop-blur-md`) and semi-transparent cards to create depth. Use soft, localized color glows to draw attention to active game invites or turn indicators.
*   **Micro-Animations:** Use rapid, fluid transitions (`duration-150 ease-out`) for all interactive elements. A hovered card should scale up slightly, and active buttons should scale down slightly to feel reactive.

---

## 3. Unified Color Palette
The color scheme is designed to keep the base application clean and unobtrusive, allowing the dynamic player colors and active game indicators to shine.

| Color Token | Hex / HSL | CSS Class / Usage | Description |
| :--- | :--- | :--- | :--- |
| **Main Background** | `#0D111A`<br>`HSL(222, 25%, 8%)` | `bg-base-100` | The deep, slate-black canvas of the entire app. |
| **Secondary Background** | `#141923`<br>`HSL(222, 25%, 11%)` | `bg-base-200` | Used for sub-panels, structural layouts, and inputs. |
| **Elevated Cards** | `#1A202C`<br>`HSL(222, 25%, 15%)` | `bg-base-300` / Glass layers | Individual elements like chat bubbles and game invites. |
| **Borders & Dividers** | `#2D3748`<br>`HSL(222, 23%, 22%)` | `border-base-300` / `divide-base-300` | Crisp, low-contrast structural separator lines. |
| **Primary Accent** | `#6366F1`<br>`HSL(239, 84%, 67%)` | `btn-primary` / text-primary | Indigo. Used for primary actions (e.g., Create Lobby). |
| **Success / Action** | `#10B981`<br>`HSL(162, 76%, 41%)` | `btn-accent` / text-success | Mint Emerald. Used for positive flows (e.g., Join Game). |
| **System White** | `#F8FAFC`<br>`HSL(210, 40%, 98%)` | `text-base-content` | Crisp, readable off-white for primary text. |
| **System Gray** | `#94A3B8`<br>`HSL(215, 16%, 65%)` | `text-base-content/70` | Secondary metadata and helper text. |

### Dynamic Player Colors (Vibe Injection)
When a player joins, they are assigned a random color pair. This must contrast highly with the dark background:
*   **Backgrounds:** Semi-transparent pastel/neon fills (e.g., `rgba(16, 185, 129, 0.15)`).
*   **Foregrounds:** Matching high-vibrancy text or border outline (e.g., `#34D399`).
*   **Consistency:** Use these dynamic pairs to color-code player names, their chat bubbles, their scores, and their active status rings.

---

## 4. Typography Hierarchy
Typography is selected to balance modern readability with an interactive arcade feel.

*   **Display Font (Headings):** A clean, geometric sans-serif (like *Outfit* or *Plus Jakarta Sans*) with extra-bold weight and tight tracking.
    *   *Usage:* App Title, Lobby Code Display, Winner Announcements.
    *   *Styles:* `font-extrabold tracking-tight text-white`
*   **Body Font (Interface):** A neutral, highly readable sans-serif (like *Inter* or *System-UI*).
    *   *Usage:* Messages, buttons, instructions, usernames.
    *   *Styles:* `font-sans leading-relaxed text-slate-200`
*   **Data Font (Status & Codes):** A clean, modern monospaced font (like *JetBrains Mono* or *Fira Code*).
    *   *Usage:* Room Codes, turn timers, score counts, active player count.
    *   *Styles:* `font-mono tracking-wider font-semibold`

---

## 5. Layout Direction & Spatial Grid
All pages follow a focused, **single-viewport layout** (no body scroll, components scroll internally when needed). This keeps the app feeling like a cohesive application rather than a series of text documents.

```
+-------------------------------------------------------------+
|  [Arc Lobby Logo]                       [My Profile Card]   |
+-------------------------------------------------------------+
|                  |                                          |
|  Active Members  |                Chat Feed                 |
|  List            |                                          |
|                  |  - Player A: Hey!                        |
|  - Host (You)    |  - Player B: Let's play Tic Tac Toe      |
|  - Player B      |  +------------------------------------+  |
|  - Player C      |  | [Game Invite Card: Join/Spectate]  |  |
|                  |  +------------------------------------+  |
|                  |                                          |
|------------------+------------------------------------------|
| [Game Settings]  | [Chat Input Box]                 [Send]  |
+-------------------------------------------------------------+
```

*   **Spatial Separation:** Maintain a standard padding grid using margins and paddings of `1rem (16px)` or `1.5rem (24px)`.
*   **Desktop Structure (2-Column):**
    *   *Left Sidebar:* Compact drawer containing active members, their current game presence, and the "Launch Game" control panel.
    *   *Main Panel:* Full-height chat container with the input fixed to the bottom.
*   **Game Canvas Overlay:** When a game starts, the game screen loads directly into the main panel (or takes over the viewport), keeping secondary lobby chat accessible or floating nearby.

---

## 6. Component Styling Specifications
All components must align to these Tailwind/DaisyUI utility configurations:

### 1. Cards (Lobby Cards, Game Invites, Profile Cards)
*   **Classes:** `bg-base-200/80 backdrop-blur-md border border-base-300/50 rounded-2xl p-5 shadow-lg`
*   **Transition:** `hover:border-base-300 hover:scale-[1.01] transition-all duration-200`

### 2. Buttons
*   **Primary Action (e.g., Create Lobby):** `btn btn-primary rounded-xl font-bold px-6 tracking-wide shadow-md active:scale-95 transition-transform`
*   **Secondary Action (e.g., Join Game):** `btn btn-accent rounded-xl font-bold px-6 active:scale-95 transition-transform`
*   **Ghost/Utility Buttons:** `btn btn-ghost text-slate-400 hover:text-white rounded-xl`

### 3. Text Inputs & Selection Controls
*   **Classes:** `input input-bordered w-full bg-base-200/50 border-base-300 focus:border-primary focus:outline-none rounded-xl h-12 text-slate-200 placeholder-slate-500 font-sans`

### 4. Interactive Chat Feed
*   **Scroll Container:** Custom scrollbars that are thin and dark (`scrollbar-thin scrollbar-thumb-base-300`).
*   **Auto-Scroll UX:** Smooth scroll to bottom on new messages unless the user has scrolled up. Provide a small floating badge `"↓ New Messages"` at the bottom right if they have scrolled up.

---

## 7. Mobile Responsiveness Guidelines
Mobile performance and spacing require careful adjustments to ensure the app feels like a native mobile app.

*   **Responsive Drawer Navigation:** On screens smaller than `768px`, the Left Sidebar (members list & game launch controls) is hidden behind a hamburger icon in the header, opening as a slide-out drawer (`drawer` component in DaisyUI).
*   **Touch Targets:** Ensure all buttons, avatars, and game cells have a minimum interactive size of `44px x 44px` to avoid misclicks.
*   **Text Adjustment:** Headings scale down on mobile (e.g., `text-4xl` on desktop becomes `text-2xl` on mobile).
*   **Input Focus Safeguards:** Standardize inputs so that mobile browser keyboard overlays do not break the viewport structure (use relative height `h-[100dvh]` for the main viewport).

---

## 8. Core UX Principles
1.  **Aesthetic Continuity:** Ensure that any dynamically loaded view or sub-state shares the same dark-slate foundation, thin border style, and font pairing.
2.  **State Visibility:** The user must never wonder what is happening. Use clear loading states (`loading` spinners), system messages in chat (e.g., *"Player B joined the lobby"*), and direct turn indicators during games.
3.  **Error Handling (Friendly & Actionable):** Instead of standard generic alerts, style errors inline (e.g., *"Lobby code not found. Double-check your link!"*) using soft warning colors.
4.  **No Unlabeled Icons:** Always display a descriptive tool-tip or inline text next to icons to keep the dashboard accessible and easy to navigate for new users.