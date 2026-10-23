"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import styles from "./auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, isOwner, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (isOwner) {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [user, isOwner, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setErrorMsg("Please enter both email and password.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    try {
      await signIn(form.email, form.password);
      // Auth state change listener will handle redirect
    } catch (err) {
      setErrorMsg(err.message || "Invalid email or password.");
      setStatus("error");
    }
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Brand */}
        <div className={styles.brand}>
          <span className={styles.brandIcon}>✦</span>
          <span className={styles.brandName}>Salon</span>
        </div>

        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to manage your salon</p>

        {errorMsg && (
          <div className={styles.error} role="alert">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email Address</label>
            <div className={styles.inputWrapper}>
              <HiOutlineMail size={18} className={styles.inputIcon} />
              <input
                id="login-email"
                type="email"
                className={`form-input ${styles.inputWithIcon}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <div className={styles.labelRow}>
              <label htmlFor="login-password" className="form-label">Password</label>
            </div>
            <div className={styles.inputWrapper}>
              <HiOutlineLockClosed size={18} className={styles.inputIcon} />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className={`form-input ${styles.inputWithIcon}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className={styles.footerLink}>Request Access</Link>
        </p>

        <Link href="/" className={styles.backLink}>← Back to website</Link>
      </div>
    </div>
  );
}
