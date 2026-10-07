/**
 * java.util.Random — тот же LCG, что в JVM, чтобы «случайные» позиции звёзд и
 * частиц анимированных фонов совпадали с Android (Random(42L), Random(7L)…).
 */
const MULT = 0x5deece66dn;
const ADD = 0xbn;
const MASK = (1n << 48n) - 1n;

export class JavaRandom {
  private seed: bigint;
  constructor(seed: number) {
    this.seed = (BigInt(seed) ^ MULT) & MASK;
  }
  private next(bits: number): number {
    this.seed = (this.seed * MULT + ADD) & MASK;
    return Number(this.seed >> BigInt(48 - bits));
  }
  nextFloat(): number {
    return this.next(24) / (1 << 24);
  }
}
