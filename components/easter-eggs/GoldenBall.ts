export class GoldenBallTracker {
  private history: number[] = []

  record(binIndex: number): boolean {
    this.history.push(binIndex)
    if (this.history.length > 3) this.history.shift()
    if (this.history.length === 3 && this.history.every((b) => b === 6)) {
      this.history = []
      return true
    }
    return false
  }

  reset() {
    this.history = []
  }
}
