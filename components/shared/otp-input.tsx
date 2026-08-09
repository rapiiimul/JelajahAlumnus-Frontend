"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"

interface OtpInputProps {
  value: string[]
  onChange: (digits: string[]) => void
  disabled?: boolean
  length?: number
}

export function OtpInput({ value, onChange, disabled = false, length = 6 }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  return (
    <div className="flex gap-2" role="group" aria-label={`Kode OTP ${length} digit`}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={value[index] ?? ""}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            "h-12 w-full rounded-lg border border-input bg-transparent text-center text-lg font-semibold transition-colors outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
          onChange={(event) => {
            const val = event.target.value.replace(/[^0-9]/g, "").slice(-1)
            const next = [...value]
            next[index] = val
            onChange(next)
            if (val && index < length - 1) refs.current[index + 1]?.focus()
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !value[index] && index > 0) {
              refs.current[index - 1]?.focus()
            }
          }}
          onPaste={(event) => {
            event.preventDefault()
            const pasted = event.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length)
            if (!pasted) return
            const next = Array(length).fill("")
            pasted.split("").forEach((char, idx) => {
              next[idx] = char
            })
            onChange(next)
            refs.current[Math.min(pasted.length, length - 1)]?.focus()
          }}
        />
      ))}
    </div>
  )
}
