import { describe, expect, it } from 'vitest'
import { ensurePrefix, ensureSuffix, getUnit, truncate } from '@/string'

describe('ensurePrefix function', () => {
  // Test case 1: 字符串已经包含前缀的情况
  it('should return the original string when it already has the prefix', () => {
    const prefix = 'http://'
    const str = 'http://example.com'

    const result = ensurePrefix(prefix, str)

    // 期望结果与原字符串相同
    expect(result).toBe(str)
  })

  // Test case 2: 字符串不包含前缀的情况
  it('should add prefix when string does not start with the prefix', () => {
    const prefix = 'http://'
    const str = 'example.com'

    const result = ensurePrefix(prefix, str)

    // 期望结果为前缀加上原字符串
    expect(result).toBe('http://example.com')
  })

  // Test case 3: 空字符串的情况
  it('should add prefix to empty string', () => {
    const prefix = 'http://'
    const str = ''

    const result = ensurePrefix(prefix, str)

    // 期望结果为前缀加上空字符串（即前缀本身）
    expect(result).toBe('http://')
  })

  // Test case 4: 前缀为空的情况
  it('should return original string when prefix is empty', () => {
    const prefix = ''
    const str = 'example.com'

    const result = ensurePrefix(prefix, str)

    // 期望结果与原字符串相同
    expect(result).toBe(str)
  })

  // Test case 5: 前缀和字符串都为空的情况
  it('should handle both empty prefix and empty string', () => {
    const prefix = ''
    const str = ''

    const result = ensurePrefix(prefix, str)

    // 期望结果为空的字符串
    expect(result).toBe('')
  })

  // Test case 6: 字符串以不同大小写开头的情况
  it('should be case-sensitive when checking prefix', () => {
    const prefix = 'http://'
    const str = 'HTTP://example.com'

    const result = ensurePrefix(prefix, str)

    // 由于大小写不同，应该添加前缀
    expect(result).toBe('http://HTTP://example.com')
  })

  // Test case 7: 前缀包含特殊字符的情况
  it('should work with special characters in prefix', () => {
    const prefix = '$$$'
    const str = 'example'

    const result = ensurePrefix(prefix, str)

    expect(result).toBe('$$$example')
  })

  // Test case 8: 字符串以空格开头的情况
  it('should not consider leading spaces as part of prefix match', () => {
    const prefix = 'http://'
    const str = ' http://example.com'

    const result = ensurePrefix(prefix, str)

    // 字符串以空格开头，所以不匹配前缀
    expect(result).toBe('http:// http://example.com')
  })
})

describe('ensureSuffix', () => {
  // 测试用例1: 当字符串已有指定后缀时，应返回原字符串
  // Test case 1: Should return original string when it already has the suffix
  it('should return original string when it already has the suffix', () => {
    const result = ensureSuffix('.js', 'app.js')
    expect(result).toBe('app.js')
  })

  // 测试用例2: 当字符串没有指定后缀时，应添加后缀
  // Test case 2: Should add suffix when string doesn't have it
  it('should add suffix when string does not have it', () => {
    const result = ensureSuffix('.js', 'app')
    expect(result).toBe('app.js')
  })

  // 测试用例3: 当字符串为空时，应只返回后缀
  // Test case 3: Should return only suffix when string is empty
  it('should return only suffix when string is empty', () => {
    const result = ensureSuffix('.js', '')
    expect(result).toBe('.js')
  })

  // 测试用例4: 当后缀为空字符串时，应返回原字符串
  // Test case 4: Should return original string when suffix is empty
  it('should return original string when suffix is empty', () => {
    const result = ensureSuffix('', 'app')
    expect(result).toBe('app')
  })

  // 测试用例5: 当字符串以不同大小写结尾时，应视为不同后缀
  // Test case 5: Should treat different cases as different suffixes
  it('should treat different cases as different suffixes', () => {
    const result = ensureSuffix('.JS', 'app.js')
    expect(result).toBe('app.js.JS')
  })

  // 测试用例6: 测试多个字符的后缀
  // Test case 6: Test multi-character suffix
  it('should handle multi-character suffix', () => {
    const result = ensureSuffix('.test.js', 'app.js')
    expect(result).toBe('app.js.test.js')
  })

  // 测试用例7: 当字符串以部分后缀开头但不是完整后缀时
  // Test case 7: When string starts with part of suffix but not complete
  it('should add full suffix when string ends with part of suffix', () => {
    const result = ensureSuffix('ing', 'test')
    expect(result).toBe('testing')
  })
})

describe('truncate', () => {
  // Test 1: Normal truncation case
  // 测试1: 正常截断情况
  it('should truncate string when length exceeds maxLength', () => {
    const result = truncate('Hello World', 8)
    expect(result).toBe('Hello...')
  })

  // Test 2: String shorter than maxLength should remain unchanged
  // 测试2: 字符串短于最大长度时应保持不变
  it('should return original string when length <= maxLength', () => {
    const result = truncate('Hello', 10)
    expect(result).toBe('Hello')
  })

  // Test 3: String equal to maxLength should remain unchanged
  // 测试3: 字符串等于最大长度时应保持不变
  it('should return original string when length equals maxLength', () => {
    const result = truncate('Hello', 5)
    expect(result).toBe('Hello')
  })

  // Test 4: Custom ellipsis string
  // 测试4: 自定义省略号字符串
  it('should use custom ellipsis string', () => {
    const result = truncate('Hello World', 8, '***')
    expect(result).toBe('Hello***')
  })

  // Test 5: When maxLength <= 0 should return empty string
  // 测试5: 当最大长度<=0时应返回空字符串
  it('should return empty string when maxLength <= 0', () => {
    expect(truncate('Hello World', 0)).toBe('')
    expect(truncate('Hello World', -5)).toBe('')
  })

  // Test 6: When maxLength <= ellipsis length
  // 测试6: 当最大长度<=省略号长度时
  it('should return truncated ellipsis when maxLength <= ellipsis length', () => {
    // With default ellipsis '...' (length 3)
    // 使用默认省略号'...'（长度3）
    expect(truncate('Hello World', 2)).toBe('..')
    expect(truncate('Hello World', 3)).toBe('...')

    // With custom ellipsis '----' (length 4)
    // 使用自定义省略号'----'（长度4）
    expect(truncate('Hello World', 2, '----')).toBe('--')
    expect(truncate('Hello World', 4, '----')).toBe('----')
  })

  // Test 7: Edge case - empty string
  // 测试7: 边界情况 - 空字符串
  it('should handle empty string correctly', () => {
    expect(truncate('', 5)).toBe('')
    expect(truncate('', 0)).toBe('')
  })

  // Test 8: Edge case - very long ellipsis
  // 测试8: 边界情况 - 非常长的省略号
  it('should handle ellipsis longer than maxLength', () => {
    const result = truncate('Hello World', 5, '......')
    expect(result).toBe('.....')
  })

  // Test 9: Unicode characters handling
  // 测试9: 处理Unicode字符
  it('should handle Unicode characters correctly', () => {
    const result = truncate('Hello 🌍 World', 11)
    expect(result).toBe('Hello 🌍...')
  })

  // Test 10: Verify the truncation logic
  // 测试10: 验证截断逻辑
  it('should correctly calculate keep length', () => {
    // maxLength=8, ellipsis length=3, keep=5
    // 最大长度=8，省略号长度=3，保留长度=5
    const result = truncate('1234567890', 8)
    expect(result).toBe('12345...')
    expect(result.length).toBe(8)
  })
})

describe('getUnit function', () => {
  // 测试1: 输入字符串包含单位的情况
  // Test 1: Input string contains unit
  it('should extract unit from string with unit', () => {
    // 准备测试数据
    // Prepare test data
    const testCases = [
      { input: '10px', expected: 'px' },
      { input: '5rem', expected: 'rem' },
      { input: '2.5em', expected: 'em' },
      { input: '100%', expected: '%' },
      { input: '20vh', expected: 'vh' },
      { input: '15vw', expected: 'vw' },
    ]

    // 执行测试并验证结果
    // Execute test and verify results
    testCases.forEach(({ input, expected }) => {
      expect(getUnit(input)).toBe(expected)
    })
  })

  // 测试2: 输入字符串不包含单位的情况
  // Test 2: Input string without unit
  it('should return empty string when no unit found', () => {
    // 准备测试数据
    // Prepare test data
    const testCases = ['10', '', '   ']

    // 执行测试并验证结果
    // Execute test and verify results
    testCases.forEach((input) => {
      expect(getUnit(input)).toBe('')
    })
  })

  // 测试3: 输入非字符串类型的情况
  // Test 3: Input is not a string type
  it('should return empty string for non-string inputs', () => {
    // 准备测试数据
    // Prepare test data
    const testCases = [
      10, // 数字
      null, // null
      undefined, // undefined
      {}, // 对象
      [], // 数组
      true, // 布尔值
      () => {}, // 函数
    ]

    // 执行测试并验证结果
    // Execute test and verify results
    testCases.forEach((input) => {
      expect(getUnit(input)).toBe('')
    })
  })

  // 测试4: 边界情况测试
  // Test 4: Edge cases testing
  it('should handle edge cases correctly', () => {
    // 测试数据包含特殊字符
    // Test data with special characters
    const testCases = [
      { input: '10px ', expected: 'px' }, // 末尾有空格
      { input: ' 10px', expected: 'px' }, // 开头有空格
      { input: '10 px', expected: '' }, // 数字和单位之间有空格
      { input: '-10px', expected: 'px' }, // 负数带单位
      { input: '+10px', expected: 'px' }, // 正数带单位
      { input: '0px', expected: 'px' }, // 零值带单位
    ]

    // 执行测试并验证结果
    // Execute test and verify results
    testCases.forEach(({ input, expected }) => {
      expect(getUnit(input)).toBe(expected)
    })
  })

  // 测试5: 复杂单位格式测试
  // Test 5: Complex unit format testing
  it('should handle complex unit formats', () => {
    // 测试复合单位或特殊单位
    // Test compound units or special units
    const testCases = [
      { input: '10deg', expected: 'deg' }, // 角度单位
      { input: '5rad', expected: 'rad' }, // 弧度单位
      { input: '2.5turn', expected: 'turn' }, // 圈数单位
      { input: '100ms', expected: 'ms' }, // 时间单位
      { input: '20s', expected: 's' }, // 秒单位
      { input: '15Hz', expected: 'Hz' }, // 频率单位
    ]

    // 执行测试并验证结果
    // Execute test and verify results
    testCases.forEach(({ input, expected }) => {
      expect(getUnit(input)).toBe(expected)
    })
  })
})
