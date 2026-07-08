"use client"

import { type FormEvent, useState } from "react"

const DECK_PATH = "/presentations/os-poc"

// Ordnance Survey brand tokens (kept local to the gate).
const PURPLE = "#453c90"
const CREAM = "#f4f0ea"
const INK = "#1b1a22"
const MUTED = "#6a6577"
const LINE = "#d9d3c8"

export function UnlockGate() {
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle")

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!password || status === "submitting") return
    setStatus("submitting")
    try {
      const res = await fetch("/api/os-poc-unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        // Cookie is set; reload into the deck (middleware now lets it through).
        window.location.assign(DECK_PATH)
        return
      }
      setStatus("error")
    } catch {
      setStatus("error")
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: CREAM,
        color: INK,
        fontFamily:
          "'Source Sans 3', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fffdf9",
          border: `1px solid ${LINE}`,
          borderTop: `3px solid ${PURPLE}`,
          borderRadius: "3px",
          padding: "40px 36px 36px",
          boxShadow: "0 1px 2px rgba(27, 26, 34, 0.04)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: PURPLE,
            fontWeight: 600,
          }}
        >
          Ordnance Survey &middot; Geovation
        </p>
        <h1
          style={{
            margin: "10px 0 6px",
            fontSize: "24px",
            lineHeight: 1.2,
            fontWeight: 600,
            color: INK,
          }}
        >
          Proof-of-concept build
        </h1>
        <p style={{ margin: "0 0 24px", fontSize: "15px", color: MUTED, lineHeight: 1.5 }}>
          This deck is passphrase-protected. Enter the passphrase to view it.
        </p>

        <form onSubmit={onSubmit} noValidate>
          <label
            htmlFor="os-poc-pass"
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
            id="os-poc-pass"
            type="password"
            autoFocus
            autoComplete="off"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (status === "error") setStatus("idle")
            }}
            aria-invalid={status === "error"}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "11px 12px",
              fontSize: "15px",
              color: INK,
              background: CREAM,
              border: `1px solid ${status === "error" ? "#d40058" : LINE}`,
              borderRadius: "2px",
              outline: "none",
            }}
          />

          <div style={{ minHeight: "20px", marginTop: "8px" }}>
            {status === "error" && (
              <p style={{ margin: 0, fontSize: "13px", color: "#d40058" }} role="alert">
                That passphrase isn&rsquo;t right. Try again.
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
              color: "#ffffff",
              background: status === "submitting" || !password ? "#8983b7" : PURPLE,
              border: "none",
              borderRadius: "2px",
              cursor: status === "submitting" || !password ? "default" : "pointer",
            }}
          >
            {status === "submitting" ? "Checking…" : "View deck"}
          </button>
        </form>
      </div>
    </main>
  )
}
