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
		const { stdout } = await execAsync(
			"python3 -c 'from gmssl.sm2 import CryptSM2; from gmssl.sm3 import sm3_hash; print(\"GmSSL initialized\")'"
		);
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
 *
 * Fix: CryptSM2 does NOT auto-compute public_key from private_key.
 * Must use sm2._kg(int(private_key, 16), ecc_table['g']) to derive it.
 */
export async function generateSm2KeyPair(): Promise<{
	publicKey: string;
	privateKey: string;
}> {
	// Write Python script to a temp file with correct indentation
	const pythonScript = [
		"import secrets",
		"import json",
		"from gmssl.sm2 import CryptSM2, default_ecc_table",
		"",
		"try:",
		"    # Generate random private key (32 bytes = 64 hex characters)",
		"    private_key = secrets.token_hex(32)",
		"",
		"    # CryptSM2 does NOT auto-compute public key - must derive it manually",
		"    sm2_crypt = CryptSM2(private_key=private_key, public_key='')",
		"    k_int = int(private_key, 16)",
		"    public_key = sm2_crypt._kg(k_int, default_ecc_table['g'])",
		"",
		"    result = {",
		"        'success': True,",
		"        'publicKey': public_key,",
		"        'privateKey': private_key",
		"    }",
		"except Exception as e:",
		"    result = {",
		"        'success': False,",
		"        'error': str(e)",
		"    }",
		"",
		"print(json.dumps(result))",
	].join("\n");

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
 *
 * Fix: sm3_hash() accepts a list of integers (or bytearray).
 * The original script had broken indentation from TS template literals.
 * Fixed by building the script as an array of lines joined with newlines.
 */
export async function calculateSm3Hash(data: string | Buffer): Promise<string> {
	// Convert data to Buffer then to base64 for safe transfer to Python
	const dataBuffer = typeof data === "string" ? Buffer.from(data, "utf-8") : data;
	const dataBase64 = dataBuffer.toString("base64");

	const pythonScript = [
		"import base64",
		"import json",
		"from gmssl.sm3 import sm3_hash",
		"",
		"try:",
		`    input_data = base64.b64decode('${dataBase64}')`,
			"    # sm3_hash accepts list of ints or bytearray",
		"    hash_result = sm3_hash(list(bytearray(input_data)))",
		"    result = {",
		"        'success': True,",
		"        'hash': hash_result",
		"    }",
		"except Exception as e:",
		"    result = {",
		"        'success': False,",
		"        'error': str(e)",
		"    }",
		"",
		"print(json.dumps(result))",
	].join("\n");

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
 * @param privateKey  - Private key (hex string)
 * @param userId      - User ID for identification (optional, unused in crypto)
 *
 * Fix: sign() expects a bytes object for the message hash.
 * Use bytes.fromhex() to convert the hex string to bytes.
 * Also need to provide the public key so SM2 instance is fully initialised
 * (derive it from private key using _kg).
 * Original script had broken indentation from TS template literals.
 */
export async function signWithSm2(
	messageHash: string,
	privateKey: string,
	userId?: string
): Promise<string> {
	// Generate random K value for signing
	const K = crypto.randomBytes(32).toString("hex");

	const pythonScript = [
		"import json",
		"from gmssl.sm2 import CryptSM2, default_ecc_table",
		"",
		"try:",
		`    private_key = '${privateKey}'`,
			`    message_hash_hex = '${messageHash}'`,
			`    K = '${K}'`,
			"",
		"    # Derive public key from private key",
		"    sm2_tmp = CryptSM2(private_key=private_key, public_key='')",
		"    public_key = sm2_tmp._kg(int(private_key, 16), default_ecc_table['g'])",
		"",
		"    # Create SM2 instance with both keys",
		"    sm2_crypt = CryptSM2(private_key=private_key, public_key=public_key)",
		"",
		"    # sign() expects bytes, convert hex string to bytes",
		"    message_bytes = bytes.fromhex(message_hash_hex)",
		"",
		"    # Sign - returns hex string r||s (128 hex chars = 64 bytes)",
		"    signature = sm2_crypt.sign(message_bytes, K)",
		"    if signature is None:",
		"        raise ValueError('Signing failed: invalid K or hash (R=0 or S=0). Retry with different K.')",
		"",
		"    result = {",
		"        'success': True,",
		"        'signature': signature",
		"    }",
		"except Exception as e:",
		"    result = {",
		"        'success': False,",
		"        'error': str(e)",
		"    }",
		"",
		"print(json.dumps(result))",
	].join("\n");

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
 * @param signature   - Signature (hex string, r||s format, 128 hex chars)
 * @param publicKey   - Public key (hex string, 128 hex chars)
 *
 * Fix: verify() expects:
 *   - Sign: hex STRING (not bytes!) - the r||s signature
 *   - data: bytes object
 * Original code called binascii.unhexlify(signature) converting it to bytes,
 * then passed bytes to verify(), causing "invalid literal for int() with base 16"
 * error inside verify(). Fixed by passing the signature hex string directly.
 */
export async function verifyWithSm2(
	messageHash: string,
	signature: string,
	publicKey: string
): Promise<boolean> {
	const pythonScript = [
		"import json",
		"from gmssl.sm2 import CryptSM2",
		"",
		"try:",
		`    public_key = '${publicKey}'`,
			`    message_hash_hex = '${messageHash}'`,
			`    signature_hex = '${signature}'`,
			"",
		"    # Create SM2 instance with public key only",
		"    sm2_verify = CryptSM2(private_key='', public_key=public_key)",
		"",
		"    # verify() expects: Sign as hex STRING, data as bytes",
		"    # Do NOT convert signature to bytes - pass hex string directly",
		"    message_bytes = bytes.fromhex(message_hash_hex)",
		"    is_valid = sm2_verify.verify(signature_hex, message_bytes)",
		"",
		"    result = {",
		"        'success': True,",
		"        'isValid': bool(is_valid)",
		"    }",
		"except Exception as e:",
		"    result = {",
		"        'success': False,",
		"        'error': str(e),",
		"        'isValid': False",
		"    }",
		"",
		"print(json.dumps(result))",
	].join("\n");

	try {
		const tmpFile = path.join(os.tmpdir(), `gmssl_verify_${Date.now()}.py`);
		fs.writeFileSync(tmpFile, pythonScript);

		const { stdout } = await execAsync(`python3 "${tmpFile}"`);
		const result = JSON.parse(stdout.trim());

		fs.unlinkSync(tmpFile);

		console.log(`[GmSSL Verify] Result:`, result);

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
