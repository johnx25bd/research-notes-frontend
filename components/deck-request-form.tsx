"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"

type FormValues = {
  email: string
  _gotcha: string
}

type Status = "idle" | "submitting" | "success" | "error"

const DECK_URL = "/presentations/ai-agents"

export function DeckRequestForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ mode: "onTouched" })
  const [status, setStatus] = useState<Status>("idle")

  const onSubmit = handleSubmit(async (values) => {
    setStatus("submitting")
    try {
      const res = await fetch("/api/deck-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        setStatus("error")
        return
      }
      setStatus("success")
    } catch {
      setStatus("error")
    }
  })

  if (status === "success") {
    return (
      <div className="text-base text-foreground leading-relaxed">
        <p className="mb-3">
          Thanks.{" "}
          <a
            href={DECK_URL}
            className="underline underline-offset-2 hover:text-primary transition-colors"
          >
            Here is the deck.
          </a>
        </p>
        <p className="text-sm text-muted-foreground">
          I will be in touch if I think there is a useful next step for us to talk.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      {/* Honeypot -- visually hidden, bots will fill it in. */}
      <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label>
          Leave this field empty
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("_gotcha")}
          />
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@somewhere.com"
          disabled={status === "submitting"}
          aria-invalid={errors.email ? "true" : "false"}
          aria-label="Email address"
          {...register("email", {
            required: "Please enter an email address.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "That does not look like a valid email.",
            },
            maxLength: { value: 254, message: "That email is too long." },
          })}
          className="flex-1 px-3 py-2 text-sm bg-background border border-foreground/30 rounded-sm focus:outline-none focus:border-foreground transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="px-4 py-2 text-sm font-medium border border-foreground/80 rounded-sm hover:bg-foreground hover:text-background transition-colors disabled:opacity-60"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          {status === "submitting" ? "Sending..." : "Send me the deck"}
        </button>
      </div>

      {errors.email && (
        <p className="text-xs text-muted-foreground" role="alert">
          {errors.email.message}
        </p>
      )}

      {status === "error" && (
        <p className="text-xs text-muted-foreground" role="alert">
          Something went wrong on my end. Email me directly at{" "}
          <a
            href="mailto:john@johnx.co?subject=Building%20with%20agents%20deck"
            className="underline underline-offset-2 hover:text-primary transition-colors"
          >
            john@johnx.co
          </a>{" "}
          and I will send the deck over.
        </p>
      )}
    </form>
  )
}
