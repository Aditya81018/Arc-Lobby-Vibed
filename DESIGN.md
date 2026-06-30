# Design Document (DESIGN.md)

---

## 1. Visual Aesthetics & Philosophy
The site follows a **modern, solid, and clean** aesthetic. It focuses on absolute ease of use, instant visual feedback, and clear visual hierarchy.

- **Vibrant Personalization:** Each user is assigned a distinct name, emoji, and a unique color combination (foreground/background) upon visiting. This color scheme dynamically styles their profile card, chat bubble, and header presence.
- **Micro-interactions:** Interactive components (buttons, cards, game cells) should have clear hover, active, and disabled states.
- **Glassmorphism/Solid Border Styling:** Heavy use of solid thin borders (`border-base-300`), subtle cards (`bg-base-100`), badge labels, and clean dark/light backgrounds to create separation of concerns.

## 2. Palette & Theme (DaisyUI + Tailwind)
- **Primary Themes:** Uses Tailwind with DaisyUI utilities (leveraging `bg-base-100` for main panels, `bg-base-200` for secondary areas/outer layouts, and `bg-base-300` for borders/dividers).
- **Core Accents:**
  - `primary`: Accent button action triggers (e.g., You badges, Create Lobby).
  - `accent`/`secondary`: Success actions or special buttons (e.g. Chat send).
- **User Colors:** User chat bubbles use the player's personal background color, and user names are styled with their personal foreground color to keep chat lively and highly readable.

## 3. Typography
- **Headings:** Solid sans-serif with medium to bold weights (`font-medium`, `font-bold`, `font-black`).
- **Monospace accents:** Used for room codes (e.g., `#6FA3B2`) and numbers to give a tech-arcade/lobby vibe.

## 4. Key Page Layouts & Structures

### Landing Page (`/`)
- Centered, vertically aligned container.
- Simple, large heading (`Arc Lobby`).
- Inline username selector and generator UI.
- Dual action block: "Create Lobby" (Primary button) and "Join Lobby" (Input + Join action button).

### Lobby Room Page (`/[lobbyId]`)
- **Responsive Drawer:**
  - On desktop: Split screen. Left/Right sidebar listing active room members, main screen showing the room header and chat.
  - On mobile: A slide-in drawer layout toggled by a burger menu button in the header.
- **Chat Feed:**
  - Bubble-based message stream with a customized scroll container.
  - Floating arrow-down button appears if the user scrolls up, allowing an instant jump back to the bottom when new messages arrive.
- **Game Invite Cards:**
  - Styled as custom message bubbles featuring game artwork, game setting badges (e.g., Target: 3, Lives: 3), and context-aware action buttons (Join / Spectate).

### Game Session Page (`/[lobbyId]/[gameSessionId]`)
- Fullscreen focused layout.
- Floating back/leave buttons.
- Side/top panels displaying active players, their current turn, lives, scores, and connection status.
- Game canvas/grid centered, with a prominent "Next Turn" or "Turn Indicator" overlay.
- End game overlay providing instant access to the **Rematch** and **Back to Lobby** actions.