const VIDEO_ID_PATTERN = /^[\w-]{11}$/
const URL_VIDEO_ID_PATTERN = /(?:v=|youtu\.be\/)([\w-]{11})/

export function parseVideoId(input: string): string | null {
  const value = input.trim()
  if (VIDEO_ID_PATTERN.test(value)) {
    return value
  }

  const match = value.match(URL_VIDEO_ID_PATTERN)
  return match?.[1] ?? null
}
