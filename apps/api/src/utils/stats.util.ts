export function calculateProgress(sent: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((sent / total) * 100);
}
