/**
 * SM3 Hash Calculator Page
 */

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { CryptoDashboard } from "@/components/CryptoDashboard";

export const SM3Hash: React.FC = () => {
  const [inputType, setInputType] = useState<"text" | "file">("text");
  const [textInput, setTextInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateSm3Text = trpc.crypto.calculateSm3Text.useMutation();
  const calculateSm3File = trpc.crypto.calculateSm3File.useMutation();

  const handleCalculateText = async () => {
    if (!textInput.trim()) {
      setError("请输入文本内容");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await calculateSm3Text.mutateAsync({
        text: textInput,
        label: label || "文本输入",
      });

      setResult(response.hash);
    } catch (err) {
      setError(`计算失败: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateFile = async () => {
    if (!fileInput) {
      setError("请选择文件");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Upload file to S3 first
      const formData = new FormData();
      formData.append("file", fileInput);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("文件上传失败");
      }

      const { fileKey } = await uploadResponse.json();

      // Calculate hash
      const response = await calculateSm3File.mutateAsync({
        fileKey,
        filename: fileInput.name,
      });

      setResult(response.hash);
    } catch (err) {
      setError(`计算失败: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CryptoDashboard currentPage="sm3">
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h2>SM3 哈希计算</h2>
        <p style={{ color: "var(--color-subtle)", marginBottom: "2rem" }}>
          对文本或文件进行 SM3 密码杂凑计算，生成 256 位哈希值
        </p>

        {/* Input Type Selector */}
        <div className="sketch-card sketch-card-tone-blue" style={{ marginBottom: "2rem" }}>
          <label style={{ marginBottom: "1rem", display: "block" }}>输入类型</label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              className="sketch-button"
              style={{
                background: inputType === "text" ? "var(--accent)" : "var(--color-wine-soft)",
                color: inputType === "text" ? "white" : "var(--color-heading)",
                border: "none",
              }}
              onClick={() => {
                setInputType("text");
                setResult(null);
                setError(null);
              }}
            >
              文本输入
            </button>
            <button
              className="sketch-button"
              style={{
                background: inputType === "file" ? "var(--accent)" : "var(--color-wine-soft)",
                color: inputType === "file" ? "white" : "var(--color-heading)",
                border: "none",
              }}
              onClick={() => {
                setInputType("file");
                setResult(null);
                setError(null);
              }}
            >
              文件上传
            </button>
          </div>
        </div>

        {/* Text Input */}
        {inputType === "text" && (
          <div className="sketch-card sketch-card-tone-green" style={{ marginBottom: "2rem" }}>
            <label>输入文本</label>
            <textarea
              className="sketch-input"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="输入需要计算哈希的文本内容..."
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
              placeholder="为此操作添加标签..."
              style={{ width: "100%", marginBottom: "1rem" }}
            />

            <button
              className="sketch-button"
              onClick={handleCalculateText}
              disabled={loading}
              style={{ width: "100%", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "计算中..." : "计算 SM3 哈希"}
            </button>
          </div>
        )}

        {/* File Input */}
        {inputType === "file" && (
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
                transition: "all 0.3s ease",
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
                  setFileInput(e.dataTransfer.files[0]);
                }
              }}
            >
              <input
                type="file"
                onChange={(e) => setFileInput(e.target.files?.[0] || null)}
                style={{ display: "none" }}
                id="file-input"
              />
              <label htmlFor="file-input" style={{ cursor: "pointer", display: "block" }}>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>📁</p>
                <p style={{ margin: "0", fontWeight: "600" }}>
                  {fileInput ? fileInput.name : "点击选择或拖拽文件"}
                </p>
              </label>
            </div>

            <label>标签 (可选)</label>
            <input
              type="text"
              className="sketch-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="为此操作添加标签..."
              style={{ width: "100%", marginBottom: "1rem" }}
            />

            <button
              className="sketch-button"
              onClick={handleCalculateFile}
              disabled={loading || !fileInput}
              style={{ width: "100%", opacity: loading || !fileInput ? 0.6 : 1 }}
            >
              {loading ? "计算中..." : "计算 SM3 哈希"}
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

        {/* Result */}
        {result && (
          <div className="sketch-card sketch-card-tone-taupe" style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginTop: "0" }}>✓ 计算结果</h3>
            <p style={{ color: "var(--color-subtle)", marginBottom: "1rem" }}>SM3 哈希值 (256 位):</p>
            <div className="code-display" style={{ marginBottom: "1rem" }}>
              {result}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(result);
                alert("已复制到剪贴板");
              }}
              className="sketch-button"
              style={{ background: "var(--color-success)", borderColor: "var(--color-success)" }}
            >
              复制哈希值
            </button>
          </div>
        )}
      </div>
    </CryptoDashboard>
  );
};

export default SM3Hash;
