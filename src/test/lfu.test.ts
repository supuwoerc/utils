import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LFUCache, LFUCacheWithTTL } from '@/lfu'
import { CacheError } from '@/lru'

describe('lfu cache', () => {
  describe('constructor', () => {
    it('should be created using positive integer capacities.', () => {
      const cache = new LFUCache<string, number>(5)
      expect(cache.capacity).toBe(5)
      expect(cache.size).toBe(0)
    })

    it('should be thrown error if the capacity is not an integer.', () => {
      expect(() => new LFUCache<string, number>(3.5 as any)).toThrow(
        'cache capacity must be integer',
      )
      expect(() => new LFUCache<string, number>(3.5 as any)).toThrowError(CacheError)
      expect(() => new LFUCache<string, number>(Number.NaN as any)).toThrow(
        'cache capacity must be integer',
      )
      expect(() => new LFUCache<string, number>(Number.NaN as any)).toThrowError(CacheError)
      expect(() => new LFUCache<string, number>(Infinity as any)).toThrow(
        'cache capacity must be integer',
      )
      expect(() => new LFUCache<string, number>(Infinity as any)).toThrowError(CacheError)
    })

    it('should be thrown error when the capacity is less than or equal to 0', () => {
      expect(() => new LFUCache<string, number>(0)).toThrow('cache capacity must be greater than 0')
      expect(() => new LFUCache<string, number>(0)).toThrowError(CacheError)
      expect(() => new LFUCache<string, number>(-1)).toThrow(
        'cache capacity must be greater than 0',
      )
      expect(() => new LFUCache<string, number>(-1)).toThrowError(CacheError)
      expect(() => new LFUCache<string, number>(-10)).toThrow(
        'cache capacity must be greater than 0',
      )
      expect(() => new LFUCache<string, number>(-10)).toThrowError(CacheError)
    })
  })

  describe('set and get', () => {
    it('should be able to set and get values', () => {
      const cache = new LFUCache<string, string>(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
    })

    it('non-existent key should return undefined', () => {
      const cache = new LFUCache<string, string>(3)
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('should overwrite the old value and keep size', () => {
      const cache = new LFUCache<string, string>(3)
      cache.set('key1', 'value1')
      cache.set('key1', 'value2')
      expect(cache.get('key1')).toBe('value2')
      expect(cache.size).toBe(1)
    })

    it('should support various types of keys and values', () => {
      const cache = new LFUCache<any, any>(5)
      const symKey = Symbol('test')

      cache.set('string', 'value')
      cache.set(123, 456)
      cache.set(symKey, 'symbol value')

      expect(cache.get('string')).toBe('value')
      expect(cache.get(123)).toBe(456)
      expect(cache.get(symKey)).toBe('symbol value')
    })
  })

  describe('lfu eviction policy', () => {
    it('when the capacity is exceeded, the least frequently used item should be discarded.', () => {
      const cache = new LFUCache<string, string>(2)
      cache.set('a', 'A') // freq(a) = 1
      cache.set('b', 'B') // freq(b) = 1

      // 提升 a 的频次，使 a 比 b 更常用
      expect(cache.get('a')).toBe('A') // freq(a) = 2

      // 插入 c，此时应淘汰 freq 最低且最久未使用的 b
      cache.set('c', 'C')

      expect(cache.get('a')).toBe('A')
      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('c')).toBe('C')
      expect(cache.size).toBe(2)
    })

    it('should evict the least recently used item among those with same frequency.', () => {
      const cache = new LFUCache<string, string>(2)
      cache.set('a', 'A') // freq(a) = 1
      cache.set('b', 'B') // freq(b) = 1，b 为最近插入

      // 不再访问它们，插入 c
      cache.set('c', 'C')

      // 由于 a 比 b 更早插入，在相同频次下应淘汰 a
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe('B')
      expect(cache.get('c')).toBe('C')
      expect(cache.size).toBe(2)
    })

    it('updating an existing key should increase its frequency and keep it in cache', () => {
      const cache = new LFUCache<string, string>(2)
      cache.set('a', 'A')
      cache.set('b', 'B')

      // 更新 a，使其频次增加
      cache.set('a', 'A2')

      // 插入 c，应淘汰 b（频次低）
      cache.set('c', 'C')

      expect(cache.get('a')).toBe('A2')
      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('c')).toBe('C')
    })
  })

  describe('has', () => {
    it('should be checked correctly to ensure it exists', () => {
      const cache = new LFUCache<string, string>(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(true)
      expect(cache.has('key3')).toBe(false)
    })

    it('the discarded key should return false', () => {
      const cache = new LFUCache<string, string>(1)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2') // 淘汰 key1

      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(true)
    })
  })

  describe('delete', () => {
    it('should be able to delete existing keys', () => {
      const cache = new LFUCache<string, string>(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      expect(cache.delete('key1')).toBe(true)
      expect(cache.has('key1')).toBe(false)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.size).toBe(1)
    })

    it('deleting a non-existent key should return false', () => {
      const cache = new LFUCache<string, string>(3)
      expect(cache.delete('nonexistent')).toBe(false)
      expect(cache.size).toBe(0)
    })

    it('should not affect other keys after delete', () => {
      const cache = new LFUCache<string, string>(3)
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

  describe('clear', () => {
    it('should be cleared', () => {
      const cache = new LFUCache<string, string>(3)
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
      const cache = new LFUCache<string, string>(3)
      cache.set('key1', 'value1')
      cache.clear()
      cache.set('key2', 'value2')
      expect(cache.get('key2')).toBe('value2')
      expect(cache.size).toBe(1)
    })
  })

  describe('size and capacity properties', () => {
    it('size', () => {
      const cache = new LFUCache<string, string>(5)
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
      const cache1 = new LFUCache<string, string>(1)
      expect(cache1.capacity).toBe(1)

      const cache5 = new LFUCache<string, string>(5)
      expect(cache5.capacity).toBe(5)

      const cache100 = new LFUCache<string, string>(100)
      expect(cache100.capacity).toBe(100)
    })

    it('size should not exceed capacity', () => {
      const cache = new LFUCache<string, string>(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      cache.set('key4', 'value4') // 触发淘汰，size 应保持为 3

      expect(cache.size).toBe(3)
      expect(cache.size).toBeLessThanOrEqual(cache.capacity)
    })
  })

  describe('edge cases and complex scenarios', () => {
    it('cache with a capacity of 1 should function normally', () => {
      const cache = new LFUCache<string, string>(1)
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
      expect(cache.size).toBe(1)

      cache.set('key2', 'value2') // 淘汰 key1
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe('value2')
      expect(cache.size).toBe(1)
    })

    it('repeatedly setting the same key should not trigger an elimination', () => {
      const cache = new LFUCache<string, string>(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      cache.set('key1', 'newValue1') // 更新 key1，不应该淘汰任何项

      expect(cache.size).toBe(3)
      expect(cache.get('key1')).toBe('newValue1')
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
    })

    it('complex access patterns should correctly maintain the LFU order', () => {
      const cache = new LFUCache<string, number>(3)
      cache.set('a', 1) // a:1
      cache.set('b', 2) // b:1
      cache.set('c', 3) // c:1

      // 访问频次：a 两次，b 一次，c 不访问
      cache.get('a') // a:2
      cache.get('a') // a:3
      cache.get('b') // b:2

      // 插入 d，应淘汰 c（freq=1，最低）
      cache.set('d', 4)

      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBeUndefined()
      expect(cache.get('d')).toBe(4)
      expect(cache.size).toBe(3)
    })
  })
})

describe('lfu cache with ttl', () => {
  describe('constructor', () => {
    it('should create cache with valid capacity and TTL', () => {
      const cache = new LFUCacheWithTTL<string, number>(10, 1000)
      expect(cache.capacity).toBe(10)
      expect(cache.size).toBe(0)
    })

    it('should throw error for non-integer capacity', () => {
      expect(() => new LFUCacheWithTTL<string, number>(10.5 as any, 1000)).toThrow(CacheError)
      expect(() => new LFUCacheWithTTL<string, number>(10.5 as any, 1000)).toThrow(
        'cache capacity must be integer',
      )
    })

    it('should throw error for zero capacity', () => {
      expect(() => new LFUCacheWithTTL<string, number>(0, 1000)).toThrow(CacheError)
      expect(() => new LFUCacheWithTTL<string, number>(0, 1000)).toThrow(
        'cache capacity must be greater than 0',
      )
    })

    it('should throw error for negative capacity', () => {
      expect(() => new LFUCacheWithTTL<string, number>(-5, 1000)).toThrow(CacheError)
      expect(() => new LFUCacheWithTTL<string, number>(-5, 1000)).toThrow(
        'cache capacity must be greater than 0',
      )
    })

    it('should throw error for non-integer TTL', () => {
      expect(() => new LFUCacheWithTTL<string, number>(10, 1000.5 as any)).toThrow(CacheError)
      expect(() => new LFUCacheWithTTL<string, number>(10, 1000.5 as any)).toThrow(
        'cache ttl must be integer',
      )
    })

    it('should throw error for zero TTL', () => {
      expect(() => new LFUCacheWithTTL<string, number>(10, 0)).toThrow(CacheError)
      expect(() => new LFUCacheWithTTL<string, number>(10, 0)).toThrow(
        'cache ttl must be greater than 0',
      )
    })

    it('should throw error for negative TTL', () => {
      expect(() => new LFUCacheWithTTL<string, number>(10, -1000)).toThrow(CacheError)
      expect(() => new LFUCacheWithTTL<string, number>(10, -1000)).toThrow(
        'cache ttl must be greater than 0',
      )
    })
  })

  describe('set and get', () => {
    it('should set and get value correctly', () => {
      const cache = new LFUCacheWithTTL<string, string>(5, 1000)
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
      expect(cache.size).toBe(1)
    })

    it('should return undefined for non-existent key', () => {
      const cache = new LFUCacheWithTTL<string, string>(5, 1000)
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('should update value for existing key and keep size', () => {
      const cache = new LFUCacheWithTTL<string, string>(5, 1000)
      cache.set('key1', 'value1')
      cache.set('key1', 'value2')
      expect(cache.get('key1')).toBe('value2')
      expect(cache.size).toBe(1)
    })

    it('should support various types of keys and values', () => {
      const cache = new LFUCacheWithTTL<any, any>(5, 1000)
      const symKey = Symbol('test')

      cache.set('string', 'value')
      cache.set(123, 456)
      cache.set(symKey, 'symbol value')

      expect(cache.get('string')).toBe('value')
      expect(cache.get(123)).toBe(456)
      expect(cache.get(symKey)).toBe('symbol value')
    })
  })

  describe('lfu eviction with ttl (no expiry)', () => {
    it('should evict least frequently used item when capacity exceeded', () => {
      const cache = new LFUCacheWithTTL<string, string>(2, 1000)
      cache.set('a', 'A') // freq(a) = 1
      cache.set('b', 'B') // freq(b) = 1
      cache.get('a') // freq(a) = 2

      cache.set('c', 'C') // 应淘汰 b

      expect(cache.get('a')).toBe('A')
      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('c')).toBe('C')
      expect(cache.size).toBe(2)
    })

    it('should evict LRU among same-frequency items', () => {
      const cache = new LFUCacheWithTTL<string, string>(2, 1000)
      cache.set('a', 'A') // a:1
      cache.set('b', 'B') // b:1 (recent)

      cache.set('c', 'C') // 淘汰 a

      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe('B')
      expect(cache.get('c')).toBe('C')
    })
  })

  describe('ttl expiration', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should expire items after TTL', () => {
      const cache = new LFUCacheWithTTL<string, string>(5, 1000)
      cache.set('key1', 'value1')

      vi.advanceTimersByTime(1500)

      expect(cache.get('key1')).toBeUndefined()
      expect(cache.has('key1')).toBe(false)
      expect(cache.size).toBe(0)
    })

    it('should not expire items before TTL', () => {
      const cache = new LFUCacheWithTTL<string, string>(5, 1000)
      cache.set('key1', 'value1')

      vi.advanceTimersByTime(500)

      expect(cache.get('key1')).toBe('value1')
      expect(cache.has('key1')).toBe(true)
      expect(cache.size).toBe(1)
    })

    it('should reset TTL on get', () => {
      const cache = new LFUCacheWithTTL<string, string>(5, 1000)
      cache.set('key1', 'value1')

      vi.advanceTimersByTime(800)
      // 访问重置 TTL
      expect(cache.get('key1')).toBe('value1')

      vi.advanceTimersByTime(800) // 总 1.6 秒，但中间重置过 TTL

      expect(cache.get('key1')).toBe('value1')
    })
  })

  describe('has', () => {
    it('should return true for existing non-expired key', () => {
      const cache = new LFUCacheWithTTL<string, string>(5, 1000)
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
    })

    it('should return false for non-existent key', () => {
      const cache = new LFUCacheWithTTL<string, string>(5, 1000)
      expect(cache.has('nonexistent')).toBe(false)
    })

    it('should return false for expired key and remove it', () => {
      vi.useFakeTimers()
      const cache = new LFUCacheWithTTL<string, string>(5, 1000)
      cache.set('key1', 'value1')

      vi.advanceTimersByTime(1500)

      expect(cache.has('key1')).toBe(false)
      expect(cache.size).toBe(0)

      vi.useRealTimers()
    })
  })

  describe('delete', () => {
    it('should delete existing key', () => {
      const cache = new LFUCacheWithTTL<string, string>(5, 1000)
      cache.set('key1', 'value1')
      expect(cache.delete('key1')).toBe(true)
      expect(cache.size).toBe(0)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('should return false for non-existent key', () => {
      const cache = new LFUCacheWithTTL<string, string>(5, 1000)
      expect(cache.delete('nonexistent')).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items from cache', () => {
      const cache = new LFUCacheWithTTL<string, string>(5, 1000)
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

  describe('capacity and size', () => {
    it('should not exceed capacity', () => {
      const cache = new LFUCacheWithTTL<string, string>(2, 1000)
      cache.set('a', 'A')
      cache.set('b', 'B')
      cache.set('c', 'C')

      expect(cache.size).toBeLessThanOrEqual(cache.capacity)
    })
  })

  describe('complex access patterns', () => {
    it('should correctly maintain LFU order with TTL', () => {
      const cache = new LFUCacheWithTTL<string, number>(3, 1000)
      cache.set('a', 1) // a:1
      cache.set('b', 2) // b:1
      cache.set('c', 3) // c:1

      cache.get('a') // a:2
      cache.get('a') // a:3
      cache.get('b') // b:2

      cache.set('d', 4) // 淘汰 c

      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBeUndefined()
      expect(cache.get('d')).toBe(4)
      expect(cache.size).toBe(3)
    })
  })
})
