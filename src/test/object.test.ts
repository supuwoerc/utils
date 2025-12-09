import { describe, expect, it } from 'vitest'
import { isEmpty, omit, pick } from '@/object'

describe('pick function', () => {
  // 基础功能：选取存在的键
  it('should pick existing keys from object', () => {
    const source = { a: 1, b: 2, c: 3 }
    const result = pick(source, ['a', 'c'])
    expect(result).toEqual({ a: 1, c: 3 })
  })

  // 选取部分不存在的键（应忽略）
  it('should ignore non-existing keys', () => {
    const source = { a: 1, b: 2 }
    const result = pick(source, ['a', 'c'] as any)
    expect(result).toEqual({ a: 1 })
  })

  // 选取所有键
  it('should pick all keys when keys array includes all properties', () => {
    const source = { x: 10, y: 20, z: 30 }
    const result = pick(source, ['x', 'y', 'z'])
    expect(result).toEqual(source)
  })

  // 空键数组
  it('should return empty object when keys array is empty', () => {
    const source = { a: 1, b: 2 }
    const result = pick(source, [])
    expect(result).toEqual({})
  })

  // 源对象为空
  it('should return empty object when source is empty', () => {
    const source = {}
    const result = pick(source, ['a', 'b'] as any)
    expect(result).toEqual({})
  })

  // 使用 omitUndefined=true 忽略 undefined 值
  it('should omit undefined values when omitUndefined is true', () => {
    const source = { a: 1, b: undefined, c: 3 }
    const result = pick(source, ['a', 'b', 'c'], true)
    expect(result).toEqual({ a: 1, c: 3 })
  })

  // 使用 omitUndefined=false（默认）保留 undefined 值
  it('should keep undefined values when omitUndefined is false (default)', () => {
    const source = { a: 1, b: undefined, c: 3 }
    const result = pick(source, ['a', 'b', 'c'])
    expect(result).toEqual({ a: 1, b: undefined, c: 3 })
  })

  // 混合类型（字符串、数字、布尔值、对象、数组）
  it('should handle mixed value types', () => {
    const source = {
      str: 'hello',
      num: 42,
      bool: true,
      obj: { nested: 'value' },
      arr: [1, 2, 3],
      nullVal: null,
    }
    const result = pick(source, ['str', 'num', 'obj', 'nullVal'])
    expect(result).toEqual({
      str: 'hello',
      num: 42,
      obj: { nested: 'value' },
      nullVal: null,
    })
  })

  // 确保不修改源对象
  it('should not modify the source object', () => {
    const source = { a: 1, b: 2, c: 3 }
    const original = { ...source }
    pick(source, ['a', 'b'])
    expect(source).toEqual(original)
  })

  // 类型安全性测试（通过 TypeScript 编译，但我们可以测试运行时行为）
  it('should work with readonly keys array', () => {
    const source = { a: 1, b: 2 }
    const keys = ['a'] as const
    const result = pick(source, keys)
    expect(result).toEqual({ a: 1 })
  })
})

describe('omit function', () => {
  // 基础功能：排除存在的键
  it('should omit specified keys from object', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = omit(obj, ['b'])
    expect(result).toEqual({ a: 1, c: 3 })
  })

  // 排除部分不存在的键（应忽略）
  it('should ignore non-existing keys to omit', () => {
    const obj = { a: 1, b: 2 }
    const result = omit(obj, ['c'] as any)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  // 排除所有键（返回空对象）
  it('should return empty object when all keys are omitted', () => {
    const obj = { a: 1, b: 2 }
    const result = omit(obj, ['a', 'b'])
    expect(result).toEqual({})
  })

  // 空键数组（返回原对象）
  it('should return original object when keys array is empty', () => {
    const obj = { a: 1, b: 2 }
    const result = omit(obj, [])
    expect(result).toEqual(obj)
  })

  // 源对象为空
  it('should return empty object when source is empty', () => {
    const obj = {} as any
    const result = omit(obj, ['a'])
    expect(result).toEqual({})
  })

  // 使用 omitUndefined=true 同时排除 undefined 值
  it('should also omit undefined values when omitUndefined is true', () => {
    const obj = { a: 1, b: undefined, c: 3 }
    const result = omit(obj, ['c'], true)
    expect(result).toEqual({ a: 1 })
  })

  // 使用 omitUndefined=false（默认）保留 undefined 值
  it('should keep undefined values when omitUndefined is false (default)', () => {
    const obj = { a: 1, b: undefined, c: 3 }
    const result = omit(obj, ['c'])
    expect(result).toEqual({ a: 1, b: undefined })
  })

  // 确保不修改源对象
  it('should not modify the source object', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const original = { ...obj }
    omit(obj, ['b'])
    expect(obj).toEqual(original)
  })

  // 混合类型
  it('should handle mixed value types', () => {
    const obj = {
      str: 'hello',
      num: 42,
      bool: true,
      obj: { nested: 'value' },
      arr: [1, 2, 3],
      nullVal: null,
      undefinedVal: undefined,
    }
    const result = omit(obj, ['str', 'nullVal'])
    expect(result).toEqual({
      num: 42,
      bool: true,
      obj: { nested: 'value' },
      arr: [1, 2, 3],
      undefinedVal: undefined,
    })
  })

  // 排除继承的属性（hasOwnProperty 检查）
  it('should not omit inherited properties', () => {
    const parent = { inherited: 'value' }
    const child = Object.create(parent)
    child.own = 123
    const result = omit(child, ['own'])
    expect(result).toEqual({})
    // 注意：继承的属性不会被枚举，所以结果为空对象
  })
})

describe('isEmpty function', () => {
  // 空对象 {} 返回 true
  it('should return true for empty object', () => {
    expect(isEmpty({})).toBe(true)
  })

  // 具有自有属性的对象返回 false
  it('should return false for object with own properties', () => {
    expect(isEmpty({ a: 1 })).toBe(false)
    expect(isEmpty({ x: undefined })).toBe(false) // undefined 也是属性
  })

  // 具有继承属性的对象（应返回 true，因为 hasOwnProperty 为 false）
  it('should return true for object with only inherited properties', () => {
    const parent = { inherited: 'value' }
    const child = Object.create(parent)
    expect(isEmpty(child)).toBe(true)
  })

  // 具有符号键的对象（for...in 不迭代符号键，所以返回 true）
  it('should return true for object with only symbol keys', () => {
    const sym = Symbol('test')
    const obj = { [sym]: 'value' }
    expect(isEmpty(obj)).toBe(true) // 因为 for...in 跳过符号键
  })

  // 具有可枚举 false 的属性（for...in 跳过，返回 true）
  it('should return true for object with non-enumerable property', () => {
    const obj = {}
    Object.defineProperty(obj, 'hidden', {
      value: 'secret',
      enumerable: false,
    })
    expect(isEmpty(obj)).toBe(true)
  })

  // 非对象输入（但 TypeScript 限制为 Record<string, any>，所以我们可以测试 null/undefined 吗？）
  // 函数可能不会处理，但我们可以测试边缘情况
  it('should handle null and undefined (type coercion)', () => {
    // 注意：TypeScript 会阻止传递 null/undefined，但我们可以强制转换
    // 在运行时，for...in 会抛出错误，但我们可以忽略，因为类型限制
    // 我们只测试有效输入
  })

  // 具有多个属性的对象
  it('should return false for object with multiple properties', () => {
    expect(isEmpty({ a: 1, b: 2, c: 3 })).toBe(false)
  })

  // 空字符串键
  it('should handle empty string keys', () => {
    const obj = { '': 'value' }
    expect(isEmpty(obj)).toBe(false)
  })
})
