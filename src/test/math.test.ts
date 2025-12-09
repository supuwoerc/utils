import { describe, expect, it } from 'vitest'
import { clamp, mapRange, normalize } from '@/math'

describe('clamp function', () => {
  // Test case 1: Value within range
  // 测试用例1：值在范围内
  it('should return the value when it is within the range', () => {
    // Arrange: Set up test data
    // 准备：设置测试数据
    const min = 0
    const max = 10
    const value = 5
    const result = clamp(min, max, value)
    expect(result).toBe(5)
  })

  // Test case 2: Value below minimum
  // 测试用例2：值小于最小值
  it('should return the minimum when value is below min', () => {
    // Arrange
    // 准备
    const min = 0
    const max = 10
    const value = -5

    // Act
    // 执行
    const result = clamp(min, max, value)

    // Assert
    // 断言
    expect(result).toBe(min)
  })

  // Test case 3: Value above maximum
  // 测试用例3：值大于最大值
  it('should return the maximum when value is above max', () => {
    // Arrange
    // 准备
    const min = 0
    const max = 10
    const value = 15

    // Act
    // 执行
    const result = clamp(min, max, value)

    // Assert
    // 断言
    expect(result).toBe(max)
  })

  // Test case 4: Value equals minimum
  // 测试用例4：值等于最小值
  it('should return the value when it equals the minimum', () => {
    // Arrange
    // 准备
    const min = 0
    const max = 10
    const value = 0

    // Act
    // 执行
    const result = clamp(min, max, value)

    // Assert
    // 断言
    expect(result).toBe(min)
  })

  // Test case 5: Value equals maximum
  // 测试用例5：值等于最大值
  it('should return the value when it equals the maximum', () => {
    // Arrange
    // 准备
    const min = 0
    const max = 10
    const value = 10

    // Act
    // 执行
    const result = clamp(min, max, value)

    // Assert
    // 断言
    expect(result).toBe(max)
  })

  // Test case 6: Edge case with negative numbers
  // 测试用例6：负数的边界情况
  it('should work correctly with negative numbers', () => {
    // Arrange
    // 准备
    const min = -10
    const max = -5
    const value = -7

    // Act
    // 执行
    const result = clamp(min, max, value)

    // Assert
    // 断言
    expect(result).toBe(-7)
  })

  // Test case 7: Edge case with floating point numbers
  // 测试用例7：浮点数的边界情况
  it('should work correctly with floating point numbers', () => {
    // Arrange
    // 准备
    const min = 0.1
    const max = 0.9
    const value = 0.5

    // Act
    // 执行
    const result = clamp(min, max, value)

    // Assert
    // 断言
    expect(result).toBe(0.5)
  })

  // Test case 8: Invalid range (min > max)
  // 测试用例8：无效范围（最小值大于最大值）
  it('should handle invalid range where min > max', () => {
    // Arrange
    // 准备
    const min = 10
    const max = 0
    const value = 5

    // Act
    // 执行
    const result = clamp(min, max, value)

    // Assert: In this case, Math.max(min, Math.min(max, value)) will return min
    // 断言：这种情况下，Math.max(min, Math.min(max, value)) 将返回最小值
    expect(result).toBe(min)
  })

  // Test case 9: Same min and max
  // 测试用例9：最小值和最大值相同
  it('should work when min and max are the same', () => {
    // Arrange
    // 准备
    const min = 5
    const max = 5
    const value = 10

    // Act
    // 执行
    const result = clamp(min, max, value)

    // Assert
    // 断言
    expect(result).toBe(5)
  })
})

describe('normalize function', () => {
  // Test case 1: Normal case with valid min and max values
  // 测试用例1：正常情况，最小值和最大值有效
  it('should return a function that normalizes values correctly', () => {
    const normalizer = normalize(0, 10)

    // Test value at minimum boundary
    // 测试最小值边界
    expect(normalizer(0)).toBe(0)

    // Test value at maximum boundary
    // 测试最大值边界
    expect(normalizer(10)).toBe(1)

    // Test value in the middle
    // 测试中间值
    expect(normalizer(5)).toBe(0.5)

    // Test value below minimum
    // 测试小于最小值的情况
    expect(normalizer(-5)).toBe(-0.5)

    // Test value above maximum
    // 测试大于最大值的情况
    expect(normalizer(15)).toBe(1.5)
  })

  // Test case 2: Different range
  // 测试用例2：不同的范围
  it('should work with different ranges', () => {
    const normalizer = normalize(100, 200)

    expect(normalizer(100)).toBe(0)
    expect(normalizer(200)).toBe(1)
    expect(normalizer(150)).toBe(0.5)
  })

  // Test case 3: Negative range
  // 测试用例3：负数范围
  it('should work with negative ranges', () => {
    const normalizer = normalize(-10, 10)

    expect(normalizer(-10)).toBe(0)
    expect(normalizer(10)).toBe(1)
    expect(normalizer(0)).toBe(0.5)
  })

  // Test case 4: Decimal range
  // 测试用例4：小数范围
  it('should work with decimal ranges', () => {
    const normalizer = normalize(0.5, 2.5)

    expect(normalizer(0.5)).toBe(0)
    expect(normalizer(2.5)).toBe(1)
    expect(normalizer(1.5)).toBe(0.5)
  })

  // Test case 5: Edge case - max equals min
  // 测试用例5：边界情况 - 最大值等于最小值
  it('should throw error when max is less than or equal to min', () => {
    // Test max equals min
    // 测试最大值等于最小值
    expect(() => normalize(5, 5)).toThrow('最大值必须大于最小值 (Max must be greater than min)')

    // Test max less than min
    // 测试最大值小于最小值
    expect(() => normalize(10, 5)).toThrow('最大值必须大于最小值 (Max must be greater than min)')
  })

  // Test case 6: Returned function should handle edge cases
  // 测试用例6：返回的函数应该处理边界情况
  it('should handle edge cases in the returned function', () => {
    const normalizer = normalize(0, 10)

    // Test with NaN
    // 测试NaN值
    expect(normalizer(Number.NaN)).toBeNaN()

    // Test with Infinity
    // 测试无穷大值
    expect(normalizer(Infinity)).toBe(Infinity)

    // Test with -Infinity
    // 测试负无穷大值
    expect(normalizer(-Infinity)).toBe(-Infinity)
  })

  // Test case 7: Verify the returned function is a closure
  // 测试用例7：验证返回的函数是一个闭包
  it('should create a closure that remembers min and max values', () => {
    const min = 10
    const max = 20
    const normalizer = normalize(min, max)

    // The closure should use the captured min and max values
    // 闭包应该使用捕获的最小值和最大值
    expect(normalizer(15)).toBe(0.5)

    // Create another normalizer with different range
    // 创建另一个不同范围的归一化函数
    const anotherNormalizer = normalize(0, 100)
    expect(anotherNormalizer(50)).toBe(0.5)

    // Both should work independently
    // 两个函数应该独立工作
    expect(normalizer(15)).toBe(0.5) // Should still be 0.5 for range 10-20
  })
})

describe('mapRange', () => {
  // Test basic linear mapping
  // 测试基本的线性映射
  it('should correctly map value within input range to output range', () => {
    // Map from [0, 10] to [0, 100]
    // 将 [0, 10] 映射到 [0, 100]
    expect(mapRange(0, 10, 0, 100, 5)).toBe(50) // Middle point 中点
    expect(mapRange(0, 10, 0, 100, 0)).toBe(0) // Lower bound 下界
    expect(mapRange(0, 10, 0, 100, 10)).toBe(100) // Upper bound 上界
  })

  // Test negative ranges
  // 测试负值范围
  it('should handle negative input and output ranges', () => {
    // Map from [-10, 10] to [-100, 100]
    // 将 [-10, 10] 映射到 [-100, 100]
    expect(mapRange(-10, 10, -100, 100, 0)).toBe(0) // Center 中心点
    expect(mapRange(-10, 10, -100, 100, -10)).toBe(-100) // Negative bound 负边界
    expect(mapRange(-10, 10, -100, 100, 10)).toBe(100) // Positive bound 正边界
  })

  // Test reversed mapping (decreasing output range)
  // 测试反向映射（递减的输出范围）
  it('should handle reversed output ranges', () => {
    // Map from [0, 10] to [100, 0] (reversed)
    // 将 [0, 10] 映射到 [100, 0]（反向）
    expect(mapRange(0, 10, 100, 0, 5)).toBe(50) // Middle becomes middle 中点映射到中点
    expect(mapRange(0, 10, 100, 0, 0)).toBe(100) // Lower input -> upper output 输入下界映射到输出上界
    expect(mapRange(0, 10, 100, 0, 10)).toBe(0) // Upper input -> lower output 输入上界映射到输出下界
  })

  // Test value outside input range (extrapolation)
  // 测试超出输入范围的值（外推）
  it('should extrapolate values outside input range', () => {
    // Map from [0, 10] to [0, 100]
    // 将 [0, 10] 映射到 [0, 100]
    expect(mapRange(0, 10, 0, 100, -5)).toBe(-50) // Below range 低于范围
    expect(mapRange(0, 10, 0, 100, 15)).toBe(150) // Above range 高于范围
  })

  // Test edge cases
  // 测试边界情况
  it('should handle edge cases', () => {
    // Zero input range (division by zero protection)
    // 零输入范围（防止除以零）
    expect(mapRange(5, 5, 0, 100, 5)).toBe(Number.NaN) // Should return NaN 应该返回 NaN

    // Same output range
    // 相同的输出范围
    expect(mapRange(0, 10, 50, 50, 5)).toBe(50) // All values map to same output 所有值映射到相同输出
  })

  // Test floating point precision
  // 测试浮点数精度
  it('should handle floating point values correctly', () => {
    // Map from [0, 1] to [0, 10]
    // 将 [0, 1] 映射到 [0, 10]
    expect(mapRange(0, 1, 0, 10, 0.3)).toBeCloseTo(3) // Use toBeCloseTo for floating point 使用 toBeCloseTo 处理浮点数
    expect(mapRange(0, 1, 0, 10, 0.7)).toBeCloseTo(7)
  })

  // Test with decimal ranges
  // 测试小数范围
  it('should work with decimal input/output ranges', () => {
    // Map from [0.5, 2.5] to [1.0, 5.0]
    // 将 [0.5, 2.5] 映射到 [1.0, 5.0]
    expect(mapRange(0.5, 2.5, 1.0, 5.0, 1.5)).toBeCloseTo(3.0) // Middle value 中间值
  })
})
