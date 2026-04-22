import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`RMBuild enquiry from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n—\nFrom: ${form.name} <${form.email}>`);
    window.location.href = `mailto:rokenasm@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
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

        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Your name
            <input
              type="text"
              required
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
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Question, feedback, or bug report…"
            />
          </label>
          <button type="submit" className="btn btn-primary">
            {sent ? "Opening your email…" : "Send message"}
          </button>
        </form>
      </div>
    </section>
  );
}
