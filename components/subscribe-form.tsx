"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"

type FormValues = {
  email: string
  _gotcha: string
}

type Status = "idle" | "submitting" | "success" | "error"

interface SubscribeFormProps {
  /** "inline" is the compact footer form; "full" is the standalone page form. */
  variant?: "inline" | "full"
}

export function SubscribeForm({ variant = "inline" }: SubscribeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ mode: "onTouched" })
  const [status, setStatus] = useState<Status>("idle")

  const onSubmit = handleSubmit(async (values) => {
    setStatus("submitting")
    try {
      const res = await fetch("/api/subscribe", {
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
      <p
        className="text-sm text-muted-foreground leading-relaxed"
        role="status"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        You're subscribed. I'll send a short note when something new goes up.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className={variant === "full" ? "space-y-3" : "space-y-2"}>
      {/* Honeypot -- visually hidden, bots will fill it in. */}
      <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" tabIndex={-1} autoComplete="off" {...register("_gotcha")} />
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
          {status === "submitting" ? "Subscribing..." : "Subscribe"}
        </button>
      </div>

      {errors.email && (
        <p className="text-xs text-muted-foreground" role="alert">
          {errors.email.message}
        </p>
      )}

      {status === "error" && (
        <p className="text-xs text-muted-foreground" role="alert">
          Something went wrong on my end. Email me at{" "}
          <a
            href="mailto:john@johnx.co?subject=Subscribe"
            className="underline underline-offset-2 hover:text-primary transition-colors"
          >
            john@johnx.co
          </a>{" "}
          and I'll add you.
        </p>
      )}
    </form>
  )
}
