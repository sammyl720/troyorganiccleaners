import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  Outlet,
  Link,
} from "react-router-dom";
import { client, configured } from "./lib/supabase";
import Hours from "./pages/Hours";
import Services from "./pages/Services";
import Banner from "./pages/Banner";
import Dashboard from "./pages/Dashboard";
import { Status, useAction } from "./components/ui";
type Access = "loading" | "guest" | "admin" | "denied" | "error";
function Login() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  const a = useAction();
  return (
    <main className="login card">
      <p className="brand">Troy Organic Cleaners</p>
      <h1>Admin Login</h1>
      <Status {...a} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void a.run(async () => {
            const { error } = await client().auth.signInWithPassword({
              email,
              password,
            });
            if (error) {
              a.setError(
                "Unable to sign in. Check your email and password and try again.",
              );
              return;
            }
            setPassword("");
          }, "");
        }}
      >
        <fieldset disabled={a.busy}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button>{a.busy ? "Signing in…" : "Sign In"}</button>
        </fieldset>
      </form>
    </main>
  );
}
export default function App() {
  const [access, setAccess] = useState<Access>("loading");
  const a = useAction();
  useEffect(() => {
    if (!configured) return;
    let alive = true,
      version = 0;
    async function verify(id?: string) {
      const token = ++version;
      if (!id) {
        if (alive) setAccess("guest");
        return;
      }
      if (alive) setAccess("loading");
      try {
        const { data, error } = await client()
          .from("admin_users")
          .select("user_id")
          .eq("user_id", id)
          .maybeSingle();
        if (alive && token === version)
          setAccess(error ? "error" : data ? "admin" : "denied");
      } catch {
        if (alive && token === version) setAccess("error");
      }
    }
    // Defer DB requests outside the auth callback to avoid auth-lock deadlocks.
    const {
      data: { subscription },
    } = client().auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        if (alive) void verify(session?.user.id);
      }, 0);
    });
    void client()
      .auth.getSession()
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setAccess("error");
        else void verify(data.session?.user.id);
      })
      .catch(() => {
        if (alive) setAccess("error");
      });
    return () => {
      alive = false;
      version++;
      subscription.unsubscribe();
    };
  }, []);
  if (!configured)
    return (
      <main className="login card">
        <h1>CMS configuration needed</h1>
        <p>
          Set the Supabase URL and publishable key using admin/.env.example,
          then rebuild the admin app.
        </p>
      </main>
    );
  async function signOut() {
    await a.run(async () => {
      const { error } = await client().auth.signOut();
      if (error) throw error;
      setAccess("guest");
    }, "");
  }
  if (access === "loading")
    return (
      <main>
        <p role="status">Checking access…</p>
      </main>
    );
  if (access === "denied" || access === "error")
    return (
      <main className="login card">
        <h1>
          {access === "denied" ? "Access denied" : "Unable to verify access"}
        </h1>
        <p>
          {access === "denied"
            ? "This account is not a CMS administrator. Ask the project owner to grant access."
            : "Check your connection and reload, or sign out and try again."}
        </p>
        <Status {...a} />
        <button disabled={a.busy} onClick={() => void signOut()}>
          Sign Out
        </button>
      </main>
    );
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route
          path="login"
          element={access === "admin" ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          element={
            access !== "admin" ? (
              <Navigate to="/login" replace />
            ) : (
              <>
                <header className="topbar">
                  <Link className="brand" to="/">
                    Troy Organic Cleaners <small>CMS</small>
                  </Link>
                  <nav aria-label="CMS">
                    <NavLink to="/" end>
                      Overview
                    </NavLink>
                    <NavLink to="/hours">Hours</NavLink>
                    <NavLink to="/services">Services</NavLink>
                    <NavLink to="/banner">Banner</NavLink>
                    <button
                      className="secondary"
                      disabled={a.busy}
                      onClick={() => void signOut()}
                    >
                      Sign Out
                    </button>
                  </nav>
                </header>
                <main>
                  <Status {...a} />
                  <Outlet />
                </main>
              </>
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="hours" element={<Hours />} />
          <Route path="services" element={<Services />} />
          <Route path="banner" element={<Banner />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
