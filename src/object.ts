/**
 * 从源对象中选取指定属性，返回新对象
 * Picks specified properties from source object and returns new object
 *
 * @template O - 源对象类型 / Source object type
 * @template K - 选取的属性键类型 / Keys type to pick
 * @param {O} source - 源对象 / Source object
 * @param {readonly K[]} keys - 要选取的属性键数组 / Array of keys to pick
 * @param {boolean} [omitUndefined=false] - 是否忽略undefined值，默认false / Whether to omit undefined values, default false
 * @returns {Pick<O, K>} 选取后的新对象 / New object with picked properties
 *
 * @example
 * // 基础用法 / Basic usage
 * const obj = { a: 1, b: 2, c: 3 }
 * pick(obj, ['a', 'c']) // { a: 1, c: 3 }
 *
 * @example
 * // 忽略undefined值 / Omit undefined values
 * const obj = { a: 1, b: undefined, c: 3 }
 * pick(obj, ['a', 'b', 'c'], true) // { a: 1, c: 3 }
 */
export function pick<O extends object, K extends keyof O>(
  source: O,
  keys: readonly K[],
  omitUndefined = false,
): Pick<O, K> {
  const result = {} as Pick<O, K>
  for (const key of keys) {
    if (key in source) {
      const value = source[key]
      if (!omitUndefined || value !== undefined) {
        ;(result as any)[key] = value
      }
    }
  }
  return result
}

/**
 * 从对象中排除指定的属性
 * Omit specified properties from an object
 *
 * @template O - 原始对象的类型 / Type of the original object
 * @template K - 要排除的属性键类型 / Type of keys to omit
 * @param {O} obj - 原始对象 / The original object
 * @param {readonly K[]} keys - 要排除的属性键数组 / Array of keys to omit
 * @param {boolean} [omitUndefined=false] - 是否同时排除值为 undefined 的属性 / Whether to also omit properties with undefined value
 * @returns {Omit<O, K>} 排除指定属性后的新对象 / New object with specified properties omitted
 *
 * @example
 * // 示例1: 基本用法 / Basic usage
 * const obj = { a: 1, b: 2, c: 3 };
 * omit(obj, ['b']); // { a: 1, c: 3 }
 *
 * @example
 * // 示例2: 排除 undefined 值 / Omit undefined values
 * const obj = { a: 1, b: undefined, c: 3 };
 * omit(obj, ['c'], true); // { a: 1 }
 */
export function omit<O extends object, K extends keyof O>(
  obj: O,
  keys: readonly K[],
  omitUndefined = false,
): Omit<O, K> {
  const keysSet = new Set(keys)
  const result = {} as any
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      if ((!omitUndefined || value !== undefined) && !keysSet.has(key as unknown as K)) {
        result[key] = value
      }
    }
  }
  return result
}

/**
 * 检查对象是否为空（没有自有属性）
 * Check if object is empty (has no own properties)
 *
 * @param {Record<string, any>} obj - 要检查的对象 / Object to check
 * @returns {boolean} 是否为空对象 / Whether object is empty
 *
 * @example
 * // 检查空对象 / Check empty object
 * isEmpty({}) // true
 * isEmpty({ a: 1 }) // false
 */
export function isEmpty(obj: Record<string, any>): boolean {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false
    }
  }
  return true
}
