import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

/** Hashes a password with a random salt. Returns "saltHex:derivedHex". */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(
    password,
    salt,
    KEY_LENGTH
  )) as Buffer;
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

/** Verifies a password against a "saltHex:derivedHex" value from hashPassword(). */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [saltHex, derivedHex] = stored.split(":");
  if (!saltHex || !derivedHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(derivedHex, "hex");
  const actual = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
