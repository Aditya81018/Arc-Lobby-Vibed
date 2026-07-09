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
import fs from "fs";

const disconnectTimeouts = new Map<string, NodeJS.Timeout>();
const userSockets = new Map<string, Set<string>>();

function logToFile(msg: string) {
  if (process.env.ENV !== "DEV") return;
  try {
    fs.appendFileSync("/home/aditya/Documents/Projects/Arc-Lobby-Vibed/debug.log", `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {
    console.error("Failed to write to debug.log", e);
  }
}

export function initSocket(socket: Socket) {
  const data = socket.handshake.auth.data as UserData;
  const userId = data.id || socket.id;
  socket.data.userId = userId;

  logToFile(`CONNECT: socket=${socket.id} user=${userId} name=${data?.name || "N/A"}`);

  // Track active socket connection
  let socketsSet = userSockets.get(userId);
  if (!socketsSet) {
    socketsSet = new Set();
    userSockets.set(userId, socketsSet);
  }
  socketsSet.add(socket.id);

  const pendingTimeout = disconnectTimeouts.get(userId);
  if (pendingTimeout) {
    clearTimeout(pendingTimeout);
    disconnectTimeouts.delete(userId);
    logToFile(`RECONNECT: cleared grace period for user=${userId}`);
    console.log("Client reconnected, cleared grace period:", socket.id);
  }
  createUser(userId, data);

  initLobbySockets(socket);
  initMessageSockets(socket);
  initGameSessionSockets(socket);

  socket.on("disconnect", () => {
    const userId = socket.data.userId || socket.id;
    logToFile(`DISCONNECT: socket=${socket.id} user=${userId}`);

    // Remove socket from tracking
    const socketsSet = userSockets.get(userId);
    if (socketsSet) {
      socketsSet.delete(socket.id);
      if (socketsSet.size === 0) {
        userSockets.delete(userId);
      }
    }

    // Immediately remove from spectators
    const gameSession = getGameSessionOfUser(userId);
    if (gameSession) {
      gameSession.spectators = gameSession.spectators.filter((s) => s !== socket.id);
    }

    // If the user still has other active sockets open, do not start grace period
    if (socketsSet && socketsSet.size > 0) {
      logToFile(`DISCONNECT IGNORED: user=${userId} still has ${socketsSet.size} active socket(s)`);
      return;
    }

    // Clear any existing timeout for this user first
    const existingTimeout = disconnectTimeouts.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set a debounce timeout for 5 seconds before cleaning up
    const timeout = setTimeout(() => {
      logToFile(`GRACE PERIOD EXPIRED: user=${userId}`);
      disconnectTimeouts.delete(userId);
      deleteUser(userId);

      const lobby = getLobbyOfUser(userId);
      if (lobby) {
        logToFile(`LEAVE LOBBY (Grace Expired): lobby=${lobby.id} user=${userId}`);
        leaveLobby(lobby.id, userId);
        io.to(lobby.id).emit("member-update", lobby?.members);
      }
      const activeSession = getGameSessionOfUser(userId);
      if (activeSession) {
        logToFile(`LEAVE SESSION (Grace Expired): session=${activeSession.id} user=${userId}`);
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
