/* eslint-disable no-underscore-dangle */

let i
let j
let k
const A = [0, 0, 0]
let u
let v
let w
const T = [0x15, 0x38, 0x32, 0x2c, 0x0d, 0x13, 0x07, 0x2a]

class Simplex {
  constructor(seed = 3000) {
    this._seedValue = Simplex.xorshift(seed)

    this.setSeed = this.setSeed.bind(this)
    this.noise = this.noise.bind(this)
  }

  static xorshift(value) {
    let x = value ^ (value >> 12)
    x ^= x << 25
    x ^= x >> 27
    return x * 2
  }

  static b2func(N, B) {
    return (N >> B) & 1
  }

  static b4func(b4i, b4j, b4k, B) {
    return T[
      (Simplex.b2func(b4i, B) << 2) |
        (Simplex.b2func(b4j, B) << 1) |
        Simplex.b2func(b4k, B)
    ]
  }

  static K(a) {
    const s = (A[0] + A[1] + A[2]) / 6
    const x = u - A[0] + s
    const y = v - A[1] + s
    const z = w - A[2] + s
    let t = 0.6 - x * x - y * y - z * z
    const h = Simplex.shuffle(i + A[0], j + A[1], k + A[2])

    A[a]++

    if (t < 0) return 0

    const b5 = (h >> 5) & 1
    const b4 = (h >> 4) & 1
    const b3 = (h >> 3) & 1
    const b2 = (h >> 2) & 1
    const b = h & 3
    let p = b === 1 ? x : b === 2 ? y : z
    let q = b === 1 ? y : b === 2 ? z : x
    let r = b === 1 ? z : b === 2 ? x : y
    p = b5 === b3 ? -p : p
    q = b5 === b4 ? -q : q
    r = b5 !== (b4 ^ b3) ? -r : r
    t *= t

    return 8 * t * t * (p + (b === 0 ? q + r : b2 === 0 ? q : r))
  }

  static shuffle(si, sj, sk) {
    return (
      Simplex.b4func(si, sj, sk, 0) +
      Simplex.b4func(sj, sk, si, 1) +
      Simplex.b4func(sk, si, sj, 2) +
      Simplex.b4func(si, sj, sk, 3) +
      Simplex.b4func(sj, sk, si, 4) +
      Simplex.b4func(sk, si, sj, 5) +
      Simplex.b4func(si, sj, sk, 6) +
      Simplex.b4func(sj, sk, si, 7)
    )
  }

  setSeed(seed = 3000) {
    this._seedValue = Simplex.xorshift(seed)
  }

  noise(a, b, c) {
    const x = a + this._seedValue
    const y = b + this._seedValue
    const z = c + this._seedValue
    let s = (x + y + z) / 3

    i = Math.floor(x + s)
    j = Math.floor(y + s)
    k = Math.floor(z + s)
    s = (i + j + k) / 6
    u = x - i + s
    v = y - j + s
    w = z - k + s
    A[0] = 0
    A[1] = 0
    A[2] = 0

    const hi = u >= w ? (u >= v ? 0 : 1) : v >= w ? 1 : 2
    const lo = u < w ? (u < v ? 0 : 1) : v < w ? 1 : 2

    return Simplex.K(hi) + Simplex.K(3 - hi - lo) + Simplex.K(lo) + Simplex.K(0)
  }
}

module.exports = Simplex
