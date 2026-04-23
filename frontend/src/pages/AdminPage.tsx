import { useCallback, useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE ?? "http://localhost:8001";
const TOKEN_KEY = "rmbuild_admin_token";

interface Contact {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_read: number;
  is_replied: number;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "replied">("all");

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setContacts([]);
  }, []);

  const loadContacts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/admin/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setContacts(data.contacts ?? []);
      setUnread(data.unread ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.status === 401) {
        setLoginError("Incorrect password.");
        return;
      }
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setPassword("");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoggingIn(false);
    }
  }

  async function markRead(id: number) {
    if (!token) return;
    await fetch(`${API}/api/admin/contacts/${id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadContacts();
  }

  async function markReplied(id: number) {
    if (!token) return;
    await fetch(`${API}/api/admin/contacts/${id}/replied`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadContacts();
  }

  async function deleteContact(id: number) {
    if (!token) return;
    if (!confirm("Delete this message? This can't be undone.")) return;
    await fetch(`${API}/api/admin/contacts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadContacts();
  }

  if (!token) {
    return (
      <section className="section section-narrow admin-login">
        <div className="section-head">
          <span className="eyebrow">Admin — RMBuild inbox</span>
          <h2>Sign in.</h2>
          <p className="section-sub">
            This is a staff-only page. If you're a user, you want the{" "}
            <a href="/contact">contact page</a> instead.
          </p>
        </div>
        <form className="admin-login-form" onSubmit={handleLogin}>
          <label>
            Admin password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </label>
          {loginError && <p className="admin-error">{loginError}</p>}
          <button className="btn btn-primary" type="submit" disabled={loggingIn}>
            {loggingIn ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    );
  }

  const visible = contacts.filter((c) => {
    if (filter === "unread") return c.is_read === 0;
    if (filter === "replied") return c.is_replied === 1;
    return true;
  });

  return (
    <section className="section admin">
      <div className="admin-header">
        <div>
          <span className="eyebrow">Admin — RMBuild inbox</span>
          <h2>
            {contacts.length} message{contacts.length === 1 ? "" : "s"}
            {unread > 0 && <span className="admin-unread-badge">{unread} unread</span>}
          </h2>
        </div>
        <div className="admin-actions">
          <button className="btn btn-text" onClick={loadContacts} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button className="btn btn-text" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>

      <div className="admin-filters">
        <button
          className={filter === "all" ? "filter-chip active" : "filter-chip"}
          onClick={() => setFilter("all")}
        >
          All ({contacts.length})
        </button>
        <button
          className={filter === "unread" ? "filter-chip active" : "filter-chip"}
          onClick={() => setFilter("unread")}
        >
          Unread ({contacts.filter((c) => c.is_read === 0).length})
        </button>
        <button
          className={filter === "replied" ? "filter-chip active" : "filter-chip"}
          onClick={() => setFilter("replied")}
        >
          Replied ({contacts.filter((c) => c.is_replied === 1).length})
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {visible.length === 0 ? (
        <div className="admin-empty">
          <p>No messages {filter !== "all" ? `in "${filter}"` : "yet"}.</p>
        </div>
      ) : (
        <ul className="admin-list">
          {visible.map((c) => (
            <li
              key={c.id}
              className={
                "admin-item" +
                (c.is_read === 0 ? " admin-item-unread" : "") +
                (c.is_replied === 1 ? " admin-item-replied" : "")
              }
            >
              <div className="admin-item-head">
                <div className="admin-item-from">
                  <strong>{c.name}</strong>
                  <a href={`mailto:${c.email}?subject=Re:%20Your%20RMBuild%20message`}>
                    {c.email}
                  </a>
                </div>
                <div className="admin-item-meta">
                  <time>{formatDate(c.created_at)}</time>
                  {c.is_replied === 1 && <span className="chip chip-replied">Replied</span>}
                  {c.is_read === 0 && <span className="chip chip-unread">New</span>}
                </div>
              </div>
              <p className="admin-item-msg">{c.message}</p>
              <div className="admin-item-actions">
                {c.is_read === 0 && (
                  <button className="btn btn-text" onClick={() => markRead(c.id)}>
                    Mark read
                  </button>
                )}
                {c.is_replied === 0 && (
                  <button className="btn btn-text" onClick={() => markReplied(c.id)}>
                    Mark replied
                  </button>
                )}
                <a
                  className="btn btn-text"
                  href={`mailto:${c.email}?subject=Re:%20Your%20RMBuild%20message&body=Hi%20${encodeURIComponent(
                    c.name
                  )},%0A%0A`}
                >
                  Reply →
                </a>
                <button className="btn btn-text btn-danger" onClick={() => deleteContact(c.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
