"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setError("Username must be 3-20 characters, lowercase letters, numbers, and underscores only.");
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, username, displayName || username);
    if (error) {
      if (error.message.includes("already")) {
        setError("An account with this email already exists.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      setError("Google sign-in failed. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-success-subtle flex items-center justify-center mx-auto mb-4">
            <span className="text-success text-lg">✓</span>
          </div>
          <h1 className="font-poem text-2xl text-text-primary mb-2">Check your email</h1>
          <p className="text-sm text-text-secondary mb-6">
            We sent a verification link to <strong>{email}</strong>. Click the link to verify your account.
          </p>
          <Link href="/login" className="text-sm font-medium text-brand hover:text-brand-hover transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-[var(--radius-sm)] gradient-brand flex items-center justify-center">
              <span className="text-white text-sm font-semibold">P</span>
            </div>
          </Link>
          <h1 className="font-poem text-2xl text-text-primary mb-1">Create your account</h1>
          <p className="text-sm text-text-secondary">Join Poetly</p>
        </div>

        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-surface border border-border-subtle rounded-[var(--radius-md)] text-sm font-medium text-text-primary hover:bg-surface-hover transition-colors mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border-subtle" />
          <span className="text-xs text-text-tertiary">or</span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="px-3 py-2 bg-error-subtle text-error text-xs rounded-[var(--radius-sm)]">
              {error}
            </div>
          )}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="Username"
            required
            className="w-full px-3.5 py-2.5 bg-surface border border-border-subtle rounded-[var(--radius-md)] text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand transition-colors"
          />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            required
            className="w-full px-3.5 py-2.5 bg-surface border border-border-subtle rounded-[var(--radius-md)] text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand transition-colors"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-3.5 py-2.5 bg-surface border border-border-subtle rounded-[var(--radius-md)] text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand transition-colors"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            required
            minLength={6}
            className="w-full px-3.5 py-2.5 bg-surface border border-border-subtle rounded-[var(--radius-md)] text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 gradient-brand text-white text-sm font-medium rounded-[var(--radius-md)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-text-secondary text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:text-brand-hover font-medium transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
