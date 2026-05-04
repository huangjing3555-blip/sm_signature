/**
 * Digital Signature Page
 */

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { CryptoDashboard } from "@/components/CryptoDashboard";

export const SignMessage: React.FC = () => {
  const [messageType, setMessageType] = useState<"text" | "file">("text");
  const [textMessage, setTextMessage] = useState("");
  const [fileMessage, setFileMessage] = useState<File | null>(null);
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);
  const [label, setLabel] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listSm2Keys = trpc.crypto.listSm2Keys.useQuery();
  const signMessage = trpc.crypto.signMessage.useMutation();
  const signFile = trpc.crypto.signFile.useMutation();

  const handleSignText = async () => {
    if (!textMessage.trim()) {
      setError("请输入消息内容");
      return;
    }
    if (!selectedKeyId) {
      setError("请选择签名密钥");
      return;
    }

    setLoading(true);
    setError(null);
    setSignature(null);

    try {
      const response = await signMessage.mutateAsync({
        keyId: selectedKeyId,
        message: textMessage,
        label: label || "文本消息",
      });

      setSignature(response.signature);
    } catch (err) {
      setError(`签名失败: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignFile = async () => {
    if (!fileMessage) {
      setError("请选择文件");
      return;
    }
    if (!selectedKeyId) {
      setError("请选择签名密钥");
      return;
    }

    setLoading(true);
    setError(null);
    setSignature(null);

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

      // Sign file
      const response = await signFile.mutateAsync({
        keyId: selectedKeyId,
        fileKey,
        filename: fileMessage.name,
      });

      setSignature(response.signature);
    } catch (err) {
      setError(`签名失败: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CryptoDashboard currentPage="sign">
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h2>数字签名</h2>
        <p style={{ color: "var(--color-subtle)", marginBottom: "2rem" }}>
          使用 SM2 私钥对消息或文件进行数字签名，生成可验证的签名值
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
                setSignature(null);
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
                setSignature(null);
                setError(null);
              }}
            >
              文件签名
            </button>
          </div>
        </div>

        {/* Key Selection */}
        <div className="sketch-card sketch-card-tone-green" style={{ marginBottom: "2rem" }}>
          <label>选择签名密钥</label>
          <select
            className="sketch-input"
            value={selectedKeyId || ""}
            onChange={(e) => setSelectedKeyId(parseInt(e.target.value) || null)}
            style={{ width: "100%", marginBottom: "1rem" }}
          >
            <option value="">-- 请选择密钥 --</option>
            {listSm2Keys.data?.map((key) => (
              <option key={key.id} value={key.id}>
                {key.keyName}
              </option>
            ))}
          </select>
          {!listSm2Keys.data || listSm2Keys.data.length === 0 ? (
            <p style={{ color: "var(--color-error)", fontSize: "0.9rem", margin: "0" }}>
              ⚠️ 还没有生成任何密钥，请先前往"密钥生成"页面创建
            </p>
          ) : null}
        </div>

        {/* Text Message Input */}
        {messageType === "text" && (
          <div className="sketch-card sketch-card-tone-green" style={{ marginBottom: "2rem" }}>
            <label>消息内容</label>
            <textarea
              className="sketch-input"
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              placeholder="输入需要签名的消息..."
              style={{
                width: "100%",
                minHeight: "150px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            />

            <label>标签 (可选)</label>
            <input
              type="text"
              className="sketch-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="为此签名添加标签..."
              style={{ width: "100%", marginBottom: "1rem" }}
            />

            <button
              className="sketch-button"
              onClick={handleSignText}
              disabled={loading || !selectedKeyId}
              style={{ width: "100%", opacity: loading || !selectedKeyId ? 0.6 : 1 }}
            >
              {loading ? "签名中..." : "对消息进行 SM2 签名"}
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
                id="file-input-sign"
              />
              <label htmlFor="file-input-sign" style={{ cursor: "pointer", display: "block" }}>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>📄</p>
                <p style={{ margin: "0", fontWeight: "600" }}>
                  {fileMessage ? fileMessage.name : "点击选择或拖拽文件"}
                </p>
              </label>
            </div>

            <label>标签 (可选)</label>
            <input
              type="text"
              className="sketch-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="为此签名添加标签..."
              style={{ width: "100%", marginBottom: "1rem" }}
            />

            <button
              className="sketch-button"
              onClick={handleSignFile}
              disabled={loading || !selectedKeyId || !fileMessage}
              style={{ width: "100%", opacity: loading || !selectedKeyId || !fileMessage ? 0.6 : 1 }}
            >
              {loading ? "签名中..." : "对文件进行 SM2 签名"}
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

        {/* Signature Result */}
        {signature && (
          <div className="sketch-card sketch-card-tone-taupe" style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginTop: "0", color: "var(--color-success)" }}>✓ 签名成功</h3>
            <p style={{ color: "var(--color-subtle)", marginBottom: "1rem" }}>SM2 签名值 (十六进制):</p>
            <div className="code-display" style={{ marginBottom: "1rem", maxHeight: "200px", overflow: "auto" }}>
              {signature}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(signature);
                alert("已复制签名值到剪贴板");
              }}
              className="sketch-button"
              style={{ background: "var(--color-success)", borderColor: "var(--color-success)" }}
            >
              复制签名值
            </button>
          </div>
        )}
      </div>
    </CryptoDashboard>
  );
};

export default SignMessage;
