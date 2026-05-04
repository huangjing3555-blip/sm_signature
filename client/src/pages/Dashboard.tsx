/**
 * Dashboard Home Page
 */

import React from "react";
import { CryptoDashboard } from "@/components/CryptoDashboard";
import { useLocation } from "wouter";

export const Dashboard: React.FC = () => {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: "🗝️🔐",
      title: "SM2 密钥生成",
      description: "生成安全的 SM2 椭圆曲线密钥对，支持下载和管理",
      path: "/keygen",
    },
    {
      icon: "📝📌",
      title: "SM3 哈希计算",
      description: "对文本或文件进行 SM3 密码杂凑，生成 256 位哈希值",
      path: "/sm3",
    },
    {
      icon: "📃✍️",
      title: "数字签名",
      description: "使用 SM2 私钥对消息或文件进行数字签名",
      path: "/sign",
    },
    {
      icon: "🔏🔎",
      title: "签名验证",
      description: "使用 SM2 公钥验证签名的真实性和完整性",
      path: "/verify",
    },
  ];

  const stats = [
    {
      label: "支持算法",
      value: "SM2/SM3",
      icon: "🖥️",
      bg: "rgba(111, 47, 69, 0.12)",
      border: "#8f4b63",
      labelColor: "#5a2739",
      valueColor: "#6f2f45",
    },
    {
      label: "硬件平台",
      value: "Orange Pi 5 Plus",
      icon: "💠",
      bg: "rgba(63, 86, 120, 0.12)",
      border: "#5f7190",
      labelColor: "#3f5678",
      valueColor: "#3f5678",
    },
    {
      label: "处理器",
      value: "RK3588",
      icon: "🗄️",
      bg: "rgba(63, 95, 71, 0.12)",
      border: "#557a5d",
      labelColor: "#35543e",
      valueColor: "#3f5f47",
    },
    {
      label: "部署方式",
      value: "本地/云端",
      icon: "☁️",
      bg: "rgba(107, 90, 80, 0.12)",
      border: "#7f6a5f",
      labelColor: "#5f4c43",
      valueColor: "#6b5a50",
    },
  ];

  return (
    <CryptoDashboard currentPage="dashboard">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Welcome Section */}
        <div className="sketch-card sketch-card-tone-blue" style={{ marginBottom: "3rem" }}>
          <h2 style={{ marginTop: "0", color: "var(--color-charcoal)" }}>
            欢迎使用国密 SM2/SM3 数字签名系统
          </h2>
          <p style={{ margin: "0.5rem 0 0 0", color: "var(--color-charcoal)", fontSize: "1.05rem" }}>
            基于香橙派 5 Plus 的国密算法应用平台，提供安全、可靠的数字签名和验证服务
          </p>
        </div>

        {/* Quick Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="sketch-card sketch-card-tone-blue"
              style={{
                textAlign: "center",
                background: stat.bg,
                borderColor: stat.border,
              }}
            >
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "2rem" }}>{stat.icon}</p>
              <p style={{ margin: "0 0 0.25rem 0", color: stat.labelColor, fontSize: "0.9rem", fontWeight: 600 }}>
                {stat.label}
              </p>
              <p style={{ margin: "0", fontWeight: "700", fontSize: "1.1rem", color: stat.valueColor }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <h3 style={{ marginBottom: "1.5rem", color: "var(--color-wine)" }}>核心功能</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          {features.map((feature, idx) => (
            <button
              key={idx}
              className="sketch-card sketch-card-tone-green"
              onClick={() => navigate(feature.path)}
              style={{
                cursor: "pointer",
                textAlign: "left",
                background: "var(--card-bg)",
                border: "2px solid var(--border)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--accent)";
                el.style.transform = "translate(-2px, -2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border)";
                el.style.transform = "translate(0, 0)";
              }}
            >
              <p style={{ margin: "0 0 0.75rem 0", fontSize: "2rem" }}>{feature.icon}</p>
              <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "var(--foreground)" }}>
                {feature.title}
              </h4>
              <p style={{ margin: "0", color: "var(--color-subtle)", fontSize: "0.9rem" }}>
                {feature.description}
              </p>
              <p style={{ margin: "1rem 0 0 0", color: "var(--accent)", fontSize: "0.9rem", fontWeight: "600" }}>
                进入 →
              </p>
            </button>
          ))}
        </div>

        {/* Info Section */}
        <div className="sketch-accent-box secondary">
          <h3 style={{ marginTop: "0", color: "var(--color-wine)" }}>🔖关于国密算法</h3>
          <p style={{ margin: "0.5rem 0", color: "var(--color-charcoal)" }}>
            <strong>SM2</strong> 是基于椭圆曲线密码学 (ECC) 的公钥密码算法，用于数字签名、密钥交换和加密。
          </p>
          <p style={{ margin: "0.5rem 0", color: "var(--color-charcoal)" }}>
            <strong>SM3</strong> 是密码杂凑算法 (哈希函数)，输出长度为 256 位，用于确保数据的完整性和真实性。
          </p>
          <p style={{ margin: "0.5rem 0 0 0", color: "var(--color-charcoal)", fontSize: "0.9rem" }}>
            这两个算法已成为中国政务、金融及能源等关键领域的强制或推荐标准。
          </p>
        </div>

        {/* Getting Started */}
        <div className="sketch-card sketch-card-tone-taupe" style={{ marginTop: "2rem" }}>
          <h3 style={{ marginTop: "0", color: "var(--color-wine)" }}>📎快速开始指导！</h3>
          <ol style={{ margin: "0", paddingLeft: "1.5rem", color: "var(--color-charcoal)" }}>
            <li style={{ marginBottom: "0.75rem" }}>
              <strong>生成密钥</strong>：前往"密钥生成"页面，创建您的 SM2 密钥对
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
              <strong>计算哈希</strong>：使用"SM3 哈希"功能对文本或文件进行哈希计算
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
              <strong>签署文件</strong>：在"数字签名"页面使用私钥对消息或文件进行签名
            </li>
            <li>
              <strong>验证签名</strong>：在"签名验证"页面验证签名的真实性和完整性
            </li>
          </ol>
        </div>
      </div>
    </CryptoDashboard>
  );
};

export default Dashboard;
