"""
db.py — SQLite storage for contact form submissions.

One table: contacts. One file on disk: contacts.db (alongside backend/).
Deliberately simple — no ORM, no migrations, no pooling. For a
dissertation-scale tool this is the right level of complexity.
"""

from __future__ import annotations

import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).parent / "contacts.db"


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Create the contacts table if it doesn't exist. Called at app start."""
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL,
                is_read INTEGER NOT NULL DEFAULT 0,
                is_replied INTEGER NOT NULL DEFAULT 0
            )
            """
        )
        conn.commit()


def insert_contact(name: str, email: str, message: str) -> int:
    with _connect() as conn:
        cur = conn.execute(
            "INSERT INTO contacts (name, email, message, created_at) VALUES (?, ?, ?, ?)",
            (name.strip(), email.strip(), message.strip(), datetime.utcnow().isoformat()),
        )
        conn.commit()
        return int(cur.lastrowid or 0)


def list_contacts() -> list[dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT id, name, email, message, created_at, is_read, is_replied "
            "FROM contacts ORDER BY created_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]


def count_unread() -> int:
    with _connect() as conn:
        row = conn.execute("SELECT COUNT(*) AS c FROM contacts WHERE is_read = 0").fetchone()
        return int(row["c"]) if row else 0


def set_read(contact_id: int, value: bool) -> None:
    with _connect() as conn:
        conn.execute("UPDATE contacts SET is_read = ? WHERE id = ?", (1 if value else 0, contact_id))
        conn.commit()


def set_replied(contact_id: int, value: bool) -> None:
    with _connect() as conn:
        conn.execute(
            "UPDATE contacts SET is_replied = ?, is_read = 1 WHERE id = ?",
            (1 if value else 0, contact_id),
        )
        conn.commit()


def delete_contact(contact_id: int) -> None:
    with _connect() as conn:
        conn.execute("DELETE FROM contacts WHERE id = ?", (contact_id,))
        conn.commit()
