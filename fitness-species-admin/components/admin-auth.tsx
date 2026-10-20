"use client";

import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "@firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getAdminFirebaseAuth, getFirebaseConfigError } from "@/lib/firebase-client";

type AdminAuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function authErrorMessage(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "The email or password is incorrect.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a little while, then try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact your administrator.";
    case "auth/operation-not-allowed":
      return "Email and password sign-in is not enabled for this Firebase project.";
    case "auth/invalid-api-key":
      return "The Firebase API key is invalid. Check the frontend Firebase configuration.";
    case "auth/app-not-authorized":
      return "This domain is not authorized for Firebase Authentication.";
    case "auth/network-request-failed":
      return "Firebase could not be reached. Check your internet connection and try again.";
    case "auth/missing-email":
      return "Enter your email address first.";
    case "auth/missing-password":
      return "Enter your password.";
    default:
      return error instanceof Error ? error.message : "Firebase Authentication failed.";
  }
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("AdminAuthProvider is missing.");
  return context;
}

export function useAdminUser(): User {
  const { user } = useAdminAuth();
  if (!user) throw new Error("An authenticated user is required.");
  return user;
}

function AdminRouteGuard({ children }: { children: ReactNode }) {
  const { user, loading, error } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (loading) return;
    if (isLoginPage && user) router.replace("/");
    else if (!isLoginPage && !user) router.replace("/login");
  }, [isLoginPage, loading, router, user]);

  if (loading) {
    return <div className="p-8 text-sm text-[#5F6B7A]">Restoring Firebase session…</div>;
  }

  if (error && !user && !isLoginPage) {
    return (
      <main className="mx-auto max-w-lg p-6">
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </p>
      </main>
    );
  }

  if (isLoginPage ? Boolean(user) : !user) {
    return <div className="p-8 text-sm text-[#5F6B7A]">Redirecting…</div>;
  }

  return children;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [configError] = useState(getFirebaseConfigError);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!configError);
  const [error, setError] = useState<string | null>(configError);

  useEffect(() => {
    if (configError) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;

    void Promise.resolve()
      .then(() => getAdminFirebaseAuth())
      .then((auth) => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(
          auth,
          (currentUser) => {
            setUser(currentUser);
            setError(null);
            setLoading(false);
          },
          (authError) => {
            setError(authErrorMessage(authError));
            setLoading(false);
          },
        );
      })
      .catch((authError: unknown) => {
        if (!active) return;
        setError(authErrorMessage(authError));
        setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [configError]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(getAdminFirebaseAuth(), email.trim(), password);
    } catch (authError) {
      const message = authErrorMessage(authError);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await firebaseSignOut(getAdminFirebaseAuth());
    } catch (authError) {
      const message = authErrorMessage(authError);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(getAdminFirebaseAuth(), email.trim());
    } catch (authError) {
      const message = authErrorMessage(authError);
      setError(message);
      throw new Error(message);
    }
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, loading, error, signIn, signOut, sendPasswordReset }}>
      <AdminRouteGuard>{children}</AdminRouteGuard>
    </AdminAuthContext.Provider>
  );
}

export function AdminReviewAccess({ children }: { children: ReactNode }) {
  const { loading, user } = useAdminAuth();
  if (loading || !user) return null;
  return children;
}
