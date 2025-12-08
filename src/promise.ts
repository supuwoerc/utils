/**
 * 延迟执行函数，可选的异步回调
 * Delays execution with optional asynchronous callback
 *
 * @param {number} ms - 延迟的毫秒数 / Delay time in milliseconds
 * @param {() => any} [callback] - 可选的回调函数，将在延迟后执行 / Optional callback function to execute after delay
 * @returns {Promise<void>} 延迟完成后解析的Promise / Promise that resolves after the delay
 * @example
 * // 等待1秒后执行
 * // Wait for 1 second then execute
 * await sleep(1000)
 *
 * @example
 * // 等待1秒后执行回调函数
 * // Wait for 1 second then execute callback
 * await sleep(1000, () => console.log('Done'))
 */
export function sleep(ms: number, callback?: () => any) {
  return new Promise<void>((resolve) =>
    setTimeout(async () => {
      await callback?.()
      resolve()
    }, ms),
  )
}
