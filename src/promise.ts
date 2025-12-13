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
  return new Promise<void>((resolve, reject) =>
    setTimeout(async () => {
      try {
        await callback?.()
        resolve()
      } catch (error) {
        reject(error)
      }
    }, ms),
  )
}

/**
 * Wraps a promise with a timeout
 * 为 Promise 添加超时包装
 *
 * @param promise - The promise to wrap with timeout
 *                 要添加超时的 Promise
 * @param timeoutMs - Timeout duration in milliseconds
 *                    超时时间（毫秒）
 * @param errorMessage - Error message or Error object for timeout (default: 'Operation timeout')
 *                       超时时使用的错误消息或 Error 对象（默认：'Operation timeout'）
 * @returns A promise that either resolves/rejects with the original promise or rejects on timeout
 *          返回一个 Promise，要么随原始 Promise 完成/拒绝，要么在超时时拒绝
 *
 * @example
 * // Basic usage
 * // 基本用法
 * const result = await withTimeout(fetchData(), 5000, 'Request timeout')
 *
 * @example
 * // With custom Error object
 * // 使用自定义 Error 对象
 * const timeoutError = new Error('Custom timeout')
 * const result = await withTimeout(longOperation(), 3000, timeoutError)
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string | Error = 'Operation timeout',
): Promise<T> {
  let timeoutId: ReturnType<typeof globalThis.setTimeout>
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(typeof errorMessage === 'string' ? new Error(errorMessage) : errorMessage)
    }, timeoutMs)
  })
  return Promise.race([promise.finally(() => clearTimeout(timeoutId)), timeoutPromise])
}

/**
 * 重试执行异步函数，支持指数退避策略
 * Retry an asynchronous function with exponential backoff support
 *
 * @template T - 函数返回的 Promise 类型 / The Promise type returned by the function
 * @param {() => Promise<T>} fn - 需要重试的异步函数 / The asynchronous function to retry
 * @param {object} options - 重试配置选项 / Retry configuration options
 * @param {number} [options.maxAttempts=3] - 最大尝试次数 / Maximum number of attempts
 * @param {number} [options.delayMs=1000] - 初始延迟时间（毫秒） / Initial delay in milliseconds
 * @param {number} [options.backoffFactor=2] - 退避因子，每次重试延迟时间乘以此值 / Backoff factor, delay multiplies by this each retry
 * @param {(error: any, attempt: number) => boolean} [options.shouldRetry=() => true] - 判断是否应该重试的函数 / Function to determine if should retry
 * @returns {Promise<T>} 成功执行的结果 / Successfully executed result
 * @throws {any} 最后一次尝试的错误或达到最大重试次数时的错误 / Last attempt error or error when max retries reached
 *
 * @example
 * // 基本用法 / Basic usage
 * const result = await retry(() => fetchData());
 *
 * @example
 * // 自定义配置 / Custom configuration
 * const result = await retry(() => apiCall(), {
 *   maxAttempts: 5,
 *   delayMs: 500,
 *   backoffFactor: 1.5,
 *   shouldRetry: (error, attempt) => error.status !== 404
 * });
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delayMs?: number
    backoffFactor?: number
    shouldRetry?: (error: any, attempt: number) => boolean
  } = {},
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, backoffFactor = 2, shouldRetry = () => true } = options
  let lastError: any
  let currentDelay = delayMs
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt === maxAttempts || !shouldRetry(error, attempt)) {
        throw error
      }
      await sleep(currentDelay)
      currentDelay *= backoffFactor
    }
  }
  throw lastError
}

/**
 * 将基于回调的函数转换为返回 Promise 的函数
 * Converts a callback-based function to a Promise-returning function
 *
 * @param {Function} fn - 需要转换的原始回调函数
 *                       The original callback function to be converted
 * @param {any} [context] - 函数执行时的上下文（this 值）
 *                         The context (this value) for function execution
 * @returns {Function} 返回一个新函数，该函数接受与原函数相同的参数，但返回 Promise
 *                    Returns a new function that accepts the same arguments
 *                    as the original but returns a Promise
 *
 * @template T - Promise 解析值的类型
 *              The type of the resolved Promise value
 *
 * @example
 * // 示例：转换 Node.js 的 fs.readFile
 * // Example: Convert Node.js fs.readFile
 * const readFilePromise = promisify(fs.readFile, fs);
 * readFilePromise('file.txt', 'utf8').then(console.log);
 */
export function promisify<T>(
  fn: (...args: any[]) => void,
  context?: any,
): (...args: any[]) => Promise<T> {
  return function (...args: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      fn.call(context, ...args, (error: any, result: T) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }
}

/**
 * 等待所有 Promise 完成，并返回包含详细结果的对象数组
 * Awaits all promises to settle and returns an array of objects with detailed results
 *
 * @template T Promise 解析值的类型 / Type of the resolved promise value
 * @param {Promise<T>[]} promises 要等待的 Promise 数组 / Array of promises to wait for
 * @returns {Promise<Array<{
 *   status: 'fulfilled' | 'rejected'
 *   value?: T
 *   error?: any
 * }>>} 包含每个 Promise 状态和结果的对象数组 / Array of objects containing each promise's status and result
 *
 * @example
 * const promises = [Promise.resolve(1), Promise.reject(new Error('fail'))]
 * const results = await allSettledWithResults(promises)
 * // 返回: [{ status: 'fulfilled', value: 1 }, { status: 'rejected', error: Error('fail') }]
 * // Returns: [{ status: 'fulfilled', value: 1 }, { status: 'rejected', error: Error('fail') }]
 */
export async function allSettledWithResults<T>(promises: Promise<T>[]): Promise<
  Array<{
    status: 'fulfilled' | 'rejected'
    value?: T
    error?: any
  }>
> {
  const results = await Promise.allSettled(promises)

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return {
        status: 'fulfilled' as const,
        value: result.value,
      }
    } else {
      return {
        status: 'rejected' as const,
        error: result.reason,
      }
    }
  })
}
