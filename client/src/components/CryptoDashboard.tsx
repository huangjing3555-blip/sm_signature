/**
 * Crypto Dashboard - Main layout with sidebar navigation
 */

import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
// import { getLoginUrl } from "@/const"; // OAuth removed
import { useLocation, useRoute } from "wouter";
import "../sketch-theme.css";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "系统首页", icon: "🌐", path: "/" },
  { id: "keygen", label: "密钥生成", icon: "🗝️", path: "/keygen" },
  { id: "sm3", label: "SM3 哈希", icon: "📝", path: "/sm3" },
  { id: "sign", label: "数字签名", icon: "✍️", path: "/sign" },
  { id: "verify", label: "签名验证", icon: "🔎", path: "/verify" },
  { id: "history", label: "操作历史", icon: "📜", path: "/history" },
];

interface CryptoDashboardProps {
  children: React.ReactNode;
  currentPage: string;
}

export const CryptoDashboard: React.FC<CryptoDashboardProps> = ({ children, currentPage }) => {
  const { user, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="sketch-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div className="sketch-loading"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="sketch-container" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <h1>🛡️ 国密 SM2/SM3 数字签名系统</h1>
        <p style={{ fontSize: "1.1rem", color: "var(--color-ink-green)", marginBottom: "2rem" }}>
          基于香橙派 5 Plus 的国密算法应用平台
        </p>
        <a href="/login" className="sketch-button" style={{ display: "inline-block" }}>
          登录系统
        </a>
      </div>
    );
  }

  return (
    <div
      className="crypto-dashboard"
      data-page={currentPage}
      style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? "280px" : "0",
          background: "var(--card-bg)",
          borderRight: "2px solid var(--border)",
          padding: sidebarOpen ? "1.5rem 0" : "0",
          overflow: "hidden",
          transition: "all 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo/Header */}
        <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
          <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>🛡️</h2>
          <p style={{ margin: "0", fontSize: "0.9rem", color: "var(--color-ink-green)", fontWeight: "600" }}>
            国密签名系统
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, paddingBottom: "2rem" }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                width: "100%",
                padding: "0.75rem 1.5rem",
                border: "none",
                background: currentPage === item.id ? "rgba(107, 90, 80, 0.16)" : "transparent",
                borderLeft: currentPage === item.id ? "4px solid var(--color-ink-green)" : "4px solid transparent",
                color: currentPage === item.id ? "var(--foreground)" : "var(--foreground)",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: currentPage === item.id ? "600" : "400",
                transition: "all 0.2s ease",
                fontFamily: "var(--font-marker)",
              }}
              onMouseEnter={(e) => {
                if (currentPage !== item.id) {
                  (e.target as HTMLButtonElement).style.background = "var(--color-ink-green-soft)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== item.id) {
                  (e.target as HTMLButtonElement).style.background = "transparent";
                }
              }}
            >
              <span style={{ marginRight: "0.75rem" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div style={{ padding: "1.5rem", borderTop: "1px dashed var(--border)" }}>
          <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.85rem", color: "var(--color-subtle)" }}>
            登录用户
          </p>
          <p style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", fontWeight: "600", color: "var(--foreground)" }}>
            {user.username || "用户"}
          </p>
          <button
            onClick={() => logout()}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--color-error)",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = "var(--color-wine-soft)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = "transparent";
            }}
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: "2rem",
          overflow: "auto",
          maxHeight: "100vh",
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            paddingBottom: "1rem",
            borderBottom: "1px dashed var(--border)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0",
            }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
          <h1 style={{ margin: "0", flex: 1, marginLeft: "1rem", fontSize: "1.8rem" }}>
            🛡️ 国密 SM2/SM3 数字签名系统
          </h1>
        </div>

        {/* Content */}
        <div style={{ maxWidth: "1200px" }}>{children}</div>
      </main>
    </div>
  );
};

export default CryptoDashboard;
