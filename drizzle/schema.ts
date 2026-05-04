import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, longtext, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * SM2 Key Pairs - stores generated SM2 public/private key pairs
 */
export const sm2Keys = mysqlTable("sm2_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  keyName: varchar("keyName", { length: 255 }).notNull(),
  publicKey: longtext("publicKey").notNull(), // Hex format
  privateKey: longtext("privateKey").notNull(), // Hex format (encrypted in production)
  algorithm: varchar("algorithm", { length: 50 }).default("SM2").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sm2Key = typeof sm2Keys.$inferSelect;
export type InsertSm2Key = typeof sm2Keys.$inferInsert;

/**
 * SM3 Hashes - records of SM3 hash calculations
 */
export const sm3Hashes = mysqlTable("sm3_hashes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  inputType: varchar("inputType", { length: 50 }).notNull(), // "text" or "file"
  inputName: varchar("inputName", { length: 255 }), // filename or text label
  inputHash: varchar("inputHash", { length: 64 }).notNull(), // SHA256 of input for dedup
  outputHash: varchar("outputHash", { length: 64 }).notNull(), // SM3 result (hex)
  fileKey: varchar("fileKey", { length: 255 }), // S3 key if file
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Sm3Hash = typeof sm3Hashes.$inferSelect;
export type InsertSm3Hash = typeof sm3Hashes.$inferInsert;

/**
 * Signatures - records of SM2 signature operations
 */
export const signatures = mysqlTable("signatures", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  keyId: int("keyId").notNull(),
  messageType: varchar("messageType", { length: 50 }).notNull(), // "text" or "file"
  messageName: varchar("messageName", { length: 255 }), // filename or text label
  messageHash: varchar("messageHash", { length: 64 }).notNull(), // SM3 of message
  signatureValue: longtext("signatureValue").notNull(), // (r, s) in hex format
  fileKey: varchar("fileKey", { length: 255 }), // S3 key if file
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Signature = typeof signatures.$inferSelect;
export type InsertSignature = typeof signatures.$inferInsert;

/**
 * Verifications - records of SM2 signature verification operations
 */
export const verifications = mysqlTable("verifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  messageType: varchar("messageType", { length: 50 }).notNull(), // "text" or "file"
  messageName: varchar("messageName", { length: 255 }), // filename or text label
  messageHash: varchar("messageHash", { length: 64 }).notNull(), // SM3 of message
  signatureValue: longtext("signatureValue").notNull(), // (r, s) in hex format
  publicKey: longtext("publicKey").notNull(), // Hex format
  isValid: boolean("isValid").notNull(),
  fileKey: varchar("fileKey", { length: 255 }), // S3 key if file
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Verification = typeof verifications.$inferSelect;
export type InsertVerification = typeof verifications.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sm2Keys: many(sm2Keys),
  sm3Hashes: many(sm3Hashes),
  signatures: many(signatures),
  verifications: many(verifications),
}));

export const sm2KeysRelations = relations(sm2Keys, ({ one, many }) => ({
  user: one(users, { fields: [sm2Keys.userId], references: [users.id] }),
  signatures: many(signatures),
}));

export const signaturesRelations = relations(signatures, ({ one }) => ({
  user: one(users, { fields: [signatures.userId], references: [users.id] }),
  key: one(sm2Keys, { fields: [signatures.keyId], references: [sm2Keys.id] }),
}));