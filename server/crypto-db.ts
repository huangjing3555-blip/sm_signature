/**
 * Database helpers for SM2/SM3 operations
 */

import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  sm2Keys,
  sm3Hashes,
  signatures,
  verifications,
  type InsertSm2Key,
  type InsertSm3Hash,
  type InsertSignature,
  type InsertVerification,
} from "../drizzle/schema";

/**
 * Save SM2 key pair to database
 */
export async function saveSm2Key(data: InsertSm2Key) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(sm2Keys).values(data);
  return result;
}

/**
 * Get SM2 keys for a user
 */
export async function getUserSm2Keys(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const keys = await db.select().from(sm2Keys).where(eq(sm2Keys.userId, userId));
  return keys;
}

/**
 * Get single SM2 key by ID
 */
export async function getSm2KeyById(keyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const key = await db.select().from(sm2Keys).where(eq(sm2Keys.id, keyId)).limit(1);
  return key[0] || null;
}

/**
 * Delete SM2 key
 */
export async function deleteSm2Key(keyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(sm2Keys).where(eq(sm2Keys.id, keyId));
}

/**
 * Save SM3 hash record
 */
export async function saveSm3Hash(data: InsertSm3Hash) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(sm3Hashes).values(data);
  return result;
}

/**
 * Get SM3 hash history for a user
 */
export async function getUserSm3Hashes(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const hashes = await db
    .select()
    .from(sm3Hashes)
    .where(eq(sm3Hashes.userId, userId))
    .orderBy(desc(sm3Hashes.createdAt))
    .limit(limit);

  return hashes;
}

/**
 * Save signature record
 */
export async function saveSignature(data: InsertSignature) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(signatures).values(data);
  return result;
}

/**
 * Get signature history for a user
 */
export async function getUserSignatures(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const sigs = await db
    .select()
    .from(signatures)
    .where(eq(signatures.userId, userId))
    .orderBy(desc(signatures.createdAt))
    .limit(limit);

  return sigs;
}

/**
 * Save verification record
 */
export async function saveVerification(data: InsertVerification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(verifications).values(data);
  return result;
}

/**
 * Get verification history for a user
 */
export async function getUserVerifications(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const verifs = await db
    .select()
    .from(verifications)
    .where(eq(verifications.userId, userId))
    .orderBy(desc(verifications.createdAt))
    .limit(limit);

  return verifs;
}
