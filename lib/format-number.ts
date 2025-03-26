/**
 * Sayıları daha okunabilir formatta gösterir (1000 -> 1k, 1000000 -> 1M)
 */
export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString()
  } else if (num < 1000000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k"
  } else {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
  }
}

