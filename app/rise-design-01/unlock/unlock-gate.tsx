"use client"

import { type FormEvent, useState } from "react"

const DECK_PATH = "/presentations/rise-design-01"

// Lucid Computing design-system tokens, matching the deck behind this gate
// (kept local to the gate). No border-radius; hairlines divide; amber is the
// single accent.
const PAPER = "#f6f1e7"
const SURFACE = "#fffdf8"
const INK = "#1e1f22"
const MUTED = "#5f6165"
const LABEL = "#93959a"
const AMBER = "#c9a227"
const AMBER_INK = "#8a6e12"
const RULE = "rgba(30, 31, 34, 0.22)"
const ERROR = "#a12f2f"

type Status = "idle" | "submitting" | "error" | "unavailable"

export function UnlockGate() {
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<Status>("idle")

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!password || status === "submitting") return
    setStatus("submitting")
    try {
      const res = await fetch("/api/rise-deck-unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        // Cookie is set; reload into the deck (the proxy now lets it through).
        window.location.assign(DECK_PATH)
        return
      }
      // No passphrase is configured for this deployment, so nothing the
      // visitor types can work. Say so instead of blaming their input.
      setStatus(res.status === 503 ? "unavailable" : "error")
    } catch {
      setStatus("error")
    }
  }

  const invalid = status === "error" || status === "unavailable"

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: PAPER,
        color: INK,
        fontFamily:
          "'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: SURFACE,
          border: `1px solid ${RULE}`,
          borderTop: `2px solid ${AMBER}`,
          padding: "40px 36px 36px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily:
              "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: LABEL,
          }}
        >
          RISE Verifiable AI Cluster
        </p>
        <h1
          style={{
            margin: "12px 0 6px",
            fontSize: "26px",
            lineHeight: 1.2,
            fontWeight: 600,
            color: INK,
          }}
        >
          Verifying compute location &mdash; Design 01
        </h1>
        <p style={{ margin: "0 0 26px", fontSize: "15px", color: MUTED, lineHeight: 1.55 }}>
          This deck is passphrase-protected. Enter the passphrase to view it.
        </p>

        <form onSubmit={onSubmit} noValidate>
          <label
            htmlFor="rise-deck-pass"
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "8px",
              color: INK,
            }}
          >
            Passphrase
          </label>
          <input
            id="rise-deck-pass"
            type="password"
            autoFocus
            autoComplete="off"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (invalid) setStatus("idle")
            }}
            aria-invalid={invalid}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "11px 12px",
              fontSize: "15px",
              color: INK,
              background: PAPER,
              border: `1px solid ${invalid ? ERROR : RULE}`,
              outline: "none",
            }}
          />

          <div style={{ minHeight: "20px", marginTop: "8px" }}>
            {status === "error" && (
              <p style={{ margin: 0, fontSize: "13px", color: ERROR }} role="alert">
                That passphrase isn&rsquo;t right. Try again.
              </p>
            )}
            {status === "unavailable" && (
              <p style={{ margin: 0, fontSize: "13px", color: ERROR }} role="alert">
                This deck isn&rsquo;t available yet. Get in touch if you were expecting access.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "submitting" || !password}
            style={{
              marginTop: "12px",
              width: "100%",
              padding: "11px 12px",
              fontSize: "15px",
              fontWeight: 600,
              color: status === "submitting" || !password ? MUTED : "#f6f1e7",
              background: status === "submitting" || !password ? "transparent" : INK,
              border: `1px solid ${status === "submitting" || !password ? RULE : INK}`,
              cursor: status === "submitting" || !password ? "default" : "pointer",
            }}
          >
            {status === "submitting" ? "Checking…" : "View deck"}
          </button>
          <p
            style={{
              margin: "18px 0 0",
              fontSize: "12px",
              color: LABEL,
              borderTop: `1px solid ${AMBER}`,
              paddingTop: "12px",
            }}
          >
            <span style={{ color: AMBER_INK }}>Lucid Computing</span> &middot; unreleased draft
          </p>
        </form>
      </div>
    </main>
  )
}
