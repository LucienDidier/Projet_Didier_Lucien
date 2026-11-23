import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_LIFETIME_SECONDS = 60 * 60;
const TOKEN_SECRET_MIN_LENGTH = 32;

interface AccessTokenPayload {
  sub: string;
  exp: number;
}

export function assertTokenSecretConfigured(): void {
  getTokenSecret();
}

export function createAccessToken(userId: number): string {
  const header = encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload: AccessTokenPayload = {
    sub: String(userId),
    exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS
  };
  const content = `${header}.${encode(JSON.stringify(payload))}`;

  return `${content}.${sign(content)}`;
}

export function verifyAccessToken(token: string): boolean {
  const secret = getTokenSecret();
  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  const expectedSignature = createHmac("sha256", secret)
    .update(`${headerPart}.${payloadPart}`)
    .digest();
  const receivedSignature = Buffer.from(signaturePart, "base64url");
  if (
    receivedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(receivedSignature, expectedSignature)
  ) {
    return false;
  }

  try {
    const header: unknown = JSON.parse(Buffer.from(headerPart, "base64url").toString("utf8"));
    const payload: unknown = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    return (
      isRecord(header) &&
      header["alg"] === "HS256" &&
      isRecord(payload) &&
      typeof payload["sub"] === "string" &&
      /^[1-9]\d*$/.test(payload["sub"]) &&
      Number.isSafeInteger(Number(payload["sub"])) &&
      typeof payload["exp"] === "number" &&
      Number.isSafeInteger(payload["exp"]) &&
      payload["exp"] > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

function sign(content: string): string {
  return createHmac("sha256", getTokenSecret())
    .update(content)
    .digest("base64url");
}

function getTokenSecret(): string {
  const secret = process.env.AUTH_TOKEN_SECRET;
  if (!secret || secret.length < TOKEN_SECRET_MIN_LENGTH) {
    throw new Error(
      `AUTH_TOKEN_SECRET must be set to at least ${TOKEN_SECRET_MIN_LENGTH} characters.`
    );
  }
  return secret;
}

function encode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
