import _equal from 'fast-deep-equal'
import { debounce as _debounce, throttle as _throttle } from 'throttle-debounce'

/**
 * @see {@link https://github.com/niksy/throttle-debounce}
 * @param {Function} func - The function to throttle
 * @param {number} delay - Throttle interval in milliseconds
 * @param {object} [options] - Configuration options
 * @param {boolean} [options.noTrailing] - Whether to disable trailing execution
 * @param {boolean} [options.noLeading] - Whether to disable leading execution
 * @param {boolean} [options.debounceMode] - Whether to enable debounce mode
 * @returns {Function} The throttled function
 * @example
 * const throttled = throttle(() => console.log('throttled'), 1000);
 * window.addEventListener('resize', throttled);
 */
export const throttle = _throttle

/**
 * @see {@link https://github.com/niksy/throttle-debounce}
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {object} [options] - Configuration options
 * @param {boolean} [options.leading=false] - Call before the delay
 * @param {boolean} [options.trailing=true] - Call after the delay
 * @param {number} [options.maxWait] - Maximum wait time
 * @returns {Function} Debounced function
 * @example
 * const debouncedFn = debounce(() => {
 *   console.log('Resized!')
 * }, 250)
 * window.addEventListener('resize', debouncedFn)
 */
export const debounce = _debounce

/**
 * 深度比较两个值是否相等
 * Deeply compares two values for equality
 *
 * @param {*} a - 第一个要比较的值 | The first value to compare
 * @param {*} b - 第二个要比较的值 | The second value to compare
 * @returns {boolean} 如果两个值深度相等则返回true，否则返回false | Returns true if the two values are deeply equal, otherwise false
 *
 * @example
 * // 基本类型比较 | Primitive type comparison
 * isDeepEqual(1, 1); // true
 * isDeepEqual('a', 'a'); // true
 *
 * @example
 * // 对象深度比较 | Deep object comparison
 * const obj1 = { a: 1, b: { c: 2 } };
 * const obj2 = { a: 1, b: { c: 2 } };
 * isDeepEqual(obj1, obj2); // true
 *
 * @example
 * // 数组深度比较 | Deep array comparison
 * const arr1 = [1, [2, 3]];
 * const arr2 = [1, [2, 3]];
 * isDeepEqual(arr1, arr2); // true
 *
 * @see _equal 实际执行比较的内部函数 | The internal function that actually performs the comparison
 */
export const isDeepEqual = _equal
