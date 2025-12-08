/**
 * 判断是否为原始值
 *
 * Determine whether a value is a primitive (string, number, boolean, symbol, bigint, null, undefined).
 *
 * @param {any} val - 待判断的值 / value to check
 * @returns {val is string | number | boolean | symbol | bigint | null | undefined} 如果是原始值返回 true / true if value is primitive
 */
export function isPrimitive(
  val: any,
): val is string | number | boolean | symbol | bigint | null | undefined {
  return !val || Object(val) !== val
}

/**
 * 判断值是否为浏览器 window 对象
 *
 * Determine whether a value is the browser `window` object.
 *
 * @param {any} val - 待判断的值 / value to check
 * @returns {boolean} 如果是 window 返回 true / true if value is window
 */
export function isWindow(val: any): boolean {
  return typeof window !== 'undefined' && Object.prototype.toString.call(val) === '[object Window]'
}

/**
 * 判断值是否定义（非 undefined）
 *
 * Determine whether a value is defined (not `undefined`).
 *
 * @template T
 * @param {T} [val] - 待判断的值 / value to check
 * @returns {val is T} 若值已定义返回 true / true if value is defined
 */
export const isDefined = <T = any>(val?: T): val is T => typeof val !== 'undefined'

/**
 * 判断值是否为 undefined
 *
 * Determine whether a value is `undefined`.
 *
 * @param {any} val - 待判断的值 / value to check
 * @returns {val is undefined} 如果是 undefined 返回 true / true if value is undefined
 */
export function isUndefined(val: any): val is undefined {
  return Object.prototype.toString.call(val) === '[object Undefined]'
}

/**
 * 判断值是否为布尔值
 *
 * Determine whether a value is a boolean.
 *
 * @param {any} val - 待判断的值 / value to check
 * @returns {val is boolean} 如果是布尔值返回 true / true if value is boolean
 */
export const isBoolean = (val: any): val is boolean => typeof val === 'boolean'

/**
 * 判断值是否为 Date 对象
 *
 * Determine whether a value is a `Date` object.
 *
 * @param {any} val - 待判断的值 / value to check
 * @returns {val is Date} 如果是 Date 返回 true / true if value is Date
 */
export function isDate(val: any): val is Date {
  return Object.prototype.toString.call(val) === '[object Date]'
}

/**
 * 判断值是否为 null
 *
 * Determine whether a value is `null`.
 *
 * @param {any} val - 待判断的值 / value to check
 * @returns {val is null} 如果是 null 返回 true / true if value is null
 */
export function isNull(val: any): val is null {
  return Object.prototype.toString.call(val) === '[object Null]'
}

/**
 * 判断值是否为普通对象（非数组、函数等）
 *
 * Determine whether a value is a plain object (not array, function, etc.).
 *
 * @param {any} val - 待判断的值 / value to check
 * @returns {val is object} 如果是普通对象返回 true / true if value is a plain object
 */
export function isObject(val: any): val is object {
  return Object.prototype.toString.call(val) === '[object Object]'
}

/**
 * 判断值是否为字符串
 *
 * Determine whether a value is a string.
 *
 * @param {unknown} val - 待判断的值 / value to check
 * @returns {val is string} 如果是字符串返回 true / true if value is string
 */
export const isString = (val: unknown): val is string => typeof val === 'string'

/**
 * 判断值是否为正则对象
 *
 * Determine whether a value is a `RegExp` object.
 *
 * @param {any} val - 待判断的值 / value to check
 * @returns {val is RegExp} 如果是 RegExp 返回 true / true if value is RegExp
 */
export function isRegExp(val: any): val is RegExp {
  return Object.prototype.toString.call(val) === '[object RegExp]'
}

/**
 * 判断值是否为数字类型（不排除 NaN）
 *
 * Determine whether a value is a number (does not exclude NaN).
 *
 * @param {any} val - 待判断的值 / value to check
 * @returns {val is number} 如果为 number 返回 true / true if value is number
 */
export const isNumber = (val: any): val is number => typeof val === 'number'

/**
 * 判断值是否为函数
 *
 * Determine whether a value is a function.
 *
 * @template T
 * @param {any} val - 待判断的值 / value to check
 * @returns {val is T} 如果为函数返回 true / true if value is a function
 */
// eslint-disable-next-line ts/no-unsafe-function-type
export const isFunction = <T extends Function>(val: any): val is T => typeof val === 'function'
