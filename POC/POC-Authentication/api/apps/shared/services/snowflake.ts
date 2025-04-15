export function generateNumber(n: number): number {
  const start = Math.pow(10, n - 1)
  const end = Math.pow(10, n) - 1

  return Math.floor(Math.random() * (end - start + 1) + start)
}

export function generateSnowflake(): string {
  const timestamp = Date.now()

  const timestampStr = timestamp.toString().slice(7)
  const machineId = generateNumber(4)
  const sequence = generateNumber(3)

  return `${machineId}${timestampStr}${sequence}`
}
