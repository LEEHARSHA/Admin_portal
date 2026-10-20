"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, KeyRound } from "lucide-react";
import { useAdminAuth } from "@/components/admin-auth";
import { getFirebaseConfigError } from "@/lib/firebase-client";

export default function LoginPage() {
  const { signIn, sendPasswordReset, error: authError } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const configError = getFirebaseConfigError();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resetPassword() {
    setError(null);
    setNotice(null);
    setResetting(true);
    try {
      await sendPasswordReset(email);
      setNotice("If this email belongs to an account, Firebase has sent a password reset link.");
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Could not send a password reset email.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F4F6] px-4 py-10 text-[#172033]">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-[#D5D9D9] bg-white shadow-sm">
        <div className="border-b border-[#E8ECEC] px-6 py-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF9900] text-sm font-bold text-white">
              FS
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#5F6B7A]">Fitness Species</p>
              <p className="text-sm font-semibold">Powered by ALK</p>
            </div>
          </div>
          <h1 className="mt-7 text-2xl font-semibold tracking-[-0.04em]">Sign in to your account</h1>
          <p className="mt-2 text-sm leading-6 text-[#5F6B7A]">
            Use your existing Fitness Species account. Administrator permissions are verified separately by the backend.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5 px-6 py-6 sm:px-8">
          {(configError || error || authError) && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {configError || error || authError}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {notice}
            </p>
          )}

          <label className="block text-sm font-medium">
            Email address
            <input
              autoComplete="username"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-[#D5D9D9] bg-white px-3 text-sm outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/20"
              placeholder="you@example.com"
            />
          </label>

          <label className="block text-sm font-medium">
            Password
            <span className="relative mt-2 block">
              <input
                autoComplete="current-password"
                type={passwordVisible ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 w-full rounded-lg border border-[#D5D9D9] bg-white px-3 pr-12 text-sm outline-none transition focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/20"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-[#5F6B7A] hover:text-[#172033]"
              >
                {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void resetPassword()}
              disabled={resetting || submitting || Boolean(configError) || !email.trim()}
              className="text-sm font-medium text-[#146EB4] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resetting ? "Sending reset link…" : "Forgot password?"}
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting || resetting || Boolean(configError)}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#FF9900] px-4 text-sm font-semibold text-white transition hover:bg-[#e98800] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>

          <div className="flex items-start gap-2 rounded-lg bg-[#F7F7F7] p-3 text-xs leading-5 text-[#5F6B7A]">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Only existing Firebase accounts can sign in. Signing in does not grant administrator privileges.</p>
          </div>
        </form>
      </section>
    </main>
  );
}
