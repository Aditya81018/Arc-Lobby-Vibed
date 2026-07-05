import { Router } from "express";

export interface UserData {
  id: string;
  name: string;
  emoji: string;
  color: { foreground: string; background: string };
}

const users = new Map<string, UserData>();

// Controllers
export function getAllUser() {
  return Object.fromEntries(users);
}

export function getUserById(id: string) {
  return users.get(id);
}

export function createUser(id: string, data: Omit<UserData, "id">) {
  const newUser: UserData = {
    ...data,
    id,
  };
  users.set(id, newUser);
  return newUser;
}

export function updateUser(id: string, newData: Partial<Omit<UserData, "id">>) {
  const oldData = users.get(id);
  if (!oldData) return undefined;

  const updatedData = { ...oldData, ...newData, id };
  users.set(id, updatedData);
  return updatedData;
}

export function deleteUser(id: string) {
  return users.delete(id);
}

// Routes
export const usersRouter = Router();

usersRouter.get("/", (_req, res) => {
  res.json(getAllUser());
});

usersRouter.put("/:id/", (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const updatedUser = updateUser(id, data);
  res.json(updatedUser);
});
