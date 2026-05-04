/**
 * Crypto Router - tRPC procedures for SM2/SM3 operations
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  generateSm2KeyPair,
  calculateSm3Hash,
  signWithSm2,
  verifyWithSm2,
  calculateFileHashSm3,
} from "../gmssl-wrapper";
import {
  saveSm2Key,
  getUserSm2Keys,
  getSm2KeyById,
  deleteSm2Key,
  saveSm3Hash,
  getUserSm3Hashes,
  saveSignature,
  getUserSignatures,
  saveVerification,
  getUserVerifications,
} from "../crypto-db";
import { storagePut, storageGet } from "../storage";
import * as crypto from "crypto";

export const cryptoRouter = router({
  /**
   * Generate SM2 key pair
   */
  generateSm2Key: protectedProcedure
    .input(
      z.object({
        keyName: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { publicKey, privateKey } = await generateSm2KeyPair();

        // Save to database
        const result = await saveSm2Key({
          userId: ctx.user.id,
          keyName: input.keyName,
          publicKey,
          privateKey,
          algorithm: "SM2",
        });

        return {
          success: true,
          keyId: result[0].insertId,
          keyName: input.keyName,
          publicKey,
          // Don't return private key in response
        };
      } catch (error) {
        throw new Error(`Failed to generate SM2 key: ${error}`);
      }
    }),

  /**
   * List user's SM2 keys
   */
  listSm2Keys: protectedProcedure.query(async ({ ctx }) => {
    try {
      const keys = await getUserSm2Keys(ctx.user.id);
      return keys.map((k) => ({
        id: k.id,
        keyName: k.keyName,
        publicKey: k.publicKey,
        algorithm: k.algorithm,
        createdAt: k.createdAt,
        // Don't return private key
      }));
    } catch (error) {
      throw new Error(`Failed to list SM2 keys: ${error}`);
    }
  }),

  /**
   * Download SM2 key pair (private key only accessible to owner)
   */
  downloadSm2Key: protectedProcedure
    .input(z.object({ keyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const key = await getSm2KeyById(input.keyId);
        if (!key) throw new Error("Key not found");
        if (key.userId !== ctx.user.id) throw new Error("Unauthorized");

        // Create PEM format export
        const keyData = {
          keyName: key.keyName,
          publicKey: key.publicKey,
          privateKey: key.privateKey,
          algorithm: key.algorithm,
          exportedAt: new Date().toISOString(),
        };

        const content = JSON.stringify(keyData, null, 2);
        const buffer = Buffer.from(content);

        // Upload to S3
        const { url } = await storagePut(
          `sm2-keys/${ctx.user.id}/${key.keyName}-${Date.now()}.json`,
          buffer,
          "application/json"
        );

        return {
          success: true,
          downloadUrl: url,
          filename: `${key.keyName}.json`,
        };
      } catch (error) {
        throw new Error(`Failed to download SM2 key: ${error}`);
      }
    }),

  /**
   * Delete SM2 key
   */
  deleteSm2Key: protectedProcedure
    .input(z.object({ keyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const key = await getSm2KeyById(input.keyId);
        if (!key) throw new Error("Key not found");
        if (key.userId !== ctx.user.id) throw new Error("Unauthorized");

        await deleteSm2Key(input.keyId);
        return { success: true };
      } catch (error) {
        throw new Error(`Failed to delete SM2 key: ${error}`);
      }
    }),

  /**
   * Calculate SM3 hash from text
   */
  calculateSm3Text: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        label: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Calculate hash
        const hash = await calculateSm3Hash(input.text);

        // Calculate input hash for deduplication
        const inputHash = crypto.createHash("sha256").update(input.text).digest("hex");

        // Save to database
        await saveSm3Hash({
          userId: ctx.user.id,
          inputType: "text",
          inputName: input.label || "Text input",
          inputHash,
          outputHash: hash,
        });

        return {
          success: true,
          hash,
          inputLength: input.text.length,
        };
      } catch (error) {
        throw new Error(`Failed to calculate SM3 hash: ${error}`);
      }
    }),

  /**
   * Calculate SM3 hash from file
   */
  calculateSm3File: protectedProcedure
    .input(
      z.object({
        fileKey: z.string(), // S3 key
        filename: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get file from S3 (presigned URL)
        const { url } = await storageGet(input.fileKey);

        // Download file and calculate hash
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const data = Buffer.from(buffer);

        const hash = await calculateSm3Hash(data);

        // Calculate input hash
        const inputHash = crypto.createHash("sha256").update(data).digest("hex");

        // Save to database
        await saveSm3Hash({
          userId: ctx.user.id,
          inputType: "file",
          inputName: input.filename,
          inputHash,
          outputHash: hash,
          fileKey: input.fileKey,
        });

        return {
          success: true,
          hash,
          filename: input.filename,
        };
      } catch (error) {
        throw new Error(`Failed to calculate SM3 file hash: ${error}`);
      }
    }),

  /**
   * Get SM3 hash history
   */
  getSm3History: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      try {
        const hashes = await getUserSm3Hashes(ctx.user.id, input.limit);
        return hashes;
      } catch (error) {
        throw new Error(`Failed to get SM3 history: ${error}`);
      }
    }),

  /**
   * Sign message with SM2
   */
  signMessage: protectedProcedure
    .input(
      z.object({
        keyId: z.number(),
        message: z.string(),
        label: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get key
        const key = await getSm2KeyById(input.keyId);
        if (!key) throw new Error("Key not found");
        if (key.userId !== ctx.user.id) throw new Error("Unauthorized");

        // Calculate message hash
        const messageHash = await calculateSm3Hash(input.message);

        // Sign
        const signature = await signWithSm2(messageHash, key.privateKey, ctx.user.id.toString());

        // Save to database
        const inputHash = crypto.createHash("sha256").update(input.message).digest("hex");
        await saveSignature({
          userId: ctx.user.id,
          keyId: input.keyId,
          messageType: "text",
          messageName: input.label || "Text message",
          messageHash,
          signatureValue: signature,
        });

        return {
          success: true,
          signature,
          messageHash,
        };
      } catch (error) {
        throw new Error(`Failed to sign message: ${error}`);
      }
    }),

  /**
   * Sign file with SM2
   */
  signFile: protectedProcedure
    .input(
      z.object({
        keyId: z.number(),
        fileKey: z.string(), // S3 key
        filename: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get key
        const key = await getSm2KeyById(input.keyId);
        if (!key) throw new Error("Key not found");
        if (key.userId !== ctx.user.id) throw new Error("Unauthorized");

        // Get file and calculate hash
        const { url } = await storageGet(input.fileKey);
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const data = Buffer.from(buffer);

        const messageHash = await calculateSm3Hash(data);

        // Sign
        const signature = await signWithSm2(messageHash, key.privateKey, ctx.user.id.toString());

        // Save to database
        const inputHash = crypto.createHash("sha256").update(data).digest("hex");
        await saveSignature({
          userId: ctx.user.id,
          keyId: input.keyId,
          messageType: "file",
          messageName: input.filename,
          messageHash,
          signatureValue: signature,
          fileKey: input.fileKey,
        });

        return {
          success: true,
          signature,
          messageHash,
          filename: input.filename,
        };
      } catch (error) {
        throw new Error(`Failed to sign file: ${error}`);
      }
    }),

  /**
   * Get signature history
   */
  getSignatureHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      try {
        const sigs = await getUserSignatures(ctx.user.id, input.limit);
        return sigs;
      } catch (error) {
        throw new Error(`Failed to get signature history: ${error}`);
      }
    }),

  /**
   * Verify signature
   */
  verifySignature: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        signature: z.string(),
        publicKey: z.string(),
        label: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Calculate message hash
        const messageHash = await calculateSm3Hash(input.message);

        // Verify
        const isValid = await verifyWithSm2(messageHash, input.signature, input.publicKey);

        // Save to database
        const inputHash = crypto.createHash("sha256").update(input.message).digest("hex");
        await saveVerification({
          userId: ctx.user.id,
          messageType: "text",
          messageName: input.label || "Text message",
          messageHash,
          signatureValue: input.signature,
          publicKey: input.publicKey,
          isValid,
        });

        return {
          success: true,
          isValid,
          messageHash,
        };
      } catch (error) {
        throw new Error(`Failed to verify signature: ${error}`);
      }
    }),

  /**
   * Verify file signature
   */
  verifyFileSignature: protectedProcedure
    .input(
      z.object({
        fileKey: z.string(), // S3 key
        filename: z.string(),
        signature: z.string(),
        publicKey: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get file and calculate hash
        const { url } = await storageGet(input.fileKey);
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const data = Buffer.from(buffer);

        const messageHash = await calculateSm3Hash(data);

        // Verify
        const isValid = await verifyWithSm2(messageHash, input.signature, input.publicKey);

        // Save to database
        const inputHash = crypto.createHash("sha256").update(data).digest("hex");
        await saveVerification({
          userId: ctx.user.id,
          messageType: "file",
          messageName: input.filename,
          messageHash,
          signatureValue: input.signature,
          publicKey: input.publicKey,
          isValid,
          fileKey: input.fileKey,
        });

        return {
          success: true,
          isValid,
          messageHash,
          filename: input.filename,
        };
      } catch (error) {
        throw new Error(`Failed to verify file signature: ${error}`);
      }
    }),

  /**
   * Get verification history
   */
  getVerificationHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      try {
        const verifs = await getUserVerifications(ctx.user.id, input.limit);
        return verifs;
      } catch (error) {
        throw new Error(`Failed to get verification history: ${error}`);
      }
    }),
});
