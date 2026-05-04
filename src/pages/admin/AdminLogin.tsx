import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/lib/withTimeout";
import { isConstrainedNetwork } from "@/hooks/use-constrained-network";
import { ArrowLeft, Eye, EyeOff, Gamepad2 } from "lucide-react";
import SlideButton from "@/components/ui/slide-button";

export default function AdminLogin() {
  const navigate = useNavigate();
  const bgRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [sliderResetSignal, setSliderResetSignal] = useState(0);

  useEffect(() => {
    const savedData = localStorage.getItem("admin_login_remember");
    if (savedData) {
      try {
        const { savedEmail, savedPassword } = JSON.parse(savedData);
        if (savedEmail) setEmail(savedEmail);
        if (savedPassword) setPassword(savedPassword);
        setRememberMe(true);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const resetSlider = () => {
    setSliderResetSignal((value) => value + 1);
  };

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
    const constrained = isConstrainedNetwork();
    console.log('[AdminLogin] Network constrained:', constrained);

    const handleSuccess = () => {
      if (rememberMe) {
        localStorage.setItem("admin_login_remember", JSON.stringify({ savedEmail: normalizedEmail, savedPassword: normalizedPassword }));
      } else {
        localStorage.removeItem("admin_login_remember");
      }
    };

    const tryProxyLogin = async (): Promise<{ usedManualStorage: boolean }> => {
      let lastError: Error | null = null;
      let usedManualStorage = false;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          console.log(`[AdminLogin] Proxy attempt ${attempt + 1}/2`);
          const response = await withTimeout(
            fetch(`/api/admin-login?attempt=${attempt + 1}&ts=${Date.now()}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              cache: "no-store",
              body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
            }),
            12000,
            "Proxy login timed out. Please check your internet and try again.",
          );

          console.log(`[AdminLogin] Proxy response: ${response.status} ${response.ok}`);

          const json = (await response.json().catch(() => ({}))) as {
            access_token?: string;
            refresh_token?: string;
            error?: string;
            user?: any;
            expires_at?: number;
            expires_in?: number;
          };

          if (!response.ok || !json.access_token || !json.refresh_token) {
            throw new Error(json.error || "Login failed. Please try again.");
          }

          console.log('[AdminLogin] Proxy success, setting session');
          
          // On constrained networks, setSession may timeout trying to validate.
          // Wrap with short timeout and fall back to manual storage if needed.
          const constrained = isConstrainedNetwork();
          
          try {
            const setSessionPromise = supabase.auth.setSession({
              access_token: json.access_token,
              refresh_token: json.refresh_token,
            });

            const { error: sessionErr } = await (constrained
              ? withTimeout(setSessionPromise, 3000, "Session set timed out")
              : setSessionPromise);

            if (sessionErr) throw sessionErr;
          } catch (setErr) {
            console.log('[AdminLogin] setSession failed, using manual storage:', setErr);
            // Manually store tokens so the app can function
            // Supabase will pick these up on next page load when network is better
            const storageKey = `sb-${import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] ?? 'auth'}-auth-token`;
            const sessionData = {
              access_token: json.access_token,
              refresh_token: json.refresh_token,
              token_type: 'bearer',
              expires_in: json.expires_in ?? 3600,
              expires_at: json.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
              user: json.user ?? null,
            };
            try {
              localStorage.setItem(storageKey, JSON.stringify(sessionData));
              usedManualStorage = true;
            } catch {
              // localStorage might be unavailable
            }
          }
          
          console.log('[AdminLogin] Session set successfully');
          return { usedManualStorage };
        } catch (error) {
          console.log(`[AdminLogin] Proxy attempt failed:`, error);
          lastError = error instanceof Error ? error : new Error("Proxy login failed");
          if (attempt < 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }

      throw lastError ?? new Error("Proxy login failed");
    };

    const tryDirectLogin = async (): Promise<void> => {
      console.log('[AdminLogin] Trying direct Supabase login');
      const { error: authErr } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: normalizedPassword,
        }),
        8000,
        "Direct login timed out",
      );

      if (authErr) throw authErr;
    };

    // Try proxy first. On constrained/cellular links, avoid direct Supabase fallback.
    try {
      const proxyResult = await tryProxyLogin();
      console.log('[AdminLogin] Login successful via proxy');

      handleSuccess();

      if (proxyResult.usedManualStorage) {
        // Force a full reload so Supabase rehydrates session from localStorage.
        window.location.assign("/admin/dashboard");
        return;
      }

      navigate("/admin/dashboard");
      setLoading(false);
    } catch (proxyErr) {
      console.log('[AdminLogin] Proxy path failed:', proxyErr);
      const proxyMessage = proxyErr instanceof Error ? proxyErr.message : "Proxy login failed";
      const isCredentialIssue = /invalid|credential|password|email/i.test(proxyMessage);

      if (isCredentialIssue) {
        setError(proxyMessage);
        setLoading(false);
        resetSlider();
        return;
      }

      if (constrained) {
        console.log('[AdminLogin] On constrained network, skipping direct fallback');
        setError(proxyMessage || "Login failed on current network. Try again or switch network.");
        setLoading(false);
        resetSlider();
        return;
      }

      try {
        console.log('[AdminLogin] Attempting direct fallback');
        await tryDirectLogin();
        console.log('[AdminLogin] Direct fallback succeeded');
        handleSuccess();
        navigate("/admin/dashboard");
      } catch (directErr) {
        console.log('[AdminLogin] Direct fallback failed:', directErr);
        const directMessage = directErr instanceof Error ? directErr.message : "Direct login failed";
        const useProxyMessage =
          /timed out|failed to fetch/i.test(directMessage) ||
          /environment|missing|supabase/i.test(proxyMessage);

        setError(useProxyMessage ? proxyMessage : directMessage);
        resetSlider();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className="relative min-h-[100svh] md:min-h-screen flex items-center justify-center p-4 overflow-hidden"
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
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs tracking-widest transition-all hover:scale-105"
        style={{ background: "hsla(0, 0%, 100%, 0.85)", color: "#000", border: "1px solid rgba(0,0,0,0.12)", fontFamily: "Jura, sans-serif" }}
      >
        <ArrowLeft size={14} />
        GO BACK
      </button>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, #000, #333)" }}>
            <Gamepad2 size={28} style={{ color: "#fff" }} />
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-[0.2em]" style={{ color: "#000", fontFamily: "Orbitron, sans-serif" }}>
            ADMIN ACCESS
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(0,0,0,0.6)" }}>Gaming Marathon Control Panel</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-xl" style={{ background: "hsla(0,0%,100%,0.88)", border: "1px solid rgba(0,0,0,0.08)", backdropFilter: "blur(12px)" }}>
          <form ref={formRef} onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs tracking-widest mb-2" style={{ color: "rgba(0,0,0,0.75)", fontFamily: "Jura, sans-serif" }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "hsla(0,0%,100%,0.95)",
                  border: "1px solid rgba(0,0,0,0.12)",
                  color: "#000",
                }}
                placeholder="admin@marathon.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs tracking-widest mb-2" style={{ color: "rgba(0,0,0,0.75)", fontFamily: "Jura, sans-serif" }}>
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all pr-12"
                  style={{
                    background: "hsla(0,0%,100%,0.95)",
                    border: "1px solid rgba(0,0,0,0.12)",
                    color: "#000",
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(0,0,0,0.55)" }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs text-black/70 font-jura tracking-wider cursor-pointer select-none">
                REMEMBER ME
              </label>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-center py-2 px-4 rounded-lg" style={{ background: "hsl(0 0% 96%)", color: "hsl(0 0% 18%)", border: "1px solid rgba(0,0,0,0.12)" }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <SlideButton
              data-slider-button="true"
              disabled={loading}
              status={loading ? "loading" : error ? "error" : "idle"}
              label="ENTER ARENA"
              completedLabel="AUTHENTICATING..."
              onSlideComplete={() => {
                if (formRef.current?.checkValidity()) {
                  formRef.current.requestSubmit();
                } else {
                  formRef.current?.reportValidity();
                  resetSlider();
                }
              }}
              resetSignal={sliderResetSignal}
              className="w-full"
            />
          </form>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: "rgba(0,0,0,0.5)" }}>
          Restricted access — authorized personnel only
        </p>
      </div>
    </div>
  );
}

