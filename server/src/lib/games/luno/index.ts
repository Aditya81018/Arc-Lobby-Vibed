import { Socket } from "socket.io";
import { GameSession } from "../../../features/game-sessions";
import { Game, GameSetting, ProcessedSettings } from "../types";
import { publicLinkTo } from "../../helpers";
import { io } from "../../..";
import { getUserById } from "../../../features/users";

const TURN_INTERVAL = 10 * 1000; // 10 seconds

interface Card {
  color: string;
  value: string;
}

interface DiscardedCard {
  color: string;
  value: string;
  id: string;
  rotate: number;
  x: number;
  y: number;
  zIndex: number;
  playedBy?: string;
}

interface LunoPlayer {
  id: string;
  hand: Card[];
}

interface LunoData {
  turnOf: number;
  direction: 1 | -1;
  playersData: LunoPlayer[];
  discardPile: DiscardedCard[];
  drawPileCount: number;
  nextTimestamp: number | undefined;
  message: string;
}

interface LunoSession extends GameSession {
  data: LunoData;
  nextTurn: () => void;
  handleDrawCard: (playerId: string) => void;
  handleDiscardCard: (playerId: string, cardIndex: number, chosenColor?: string) => void;
  onTimeRunOut: () => void;
  resetTimer: () => void;
}

interface LunoPrivateData {
  timerId: NodeJS.Timeout | undefined;
}

const privateData = new Map<string, LunoPrivateData>();

function getRandomCard(): Card {
  const colors = ["red", "blue", "yellow", "green", "wild"];
  const values = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "skip",
    "reverse",
    "draw-two",
    "wild-draw-four",
  ];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  let randomValue = "";

  if (randomColor === "wild") {
    randomValue = Math.random() > 0.5 ? "wild" : "wild-draw-four";
  } else {
    const standardValues = values.filter((v) => v !== "wild" && v !== "wild-draw-four");
    randomValue = standardValues[Math.floor(Math.random() * standardValues.length)];
  }
  return { color: randomColor, value: randomValue };
}

const luno: Game<LunoSession> = {
  id: "luno",
  name: "Luno",
  image: publicLinkTo("/assets/luno-image.png"),
  settings: {
    "players-count": {
      id: "players-count",
      name: "Number of Players",
      type: "pick-one",
      defaultValue: 4,
      options: [
        { name: "2", value: 2 },
        { name: "3", value: 3 },
        { name: "4", value: 4 },
      ],
    } as GameSetting<number>,
  },

  createGameSession(id: string, lobbyId: string, settings: ProcessedSettings) {
    privateData.set(id, { timerId: undefined });

    const newSession: LunoSession = {
      id,
      gameId: "luno",
      lobbyId,
      players: [],
      spectators: [],
      winner: undefined,
      settings,
      data: this.getDefaultData(settings),
      state: "waiting",

      nextTurn() {
        let attempts = 0;
        do {
          this.data.turnOf = (this.data.turnOf + this.data.direction + this.players.length) % this.players.length;
          attempts++;
        } while (this.players[this.data.turnOf] === undefined && attempts < this.players.length);
      },

      handleDrawCard(playerId) {
        if (this.state !== "ongoing") return;
        const currentActivePlayer = this.players[this.data.turnOf];
        if (currentActivePlayer !== playerId) return;

        const playerData = this.data.playersData[this.data.turnOf];
        if (!playerData) return;

        const card = getRandomCard();
        playerData.hand.push(card);
        this.data.drawPileCount = Math.max(0, this.data.drawPileCount - 1);
        if (this.data.drawPileCount <= 0) {
          this.data.drawPileCount = 40;
        }

        const user = getUserById(playerId);
        this.data.message = `${user?.name || "Someone"} drew a card`;

        this.nextTurn();
        this.resetTimer();

        io.to(this.id).emit("session-data-update", this.data);
      },

      handleDiscardCard(playerId, cardIndex, chosenColor?: string) {
        if (this.state !== "ongoing") return;
        const currentActivePlayer = this.players[this.data.turnOf];
        if (currentActivePlayer !== playerId) return;

        const playerData = this.data.playersData[this.data.turnOf];
        if (!playerData) return;

        const card = playerData.hand[cardIndex];
        if (!card) return;

        const topCard = this.data.discardPile[this.data.discardPile.length - 1];
        const isPlayable = card.color === "wild" || card.color === topCard.color || card.value === topCard.value;
        if (!isPlayable) return;

        // Discard card from hand
        playerData.hand.splice(cardIndex, 1);

        let finalColor = card.color;
        if (card.color === "wild") {
          if (chosenColor && ["red", "blue", "yellow", "green"].includes(chosenColor)) {
            finalColor = chosenColor;
          } else {
            finalColor = ["red", "blue", "yellow", "green"][Math.floor(Math.random() * 4)];
          }
        }

        // Add to discard pile
        const rotate = Math.floor(Math.random() * 26) - 13;
        const x = Math.floor(Math.random() * 21) - 10;
        const y = Math.floor(Math.random() * 17) - 8;
        const zIndex = 10 + this.data.discardPile.length;

        this.data.discardPile.push({
          color: finalColor,
          value: card.value,
          id: `${card.color}-${card.value}-${Date.now()}-${Math.random()}`,
          rotate,
          x,
          y,
          zIndex,
          playedBy: playerId,
        });

        const user = getUserById(playerId);

        // Check winner
        if (playerData.hand.length === 0) {
          const prevTimer = privateData.get(this.id)?.timerId;
          if (prevTimer) clearTimeout(prevTimer);

          this.winner = playerId;
          this.state = "finished";
          this.data.message = `${user?.name || "Someone"} has won!`;
          io.to(this.lobbyId).emit("game-session-update", this);
          io.to(this.id).emit("session-data-update", this.data);
          return;
        }

        // Apply special card effects
        let skipNext = false;
        let nextDraw = 0;

        if (card.value === "reverse") {
          if (this.players.length === 2) {
            skipNext = true;
            this.data.message = `${user?.name || "Someone"} played Reverse to get another turn`;
          } else {
            this.data.direction = (this.data.direction === 1 ? -1 : 1);
            this.data.message = `${user?.name || "Someone"} reversed direction`;
          }
        } else if (card.value === "skip") {
          skipNext = true;
          this.data.message = `${user?.name || "Someone"} skipped the next player`;
        } else if (card.value === "draw-two") {
          skipNext = true;
          nextDraw = 2;
          this.data.message = `${user?.name || "Someone"} played Draw 2`;
        } else if (card.value === "wild-draw-four") {
          skipNext = true;
          nextDraw = 4;
          this.data.message = `${user?.name || "Someone"} played Wild Draw 4 and chose ${finalColor}`;
        } else if (card.color === "wild" && card.value === "wild") {
          this.data.message = `${user?.name || "Someone"} played Wild and chose ${finalColor}`;
        } else {
          this.data.message = `${user?.name || "Someone"} played ${card.color} ${card.value}`;
        }

        // Apply skip or draws
        if (skipNext) {
          const nextPlayerIdx = (this.data.turnOf + this.data.direction + this.players.length) % this.players.length;
          if (nextDraw > 0) {
            const nextPlayerData = this.data.playersData[nextPlayerIdx];
            if (nextPlayerData) {
              for (let i = 0; i < nextDraw; i++) {
                nextPlayerData.hand.push(getRandomCard());
              }
              this.data.drawPileCount = Math.max(0, this.data.drawPileCount - nextDraw);
              if (this.data.drawPileCount <= 0) {
                this.data.drawPileCount = 40;
              }
            }
          }
          this.data.turnOf = nextPlayerIdx;
        }

        this.nextTurn();
        this.resetTimer();

        io.to(this.id).emit("session-data-update", this.data);
      },

      onTimeRunOut() {
        if (this.state !== "ongoing") return;

        const playerId = this.players[this.data.turnOf];
        if (!playerId) return;

        const playerData = this.data.playersData[this.data.turnOf];
        if (playerData) {
          playerData.hand.push(getRandomCard());
          this.data.drawPileCount = Math.max(0, this.data.drawPileCount - 1);
          if (this.data.drawPileCount <= 0) {
            this.data.drawPileCount = 40;
          }
        }

        const user = getUserById(playerId);
        this.data.message = `${user?.name || "Someone"} timed out and drew a card`;

        this.nextTurn();
        this.resetTimer();

        io.to(this.id).emit("session-data-update", this.data);
      },

      resetTimer() {
        const prevTimer = privateData.get(this.id)?.timerId;
        if (prevTimer) clearTimeout(prevTimer);

        this.data.nextTimestamp = Date.now() + TURN_INTERVAL;
        privateData.set(this.id, {
          timerId: setTimeout(() => this.onTimeRunOut(), TURN_INTERVAL + 250),
        });
      },
    };

    return newSession;
  },

  getDefaultData(settings: ProcessedSettings): LunoData {
    const playersData: LunoPlayer[] = [];
    const count = settings["players-count"] as number;

    for (let i = 0; i < count; i++) {
      const hand: Card[] = [];
      for (let j = 0; j < 7; j++) {
        hand.push(getRandomCard());
      }
      playersData.push({
        id: "",
        hand,
      });
    }

    const initialCard = getRandomCard();
    while (initialCard.color === "wild") {
      const newCard = getRandomCard();
      initialCard.color = newCard.color;
      initialCard.value = newCard.value;
    }

    return {
      turnOf: 0,
      direction: 1,
      playersData,
      discardPile: [
        {
          color: initialCard.color,
          value: initialCard.value,
          id: "initial",
          rotate: 5,
          x: 0,
          y: 0,
          zIndex: 10,
        },
      ],
      drawPileCount: 40,
      nextTimestamp: undefined,
      message: "Waiting for players...",
    };
  },

  isJoinable(session: LunoSession): boolean {
    const isSessionWaiting = session.state === "waiting";
    const hasSpaceForPlayers = session.players.length < (session.settings?.["players-count"] as number);
    return isSessionWaiting && hasSpaceForPlayers;
  },

  onPlayerJoin(session: LunoSession, playerId: string): void {
    const playerIndex = session.players.indexOf(playerId);
    if (playerIndex !== -1 && session.data.playersData[playerIndex]) {
      session.data.playersData[playerIndex].id = playerId;
    }

    if (session.players.length === session.settings["players-count"]) {
      session.state = "ongoing";
      session.data.message = "Game Started!";
      session.resetTimer();
      io.to(session.lobbyId).emit("game-session-update", session);
    }
  },

  onPlayerLeave(session: LunoSession, playerId: string): void {
    if (session.state !== "ongoing") return;

    const turnOfPlayer = session.players[session.data.turnOf];
    if (turnOfPlayer === undefined) {
      session.nextTurn();
      io.to(session.id).emit("session-data-update", session.data);
    }

    const activePlayers = session.players.filter((p) => p !== undefined);
    const startingPlayersCount = session.settings["players-count"] as number;
    if (startingPlayersCount > 1 && activePlayers.length <= 1) {
      const prevTimer = privateData.get(session.id)?.timerId;
      if (prevTimer) clearTimeout(prevTimer);

      session.state = "finished";
      session.winner = activePlayers[0] || undefined;
      io.to(session.lobbyId).emit("game-session-update", session);
    }
  },

  onSessionEnd(session: LunoSession): void {
    const prevTimer = privateData.get(session.id)?.timerId;
    if (prevTimer) clearTimeout(prevTimer);
    privateData.delete(session.id);
  },

  initSockets(session: LunoSession, socket: Socket): () => void {
    const onDrawCard = () => {
      session.handleDrawCard(socket.id);
    };

    const onDiscardCard = (cardIndex: number, chosenColor?: string) => {
      session.handleDiscardCard(socket.id, cardIndex, chosenColor);
    };

    socket.on("luno-draw-card", onDrawCard);
    socket.on("luno-discard-card", onDiscardCard);

    return () => {
      socket.off("luno-draw-card", onDrawCard);
      socket.off("luno-discard-card", onDiscardCard);
    };
  },
};

export default luno;
