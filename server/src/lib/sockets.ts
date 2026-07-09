import { Socket } from "socket.io";
import { createUser, deleteUser, UserData } from "../features/users";
import {
  getLobbyById,
  getLobbyOfUser,
  initLobbySockets,
  joinLobby,
  leaveLobby,
} from "../features/lobbies";
import { io } from "..";
import { initMessageSockets } from "../features/message";
import {
  getGameSessionOfUser,
  initGameSessionSockets,
  removePlayerFromSession,
  deleteGameSession,
} from "../features/game-sessions";
import GAMES from "./games";

const disconnectTimeouts = new Map<string, NodeJS.Timeout>();

export function initSocket(socket: Socket) {
  const data = socket.handshake.auth.data as UserData;
  const userId = data.id || socket.id;
  socket.data.userId = userId;

  const pendingTimeout = disconnectTimeouts.get(userId);
  if (pendingTimeout) {
    clearTimeout(pendingTimeout);
    disconnectTimeouts.delete(userId);
    console.log("Client reconnected, cleared grace period:", socket.id);
  }
  createUser(userId, data);

  initLobbySockets(socket);
  initMessageSockets(socket);
  initGameSessionSockets(socket);

  socket.on("disconnect", () => {
    const userId = socket.data.userId || socket.id;

    // Immediately remove from spectators
    const gameSession = getGameSessionOfUser(userId);
    if (gameSession) {
      gameSession.spectators = gameSession.spectators.filter((s) => s !== socket.id);
    }

    // Set a debounce timeout for 5 seconds before cleaning up
    const timeout = setTimeout(() => {
      disconnectTimeouts.delete(userId);
      deleteUser(userId);

      const lobby = getLobbyOfUser(userId);
      if (lobby) {
        leaveLobby(lobby.id, userId);
        io.to(lobby.id).emit("member-update", lobby?.members);
      }
      const activeSession = getGameSessionOfUser(userId);
      if (activeSession) {
        removePlayerFromSession(activeSession.id, userId);
        io.to(activeSession.id).emit("players-update", activeSession.players);
        io.to(activeSession.id).emit("session-update", activeSession);

        if (activeSession.spectators.length === 0) {
          const game = GAMES[activeSession.gameId];
          activeSession.state = "finished";
          io.to(activeSession.lobbyId).emit("game-session-update", activeSession);
          game.onSessionEnd(activeSession);
          deleteGameSession(activeSession.id);
        }
      }
    }, 5000);

    disconnectTimeouts.set(userId, timeout);
    console.log("Client disconnected, starting grace period:", socket.id);
  });
}
