/**
 * Clamps a value within a range of values between a defined minimum bound and a maximum bound.
 * @param value Value
 * @param min Minimum bound
 * @param max Maximum bound
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(value, min));
}