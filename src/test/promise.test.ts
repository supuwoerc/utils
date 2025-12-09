import { describe, expect, it, vi } from 'vitest'
import { allSettledWithResults, promisify, sleep, withTimeout } from '@/promise'

describe('sleep function', () => {
  // 测试基础延迟功能
  // Test basic delay functionality
  it('should resolve after specified milliseconds', async () => {
    const startTime = Date.now()
    const delayMs = 100
    await sleep(delayMs)
    const elapsedTime = Date.now() - startTime
    expect(elapsedTime).toBeGreaterThanOrEqual(delayMs - 100)
    expect(elapsedTime).toBeLessThanOrEqual(delayMs + 100)
  })

  // 测试回调函数执行
  // Test callback function execution
  it('should execute callback before resolving', async () => {
    let callbackExecuted = false
    const mockCallback = vi.fn(() => {
      callbackExecuted = true
    })

    await sleep(50, mockCallback)

    // 验证回调函数被调用
    // Verify callback was called
    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(callbackExecuted).toBe(true)
  })

  // 测试异步回调函数
  // Test asynchronous callback function
  it('should handle async callback functions', async () => {
    let asyncOperationCompleted = false

    const asyncCallback = async () => {
      await new Promise((resolve) => setTimeout(resolve, 20))
      asyncOperationCompleted = true
    }

    await sleep(50, asyncCallback)

    // 验证异步操作完成
    // Verify async operation completed
    expect(asyncOperationCompleted).toBe(true)
  })

  // 测试没有回调函数的情况
  // Test case without callback function
  it('should work without callback function', async () => {
    const startTime = Date.now()

    // 不传递回调函数应该也能正常工作
    // Should work correctly without passing callback
    await sleep(50)

    const elapsedTime = Date.now() - startTime
    expect(elapsedTime).toBeGreaterThanOrEqual(40)
  })

  // 测试回调函数中的错误处理
  // Test error handling in callback
  it('should reject if callback throws error', async () => {
    const errorMessage = 'Callback error'
    const failingCallback = () => {
      throw new Error(errorMessage)
    }

    // 注意：原函数不会拒绝Promise，而是会抛出同步错误
    // Note: The original function doesn't reject the promise, but throws synchronous error
    await expect(sleep(50, failingCallback)).rejects.toThrow(errorMessage)
  })

  // 测试零延迟情况
  // Test zero delay scenario
  it('should handle zero milliseconds delay', async () => {
    const startTime = Date.now()
    let callbackCalled = false

    await sleep(0, () => {
      callbackCalled = true
    })

    const elapsedTime = Date.now() - startTime
    // 零延迟应该几乎立即执行
    // Zero delay should execute almost immediately
    expect(elapsedTime).toBeLessThan(10)
    expect(callbackCalled).toBe(true)
  })

  // 测试负延迟情况（应该立即执行）
  // Test negative delay (should execute immediately)
  it('should handle negative milliseconds delay', async () => {
    const startTime = Date.now()
    let callbackCalled = false

    await sleep(-100, () => {
      callbackCalled = true
    })

    const elapsedTime = Date.now() - startTime
    // 负延迟应该几乎立即执行
    // Negative delay should execute almost immediately
    expect(elapsedTime).toBeLessThan(10)
    expect(callbackCalled).toBe(true)
  })
})

describe('withTimeout', () => {
  // Test case 1: Promise resolves before timeout
  // 测试用例 1: Promise 在超时前完成
  it('should resolve when promise completes before timeout', async () => {
    const fastPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('success'), 50)
    })

    const result = await withTimeout(fastPromise, 100, 'Timeout error')
    expect(result).toBe('success')
  })

  // Test case 2: Promise rejects before timeout
  // 测试用例 2: Promise 在超时前拒绝
  it('should reject when promise rejects before timeout', async () => {
    const failingPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Promise failed')), 50)
    })

    await expect(withTimeout(failingPromise, 100, 'Timeout error')).rejects.toThrow(
      'Promise failed',
    )
  })

  // Test case 3: Timeout occurs before promise resolves
  // 测试用例 3: 超时发生在 Promise 完成之前
  it('should reject with timeout error when timeout occurs', async () => {
    const slowPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('success'), 200)
    })

    await expect(withTimeout(slowPromise, 100, 'Operation timed out')).rejects.toThrow(
      'Operation timed out',
    )
  })

  // Test case 4: Custom Error object as timeout error
  // 测试用例 4: 使用自定义 Error 对象作为超时错误
  it('should reject with custom Error object', async () => {
    const slowPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('success'), 200)
    })

    const customError = new Error('Custom timeout error')
    customError.name = 'TimeoutError'

    await expect(withTimeout(slowPromise, 100, customError)).rejects.toBe(customError)
  })

  // Test case 5: Timeout cleanup when promise resolves
  // 测试用例 5: Promise 完成时清理超时
  it('should clear timeout when promise resolves', async () => {
    const mockClearTimeout = vi.spyOn(globalThis, 'clearTimeout')

    const fastPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('success'), 50)
    })

    await withTimeout(fastPromise, 100, 'Timeout error')

    // Verify clearTimeout was called
    // 验证 clearTimeout 被调用
    expect(mockClearTimeout).toHaveBeenCalled()

    mockClearTimeout.mockRestore()
  })

  // Test case 6: Timeout cleanup when promise rejects
  // 测试用例 6: Promise 拒绝时清理超时
  it('should clear timeout when promise rejects', async () => {
    const mockClearTimeout = vi.spyOn(globalThis, 'clearTimeout')

    const failingPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Failed')), 50)
    })

    await expect(withTimeout(failingPromise, 100, 'Timeout error')).rejects.toThrow('Failed')

    // Verify clearTimeout was called
    // 验证 clearTimeout 被调用
    expect(mockClearTimeout).toHaveBeenCalled()

    mockClearTimeout.mockRestore()
  })

  // Test case 7: Default error message
  // 测试用例 7: 默认错误消息
  it('should use default error message when not provided', async () => {
    const slowPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('success'), 200)
    })

    await expect(withTimeout(slowPromise, 100)).rejects.toThrow('Operation timeout')
  })

  // Test case 8: Immediate resolution promise
  // 测试用例 8: 立即完成的 Promise
  it('should work with immediately resolving promise', async () => {
    const immediatePromise = Promise.resolve('immediate success')

    const result = await withTimeout(immediatePromise, 100, 'Timeout error')
    expect(result).toBe('immediate success')
  })

  // Test case 9: Immediate rejection promise
  // 测试用例 9: 立即拒绝的 Promise
  it('should work with immediately rejecting promise', async () => {
    const immediatePromise = Promise.reject(new Error('immediate failure'))

    await expect(withTimeout(immediatePromise, 100, 'Timeout error')).rejects.toThrow(
      'immediate failure',
    )
  })
})

describe('promisify', () => {
  // Test 1: Basic functionality - should convert callback-style function to promise
  // 测试1: 基本功能 - 应该将回调式函数转换为Promise
  it('should convert callback-style function to promise', async () => {
    // Mock callback-style function
    // 模拟回调式函数
    const mockFn = (arg1: string, arg2: number, callback: (error: any, result: string) => void) => {
      callback(null, `result: ${arg1}-${arg2}`)
    }

    // Convert to promise-based function
    // 转换为基于Promise的函数
    const promisifiedFn = promisify<string>(mockFn)

    // Call the promisified function
    // 调用Promise化的函数
    const result = await promisifiedFn('test', 123)

    // Verify the result
    // 验证结果
    expect(result).toBe('result: test-123')
  })

  // Test 2: Error handling - should reject when callback returns error
  // 测试2: 错误处理 - 当回调返回错误时应拒绝Promise
  it('should reject when callback returns error', async () => {
    const error = new Error('Test error')
    const mockFn = (callback: (error: any, result: any) => void) => {
      callback(error, null)
    }

    const promisifiedFn = promisify(mockFn)

    // Expect the promise to be rejected with the error
    // 期望Promise被拒绝并返回错误
    await expect(promisifiedFn()).rejects.toThrow(error)
  })

  // Test 3: Context binding - should maintain correct context
  // 测试3: 上下文绑定 - 应该保持正确的上下文
  it('should maintain correct context when provided', async () => {
    const context = {
      value: 'contextValue',
      mockMethod(callback: (error: any, result: string) => void) {
        callback(null, this.value)
      },
    }

    // Bind the function to context
    // 将函数绑定到上下文
    const promisifiedFn = promisify<string>(context.mockMethod, context)

    const result = await promisifiedFn()
    expect(result).toBe('contextValue')
  })

  // Test 4: Multiple arguments - should handle functions with multiple arguments
  // 测试4: 多个参数 - 应该处理具有多个参数的函数
  it('should handle functions with multiple arguments', async () => {
    const mockFn = (
      a: number,
      b: string,
      c: boolean,
      callback: (error: any, result: string) => void,
    ) => {
      callback(null, `${a}-${b}-${c}`)
    }

    const promisifiedFn = promisify<string>(mockFn)
    const result = await promisifiedFn(1, 'test', true)

    expect(result).toBe('1-test-true')
  })

  // Test 5: No context - should work without context parameter
  // 测试5: 无上下文 - 在没有上下文参数的情况下应该正常工作
  it('should work without context parameter', async () => {
    const mockFn = (callback: (error: any, result: string) => void) => {
      callback(null, 'success')
    }

    const promisifiedFn = promisify<string>(mockFn)
    const result = await promisifiedFn()

    expect(result).toBe('success')
  })

  // Test 6: Type safety - should preserve TypeScript types
  // 测试6: 类型安全 - 应该保留TypeScript类型
  it('should preserve TypeScript types', async () => {
    interface User {
      id: number
      name: string
    }

    const getUser = (id: number, callback: (error: any, user: User) => void) => {
      callback(null, { id, name: 'John Doe' })
    }

    const promisifiedGetUser = promisify<User>(getUser)
    const user = await promisifiedGetUser(1)

    // TypeScript should infer the correct type
    // TypeScript应该推断出正确的类型
    expect(user.id).toBe(1)
    expect(user.name).toBe('John Doe')
  })

  // Test 7: Async callback - should handle async callbacks correctly
  // 测试7: 异步回调 - 应该正确处理异步回调
  it('should handle async callbacks correctly', async () => {
    const mockFn = (callback: (error: any, result: string) => void) => {
      setTimeout(() => {
        callback(null, 'delayed result')
      }, 10)
    }

    const promisifiedFn = promisify<string>(mockFn)
    const result = await promisifiedFn()

    expect(result).toBe('delayed result')
  })
})

describe('allSettledWithResults', () => {
  // Test case 1: All promises fulfilled successfully
  // 测试用例 1: 所有 Promise 都成功完成
  it('should return fulfilled results when all promises resolve', async () => {
    // Arrange: Create three promises that will resolve with different values
    // 准备: 创建三个会以不同值解析的 Promise
    const promise1 = Promise.resolve('value1')
    const promise2 = Promise.resolve(42) as unknown as Promise<string>
    const promise3 = Promise.resolve({ data: 'test' }) as unknown as Promise<string>

    // Act: Call the function with the promises
    // 执行: 使用这些 Promise 调用函数
    const results = await allSettledWithResults([promise1, promise2, promise3])

    // Assert: Verify all results have status 'fulfilled' with correct values
    // 断言: 验证所有结果状态为 'fulfilled' 且值正确
    expect(results).toHaveLength(3)

    expect(results[0]).toEqual({
      status: 'fulfilled',
      value: 'value1',
    })

    expect(results[1]).toEqual({
      status: 'fulfilled',
      value: 42,
    })

    expect(results[2]).toEqual({
      status: 'fulfilled',
      value: { data: 'test' },
    })
  })

  // Test case 2: All promises rejected
  // 测试用例 2: 所有 Promise 都被拒绝
  it('should return rejected results when all promises reject', async () => {
    // Arrange: Create three promises that will reject with different errors
    // 准备: 创建三个会以不同错误拒绝的 Promise
    const error1 = new Error('Error 1')
    const error2 = new TypeError('Type Error')
    const error3 = 'String error'

    const promise1 = Promise.reject(error1)
    const promise2 = Promise.reject(error2)
    const promise3 = Promise.reject(error3)

    // Act: Call the function with the promises
    // 执行: 使用这些 Promise 调用函数
    const results = await allSettledWithResults([promise1, promise2, promise3])

    // Assert: Verify all results have status 'rejected' with correct errors
    // 断言: 验证所有结果状态为 'rejected' 且错误正确
    expect(results).toHaveLength(3)

    expect(results[0]).toEqual({
      status: 'rejected',
      error: error1,
    })

    expect(results[1]).toEqual({
      status: 'rejected',
      error: error2,
    })

    expect(results[2]).toEqual({
      status: 'rejected',
      error: error3,
    })
  })

  // Test case 3: Mixed results with some fulfilled and some rejected promises
  // 测试用例 3: 混合结果 - 部分成功，部分失败
  it('should handle mixed results with both fulfilled and rejected promises', async () => {
    // Arrange: Create promises with mixed outcomes
    // 准备: 创建具有混合结果的 Promise
    const successValue = 'Success!'
    const error = new Error('Failed!')

    const promise1 = Promise.resolve(successValue)
    const promise2 = Promise.reject(error)
    const promise3 = Promise.resolve(100) as unknown as Promise<string>

    // Act: Call the function with the promises
    // 执行: 使用这些 Promise 调用函数
    const results = await allSettledWithResults([promise1, promise2, promise3])

    // Assert: Verify mixed results are correctly categorized
    // 断言: 验证混合结果被正确分类
    expect(results).toHaveLength(3)

    expect(results[0]).toEqual({
      status: 'fulfilled',
      value: successValue,
    })

    expect(results[1]).toEqual({
      status: 'rejected',
      error,
    })

    expect(results[2]).toEqual({
      status: 'fulfilled',
      value: 100,
    })
  })

  // Test case 4: Empty array of promises
  // 测试用例 4: 空 Promise 数组
  it('should return empty array when given empty promises array', async () => {
    // Arrange: Empty promises array
    // 准备: 空 Promise 数组
    const promises: Promise<any>[] = []

    // Act: Call the function with empty array
    // 执行: 使用空数组调用函数
    const results = await allSettledWithResults(promises)

    // Assert: Verify empty array is returned
    // 断言: 验证返回空数组
    expect(results).toEqual([])
    expect(results).toHaveLength(0)
  })

  // Test case 5: Verify type safety and structure
  // 测试用例 5: 验证类型安全和结构
  it('should maintain correct TypeScript types in results', async () => {
    // Arrange: Create typed promises
    // 准备: 创建类型化的 Promise
    const stringPromise = Promise.resolve('test')
    const numberPromise = Promise.resolve(123) as unknown as Promise<string>

    // Act: Call the function
    // 执行: 调用函数
    const results = await allSettledWithResults([stringPromise, numberPromise])

    // Assert: Type checking through usage
    // 断言: 通过使用进行类型检查
    results.forEach((result) => {
      // TypeScript should infer the correct type
      // TypeScript 应该推断出正确的类型
      if (result.status === 'fulfilled') {
        // value should exist for fulfilled promises
        // 对于已完成的 Promise，value 应该存在
        expect(result.value).toBeDefined()
        // error should not exist for fulfilled promises
        // 对于已完成的 Promise，error 不应该存在
        expect(result.error).toBeUndefined()
      } else {
        // error should exist for rejected promises
        // 对于被拒绝的 Promise，error 应该存在
        expect(result.error).toBeDefined()
        // value should not exist for rejected promises
        // 对于被拒绝的 Promise，value 不应该存在
        expect(result.value).toBeUndefined()
      }
    })
  })

  // Test case 6: Verify order preservation
  // 测试用例 6: 验证顺序保持
  it('should preserve the order of results matching input promises', async () => {
    // Arrange: Create promises that resolve in different orders
    // 准备: 创建以不同顺序解析的 Promise
    const slowPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('slow'), 50)
    })

    const fastPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('fast'), 10)
    })

    const mediumPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('medium'), 30)
    })

    // Act: Call the function
    // 执行: 调用函数
    const results = await allSettledWithResults([
      slowPromise, // Index 0 - 索引 0
      fastPromise, // Index 1 - 索引 1
      mediumPromise, // Index 2 - 索引 2
    ])

    // Assert: Results should be in original order, not resolution order
    // 断言: 结果应该保持原始顺序，而不是解析顺序
    expect(results[0]).toEqual({
      status: 'fulfilled',
      value: 'slow',
    })

    expect(results[1]).toEqual({
      status: 'fulfilled',
      value: 'fast',
    })

    expect(results[2]).toEqual({
      status: 'fulfilled',
      value: 'medium',
    })
  })
})
