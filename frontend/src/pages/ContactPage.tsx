import { useState } from "react";
import { usePageTitle } from "../hooks/usePageTitle";

const API = import.meta.env.VITE_API_BASE ?? "http://localhost:8001";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  usePageTitle("Contact");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg(null);
    try {
      const res = await fetch(`${API}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? `Server returned ${res.status}`);
      }
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <section className="section section-narrow">
      <div className="section-head">
        <span className="eyebrow">Contact</span>
        <h2>Get in touch</h2>
        <p className="section-sub">
          Questions, feedback, or bug reports — drop a line.
        </p>
      </div>

      <div className="contact-grid">
        <div className="contact-info">
          <div className="contact-item">
            <h4>Email</h4>
            <a href="mailto:rokenasm@gmail.com">rokenasm@gmail.com</a>
          </div>
          <div className="contact-item">
            <h4>Based in</h4>
            <p>United Kingdom</p>
          </div>
          <div className="contact-item">
            <h4>Project</h4>
            <p>Final-year dissertation, 2026</p>
          </div>
        </div>

        {status === "sent" ? (
          <div className="contact-sent">
            <h3>Message sent.</h3>
            <p>
              Thanks — I read every one. You'll hear back on the email you
              gave.
            </p>
            <button
              className="btn btn-text"
              onClick={() => setStatus("idle")}
            >
              Send another
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <label>
              Your name
              <input
                type="text"
                required
                maxLength={120}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Smith"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                required
                maxLength={200}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
              />
            </label>
            <label>
              Message
              <textarea
                required
                rows={6}
                maxLength={4000}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Question, feedback, or bug report…"
              />
            </label>
            {status === "error" && errorMsg && (
              <p className="contact-error">Couldn't send — {errorMsg}</p>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
