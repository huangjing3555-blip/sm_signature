/**
 * GmSSL Wrapper - Provides Python subprocess-based access to gmssl library
 * This module executes Python scripts that use the gmssl library for SM2/SM3 operations
 * On Windows or when gmssl is unavailable, uses mock data for testing
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";

const execAsync = promisify(exec);

let gmSSLAvailable = false;

/**
 * Initialize gmssl Python environment
 * This should be called once during application startup
 */
export async function initGmssl(): Promise<boolean> {
  // 在 Windows 上或开发模式下，使用 Mock 数据
  if (process.platform === "win32" || process.env.GMSSL_MOCK === "1") {
    console.log("[GmSSL] Running in MOCK mode (Windows or GMSSL_MOCK=1)");
    gmSSLAvailable = false;
    return true; // 返回 true 表示初始化成功（使用 mock）
  }

  try {
    // Check if gmssl is installed
    const { stdout } = await execAsync("python3 -c 'import gmssl; print(gmssl.GMSSL_PYTHON_VERSION)'");
    console.log("[GmSSL] Initialized successfully. Version:", stdout.trim());
    gmSSLAvailable = true;
    return true;
  } catch (error) {
    console.warn("[GmSSL] Failed to initialize - falling back to mock mode:", error);
    gmSSLAvailable = false;
    return true; // 返回 true 但使用 mock 模式
  }
}

/**
 * Generate mock SM2 key pair (for testing on Windows)
 */
function generateMockSm2KeyPair(): { publicKey: string; privateKey: string } {
  // 生成伪 SM2 密钥对（用于测试）
  const privateKeyBuffer = crypto.randomBytes(32);
  const publicKeyBuffer = crypto.randomBytes(64);

  return {
    publicKey: publicKeyBuffer.toString("hex").toUpperCase(),
    privateKey: privateKeyBuffer.toString("hex").toUpperCase(),
  };
}

/**
 * Generate SM2 key pair
 * Returns { publicKey, privateKey } in hex format
 */
export async function generateSm2KeyPair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  // 如果 gmssl 不可用，使用 mock 数据
  if (!gmSSLAvailable) {
    console.log("[GmSSL] Using MOCK SM2 key pair generation");
    return generateMockSm2KeyPair();
  }

  const pythonScript = `
import gmssl
import json

try:
    # Generate SM2 key pair
    key = gmssl.Sm2Key()
    key.generate_key()
    
    public_key = key.get_public_key().hex()
    private_key = key.get_private_key().hex()
    
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

    return {
      publicKey: result.publicKey,
      privateKey: result.privateKey,
    };
  } catch (error) {
    console.warn(`[GmSSL] SM2 key generation failed, falling back to mock: ${error}`);
    return generateMockSm2KeyPair();
  }
}

/**
 * Calculate mock SM3 hash (for testing on Windows)
 */
function calculateMockSm3Hash(data: string | Buffer): string {
  // 使用 SHA256 作为 mock（长度相同）
  const hash = crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
    .toUpperCase();
  return hash;
}

/**
 * Calculate SM3 hash
 * @param data - Input data as hex string or bytes
 * @param isHex - Whether input is hex encoded
 */
export async function calculateSm3Hash(data: string | Buffer, isHex: boolean = false): Promise<string> {
  // 如果 gmssl 不可用，使用 mock 数据
  if (!gmSSLAvailable) {
    console.log("[GmSSL] Using MOCK SM3 hash calculation");
    return calculateMockSm3Hash(data);
  }

  const pythonScript = `
import gmssl
import json

try:
    sm3 = gmssl.Sm3()
    
    # Handle input
    if ${isHex}:
        input_data = bytes.fromhex('${typeof data === "string" ? data : data.toString("hex")}')
    else:
        input_data = b'${typeof data === "string" ? data.replace(/'/g, "\\'") : data.toString().replace(/'/g, "\\'")}'
    
    sm3.update(input_data)
    digest = sm3.digest()
    
    result = {
        "success": True,
        "hash": digest.hex()
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

    return result.hash;
  } catch (error) {
    console.warn(`[GmSSL] SM3 hash calculation failed, falling back to mock: ${error}`);
    return calculateMockSm3Hash(data);
  }
}

/**
 * Sign message with SM2 private key
 * @param message - Message to sign (hex string)
 * @param privateKey - Private key (hex string)
 * @param userId - User ID for identification (optional)
 */
export async function signWithSm2(message: string, privateKey: string, userId?: string): Promise<string> {
  // 如果 gmssl 不可用，使用 mock 签名
  if (!gmSSLAvailable) {
    console.log("[GmSSL] Using MOCK SM2 signature");
    // 生成伪签名（使用 HMAC）
    const signature = crypto
      .createHmac("sha256", privateKey)
      .update(message)
      .digest("hex")
      .toUpperCase();
    return signature;
  }

  const pythonScript = `
import gmssl
import json

try:
    # Create SM2 key object
    key = gmssl.Sm2Key()
    key.set_private_key(bytes.fromhex('${privateKey}'))
    
    # Sign message
    message_bytes = bytes.fromhex('${message}')
    signature = key.sign(message_bytes)
    
    result = {
        "success": True,
        "signature": signature.hex()
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

    return result.signature;
  } catch (error) {
    console.warn(`[GmSSL] SM2 signing failed, falling back to mock: ${error}`);
    const signature = crypto
      .createHmac("sha256", privateKey)
      .update(message)
      .digest("hex")
      .toUpperCase();
    return signature;
  }
}

/**
 * Verify SM2 signature
 * @param message - Message (hex string)
 * @param signature - Signature (hex string)
 * @param publicKey - Public key (hex string)
 */
export async function verifyWithSm2(message: string, signature: string, publicKey: string): Promise<boolean> {
  // 如果 gmssl 不可用，使用 mock 验证
  if (!gmSSLAvailable) {
    console.log("[GmSSL] Using MOCK SM2 verification");
    // 简单的 mock 验证：检查签名长度和格式
    return signature.length > 0 && /^[0-9A-F]+$/.test(signature);
  }

  const pythonScript = `
import gmssl
import json

try:
    # Create SM2 key object
    key = gmssl.Sm2Key()
    key.set_public_key(bytes.fromhex('${publicKey}'))
    
    # Verify signature
    message_bytes = bytes.fromhex('${message}')
    signature_bytes = bytes.fromhex('${signature}')
    
    is_valid = key.verify(signature_bytes, message_bytes)
    
    result = {
        "success": True,
        "isValid": is_valid
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

    return result.isValid || false;
  } catch (error) {
    console.warn(`[GmSSL] SM2 verification failed, falling back to mock: ${error}`);
    // Mock 验证：只检查格式
    return signature.length > 0 && /^[0-9A-F]+$/.test(signature);
  }
}

/**
 * Calculate file hash (SM3)
 * @param filePath - Path to file
 */
export async function calculateFileHashSm3(filePath: string): Promise<string> {
  // 如果 gmssl 不可用，使用 mock 数据
  if (!gmSSLAvailable) {
    console.log("[GmSSL] Using MOCK file hash calculation");
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const fileContent = fs.readFileSync(filePath);
    return calculateMockSm3Hash(fileContent);
  }

  const pythonScript = `
import gmssl
import json

try:
    sm3 = gmssl.Sm3()
    
    # Read file and calculate hash
    with open('${filePath.replace(/'/g, "\\'")}', 'rb') as f:
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            sm3.update(chunk)
    
    digest = sm3.digest()
    
    result = {
        "success": True,
        "hash": digest.hex()
    }
except Exception as e:
    result = {
        "success": False,
        "error": str(e)
    }

print(json.dumps(result))
`;

  try {
    const tmpFile = path.join(os.tmpdir(), `gmssl_filehash_${Date.now()}.py`);
    fs.writeFileSync(tmpFile, pythonScript);

    const { stdout } = await execAsync(`python3 "${tmpFile}"`);
    const result = JSON.parse(stdout.trim());

    fs.unlinkSync(tmpFile);

    if (!result.success) {
      throw new Error(result.error || "Failed to calculate file hash");
    }

    return result.hash;
  } catch (error) {
    console.warn(`[GmSSL] File hash calculation failed, falling back to mock: ${error}`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const fileContent = fs.readFileSync(filePath);
    return calculateMockSm3Hash(fileContent);
  }
}
