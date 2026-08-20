import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { ApiError, apiFetch, setToken } from "@/api/Admin/adminApi";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: number; phone: string; name: string | null; role: "USER" | "ADMIN" };
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<LoginResponse>("/api/auth/login/password", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      });
      if (data.user.role !== "ADMIN") {
        setError("این حساب دسترسی ادمین ندارد");
        return;
      }
      setToken(data.accessToken);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "خطا در ورود");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-panel">
      <div className="login-wrap">
        <form className="login-box" onSubmit={onSubmit}>
          <h1 style={{ fontSize: 18, marginBottom: 20 }}>ورود به پنل مدیریت</h1>
          <div className="field">
            <label>شماره موبایل</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09120000000" required />
          </div>
          <div className="field">
            <label>رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn" style={{ width: "100%" }} type="submit" disabled={loading}>
            {loading ? "در حال ورود..." : "ورود"}
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
}
