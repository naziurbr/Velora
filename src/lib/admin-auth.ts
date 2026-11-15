import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "digital_closet_admin";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && Buffer.byteLength(secret) >= 32 ? secret : null;
}

export function isAdminConfigured() {
  const hash = process.env.ADMIN_PASSWORD_HASH ?? "";
  return !!(
    process.env.ADMIN_USERNAME &&
    /^[a-f0-9]{32}:[a-f0-9]{128}$/i.test(hash) &&
    sessionSecret()
  );
}

export function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME ?? "";
  const encodedHash = process.env.ADMIN_PASSWORD_HASH ?? "";
  if (!isAdminConfigured()) return false;

  const usernameMatches = safeEqual(username, expectedUsername);
  const [saltHex, expectedHex] = encodedHash.split(":");
  const actualHash = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  const passwordMatches = safeEqual(actualHash, Buffer.from(expectedHex, "hex"));
  return usernameMatches && passwordMatches;
}

function safeEqual(left: string | Buffer, right: string | Buffer) {
  const a = typeof left === "string" ? Buffer.from(left) : left;
  const b = typeof right === "string" ? Buffer.from(right) : right;
  return a.length === b.length && timingSafeEqual(a, b);
}

function sign(expiry: string, secret: string) {
  return createHmac("sha256", secret).update(expiry).digest("base64url");
}

export function createAdminSession() {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET must be at least 32 bytes");
  const expiry = String(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS);
  return `${expiry}.${sign(expiry, secret)}`;
}

export function isValidAdminSession(token: string | undefined) {
  const secret = sessionSecret();
  if (!secret || !token) return false;
  const [expiry, signature, extra] = token.split(".");
  if (extra !== undefined || !/^\d+$/.test(expiry) || Number(expiry) <= Date.now() / 1000) {
    return false;
  }
  return safeEqual(signature, sign(expiry, secret));
}

export function isSameOrigin(req: NextRequest) {
  return req.headers.get("origin") === req.nextUrl.origin;
}

export function isAdminRequest(req: NextRequest) {
  return isValidAdminSession(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}
