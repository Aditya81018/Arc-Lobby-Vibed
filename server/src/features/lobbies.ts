import { Router } from "express";
import { getUserById } from "./users";
import { Socket } from "socket.io";
import { io } from "..";
import fs from "fs";

export interface Lobby {
  id: string;
  members: string[];
}

const lobbies = new Map<string, Lobby>();
const userToLobby = new Map<string, string>();

function logToFile(msg: string) {
  if (process.env.ENV !== "DEV") return;
  try {
    fs.appendFileSync("/home/aditya/Documents/Projects/Arc-Lobby-Vibed/debug.log", `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {
    console.error("Failed to write to debug.log", e);
  }
}

// Controllers
export function getAllLobbies() {
  return Object.fromEntries(lobbies);
}

export function getLobbyById(lobbyId: string) {
  return lobbies.get(lobbyId);
}

export function createLobby() {
  let lobbyId = "";
  do {
    lobbyId = crypto.randomUUID().substring(0, 6).toUpperCase();
  } while (getLobbyById(lobbyId) !== undefined);
  const newLobby: Lobby = { id: lobbyId, members: [] };
  lobbies.set(lobbyId, newLobby);
  return newLobby;
}

export function updateLobby(lobbyId: string, data: Partial<Lobby>) {
  const lobby = getLobbyById(lobbyId);
  if (!lobby) return;
  const updatedLobby = Object.assign(lobby, data);
  lobbies.set(lobbyId, updatedLobby);
  return updatedLobby;
}

export function deleteLobby(lobbyId: string) {
  return lobbies.delete(lobbyId);
}

// Helpers

export function getLobbyOfUser(userId: string) {
  const lobbyId = userToLobby.get(userId);
  if (!lobbyId) return;

  const lobby = getLobbyById(lobbyId);
  return lobby;
}

export function joinLobby(lobbyId: string, userId: string) {
  const lobby = getLobbyById(lobbyId);
  if (!lobby) return false;
  if (lobby.members.includes(userId)) return false;

  updateLobby(lobbyId, { members: [...lobby?.members, userId] });
  userToLobby.set(userId, lobbyId);
  return true;
}

export function leaveLobby(lobbyId: string, userId: string) {
  const lobby = getLobbyById(lobbyId);
  if (!lobby) return false;

  const index = lobby.members.indexOf(userId);
  if (index === -1) return false;

  lobby.members.splice(index, 1);
  userToLobby.delete(userId);
  if (lobby.members.length === 0) deleteLobby(lobbyId);

  return true;
}

export function getLobbyMembersData(lobbyId: string) {
  const lobby = getLobbyById(lobbyId);
  if (!lobby) return undefined;

  const membersData = [];
  for (const member of lobby.members) {
    membersData.push(getUserById(member));
  }
  return membersData;
}

export function initLobbySockets(socket: Socket) {
  socket.on("join-lobby", (lobbyId) => {
    const userId = socket.data.userId || socket.id;
    logToFile(`SOCKET: join-lobby lobby=${lobbyId} user=${userId} socket=${socket.id}`);
    joinLobby(lobbyId, userId);
    socket.join(lobbyId);

    const lobby = getLobbyById(lobbyId);
    io.to(lobbyId).emit("member-update", lobby?.members);
  });

  socket.on("leave-lobby", (lobbyId) => {
    const userId = socket.data.userId || socket.id;
    logToFile(`SOCKET: leave-lobby lobby=${lobbyId} user=${userId} socket=${socket.id}`);
    leaveLobby(lobbyId, userId);
    socket.leave(lobbyId);

    const lobby = getLobbyById(lobbyId);
    io.to(lobbyId).emit("member-update", lobby?.members);
  });
}

// Routes
export const lobbiesRouter = Router();

lobbiesRouter.get("/", (_req, res) => {
  res.json(getAllLobbies());
});

lobbiesRouter.post("/", (_req, res) => {
  const newLobby = createLobby();
  logToFile(`REST: POST /lobbies/ lobby=${newLobby.id}`);
  res.json(newLobby);
});

lobbiesRouter.get("/:id", (req, res) => {
  const { id: lobbyId } = req.params;
  logToFile(`REST: GET /lobbies/${lobbyId}`);
  const lobby = getLobbyById(lobbyId);
  res.json(lobby || null);
});

lobbiesRouter.get("/:id/members", (req, res) => {
  const { id: lobbyId } = req.params;
  logToFile(`REST: GET /lobbies/${lobbyId}/members`);
  const membersData = getLobbyMembersData(lobbyId);
  res.json(membersData || null);
});
