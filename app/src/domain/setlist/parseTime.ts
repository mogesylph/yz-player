export function parseTime(text: string): number | null {
  const parts = text.trim().split(':')
  if (parts.length !== 2 && parts.length !== 3) return null

  const numbers = parts.map(Number)
  if (numbers.some((part) => !Number.isInteger(part) || part < 0)) return null

  if (numbers.length === 2) {
    const [minutes, seconds] = numbers
    return minutes * 60 + seconds
  }

  const [hours, minutes, seconds] = numbers
  return hours * 3600 + minutes * 60 + seconds
}
