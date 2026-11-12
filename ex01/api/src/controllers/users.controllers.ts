import { randomBytes, scrypt } from "node:crypto";
import { Request, Response } from "express";
import { UniqueConstraintError } from "sequelize";
import db from "../models";

const Users = db.users;
const PASSWORD_HASH_LENGTH = 64;

interface UserInput {
  name: string;
  email: string;
  password: string;
}

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await Users.findAll({
      attributes: ["id", "name", "email"],
      order: [["id", "ASC"]]
    });
    res.status(200).json(users);
  } catch (error: unknown) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const user = parseUser(req.body);
  if (!user) {
    res.status(400).json({ message: "User data is invalid." });
    return;
  }

  try {
    const salt = randomBytes(16).toString("hex");
    const passwordHash = await hashPassword(user.password, salt);
    const created = await Users.create({
      name: user.name,
      email: user.email,
      passwordHash
    });

    res.status(201).json({
      id: created.id,
      name: created.name,
      email: created.email,
      message: "Votre compte a été créé avec succès."
    });
  } catch (error: unknown) {
    if (error instanceof UniqueConstraintError) {
      res.status(409).json({ message: "An account with this email already exists." });
      return;
    }

    console.error("Failed to create user:", error);
    res.status(500).json({ message: "Failed to create user." });
  }
};

function parseUser(value: unknown): UserInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const { name, email, password } = value;
  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 80 ||
    !/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(name.trim()) ||
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128 ||
    !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z\s])/.test(password)
  ) {
    return null;
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, PASSWORD_HASH_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

export default { getAll, create };
