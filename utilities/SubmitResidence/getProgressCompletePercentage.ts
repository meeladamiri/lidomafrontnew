export function getProgressCompletePercentage(current_step: number): number {
  const p = (current_step / 14) * 100;

  return Number(p.toFixed(2));
}
