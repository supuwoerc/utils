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
