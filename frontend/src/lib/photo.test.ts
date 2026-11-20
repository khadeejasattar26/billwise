import { describe, expect, it } from 'vitest'
import { assess, measure } from './photo'

function image(width: number, height: number, pixel: (x: number, y: number) => number) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const v = pixel(x, y), i = (y * width + x) * 4
    data[i] = data[i + 1] = data[i + 2] = v
    data[i + 3] = 255
  }
  return data
}

describe('measure', () => {
  it('gives a flat page zero sharpness and its brightness', () => {
    const r = measure(image(40, 40, () => 250), 40, 40)
    expect(r.sharpness).toBe(0)
    expect(r.brightness).toBeCloseTo(250)
  })
  it('scores sharp black-on-white edges far above the blur threshold', () => {
    const r = measure(image(40, 40, (x, y) => ((x >> 1) + (y >> 1)) % 2 ? 0 : 255), 40, 40)
    expect(r.sharpness).toBeGreaterThan(1000)
  })
})

describe('assess', () => {
  const sharp = { width: 3000, height: 4000, sharpness: 1180, brightness: 228 } // a real phone photo of the sample bill
  it('passes a sharp, bright, large photo', () => expect(assess(sharp)).toEqual([]))
  it('flags blurry, dark and small photos using the measured thresholds', () => {
    expect(assess({ ...sharp, sharpness: 44 })).toEqual(['blurry'])   // blurred by 1.5 px: 44
    expect(assess({ ...sharp, brightness: 57 })).toEqual(['dark'])    // dark photo: 57
    expect(assess({ ...sharp, width: 300, height: 380 })).toEqual(['small'])
  })
})
