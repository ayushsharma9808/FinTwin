// Indian Rupee formatting utility with Indian numbering system
export function formatINR(amount: number): string {
  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? "-" : ""

  if (absAmount >= 10000000) {
    // Crores (1,00,00,000)
    return `${sign}₹${(absAmount / 10000000).toFixed(2)} Cr`
  } else if (absAmount >= 100000) {
    // Lakhs (1,00,000)
    return `${sign}₹${(absAmount / 100000).toFixed(2)} L`
  } else {
    // Indian number formatting with proper comma placement
    const formatted = absAmount.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })
    return `${sign}₹${formatted}`
  }
}

export function formatINRFull(amount: number): string {
  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? "-" : ""
  const formatted = absAmount.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })
  return `${sign}₹${formatted}`
}

export function formatINRCompact(amount: number): string {
  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? "-" : ""

  if (absAmount >= 10000000) {
    return `${sign}₹${(absAmount / 10000000).toFixed(1)}Cr`
  } else if (absAmount >= 100000) {
    return `${sign}₹${(absAmount / 100000).toFixed(1)}L`
  } else if (absAmount >= 1000) {
    return `${sign}₹${(absAmount / 1000).toFixed(1)}K`
  }
  return `${sign}₹${absAmount}`
}

// Alias for formatINRFull for consistency
export const formatCurrency = formatINRFull