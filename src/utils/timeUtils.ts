export function formatTimecode(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const frames = Math.floor((seconds % 1) * 30) // Assuming 30 fps

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`
  }
  
  return `${minutes}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`
}

export function parseTimecode(timecode: string): number {
  const parts = timecode.split(':').map(Number)
  
  if (parts.length === 4) {
    // HH:MM:SS:FF
    return parts[0] * 3600 + parts[1] * 60 + parts[2] + parts[3] / 30
  } else if (parts.length === 3) {
    // MM:SS:FF
    return parts[0] * 60 + parts[1] + parts[2] / 30
  } else if (parts.length === 2) {
    // SS:FF
    return parts[0] + parts[1] / 30
  }
  
  return 0
}
