/**
 * 限制数值在指定范围内
 * Clamps a number between a minimum and maximum value
 *
 * @param min - 最小值 / Minimum value
 * @param max - 最大值 / Maximum value
 * @param value - 返回限制后的结果 / clamped result
 * @returns 限制后的数值 / Clamped number
 */
export function clamp(min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 创建一个归一化函数，将给定范围内的值映射到 [0, 1] 区间
 * Creates a normalization function that maps values in a given range to [0, 1]
 *
 * @param {number} min - 范围的最小值 / Minimum value of the range
 * @param {number} max - 范围的最大值 / Maximum value of the range
 * @returns {(value: number) => number} 归一化函数，接收一个数值并返回其在 [0, 1] 区间内的比例
 *           Normalization function that takes a number and returns its proportion in [0, 1]
 * @throws {Error} 当最大值小于或等于最小值时抛出异常
 *                  Throws an error when max is less than or equal to min
 *
 * @example
 * // 示例 / Example:
 * const normalizeToRange = normalize(10, 20)
 * console.log(normalizeToRange(15)) // 输出: 0.5
 */
export function normalize(min: number, max: number): (n: number) => number {
  if (max <= min) {
    throw new Error('最大值必须大于最小值 (Max must be greater than min)')
  }
  return function (value: number): number {
    return (value - min) / (max - min)
  }
}

/**
 * 将数值从一个范围线性映射到另一个范围
 * Linearly maps a value from one range to another range
 *
 * @param {number} inMin - 输入范围的最小值 / Minimum value of input range
 * @param {number} inMax - 输入范围的最大值 / Maximum value of input range
 * @param {number} outMin - 输出范围的最小值 / Minimum value of output range
 * @param {number} outMax - 输出范围的最大值 / Maximum value of output range
 * @param {number} value - 需要映射的数值 / Value to be mapped
 * @returns {number} 映射后的数值 / Mapped value
 *
 * @example
 * // 将0-100范围内的50映射到0-1范围
 * // Map 50 from range 0-100 to range 0-1
 * mapRange(0, 100, 0, 1, 50); // 返回 0.5 / Returns 0.5
 *
 * @example
 * // 将-10到10范围内的0映射到0到255范围
 * // Map 0 from range -10 to 10 to range 0 to 255
 * mapRange(-10, 10, 0, 255, 0); // 返回 127.5 / Returns 127.5
 */
export function mapRange(
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  value: number,
) {
  const ratio = (value - inMin) / (inMax - inMin)
  const mappedValue = outMin + ratio * (outMax - outMin)
  return mappedValue
}
