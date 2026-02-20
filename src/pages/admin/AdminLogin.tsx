import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Eye, EyeOff, Gamepad2 } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const bgRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bgRef.current) return;
    const rect = bgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    bgRef.current.style.setProperty("--mx", `${x}%`);
    bgRef.current.style.setProperty("--my", `${y}%`);
  };

  const handleMouseLeave = () => {
    if (!bgRef.current) return;
    bgRef.current.style.setProperty("--mx", "50%");
    bgRef.current.style.setProperty("--my", "50%");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password;

    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword,
    });

    if (authErr) {
      setError(authErr.message || "Invalid credentials. Access denied.");
      setLoading(false);
      return;
    }

    navigate("/admin/dashboard");
    setLoading(false);
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ background: "linear-gradient(135deg, hsl(var(--cream)), hsl(var(--cream-dark)))" }}
    >
      <div ref={bgRef} className="pointer-events-none absolute inset-0" style={{ ["--mx" as any]: "50%", ["--my" as any]: "50%" }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(620px circle at var(--mx) var(--my), hsla(var(--gold) / 0.24), transparent 40%), radial-gradient(700px circle at 15% 20%, hsla(var(--brown) / 0.2), transparent 45%), radial-gradient(760px circle at 85% 80%, hsla(var(--brown-light) / 0.18), transparent 42%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: "radial-gradient(hsla(var(--brown) / 0.14) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ background: "hsla(var(--gold) / 0.18)" }} />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: "hsla(var(--brown) / 0.22)", animationDelay: "800ms" }} />
      </div>

      <button
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-cinzel tracking-widest transition-all hover:scale-105"
        style={{ background: "hsla(var(--cream) / 0.8)", color: "hsl(var(--brown-deep))", border: "1px solid hsl(var(--cream-dark))", fontFamily: "Cinzel, serif" }}
      >
        <ArrowLeft size={14} />
        GO BACK
      </button>

      <div className="relative z-10 w-full max-w-md">
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
