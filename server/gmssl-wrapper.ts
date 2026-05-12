/**
 * GmSSL Wrapper - Provides Python subprocess-based access to gmssl library
 * This module executes Python scripts that use the gmssl library for SM2/SM3 operations
 * Using gmssl 3.2.2 API: CryptSM2 and sm3_hash
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";

const execAsync = promisify(exec);

/**
 * Initialize gmssl Python environment
 * This should be called once during application startup
 */
export async function initGmssl(): Promise<boolean> {
	try {
		// Check if gmssl is installed
		const { stdout } = await execAsync("python3 -c 'from gmssl.sm2 import CryptSM2; from gmssl.sm3 import sm3_hash; print(\"GmSSL initialized\")'");
		console.log("[GmSSL] Initialized successfully:", stdout.trim());
		return true;
	} catch (error) {
		console.error("[GmSSL] Failed to initialize:", error);
		return false;
	}
}

/**
 * Generate SM2 key pair
 * Returns { publicKey, privateKey } in hex format
 */
export async function generateSm2KeyPair(): Promise<{
	publicKey: string;
	privateKey: string;
}> {
	const pythonScript = `
	import secrets
	import json
	from gmssl.sm2 import CryptSM2

	try:
		# Generate random private key (32 bytes = 64 hex characters)
	private_key = secrets.token_hex(32)

	# Create SM2 instance and get public key
	sm2_crypt = CryptSM2(private_key=private_key, public_key='')
	public_key = sm2_crypt.public_key

	result = {
		"success": True,
		"publicKey": public_key,
		"privateKey": private_key
	}
	except Exception as e:
		result = {
		"success": False,
		"error": str(e)
	}

	print(json.dumps(result))
	`;

	try {
		const tmpFile = path.join(os.tmpdir(), `gmssl_keygen_${Date.now()}.py`);
		fs.writeFileSync(tmpFile, pythonScript);

		const { stdout } = await execAsync(`python3 "${tmpFile}"`);
		const result = JSON.parse(stdout.trim());

		fs.unlinkSync(tmpFile);

		if (!result.success) {
			throw new Error(result.error || "Failed to generate SM2 key pair");
		}

		console.log(`[GmSSL SM2] Key pair generated: ${result.publicKey.substring(0, 32)}...`);
		return {
			publicKey: result.publicKey,
			privateKey: result.privateKey,
		};
	} catch (error) {
		throw new Error(`SM2 key generation failed: ${error}`);
	}
}

/**
 * Calculate SM3 hash
 * @param data - Input data as string or Buffer
 */
export async function calculateSm3Hash(data: string | Buffer): Promise<string> {
	// Convert data to Buffer
	const dataBuffer = typeof data === "string" ? Buffer.from(data, "utf-8") : data;
	const dataBase64 = dataBuffer.toString("base64");

	const pythonScript = `
	import base64
	import json
	from gmssl.sm3 import sm3_hash

	try:
		# Decode base64 data
	input_data = base64.b64decode('${dataBase64}')

	# Convert to bytearray for sm3_hash
		input_bytearray = bytearray(input_data)

	# Calculate SM3 hash
	hash_result = sm3_hash(input_bytearray)

	result = {
		"success": True,
		"hash": hash_result
	}
	except Exception as e:
		result = {
		"success": False,
		"error": str(e)
	}

	print(json.dumps(result))
	`;

	try {
		const tmpFile = path.join(os.tmpdir(), `gmssl_sm3_${Date.now()}.py`);
		fs.writeFileSync(tmpFile, pythonScript);

		const { stdout } = await execAsync(`python3 "${tmpFile}"`);
		const result = JSON.parse(stdout.trim());

		fs.unlinkSync(tmpFile);

		if (!result.success) {
			throw new Error(result.error || "Failed to calculate SM3 hash");
		}

		console.log(`[GmSSL SM3] Input length: ${dataBuffer.length} bytes, Hash: ${result.hash}`);
		return result.hash;
	} catch (error) {
		throw new Error(`SM3 hash calculation failed: ${error}`);
	}
}

/**
 * Sign message with SM2 private key
 * @param messageHash - Message hash (hex string of SM3 hash)
 * @param privateKey - Private key (hex string)
 * @param userId - User ID for identification (optional)
 */
export async function signWithSm2(
	messageHash: string,
	privateKey: string,
	userId?: string
): Promise<string> {
	// Generate random K value for signing
	const K = crypto.randomBytes(32).toString("hex");

	const pythonScript = `
	import binascii
	import json
	from gmssl.sm2 import CryptSM2

	try:
		# Create SM2 instance with private key
	sm2_crypt = CryptSM2(private_key='${privateKey}', public_key='')

	# Convert hash from hex string to bytes
	message_bytes = binascii.unhexlify('${messageHash}')

	# Sign the message hash with K parameter
	signature = sm2_crypt.sign(message_bytes, '${K}')

	result = {
		"success": True,
		"signature": signature
	}
	except Exception as e:
		result = {
		"success": False,
		"error": str(e)
	}

	print(json.dumps(result))
	`;

	try {
		const tmpFile = path.join(os.tmpdir(), `gmssl_sign_${Date.now()}.py`);
		fs.writeFileSync(tmpFile, pythonScript);

		const { stdout } = await execAsync(`python3 "${tmpFile}"`);
		const result = JSON.parse(stdout.trim());

		fs.unlinkSync(tmpFile);

		if (!result.success) {
			throw new Error(result.error || "Failed to sign message");
		}

		console.log(`[GmSSL Sign] Signature created: ${result.signature.substring(0, 32)}...`);
		return result.signature;
	} catch (error) {
		throw new Error(`SM2 signing failed: ${error}`);
	}
}

/**
 * Verify SM2 signature
 * @param messageHash - Message hash (hex string of SM3 hash)
 * @param signature - Signature (hex string)
 * @param publicKey - Public key (hex string)
 */
export async function verifyWithSm2(
	messageHash: string,
	signature: string,
	publicKey: string
): Promise<boolean> {
	const pythonScript = `
	import binascii
	import json
	from gmssl.sm2 import CryptSM2

	try:
		# Create SM2 instance with public key
	sm2_verify = CryptSM2(private_key='', public_key='${publicKey}')

	# Convert hash and signature from hex strings to bytes
	message_bytes = binascii.unhexlify('${messageHash}')
	signature_bytes = binascii.unhexlify('${signature}')

	# Verify the signature
	is_valid = sm2_verify.verify(signature_bytes, message_bytes)

	result = {
		"success": True,
		"isValid": bool(is_valid)
	}
	except Exception as e:
		result = {
		"success": False,
		"error": str(e),
		"isValid": False
	}

	print(json.dumps(result))
	`;

	try {
		const tmpFile = path.join(os.tmpdir(), `gmssl_verify_${Date.now()}.py`);
		fs.writeFileSync(tmpFile, pythonScript);

		const { stdout } = await execAsync(`python3 "${tmpFile}"`);
		const result = JSON.parse(stdout.trim());

		fs.unlinkSync(tmpFile);

		console.log(`[GmSSL Verify] Result:`, result);

		// Explicitly return the boolean value
		if (result.success === false) {
			console.error(`[GmSSL Verify] Error: ${result.error}`);
			return false;
		}

		return result.isValid === true;
	} catch (error) {
		console.error(`[GmSSL Verify] Failed: ${error}`);
		return false;
	}
}

