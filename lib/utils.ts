import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formats numbers as currency with sensible defaults for the app.
// Usage: formatCurrency(1500000) -> "$1,500,000.00" (locale dependent)
export function formatCurrency(
  value: number | string | null | undefined,
  options: { currency?: string; locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
): string {
  const { currency = "USD", locale = "es-MX", minimumFractionDigits = 2, maximumFractionDigits = 2 } = options

  if (value === null || value === undefined || value === "") return "-"
  const num = typeof value === "string" ? Number(value) : value
  if (Number.isNaN(num)) return "-"

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(num)
  } catch {
    // Fallback
    return `${num.toLocaleString(locale)} ${currency}`
  }
}
