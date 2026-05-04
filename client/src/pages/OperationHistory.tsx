/**
 * Operation History Page
 * Displays all SM3 hashes, signatures, and verifications
 */

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { CryptoDashboard } from "@/components/CryptoDashboard";

type HistoryTab = "hashes" | "signatures" | "verifications";

export const OperationHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HistoryTab>("hashes");
  const [limit, setLimit] = useState(50);

  const sm3History = trpc.crypto.getSm3History.useQuery({ limit });
  const signatureHistory = trpc.crypto.getSignatureHistory.useQuery({ limit });
  const verificationHistory = trpc.crypto.getVerificationHistory.useQuery({ limit });

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString();
  };

  const truncateHash = (hash: string, length: number = 16) => {
    return hash.length > length ? `${hash.substring(0, length)}...` : hash;
  };

  return (
    <CryptoDashboard currentPage="history">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2>操作历史</h2>
        <p style={{ color: "var(--color-subtle)", marginBottom: "2rem" }}>
          查看所有 SM3 哈希计算、数字签名和签名验证操作的完整历史记录
        </p>

        {/* Tab Navigation */}
        <div className="sketch-card sketch-card-tone-blue" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", gap: "1rem", borderBottom: "1px dashed var(--border)", paddingBottom: "1rem" }}>
            <button
              onClick={() => setActiveTab("hashes")}
              style={{
                background: activeTab === "hashes" ? "var(--accent)" : "var(--color-wine-soft)",
                color: activeTab === "hashes" ? "white" : "var(--color-heading)",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: activeTab === "hashes" ? "600" : "400",
                transition: "all 0.2s ease",
              }}
            >
              #️⃣ SM3 哈希 ({sm3History.data?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("signatures")}
              style={{
                background: activeTab === "signatures" ? "var(--accent)" : "var(--color-wine-soft)",
                color: activeTab === "signatures" ? "white" : "var(--color-heading)",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: activeTab === "signatures" ? "600" : "400",
                transition: "all 0.2s ease",
              }}
            >
              ✍️ 数字签名 ({signatureHistory.data?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("verifications")}
              style={{
                background: activeTab === "verifications" ? "var(--accent)" : "var(--color-wine-soft)",
                color: activeTab === "verifications" ? "white" : "var(--color-heading)",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: activeTab === "verifications" ? "600" : "400",
                transition: "all 0.2s ease",
              }}
            >
              ✓ 签名验证 ({verificationHistory.data?.length || 0})
            </button>
          </div>
        </div>

        {/* SM3 Hashes Tab */}
        {activeTab === "hashes" && (
          <div className="sketch-card sketch-card-tone-taupe">
            <h3 style={{ marginTop: "0" }}>SM3 哈希计算历史</h3>

            {sm3History.isLoading ? (
              <p style={{ textAlign: "center", color: "var(--color-subtle)" }}>加载中...</p>
            ) : sm3History.data && sm3History.data.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                        输入类型
                      </th>
                      <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                        名称
                      </th>
                      <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                        哈希值
                      </th>
                      <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                        创建时间
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sm3History.data.map((item: any) => (
                      <tr key={item.id} style={{ borderBottom: "1px dashed var(--border)" }}>
                        <td style={{ padding: "0.75rem" }}>
                          <span className="status-badge status-badge.info">
                            {item.inputType === "text" ? "📝 文本" : "📁 文件"}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem", fontWeight: "500" }}>
                          {item.inputName}
                        </td>
                        <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                          <code title={item.outputHash}>{truncateHash(item.outputHash, 20)}</code>
                        </td>
                        <td style={{ padding: "0.75rem", color: "var(--color-subtle)", fontSize: "0.85rem" }}>
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: "var(--color-subtle)", textAlign: "center", padding: "2rem 0" }}>
                还没有任何 SM3 哈希计算记录
              </p>
            )}
          </div>
        )}

        {/* Signatures Tab */}
        {activeTab === "signatures" && (
          <div className="sketch-card sketch-card-tone-taupe">
            <h3 style={{ marginTop: "0" }}>数字签名历史</h3>

            {signatureHistory.isLoading ? (
              <p style={{ textAlign: "center", color: "var(--color-subtle)" }}>加载中...</p>
            ) : signatureHistory.data && signatureHistory.data.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                        消息类型
                      </th>
                      <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                        名称
                      </th>
                      <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                        消息哈希
                      </th>
                      <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                        签名值
                      </th>
                      <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                        创建时间
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {signatureHistory.data.map((item: any) => (
                      <tr key={item.id} style={{ borderBottom: "1px dashed var(--border)" }}>
                        <td style={{ padding: "0.75rem" }}>
                          <span className="status-badge status-badge.info">
                            {item.messageType === "text" ? "📝 文本" : "📁 文件"}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem", fontWeight: "500" }}>
                          {item.messageName}
                        </td>
                        <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                          <code title={item.messageHash}>{truncateHash(item.messageHash, 16)}</code>
                        </td>
                        <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                          <code title={item.signatureValue}>{truncateHash(item.signatureValue, 16)}</code>
                        </td>
                        <td style={{ padding: "0.75rem", color: "var(--color-subtle)", fontSize: "0.85rem" }}>
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: "var(--color-subtle)", textAlign: "center", padding: "2rem 0" }}>
                还没有任何数字签名记录
              </p>
            )}
          </div>
        )}

        {/* Verifications Tab */}
        {activeTab === "verifications" && (
          <div className="sketch-card sketch-card-tone-taupe">
            <h3 style={{ marginTop: "0" }}>签名验证历史</h3>

            {verificationHistory.isLoading ? (
              <p style={{ textAlign: "center", color: "var(--color-subtle)" }}>加载中...</p>
            ) : verificationHistory.data && verificationHistory.data.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                        消息类型
                      </th>
                      <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                        名称
                      </th>
                      <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                        验证结果
                      </th>
                      <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                        消息哈希
                      </th>
                      <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600" }}>
                        创建时间
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {verificationHistory.data.map((item: any) => (
                      <tr key={item.id} style={{ borderBottom: "1px dashed var(--border)" }}>
                        <td style={{ padding: "0.75rem" }}>
                          <span className="status-badge status-badge.info">
                            {item.messageType === "text" ? "📝 文本" : "📁 文件"}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem", fontWeight: "500" }}>
                          {item.messageName}
                        </td>
                        <td style={{ padding: "0.75rem" }}>
                          <span
                            className={`status-badge ${item.isValid ? "status-badge.success" : "status-badge.error"}`}
                          >
                            {item.isValid ? "✓ 通过" : "✗ 失败"}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                          <code title={item.messageHash}>{truncateHash(item.messageHash, 16)}</code>
                        </td>
                        <td style={{ padding: "0.75rem", color: "var(--color-subtle)", fontSize: "0.85rem" }}>
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: "var(--color-subtle)", textAlign: "center", padding: "2rem 0" }}>
                还没有任何签名验证记录
              </p>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="sketch-card sketch-card-tone-blue" style={{ marginTop: "2rem", textAlign: "center" }}>
          <label style={{ marginRight: "1rem" }}>显示条数:</label>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            style={{
              padding: "0.5rem",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </CryptoDashboard>
  );
};

export default OperationHistory;
