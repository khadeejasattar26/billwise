// Photo checks and preparation, done on the phone before anything is uploaded.
// Thresholds measured on the sample bills (2026-11-21): sharp photos scored 1,075-3,976, a bill
// blurred by 1.5 px scored 44, a blank page 0; a dark photo averaged 57 brightness.

export type PhotoIssue = 'blurry' | 'dark' | 'small'
export type PhotoStats = { width: number; height: number; sharpness: number; brightness: number }

export const SHARPNESS_MIN = 100
export const BRIGHTNESS_MIN = 70
export const SHORT_SIDE_MIN = 700
/** Longest side sent to the server: it shrinks to 2,000 px anyway, and this keeps uploads under 5 MB. */
export const UPLOAD_MAX_SIDE = 2000
const ANALYSIS_SIDE = 512

/** Variance of the Laplacian (edge strength) and mean brightness of an RGBA image. */
export function measure(data: Uint8ClampedArray, width: number, height: number): { sharpness: number; brightness: number } {
  const grey = new Float32Array(width * height)
  let sum = 0
  for (let i = 0; i < width * height; i++) {
    const g = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]
    grey[i] = g
    sum += g
  }
  let n = 0, mean = 0, m2 = 0 // Welford's running variance
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x
      const lap = grey[i - width] + grey[i + width] + grey[i - 1] + grey[i + 1] - 4 * grey[i]
      n++
      const d = lap - mean
      mean += d / n
      m2 += d * (lap - mean)
    }
  }
  return { sharpness: n > 0 ? m2 / n : 0, brightness: sum / (width * height || 1) }
}

/** Advice, never a block: the user can always use the photo anyway. */
export function assess(stats: PhotoStats): PhotoIssue[] {
  const issues: PhotoIssue[] = []
  if (stats.sharpness < SHARPNESS_MIN) issues.push('blurry')
  if (stats.brightness < BRIGHTNESS_MIN) issues.push('dark')
  if (Math.min(stats.width, stats.height) < SHORT_SIDE_MIN) issues.push('small')
  return issues
}

export function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable image')) }
    img.src = url
  })
}

function draw(img: HTMLImageElement, maxSide: number): HTMLCanvasElement {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

export function analyze(img: HTMLImageElement): PhotoStats {
  const canvas = draw(img, ANALYSIS_SIDE)
  const pixels = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height)
  const { sharpness, brightness } = pixels ? measure(pixels.data, canvas.width, canvas.height) : { sharpness: Infinity, brightness: 255 }
  return { width: img.naturalWidth, height: img.naturalHeight, sharpness, brightness }
}

/** Shrink big phone photos (often 5-15 MB, over the 5 MB limit) to a JPEG of at most 2,000 px. */
export async function prepareForUpload(img: HTMLImageElement, original: File): Promise<File> {
  if (Math.max(img.naturalWidth, img.naturalHeight) <= UPLOAD_MAX_SIDE && original.size < 4 * 1024 * 1024) return original
  const canvas = draw(img, UPLOAD_MAX_SIDE)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88))
  return blob ? new File([blob], 'bill.jpg', { type: 'image/jpeg' }) : original
}
