import { describe, expect, it } from 'vitest'
import { LRUCache } from '@/cache'

describe('lru cache', () => {
  describe('constructor', () => {
    it('should be created using positive integer capacities.', () => {
      const cache = new LRUCache(5)
      expect(cache.capacity).toBe(5)
      expect(cache.size).toBe(0)
    })

    it('should be thrown error if the capacity is not an integer.', () => {
      expect(() => new LRUCache(3.5)).toThrow('cache size must be integer')
      expect(() => new LRUCache(Number.NaN)).toThrow('cache size must be integer')
      expect(() => new LRUCache(Infinity)).toThrow('cache size must be integer')
    })

    it('should be thrown error when the capacity is less than or equal to 0', () => {
      expect(() => new LRUCache(0)).toThrow('cache size must be greater then 0')
      expect(() => new LRUCache(-1)).toThrow('cache size must be greater then 0')
      expect(() => new LRUCache(-10)).toThrow('cache size must be greater then 0')
    })

    it('should be thrown error when the capacity is a string number.', () => {
      expect(() => new LRUCache('5' as any)).toThrow('cache size must be integer')
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
