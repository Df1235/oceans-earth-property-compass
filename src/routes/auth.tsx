import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoNavy from "@/assets/logo-navy.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Administrator sign in | Oceans & Earth Realty" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
      else setChecking(false);
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) {
      setError("Incorrect email or password.");
      setBusy(false);
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  if (checking) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-5">
      <form onSubmit={signIn} className="w-full max-w-sm rounded-md border bg-card p-8 shadow-soft">
        <img src={logoNavy} alt="Oceans and Earth" className="h-10 w-auto" />
        <h1 className="mt-6 text-2xl">Administrator sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage enquiries and property listings.</p>
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="auth-email">Email</Label>
            <Input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="auth-password">Password</Label>
            <Input id="auth-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Signing in…" : "Sign in"}</Button>
        </div>
      </form>
    </div>
  );
}
