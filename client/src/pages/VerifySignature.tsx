/**
 * Signature Verification Page
 */

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { CryptoDashboard } from "@/components/CryptoDashboard";

interface VerificationResult {
  isValid: boolean;
  messageHash: string;
  filename?: string;
}

export const VerifySignature: React.FC = () => {
  const [messageType, setMessageType] = useState<"text" | "file">("text");
  const [textMessage, setTextMessage] = useState("");
  const [fileMessage, setFileMessage] = useState<File | null>(null);
  const [signature, setSignature] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [label, setLabel] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifySignature = trpc.crypto.verifySignature.useMutation();
  const verifyFileSignature = trpc.crypto.verifyFileSignature.useMutation();

  const handleVerifyText = async () => {
    if (!textMessage.trim()) {
      setError("请输入消息内容");
      return;
    }
    if (!signature.trim()) {
      setError("请输入签名值");
      return;
    }
    if (!publicKey.trim()) {
      setError("请输入公钥");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await verifySignature.mutateAsync({
        message: textMessage,
        signature,
        publicKey,
        label: label || "文本消息",
      });

      setResult({
        isValid: response.isValid,
        messageHash: response.messageHash,
      });
    } catch (err) {
      setError(`验证失败: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFile = async () => {
    if (!fileMessage) {
      setError("请选择文件");
      return;
    }
    if (!signature.trim()) {
      setError("请输入签名值");
      return;
    }
    if (!publicKey.trim()) {
      setError("请输入公钥");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Upload file first
      const formData = new FormData();
      formData.append("file", fileMessage);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("文件上传失败");
      }

      const { fileKey } = await uploadResponse.json();

      // Verify file
      const response = await verifyFileSignature.mutateAsync({
        fileKey,
        filename: fileMessage.name,
        signature,
        publicKey,
      });

      setResult({
        isValid: response.isValid,
        messageHash: response.messageHash,
        filename: response.filename,
      });
    } catch (err) {
      setError(`验证失败: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CryptoDashboard currentPage="verify">
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h2>签名验证</h2>
        <p style={{ color: "var(--color-subtle)", marginBottom: "2rem" }}>
          使用 SM2 公钥验证签名的真实性和完整性，确保消息未被篡改
        </p>

        {/* Message Type Selector */}
        <div className="sketch-card sketch-card-tone-blue" style={{ marginBottom: "2rem" }}>
          <label style={{ marginBottom: "1rem", display: "block" }}>消息类型</label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              className="sketch-button"
              style={{
                background: messageType === "text" ? "var(--accent)" : "var(--color-wine-soft)",
                color: messageType === "text" ? "white" : "var(--color-heading)",
                border: "none",
              }}
              onClick={() => {
                setMessageType("text");
                setResult(null);
                setError(null);
              }}
            >
              文本消息
            </button>
            <button
              className="sketch-button"
              style={{
                background: messageType === "file" ? "var(--accent)" : "var(--color-wine-soft)",
                color: messageType === "file" ? "white" : "var(--color-heading)",
                border: "none",
              }}
              onClick={() => {
                setMessageType("file");
                setResult(null);
                setError(null);
              }}
            >
              文件验证
            </button>
          </div>
        </div>

        {/* Text Message Input */}
        {messageType === "text" && (
          <div className="sketch-card sketch-card-tone-green" style={{ marginBottom: "2rem" }}>
            <label>消息内容</label>
            <textarea
              className="sketch-input"
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              placeholder="输入需要验证的消息..."
              style={{
                width: "100%",
                minHeight: "100px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            />

            <label>签名值 (十六进制)</label>
            <textarea
              className="sketch-input"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="粘贴签名值..."
              style={{
                width: "100%",
                minHeight: "100px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            />

            <label>公钥 (十六进制)</label>
            <textarea
              className="sketch-input"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="粘贴公钥..."
              style={{
                width: "100%",
                minHeight: "100px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            />

            <button
              className="sketch-button"
              onClick={handleVerifyText}
              disabled={loading}
              style={{ width: "100%", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "验证中..." : "验证 SM2 签名"}
            </button>
          </div>
        )}

        {/* File Input */}
        {messageType === "file" && (
          <div className="sketch-card sketch-card-tone-green" style={{ marginBottom: "2rem" }}>
            <label>选择文件</label>
            <div
              style={{
                border: "2px dashed var(--border)",
                borderRadius: "8px",
                padding: "2rem",
                textAlign: "center",
                marginBottom: "1rem",
                cursor: "pointer",
              }}
              onDragOver={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLDivElement).style.background = "var(--color-ink-green-soft)";
              }}
              onDragLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
              onDrop={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
                if (e.dataTransfer.files[0]) {
                  setFileMessage(e.dataTransfer.files[0]);
                }
              }}
            >
              <input
                type="file"
                onChange={(e) => setFileMessage(e.target.files?.[0] || null)}
                style={{ display: "none" }}
                id="file-input-verify"
              />
              <label htmlFor="file-input-verify" style={{ cursor: "pointer", display: "block" }}>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>📄</p>
                <p style={{ margin: "0", fontWeight: "600" }}>
                  {fileMessage ? fileMessage.name : "点击选择或拖拽文件"}
                </p>
              </label>
            </div>

            <label>签名值 (十六进制)</label>
            <textarea
              className="sketch-input"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="粘贴签名值..."
              style={{
                width: "100%",
                minHeight: "100px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            />

            <label>公钥 (十六进制)</label>
            <textarea
              className="sketch-input"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="粘贴公钥..."
              style={{
                width: "100%",
                minHeight: "100px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            />

            <button
              className="sketch-button"
              onClick={handleVerifyFile}
              disabled={loading || !fileMessage}
              style={{ width: "100%", opacity: loading || !fileMessage ? 0.6 : 1 }}
            >
              {loading ? "验证中..." : "验证文件签名"}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="sketch-card sketch-card-tone-wine"
            style={{
              background: "var(--color-wine-soft)",
              borderColor: "var(--color-error)",
              marginBottom: "2rem",
            }}
          >
            <p style={{ margin: "0", color: "var(--color-error)" }}>❌ {error}</p>
          </div>
        )}

        {/* Verification Result */}
        {result && (
          <div
            className="sketch-card sketch-card-tone-taupe"
            style={{
              background: result.isValid
                ? "rgba(127, 176, 105, 0.1)"
                : "var(--color-wine-soft)",
              borderColor: result.isValid ? "var(--color-success)" : "var(--color-error)",
              marginBottom: "2rem",
            }}
          >
            <h3 style={{ marginTop: "0", color: result.isValid ? "var(--color-success)" : "var(--color-error)" }}>
              {result.isValid ? "✓ 验证通过" : "✗ 验证失败"}
            </h3>

            <p style={{ margin: "0.5rem 0", color: "var(--color-charcoal)" }}>
              <strong>验证结果:</strong> {result.isValid ? "签名有效，消息完整无篡改" : "签名无效，消息可能已被篡改"}
            </p>

            {result.filename && (
              <p style={{ margin: "0.5rem 0", color: "var(--color-charcoal)" }}>
                <strong>文件名:</strong> {result.filename}
              </p>
            )}

            <p style={{ margin: "0.5rem 0", color: "var(--color-subtle)", fontSize: "0.9rem" }}>
              <strong>消息哈希 (SM3):</strong>
            </p>
            <div className="code-display" style={{ marginBottom: "1rem" }}>
              {result.messageHash}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(result.messageHash);
                alert("已复制消息哈希到剪贴板");
              }}
              className="sketch-button"
              style={{
                background: result.isValid ? "var(--color-success)" : "var(--color-error)",
                borderColor: result.isValid ? "var(--color-success)" : "var(--color-error)",
              }}
            >
              复制消息哈希
            </button>
          </div>
        )}
      </div>
    </CryptoDashboard>
  );
};

export default VerifySignature;
