import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { CacheError, LRUCache, LRUCacheWithTTL, ValueWithTTL } from '@/cache'

describe('lru cache', () => {
  describe('constructor', () => {
    it('should be created using positive integer capacities.', () => {
      const cache = new LRUCache(5)
      expect(cache.capacity).toBe(5)
      expect(cache.size).toBe(0)
    })

    it('should be thrown error if the capacity is not an integer.', () => {
      expect(() => new LRUCache(3.5)).toThrow('cache capacity must be integer')
      expect(() => new LRUCache(3.5)).toThrowError(CacheError)
      expect(() => new LRUCache(Number.NaN)).toThrow('cache capacity must be integer')
      expect(() => new LRUCache(Number.NaN)).toThrowError(CacheError)
      expect(() => new LRUCache(Infinity)).toThrow('cache capacity must be integer')
      expect(() => new LRUCache(Infinity)).toThrowError(CacheError)
    })

    it('should be thrown error when the capacity is less than or equal to 0', () => {
      expect(() => new LRUCache(0)).toThrow('cache capacity must be greater than 0')
      expect(() => new LRUCache(0)).toThrowError(CacheError)
      expect(() => new LRUCache(-1)).toThrow('cache capacity must be greater than 0')
      expect(() => new LRUCache(-1)).toThrowError(CacheError)
      expect(() => new LRUCache(-10)).toThrow('cache capacity must be greater than 0')
      expect(() => new LRUCache(-10)).toThrowError(CacheError)
    })

    it('should be thrown error when the capacity is a string number.', () => {
      expect(() => new LRUCache('5' as any)).toThrow('cache capacity must be integer')
      expect(() => new LRUCache('5' as any)).toThrowError(CacheError)
    })
  })

  // 测试 set 和 get 方法
  describe('set and get', () => {
    it('should be able to set and get values', () => {
      const cache = new LRUCache(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
    })

    it('non-existent key should return undefined', () => {
      const cache = new LRUCache(3)
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('should overwrite the old value', () => {
      const cache = new LRUCache(3)
      cache.set('key1', 'value1')
      cache.set('key1', 'value2')
      expect(cache.get('key1')).toBe('value2')
      expect(cache.size).toBe(1)
    })

    it('should support various types of keys and values', () => {
      const cache = new LRUCache(5)
      const objKey = { id: 1 }
      const funcKey = () => {}
      const symKey = Symbol('test')

      cache.set('string', 'value')
      cache.set(123, 456)
      cache.set(objKey, 'object value')
      cache.set(funcKey, 'function value')
      cache.set(symKey, 'symbol value')

      expect(cache.get('string')).toBe('value')
      expect(cache.get(123)).toBe(456)
      expect(cache.get(objKey)).toBe('object value')
      expect(cache.get(funcKey)).toBe('function value')
      expect(cache.get(symKey)).toBe('symbol value')
    })
  })

  // 测试 LRU 淘汰策略
  describe('lru eviction policy', () => {
    it('when the capacity is exceeded, the least used item should be discarded.', () => {
      const cache = new LRUCache(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      cache.set('key4', 'value4') // 应该淘汰 key1

      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
      expect(cache.get('key4')).toBe('value4')
      expect(cache.size).toBe(3)
    })

    it('should update the usage time of the item', () => {
      const cache = new LRUCache(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // 访问 key1 使其成为最近使用的
      expect(cache.get('key1')).toBe('value1')

      // 添加新项，应该淘汰 key2（最久未使用）
      cache.set('key4', 'value4')

      expect(cache.get('key1')).toBe('value1') // 应该还在
      expect(cache.get('key2')).toBeUndefined() // 应该被淘汰
      expect(cache.get('key3')).toBe('value3') // 应该还在
      expect(cache.get('key4')).toBe('value4') // 应该还在
    })

    it('updating an existing key should make it the most recently used key', () => {
      const cache = new LRUCache(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // 更新 key1
      cache.set('key1', 'newValue1')

      // 添加新项，应该淘汰 key2（最久未使用）
      cache.set('key4', 'value4')

      expect(cache.get('key1')).toBe('newValue1') // 应该还在
      expect(cache.get('key2')).toBeUndefined() // 应该被淘汰
      expect(cache.get('key3')).toBe('value3') // 应该还在
      expect(cache.get('key4')).toBe('value4') // 应该还在
    })
  })

  // 测试 has 方法
  describe('has', () => {
    it('should be checked correctly to ensure it exists', () => {
      const cache = new LRUCache(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(true)
      expect(cache.has('key3')).toBe(false)
    })

    it('the discarded key should return false', () => {
      const cache = new LRUCache(2)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3') // 淘汰 key1

      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(true)
      expect(cache.has('key3')).toBe(true)
    })
  })

  // 测试 delete 方法
  describe('delete', () => {
    it('should be able to delete existing keys', () => {
      const cache = new LRUCache(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      expect(cache.delete('key1')).toBe(true)
      expect(cache.has('key1')).toBe(false)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.size).toBe(1)
    })

    it('deleting a non-existent key should return false', () => {
      const cache = new LRUCache(3)
      expect(cache.delete('nonexistent')).toBe(false)
      expect(cache.size).toBe(0)
    })

    it('should not affect other keys after delete', () => {
      const cache = new LRUCache(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      cache.delete('key2')

      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBeUndefined()
      expect(cache.get('key3')).toBe('value3')
      expect(cache.size).toBe(2)
    })
  })

  // 测试 clear 方法
  describe('clear', () => {
    it('should be cleared', () => {
      const cache = new LRUCache(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      expect(cache.size).toBe(3)
      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBeUndefined()
      expect(cache.get('key3')).toBeUndefined()
    })

    it('can be reused after being cleared', () => {
      const cache = new LRUCache(3)
      cache.set('key1', 'value1')
      cache.clear()
      cache.set('key2', 'value2')
      expect(cache.get('key2')).toBe('value2')
      expect(cache.size).toBe(1)
    })
  })

  // 测试 size 和 capacity 属性
  describe('size and capacity properties', () => {
    it('size', () => {
      const cache = new LRUCache(5)
      expect(cache.size).toBe(0)

      cache.set('key1', 'value1')
      expect(cache.size).toBe(1)

      cache.set('key2', 'value2')
      expect(cache.size).toBe(2)

      cache.delete('key1')
      expect(cache.size).toBe(1)

      cache.clear()
      expect(cache.size).toBe(0)
    })

    it('capacity', () => {
      const cache1 = new LRUCache(1)
      expect(cache1.capacity).toBe(1)

      const cache5 = new LRUCache(5)
      expect(cache5.capacity).toBe(5)

      const cache100 = new LRUCache(100)
      expect(cache100.capacity).toBe(100)
    })

    it('size should not exceed capacity', () => {
      const cache = new LRUCache(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      cache.set('key4', 'value4') // 淘汰 key1，size 保持为3

      expect(cache.size).toBe(3)
      expect(cache.size).toBeLessThanOrEqual(cache.capacity)
    })
  })

  // 测试边界情况和复杂场景
  describe('edge cases and complex scenarios', () => {
    it('cache with a capacity of 1 should function normally', () => {
      const cache = new LRUCache(1)
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
      expect(cache.size).toBe(1)

      cache.set('key2', 'value2') // 淘汰 key1
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe('value2')
      expect(cache.size).toBe(1)
    })

    it('repeatedly setting the same key should not trigger an elimination', () => {
      const cache = new LRUCache(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      cache.set('key1', 'newValue1') // 更新 key1，不应该淘汰任何项

      expect(cache.size).toBe(3)
      expect(cache.get('key1')).toBe('newValue1')
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
    })

    it('complex access patterns should correctly maintain the LRU order', () => {
      const cache = new LRUCache(4)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)

      // 访问顺序: a, c, b, d
      cache.get('a')
      cache.get('c')
      cache.get('b')
      cache.get('d')

      // 添加新项应该淘汰 a（最久未使用）
      cache.set('e', 5)

      expect(cache.has('a')).toBe(false) // 被淘汰
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
      expect(cache.has('e')).toBe(true)
    })

    it('order should be kept correct after delete', () => {
      const cache = new LRUCache(4)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)

      // 删除 b
      cache.delete('b') // a c d

      // 访问 a 和 c
      cache.get('a') // c d a
      cache.get('c') // d a c

      // 添加新项应该淘汰 d（最久未使用）
      cache.set('e', 5) // d a c e
      cache.set('f', 6) // a c e f

      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false) // 已删除
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(false) // 被淘汰
      expect(cache.has('e')).toBe(true)

      cache.set('m', 7) // c e f m
      expect(cache.has('a')).toBe(false)
    })
  })
})

describe('value with ttl', () => {
  let mockNow = 1000000
  const originalDateNow = Date.now
  beforeAll(() => {
    // 在所有测试前替换 Date.now
    // Replace Date.now before all tests
    Date.now = () => mockNow
  })

  beforeEach(() => {
    // 在每个测试前重置模拟时间
    // Reset mock time before each test
    mockNow = 1000000
  })

  afterAll(() => {
    // 在所有测试后恢复 Date.now
    // Restore Date.now after all tests
    Date.now = originalDateNow
  })

  describe('constructor', () => {
    it('should create value instance with TTL correctly', () => {
      const value = 'test-value'
      const ttl = 5000
      const instance = new ValueWithTTL(value, ttl)

      // 验证值是否正确存储
      // Verify value is stored correctly
      expect(instance.value).toBe(value)

      // 验证过期时间是否正确计算（当前时间 + TTL）
      // Verify expiry is calculated correctly (current time + TTL)
      expect(instance.expiry).toBe(mockNow + ttl)
    })

    it('should accept values of various types', () => {
      // 测试字符串类型 / Test string type
      const stringInstance = new ValueWithTTL('string', 1000)
      expect(stringInstance.value).toBe('string')

      // 测试数字类型 / Test number type
      const numberInstance = new ValueWithTTL(123, 1000)
      expect(numberInstance.value).toBe(123)

      // 测试对象类型 / Test object type
      const obj = { key: 'value' }
      const objectInstance = new ValueWithTTL(obj, 1000)
      expect(objectInstance.value).toBe(obj)

      // 测试数组类型 / Test array type
      const arrayInstance = new ValueWithTTL([1, 2, 3], 1000)
      expect(arrayInstance.value).toEqual([1, 2, 3])

      // 测试null值 / Test null value
      const nullInstance = new ValueWithTTL(null, 1000)
      expect(nullInstance.value).toBeNull()
    })

    it('should throw CacheError when TTL is not integer', () => {
      // 测试浮点数 / Test float number
      expect(() => new ValueWithTTL('test', 1000.5)).toThrow(CacheError)
      expect(() => new ValueWithTTL('test', 1000.5)).toThrow('value ttl must be integer')

      // 测试NaN / Test NaN
      expect(() => new ValueWithTTL('test', Number.NaN)).toThrow(CacheError)

      // 测试Infinity / Test Infinity
      expect(() => new ValueWithTTL('test', Infinity)).toThrow(CacheError)
    })

    it('should throw CacheError when TTL <= 0', () => {
      // 测试0 / Test 0
      expect(() => new ValueWithTTL('test', 0)).toThrow(CacheError)
      expect(() => new ValueWithTTL('test', 0)).toThrow('value ttl must be greater than 0')

      // 测试负数 / Test negative number
      expect(() => new ValueWithTTL('test', -100)).toThrow(CacheError)
      expect(() => new ValueWithTTL('test', -100)).toThrow('value ttl must be greater than 0')

      // 测试负浮点数 / Test negative float
      expect(() => new ValueWithTTL('test', -100.5)).toThrow(CacheError)
    })
  })

  describe('isExpired', () => {
    it('should return false when not expired', () => {
      const instance = new ValueWithTTL('test', 5000)

      // 刚创建时不应该过期 / Should not expire immediately after creation
      expect(instance.isExpired()).toBe(false)

      // 时间前进但仍在TTL内 / Time advances but still within TTL
      mockNow += 3000
      expect(instance.isExpired()).toBe(false)

      // 时间前进到刚好过期前 / Time advances to just before expiry
      mockNow = instance.expiry - 1
      expect(instance.isExpired()).toBe(false)
    })

    it('should return true when expired', () => {
      const instance = new ValueWithTTL('test', 5000)

      // 时间前进到刚好过期时 / Time advances to exactly at expiry
      mockNow = instance.expiry
      expect(instance.isExpired()).toBe(true)

      // 时间前进到过期后 / Time advances past expiry
      mockNow += 1000
      expect(instance.isExpired()).toBe(true)

      // 时间前进到远超过期后 / Time advances far past expiry
      mockNow += 10000
      expect(instance.isExpired()).toBe(true)
    })
  })

  describe('resetTTL', () => {
    it('should reset TTL correctly', () => {
      const ttl = 5000
      const instance = new ValueWithTTL('test', ttl)
      const originalExpiry = instance.expiry

      // 时间前进一部分 / Advance time partially
      mockNow += 2000

      // 重置TTL / Reset TTL
      instance.resetTTL()

      // 验证过期时间已更新为新的当前时间 + TTL
      // Verify expiry is updated to new current time + TTL
      expect(instance.expiry).toBe(mockNow + ttl)
      expect(instance.expiry).toBeGreaterThan(originalExpiry)
    })

    it('should work correctly with multiple resets', () => {
      const ttl = 5000
      const instance = new ValueWithTTL('test', ttl)

      // 第一次重置 / First reset
      mockNow += 1000
      instance.resetTTL()
      const firstResetExpiry = instance.expiry

      // 第二次重置 / Second reset
      mockNow += 2000
      instance.resetTTL()

      // 验证第二次重置后的过期时间
      // Verify expiry after second reset
      expect(instance.expiry).toBe(mockNow + ttl)
      expect(instance.expiry).toBeGreaterThan(firstResetExpiry)

      // 第三次重置 / Third reset
      mockNow += 3000
      instance.resetTTL()
      expect(instance.expiry).toBe(mockNow + ttl)
    })

    it('should affect isExpired result after reset', () => {
      const ttl = 5000
      const instance = new ValueWithTTL('test', ttl)

      // 让实例过期 / Make instance expire
      mockNow = instance.expiry + 1000
      expect(instance.isExpired()).toBe(true)

      // 重置TTL / Reset TTL
      instance.resetTTL()

      // 重置后不应该过期 / Should not be expired after reset
      expect(instance.isExpired()).toBe(false)

      // 再次过期 / Expire again
      mockNow = instance.expiry + 1000
      expect(instance.isExpired()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle minimum valid TTL (1ms)', () => {
      const instance = new ValueWithTTL('test', 1)

      // 创建时未过期 / Not expired at creation
      expect(instance.isExpired()).toBe(false)

      // 1毫秒后过期 / Expired after 1ms
      mockNow += 1
      expect(instance.isExpired()).toBe(true)
    })

    it('should handle large TTL values', () => {
      const largeTTL = 365 * 24 * 60 * 60 * 1000 // 1年 / 1 year
      const instance = new ValueWithTTL('test', largeTTL)

      expect(instance.isExpired()).toBe(false)
      expect(instance.expiry).toBe(mockNow + largeTTL)
    })

    it('resetTTL should maintain original TTL value', () => {
      const ttl = 10000
      const instance = new ValueWithTTL('test', ttl)

      // 多次重置后，过期时间间隔应保持为原始TTL
      // After multiple resets, expiry intervals should remain original TTL
      mockNow += 1000
      instance.resetTTL()
      const expiry1 = instance.expiry

      mockNow += 1000
      instance.resetTTL()
      const expiry2 = instance.expiry

      // 两次重置的时间间隔应该等于时间前进的间隔
      // Time interval between resets should equal time advancement
      expect(expiry2 - expiry1).toBe(1000)

      // 从重置时间点到过期的时间应该等于原始TTL
      // Time from reset to expiry should equal original TTL
      expect(expiry1 - (mockNow - 1000)).toBe(ttl)
      expect(expiry2 - mockNow).toBe(ttl)
    })
  })
})

describe('lru cache with ttl', () => {
  // Test constructor validation
  // 测试构造函数验证
  describe('constructor', () => {
    it('should create cache with valid capacity and TTL', () => {
      // Should successfully create cache with positive integer parameters
      // 应该成功创建具有正整数参数的缓存
      const cache = new LRUCacheWithTTL(10, 1000)
      expect(cache.capacity).toBe(10)
      expect(cache.size).toBe(0)
    })

    it('should throw error for non-integer capacity', () => {
      // Should throw CacheError when capacity is not an integer
      // 当容量不是整数时应抛出CacheError
      expect(() => new LRUCacheWithTTL(10.5, 1000)).toThrow(CacheError)
      expect(() => new LRUCacheWithTTL(10.5, 1000)).toThrow('cache capacity must be integer')
    })

    it('should throw error for zero capacity', () => {
      // Should throw CacheError when capacity is zero
      // 当容量为零时应抛出CacheError
      expect(() => new LRUCacheWithTTL(0, 1000)).toThrow(CacheError)
      expect(() => new LRUCacheWithTTL(0, 1000)).toThrow('cache capacity must be greater than 0')
    })

    it('should throw error for negative capacity', () => {
      // Should throw CacheError when capacity is negative
      // 当容量为负数时应抛出CacheError
      expect(() => new LRUCacheWithTTL(-5, 1000)).toThrow(CacheError)
      expect(() => new LRUCacheWithTTL(-5, 1000)).toThrow('cache capacity must be greater than 0')
    })

    it('should throw error for non-integer TTL', () => {
      // Should throw CacheError when TTL is not an integer
      // 当TTL不是整数时应抛出CacheError
      expect(() => new LRUCacheWithTTL(10, 1000.5)).toThrow(CacheError)
      expect(() => new LRUCacheWithTTL(10, 1000.5)).toThrow('cache ttl must be integer')
    })

    it('should throw error for zero TTL', () => {
      // Should throw CacheError when TTL is zero
      // 当TTL为零时应抛出CacheError
      expect(() => new LRUCacheWithTTL(10, 0)).toThrow(CacheError)
      expect(() => new LRUCacheWithTTL(10, 0)).toThrow('cache ttl must be greater than 0')
    })

    it('should throw error for negative TTL', () => {
      // Should throw CacheError when TTL is negative
      // 当TTL为负数时应抛出CacheError
      expect(() => new LRUCacheWithTTL(10, -1000)).toThrow(CacheError)
      expect(() => new LRUCacheWithTTL(10, -1000)).toThrow('cache ttl must be greater than 0')
    })
  })

  // Test set and get operations
  // 测试设置和获取操作
  describe('set and get', () => {
    it('should set and get value correctly', () => {
      // Should store value and retrieve it successfully
      // 应该存储值并成功检索
      const cache = new LRUCacheWithTTL(5, 1000)
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
      expect(cache.size).toBe(1)
    })

    it('should return undefined for non-existent key', () => {
      // Should return undefined when key doesn't exist
      // 当键不存在时应返回undefined
      const cache = new LRUCacheWithTTL(5, 1000)
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('should update value for existing key', () => {
      // Should overwrite value when setting same key
      // 当设置相同键时应覆盖值
      const cache = new LRUCacheWithTTL(5, 1000)
      cache.set('key1', 'value1')
      cache.set('key1', 'value2')
      expect(cache.get('key1')).toBe('value2')
      expect(cache.size).toBe(1)
    })

    it('should respect capacity limit', () => {
      const cache = new LRUCacheWithTTL(2, 1000)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
      expect(cache.size).toBe(2)
    })

    it('should update access order on get', () => {
      // Should make item most recently used when accessed via get
      // 当通过get访问时应使项目成为最近使用的
      const cache = new LRUCacheWithTTL(2, 1000)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      // Access key1 to make it most recently used
      // 访问key1使其成为最近使用的
      cache.get('key1')

      // Add new item, should evict key2 (least recently used)
      // 添加新项目，应该驱逐key2（最近最少使用）
      cache.set('key3', 'value3')

      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBeUndefined()
      expect(cache.get('key3')).toBe('value3')
    })
  })

  // Test TTL expiration
  // 测试TTL过期
  describe('ttl expiration', () => {
    beforeEach(() => {
      // Mock Date.now for consistent testing
      // 模拟Date.now以进行一致的测试
      vi.useFakeTimers()
    })

    afterEach(() => {
      // Restore real timers
      // 恢复真实计时器
      vi.useRealTimers()
    })

    it('should expire items after TTL', () => {
      // Should return undefined for expired items
      // 对于过期的项目应返回undefined
      const cache = new LRUCacheWithTTL(5, 1000) // 1 second TTL 1秒TTL
      cache.set('key1', 'value1')

      // Advance time by 1.5 seconds
      // 时间前进1.5秒
      vi.advanceTimersByTime(1500)

      expect(cache.get('key1')).toBeUndefined()
      expect(cache.has('key1')).toBe(false)
      expect(cache.size).toBe(0)
    })

    it('should not expire items before TTL', () => {
      // Should return value for items within TTL
      // 对于TTL内的项目应返回值
      const cache = new LRUCacheWithTTL(5, 1000)
      cache.set('key1', 'value1')

      // Advance time by 0.5 seconds
      // 时间前进0.5秒
      vi.advanceTimersByTime(500)

      expect(cache.get('key1')).toBe('value1')
      expect(cache.has('key1')).toBe(true)
      expect(cache.size).toBe(1)
    })

    it('should reset TTL on get', () => {
      // Should extend item lifetime when accessed
      // 当访问时应延长项目生命周期
      const cache = new LRUCacheWithTTL(5, 1000)
      cache.set('key1', 'value1')

      // Advance time by 0.8 seconds
      // 时间前进0.8秒
      vi.advanceTimersByTime(800)

      // Access item, resetting its TTL
      // 访问项目，重置其TTL
      cache.get('key1')

      // Advance time by 0.8 seconds more (total 1.6 seconds)
      // 时间再前进0.8秒（总共1.6秒）
      vi.advanceTimersByTime(800)

      // Item should still be valid due to TTL reset
      // 由于TTL重置，项目应该仍然有效
      expect(cache.get('key1')).toBe('value1')
    })

    it('should cleanup expired items', () => {
      // Should remove all expired items and return count
      // 应该移除所有过期项目并返回计数
      const cache = new LRUCacheWithTTL(5, 1000)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // Advance time by 1.5 seconds
      // 时间前进1.5秒
      vi.advanceTimersByTime(1500)

      // Add new item that won't expire yet
      // 添加尚未过期的新项目
      cache.set('key4', 'value4')

      const removedCount = cache.cleanupExpired()
      expect(removedCount).toBe(3)
      expect(cache.size).toBe(1)
      expect(cache.get('key4')).toBe('value4')
    })
  })

  // Test has method
  // 测试has方法
  describe('has', () => {
    it('should return true for existing non-expired key', () => {
      // Should return true when key exists and is not expired
      // 当键存在且未过期时应返回true
      const cache = new LRUCacheWithTTL(5, 1000)
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
    })

    it('should return false for non-existent key', () => {
      // Should return false when key doesn't exist
      // 当键不存在时应返回false
      const cache = new LRUCacheWithTTL(5, 1000)
      expect(cache.has('nonexistent')).toBe(false)
    })

    it('should return false for expired key and remove it', () => {
      // Should return false for expired key and delete it from cache
      // 对于过期的键应返回false并从缓存中删除
      vi.useFakeTimers()
      const cache = new LRUCacheWithTTL(5, 1000)
      cache.set('key1', 'value1')

      vi.advanceTimersByTime(1500)

      expect(cache.has('key1')).toBe(false)
      expect(cache.size).toBe(0)

      vi.useRealTimers()
    })
  })

  // Test delete method
  // 测试delete方法
  describe('delete', () => {
    it('should delete existing key', () => {
      // Should remove key and return true
      // 应该移除键并返回true
      const cache = new LRUCacheWithTTL(5, 1000)
      cache.set('key1', 'value1')
      expect(cache.delete('key1')).toBe(true)
      expect(cache.size).toBe(0)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('should return false for non-existent key', () => {
      // Should return false when trying to delete non-existent key
      // 当尝试删除不存在的键时应返回false
      const cache = new LRUCacheWithTTL(5, 1000)
      expect(cache.delete('nonexistent')).toBe(false)
    })
  })

  // Test clear method
  // 测试clear方法
  describe('clear', () => {
    it('should remove all items from cache', () => {
      // Should empty the cache completely
      // 应该完全清空缓存
      const cache = new LRUCacheWithTTL(5, 1000)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      expect(cache.size).toBe(3)
      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBeUndefined()
      expect(cache.get('key3')).toBeUndefined()
    })
  })

  // Test capacity property
  // 测试capacity属性
  describe('capacity', () => {
    it('should return correct capacity', () => {
      // Should return the capacity set in constructor
      // 应该返回构造函数中设置的容量
      const cache = new LRUCacheWithTTL(10, 1000)
      expect(cache.capacity).toBe(10)

      const cache2 = new LRUCacheWithTTL(20, 500)
      expect(cache2.capacity).toBe(20)
    })
  })

  // Test edge cases
  // 测试边界情况
  describe('edge cases', () => {
    it('should handle capacity of 1', () => {
      // Should work correctly with minimum capacity
      // 应该正确处理最小容量
      const cache = new LRUCacheWithTTL(1, 1000)
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')

      cache.set('key2', 'value2')
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe('value2')
      expect(cache.size).toBe(1)
    })

    it('should handle multiple operations correctly', () => {
      // Should maintain correct state after complex operations
      // 复杂操作后应保持正确状态
      const cache = new LRUCacheWithTTL(3, 1000)

      // Set 3 items
      // 设置3个项目
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // Access 'a' to make it most recently used
      // 访问'a'使其成为最近使用的
      cache.get('a')

      // Add 'd', should evict 'b' (least recently used)
      // 添加'd'，应该驱逐'b'（最近最少使用）
      cache.set('d', 4)

      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('a')).toBe(1)
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
      expect(cache.size).toBe(3)
    })
  })
})
