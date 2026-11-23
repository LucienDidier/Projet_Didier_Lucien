import { timingSafeEqual, scrypt } from "node:crypto";
import { Request, Response } from "express";
import db from "../models";
import { createAccessToken } from "../auth/tokens";

const Users = db.users;
const PASSWORD_HASH_LENGTH = 64;

interface LoginInput {
  email: string;
  password: string;
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const input = parseLogin(req.body);
  if (!input) {
    res.status(400).json({ message: "Email or password is invalid." });
    return;
  }

  try {
    const user = await Users.findOne({ where: { email: input.email } });
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      res.status(401).json({ message: "Email or password is incorrect." });
      return;
    }

    res.status(200).json({
      token: createAccessToken(user.id),
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error: unknown) {
    console.error("Failed to authenticate user:", error);
    res.status(500).json({ message: "Authentication failed." });
  }
};

function parseLogin(value: unknown): LoginInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const { email, password } = value;
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== "string" ||
    password.length === 0 ||
    password.length > 128
  ) {
    return null;
  }

  return { email: email.trim().toLowerCase(), password };
}

function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [salt, expectedHex, extra] = passwordHash.split(":");
  if (
    extra !== undefined ||
    !/^[\da-f]{32}$/i.test(salt ?? "") ||
    !/^[\da-f]{128}$/i.test(expectedHex ?? "")
  ) {
    return Promise.resolve(false);
  }

  return new Promise((resolve, reject) => {
    scrypt(password, salt, PASSWORD_HASH_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      const expected = Buffer.from(expectedHex, "hex");
      resolve(
        expected.length === derivedKey.length &&
          timingSafeEqual(expected, derivedKey)
      );
    });
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default { login };
