/**
 * SM2 Key Generation Page
 */

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { CryptoDashboard } from "@/components/CryptoDashboard";

interface GeneratedKey {
  keyId: number;
  keyName: string;
  publicKey: string;
}

export const KeyGeneration: React.FC = () => {
  const [keyName, setKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<GeneratedKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<any[]>([]);

  const generateSm2Key = trpc.crypto.generateSm2Key.useMutation();
  const listSm2Keys = trpc.crypto.listSm2Keys.useQuery();
  const downloadSm2Key = trpc.crypto.downloadSm2Key.useMutation();
  const deleteSm2Key = trpc.crypto.deleteSm2Key.useMutation();

  React.useEffect(() => {
    if (listSm2Keys.data) {
      setKeys(listSm2Keys.data);
    }
  }, [listSm2Keys.data]);

  const handleGenerateKey = async () => {
    if (!keyName.trim()) {
      setError("请输入密钥名称");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedKey(null);

    try {
      const response = await generateSm2Key.mutateAsync({
        keyName,
      });

      setGeneratedKey({
        keyId: response.keyId,
        keyName: response.keyName,
        publicKey: response.publicKey,
      });

      setKeyName("");
      // Refresh key list
      listSm2Keys.refetch();
    } catch (err) {
      setError(`生成失败: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadKey = async (keyId: number) => {
    try {
      const response = await downloadSm2Key.mutateAsync({ keyId });
      // Trigger download
      const link = document.createElement("a");
      link.href = response.downloadUrl;
      link.download = response.filename;
      link.click();
    } catch (err) {
      alert(`下载失败: ${err}`);
    }
  };

  const handleDeleteKey = async (keyId: number) => {
    if (!confirm("确定要删除此密钥吗？此操作无法撤销。")) {
      return;
    }

    try {
      await deleteSm2Key.mutateAsync({ keyId });
      listSm2Keys.refetch();
    } catch (err) {
      alert(`删除失败: ${err}`);
    }
  };

  return (
    <CryptoDashboard currentPage="keygen">
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h2>SM2 密钥对生成</h2>
        <p style={{ color: "var(--color-subtle)", marginBottom: "2rem" }}>
          生成 SM2 椭圆曲线密钥对，用于数字签名和验证操作
        </p>

        {/* Key Generation Form */}
        <div className="sketch-card sketch-card-tone-blue" style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginTop: "0" }}>生成新密钥</h3>

          <label>密钥名称</label>
          <input
            type="text"
            className="sketch-input"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="例如: 我的签名密钥、公司公章等..."
            style={{ width: "100%", marginBottom: "1rem" }}
          />

          <button
            className="sketch-button"
            onClick={handleGenerateKey}
            disabled={loading}
            style={{ width: "100%", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "生成中..." : "生成 SM2 密钥对"}
          </button>
        </div>

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

        {/* Generated Key Display */}
        {generatedKey && (
          <div className="sketch-card sketch-card-tone-taupe" style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginTop: "0", color: "var(--color-success)" }}>✓ 密钥生成成功</h3>

            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ margin: "0 0 0.5rem 0", color: "var(--color-subtle)", fontSize: "0.9rem" }}>
                密钥名称
              </p>
              <p style={{ margin: "0 0 1rem 0", fontWeight: "600", fontSize: "1rem" }}>
                {generatedKey.keyName}
              </p>

              <p style={{ margin: "0 0 0.5rem 0", color: "var(--color-subtle)", fontSize: "0.9rem" }}>
                公钥 (可安全分享)
              </p>
              <div className="code-display" style={{ marginBottom: "1rem", maxHeight: "120px", overflow: "auto" }}>
                {generatedKey.publicKey}
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedKey.publicKey);
                  alert("已复制公钥到剪贴板");
                }}
                className="sketch-button"
                style={{
                  background: "var(--color-wine)",
                  borderColor: "var(--color-wine)",
                  marginRight: "0.5rem",
                }}
              >
                复制公钥
              </button>

              <button
                onClick={() => handleDownloadKey(generatedKey.keyId)}
                className="sketch-button"
                style={{
                  background: "var(--color-ink-green)",
                  borderColor: "var(--color-ink-green)",
                }}
              >
                下载密钥文件
              </button>
            </div>

            <div
              className="sketch-accent-box"
              style={{
                background: "var(--color-wine-soft)",
                borderColor: "var(--color-error)",
              }}
            >
              <p style={{ margin: "0", fontSize: "0.9rem", color: "var(--color-error)" }}>
                ⚠️ 重要提示: 私钥已安全存储在服务器。请妥善保管下载的密钥文件，不要在不安全的地方分享私钥。
              </p>
            </div>
          </div>
        )}

        {/* Keys List */}
        <div className="sketch-card sketch-card-tone-taupe">
          <h3 style={{ marginTop: "0" }}>我的密钥</h3>

          {keys.length === 0 ? (
            <p style={{ color: "var(--color-subtle)", textAlign: "center", padding: "2rem 0" }}>
              还没有生成任何密钥。上方生成第一个密钥吧！
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                      密钥名称
                    </th>
                    <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                      算法
                    </th>
                    <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                      创建时间
                    </th>
                    <th style={{ textAlign: "center", padding: "0.75rem", fontWeight: "600" }}>
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key.id} style={{ borderBottom: "1px dashed var(--border)" }}>
                      <td style={{ padding: "0.75rem", fontWeight: "500" }}>{key.keyName}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <span className="status-badge status-badge.info">{key.algorithm}</span>
                      </td>
                      <td style={{ padding: "0.75rem", color: "var(--color-subtle)" }}>
                        {new Date(key.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        <button
                          onClick={() => handleDownloadKey(key.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--accent)",
                            cursor: "pointer",
                            marginRight: "1rem",
                            fontSize: "0.9rem",
                          }}
                        >
                          下载
                        </button>
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--color-error)",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                          }}
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CryptoDashboard>
  );
};

export default KeyGeneration;
