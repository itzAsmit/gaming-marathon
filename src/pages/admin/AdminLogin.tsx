import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Gamepad2 } from "lucide-react";

const ADMIN_EMAIL = "marathon@gmail.com";
const ADMIN_PASSWORD = "mara1234";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setError("Invalid credentials. Access denied.");
      setLoading(false);
      return;
    }

    // Sign in with Supabase auth
    const { error: authErr } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    if (authErr) {
      // Try to sign up first if user doesn't exist
      const { error: signUpErr } = await supabase.auth.signUp({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      if (signUpErr) {
        // Try sign in again
        const { error: retryErr } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
        if (retryErr) {
          setError("Auth error. Please try again.");
          setLoading(false);
          return;
        }
      } else {
        // If signup succeeded, sign in
        await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      }
    }

    navigate("/admin/dashboard");
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, hsl(var(--cream)), hsl(var(--cream-dark)))" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))" }}>
            <Gamepad2 size={28} style={{ color: "hsl(var(--cream))" }} />
          </div>
          <h1 className="text-3xl font-cinzel font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Cinzel, serif" }}>
            ADMIN ACCESS
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--brown-light))" }}>Gaming Marathon Control Panel</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-xl" style={{ background: "white", border: "1px solid hsl(var(--cream-dark))" }}>
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-cinzel tracking-widest mb-2" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "hsl(var(--cream))",
                  border: "1px solid hsl(var(--cream-dark))",
                  color: "hsl(var(--brown-deep))",
                }}
                placeholder="admin@marathon.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-cinzel tracking-widest mb-2" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all pr-12"
                  style={{
                    background: "hsl(var(--cream))",
                    border: "1px solid hsl(var(--cream-dark))",
                    color: "hsl(var(--brown-deep))",
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "hsl(var(--brown-light))" }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: "hsl(var(--brown))" }}
              />
              <span className="text-sm" style={{ color: "hsl(var(--brown-light))" }}>Remember me</span>
            </label>

            {/* Error */}
            {error && (
              <p className="text-sm text-center py-2 px-4 rounded-lg" style={{ background: "hsl(0 80% 96%)", color: "hsl(0 70% 45%)", border: "1px solid hsl(0 60% 85%)" }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-cinzel text-sm tracking-widest transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))",
                color: "hsl(var(--cream))",
                fontFamily: "Cinzel, serif",
                boxShadow: "0 4px 20px hsla(var(--brown) / 0.3)",
              }}
            >
              {loading ? "AUTHENTICATING..." : "ENTER ARENA"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: "hsl(var(--brown-light) / 0.6)" }}>
          Restricted access — authorized personnel only
        </p>
      </div>
    </div>
  );
}
