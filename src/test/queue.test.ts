import { describe, expect, it } from 'vitest'
import { Queue } from '@/queue'

describe('queue', () => {
  // 测试队列初始化 — Test queue initialization
  describe('constructor', () => {
    it('should create an empty queue', () => {
      const queue = new Queue()
      expect(queue.size).toBe(0)
      expect(queue.peek()).toBeUndefined()
    })
  })

  // 测试 size 属性 — Test size property
  describe('size', () => {
    it('should return 0 for empty queue', () => {
      const queue = new Queue()
      expect(queue.size).toBe(0)
    })

    it('should reflect number of elements after push', () => {
      const queue = new Queue()
      queue.enqueue('a')
      expect(queue.size).toBe(1)
      queue.enqueue('b')
      expect(queue.size).toBe(2)
    })

    it('should decrease after dequeue', () => {
      const queue = new Queue()
      queue.enqueue('a')
      queue.enqueue('b')
      queue.dequeue()
      expect(queue.size).toBe(1)
      queue.dequeue()
      expect(queue.size).toBe(0)
    })
  })

  // 测试 clear 方法 — Test clear method
  describe('clear', () => {
    it('should empty the queue', () => {
      const queue = new Queue()
      queue.enqueue('a')
      queue.enqueue('b')
      expect(queue.size).toBe(2)
      queue.clear()
      expect(queue.size).toBe(0)
      expect(queue.peek()).toBeUndefined()
    })

    it('should work on already empty queue', () => {
      const queue = new Queue()
      queue.clear()
      expect(queue.size).toBe(0)
    })
  })

  // 测试 enqueue 方法 — Test enqueue method
  describe('enqueue', () => {
    it('should add elements to the queue', () => {
      const queue = new Queue()
      queue.enqueue('first')
      expect(queue.size).toBe(1)
      queue.enqueue('second')
      expect(queue.size).toBe(2)
    })

    it('should maintain FIFO order', () => {
      const queue = new Queue()
      queue.enqueue('a')
      queue.enqueue('b')
      queue.enqueue('c')
      expect(queue.dequeue()).toBe('a')
      expect(queue.dequeue()).toBe('b')
      expect(queue.dequeue()).toBe('c')
    })

    it('should handle multiple data types', () => {
      const queue = new Queue()
      queue.enqueue(123)
      queue.enqueue('string')
      queue.enqueue({ key: 'value' })
      queue.enqueue([1, 2, 3])
      expect(queue.size).toBe(4)
      expect(queue.dequeue()).toBe(123)
      expect(queue.dequeue()).toBe('string')
      expect(queue.dequeue()).toEqual({ key: 'value' })
      expect(queue.dequeue()).toEqual([1, 2, 3])
    })
  })

  // 测试 dequeue 方法 — Test dequeue method
  describe('dequeue', () => {
    it('should return undefined for empty queue', () => {
      const queue = new Queue()
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should remove and return first element', () => {
      const queue = new Queue()
      queue.enqueue('first')
      queue.enqueue('second')
      expect(queue.dequeue()).toBe('first')
      expect(queue.size).toBe(1)
      expect(queue.dequeue()).toBe('second')
      expect(queue.size).toBe(0)
    })

    it('should handle interleaved push and shift', () => {
      const queue = new Queue()
      queue.enqueue('a')
      queue.enqueue('b')
      expect(queue.dequeue()).toBe('a')
      queue.enqueue('c')
      expect(queue.dequeue()).toBe('b')
      expect(queue.dequeue()).toBe('c')
      expect(queue.dequeue()).toBeUndefined()
    })
  })

  describe('reverse', () => {
    it('should do nothing for empty queue', () => {
      const queue = new Queue()
      queue.reverse()
      expect(queue.size).toBe(0)
      expect(queue.peek()).toBeUndefined()
      expect([...queue]).toEqual([])
    })

    it('should do nothing for single element queue', () => {
      const queue = new Queue()
      queue.enqueue('single')
      queue.reverse()
      expect(queue.size).toBe(1)
      expect(queue.peek()).toBe('single')
      expect([...queue]).toEqual(['single'])
    })

    it('should reverse multiple elements', () => {
      const queue = new Queue()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      queue.enqueue(4)

      queue.reverse()

      expect(queue.size).toBe(4)
      expect([...queue]).toEqual([4, 3, 2, 1])
      expect(queue.peek()).toBe(4)
    })

    it('should maintain correct dequeue order after reversal', () => {
      const queue = new Queue()
      queue.enqueue('a')
      queue.enqueue('b')
      queue.enqueue('c')

      queue.reverse()

      expect(queue.dequeue()).toBe('c')
      expect(queue.dequeue()).toBe('b')
      expect(queue.dequeue()).toBe('a')
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should work correctly with enqueue after reversal', () => {
      const queue = new Queue()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.reverse()
      queue.enqueue(3)

      expect([...queue]).toEqual([2, 1, 3])
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(3)
    })

    it('should restore original order after double reversal', () => {
      const queue = new Queue()
      queue.enqueue('x')
      queue.enqueue('y')
      queue.enqueue('z')

      const original = [...queue]
      queue.reverse()
      queue.reverse()

      expect([...queue]).toEqual(original)
      expect(queue.peek()).toBe('x')
    })

    it('should work with drain generator after reversal', () => {
      const queue = new Queue()
      queue.enqueue(10)
      queue.enqueue(20)
      queue.enqueue(30)

      queue.reverse()

      const drained = []
      for (const item of queue.drain()) {
        drained.push(item)
      }

      expect(drained).toEqual([30, 20, 10])
      expect(queue.size).toBe(0)
    })

    it('should handle large number of elements', () => {
      const queue = new Queue()
      const count = 100
      const original = []

      for (let i = 0; i < count; i++) {
        queue.enqueue(i)
        original.push(i)
      }

      queue.reverse()

      const reversed = [...queue]
      expect(reversed).toEqual(original.reverse())
      expect(queue.size).toBe(count)

      // 验证出队顺序
      for (let i = count - 1; i >= 0; i--) {
        expect(queue.dequeue()).toBe(i)
      }
    })
  })

  // 测试 peek 方法（查看队首）— Test peek method
  describe('peek', () => {
    it('should return undefined for empty queue', () => {
      const queue = new Queue()
      expect(queue.peek()).toBeUndefined()
    })

    it('should return first element without removing it', () => {
      const queue = new Queue()
      queue.enqueue('front')
      queue.enqueue('back')
      expect(queue.peek()).toBe('front')
      expect(queue.size).toBe(2) // 大小不变 — size unchanged
      expect(queue.dequeue()).toBe('front') // 移除后验证 — verify after removal
    })

    it('should reflect changes after dequeue', () => {
      const queue = new Queue()
      queue.enqueue('a')
      queue.enqueue('b')
      queue.dequeue()
      expect(queue.peek()).toBe('b')
    })
  })

  // 测试 drain 生成器 — Test drain generator
  describe('drain', () => {
    it('should yield all elements in FIFO order', () => {
      const queue = new Queue()
      queue.enqueue('a')
      queue.enqueue('b')
      queue.enqueue('c')
      const results = []
      for (const item of queue.drain()) {
        results.push(item)
      }
      expect(results).toEqual(['a', 'b', 'c'])
      expect(queue.size).toBe(0) // 队列应被排空 — queue should be drained
    })

    it('should work on empty queue', () => {
      const queue = new Queue()
      const results = []
      for (const item of queue.drain()) {
        results.push(item)
      }
      expect(results).toEqual([])
    })

    it('should allow partial consumption', () => {
      const queue = new Queue()
      queue.enqueue('x')
      queue.enqueue('y')
      const generator = queue.drain()
      const first = generator.next()
      expect(first.value).toBe('x')
      expect(queue.size).toBe(1) // 只消费了一个 — only one consumed
      const second = generator.next()
      expect(second.value).toBe('y')
      expect(queue.size).toBe(0)
    })
  })

  // 测试迭代器 — Test iterator
  describe('iterator', () => {
    it('should iterate over elements without removing them', () => {
      const queue = new Queue()
      queue.enqueue('a')
      queue.enqueue('b')
      queue.enqueue('c')
      const results = []
      for (const item of queue) {
        results.push(item)
      }
      expect(results).toEqual(['a', 'b', 'c'])
      expect(queue.size).toBe(3) // 大小不变 — size unchanged
    })

    it('should work with spread operator', () => {
      const queue = new Queue()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)
      const array = [...queue]
      expect(array).toEqual([1, 2, 3])
      expect(queue.size).toBe(3)
    })

    it('should work with empty queue', () => {
      const queue = new Queue()
      expect([...queue]).toEqual([])
    })
  })

  // 测试综合场景 — Test integrated scenarios
  describe('integrated scenarios', () => {
    it('should handle complex sequence of operations', () => {
      const queue = new Queue()
      // 初始添加 — initial adds
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.peek()).toBe(1)
      expect(queue.size).toBe(2)
      // 移除一个 — remove one
      expect(queue.dequeue()).toBe(1)
      expect(queue.peek()).toBe(2)
      // 添加更多 — add more
      queue.enqueue(3)
      queue.enqueue(4)
      expect(queue.size).toBe(3)
      // 迭代 — iterate
      expect([...queue]).toEqual([2, 3, 4])
      // 排空 — drain
      const drained = []
      for (const item of queue.drain()) {
        drained.push(item)
      }
      expect(drained).toEqual([2, 3, 4])
      expect(queue.size).toBe(0)
      // 清空后操作 — operations after empty
      queue.enqueue('final')
      expect(queue.dequeue()).toBe('final')
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should maintain correctness after clear', () => {
      const queue = new Queue()
      queue.enqueue('a')
      queue.enqueue('b')
      queue.clear()
      queue.enqueue('c')
      expect(queue.size).toBe(1)
      expect(queue.dequeue()).toBe('c')
      expect(queue.dequeue()).toBeUndefined()
    })
  })

  // 测试性能边界 — Test performance boundaries
  describe('performance boundaries', () => {
    it('should handle large number of elements', () => {
      const queue = new Queue()
      const count = 1000
      for (let i = 0; i < count; i++) {
        queue.enqueue(i)
      }
      expect(queue.size).toBe(count)
      for (let i = 0; i < count; i++) {
        expect(queue.dequeue()).toBe(i)
      }
      expect(queue.size).toBe(0)
    })

    it('should maintain consistency under rapid operations', () => {
      const queue = new Queue()
      // 交替 push 和 shift — alternate push and shift
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i)
        expect(queue.dequeue()).toBe(i)
        expect(queue.size).toBe(0)
      }
      // 批量操作 — batch operations
      for (let i = 0; i < 50; i++) {
        queue.enqueue(i)
      }
      expect(queue.size).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(queue.dequeue()).toBe(i)
      }
      expect(queue.size).toBe(0)
    })
  })
})
