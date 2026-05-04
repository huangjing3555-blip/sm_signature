import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Login() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      // 保存 token
      localStorage.setItem("auth_token", data.token);
      toast.success("登录成功！");
      // 刷新用户信息
      setTimeout(() => {
        navigate("/");
      }, 500);
    },
    onError: (error) => {
      toast.error(error.message || "登录失败");
      setIsLoading(false);
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await loginMutation.mutateAsync({
        username,
        password,
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <CardTitle className="text-2xl">国密签名系统</CardTitle>
          <CardDescription>SM2/SM3 数字签名与验签平台</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">用户名</label>
              <Input
                type="text"
                placeholder="输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">密码</label>
              <Input
                type="password"
                placeholder="输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg text-sm border" style={{ background: "var(--color-wine-soft)", borderColor: "var(--border)" }}>
            <p className="font-semibold mb-2" style={{ color: "var(--color-subtle)" }}>系统介绍：</p>
            <p style={{ color: "var(--color-subtle)" }}>国密 SM2/SM3 数字签名系统，支持密钥生成、数据签名、</p>
            <p style={{ color: "var(--color-subtle)" }}>签名验证、操作记录，系统色彩舒适，可部署于香橙派。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
