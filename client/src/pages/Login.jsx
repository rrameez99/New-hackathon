import { API_BASE } from "../utils/api";
import { useState } from "react";

export default function Login({ onLogin }) {
  const [step, setStep] = useState("form"); // form -> otp -> done
  const [isRegister, setIsRegister] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdu = form.email.endsWith(".edu");

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  // SIGN IN — just email + password, no OTP
  const handleSignIn = async () => {
    if (!form.email || !form.password) return setError("Email and password are required");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || "Sign in failed");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // SIGN UP Step 1 — validate form, send OTP
  const handleSendOtp = () => {
    if (!form.name) return setError("Name is required");
    if (!form.email || !form.email.includes("@")) return setError("Enter a valid email");
    if (!form.password || form.password.length < 6) return setError("Password must be at least 6 characters");

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setStep("otp");
    setError("");
    // For demo — in production this would send a real email
    alert(`Demo OTP code: ${code}\n\n(In production, this would be emailed to ${form.email})`);
  };

  // SIGN UP Step 2 — verify OTP, then register
  const handleVerifyOtp = async () => {
    if (otp !== generatedOtp) return setError("Invalid code. Try again.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || "Registration failed");
        setStep("form");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-brand-dark flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-red flex items-center justify-center text-2xl font-extrabold mx-auto mb-4">
          ▶
        </div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight bg-gradient-to-r from-brand-orange to-yellow-400 bg-clip-text text-transparent">
          BadgerPlay
        </h1>
        <p className="text-gray-500 text-sm mt-2">Find pickup games on campus</p>
      </div>

      {/* Card */}
      <div className="w-full bg-brand-card border border-brand-border rounded-2xl p-6">

        {/* ======================== FORM STEP ======================== */}
        {step === "form" && (
          <>
            <h2 className="font-display text-xl font-bold mb-1">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {isRegister ? "Sign up to find games near you" : "Sign in with your email & password"}
            </p>

            {/* Name (register only) */}
            {isRegister && (
              <div className="mb-4">
                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3.5 py-3 rounded-xl border border-brand-border bg-brand-dark text-white text-sm outline-none focus:border-brand-orange transition-colors"
                />
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@wisc.edu or any email"
                className="w-full px-3.5 py-3 rounded-xl border border-brand-border bg-brand-dark text-white text-sm outline-none focus:border-brand-orange transition-colors"
              />
              {isRegister && form.email && (
                <p className={`text-[11px] mt-1.5 ${isEdu ? "text-brand-green" : "text-yellow-500"}`}>
                  {isEdu ? "🔒 .edu email — you'll be verified as a student" : "⚠️ Non-.edu — you can join but won't have student badge"}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder={isRegister ? "Min 6 characters" : "Your password"}
                className="w-full px-3.5 py-3 rounded-xl border border-brand-border bg-brand-dark text-white text-sm outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 px-3 py-2 rounded-xl bg-brand-red/10 border border-brand-red/30 text-brand-red text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={isRegister ? handleSendOtp : handleSignIn}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-white font-display text-base font-bold bg-gradient-to-r from-brand-orange to-brand-red hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {loading ? "..." : isRegister ? "🎯 Sign Up" : "🏓 Sign In"}
            </button>

            {/* Toggle */}
            <p className="text-center text-gray-500 text-sm mt-5">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => { setIsRegister(!isRegister); setError(""); }}
                className="text-brand-orange font-semibold"
              >
                {isRegister ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </>
        )}

        {/* ======================== OTP STEP (signup only) ======================== */}
        {step === "otp" && (
          <>
            <h2 className="font-display text-xl font-bold mb-1">Verify Email</h2>
            <p className="text-gray-500 text-sm mb-6">
              Enter the 6-digit code sent to <span className="text-white font-medium">{form.email}</span>
            </p>

            <div className="mb-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                placeholder="000000"
                maxLength={6}
                className="w-full px-3.5 py-4 rounded-xl border border-brand-border bg-brand-dark text-white text-2xl text-center font-mono tracking-[0.5em] outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            {error && (
              <div className="mb-4 px-3 py-2 rounded-xl bg-brand-red/10 border border-brand-red/30 text-brand-red text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || loading}
              className={`w-full py-3.5 rounded-2xl text-white font-display text-base font-bold transition-all ${
                otp.length === 6
                  ? "bg-gradient-to-r from-brand-orange to-brand-red hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-gray-800 text-gray-600 cursor-not-allowed"
              }`}
            >
              {loading ? "Creating account..." : "✓ Verify & Create Account"}
            </button>

            <button
              onClick={() => { setStep("form"); setOtp(""); setError(""); }}
              className="w-full mt-3 text-gray-500 text-sm"
            >
              ← Back
            </button>
          </>
        )}
      </div>

      <p className="text-gray-700 text-xs mt-8">UW-Madison • Hackathon 2026</p>
    </div>
  );
}
