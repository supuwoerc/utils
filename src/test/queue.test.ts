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

  // 测试链式调用 — Test method chaining
  describe('method chaining', () => {
    it('should support chaining enqueue operations', () => {
      const queue = new Queue<number>()
      const result = queue.enqueue(1).enqueue(2).enqueue(3)
      expect(result).toBe(queue)
      expect(queue.size).toBe(3)
      expect([...queue]).toEqual([1, 2, 3])
    })

    it('should support chaining clear and enqueue', () => {
      const queue = new Queue<string>()
      const afterQueue = queue.enqueue('a').enqueue('b')
      expect(queue.size).toBe(2)
      expect(queue).toEqual(afterQueue)

      const clearedQueue = queue.clear()
      expect(clearedQueue).toBe(queue)
      expect(queue.size).toBe(0)

      queue.enqueue('c').enqueue('d')
      expect(queue.size).toBe(2)
      expect([...queue]).toEqual(['c', 'd'])
    })

    it('should support chaining with reverse', () => {
      const queue = new Queue<number>()

      queue.enqueue(1).enqueue(2).enqueue(3).reverse()

      expect(queue.size).toBe(3)
      expect([...queue]).toEqual([3, 2, 1])

      const reversedQueue = queue.reverse()
      expect(reversedQueue).toBe(queue)
      expect([...queue]).toEqual([1, 2, 3])
    })

    it('should support complex chaining scenarios', () => {
      const queue = new Queue<string>()

      queue
        .enqueue('first') // first
        .enqueue('second') // first second
        .enqueue('third') // first second third
        .reverse() // third second first
        .enqueue('fourth') // third second first fourth
        .reverse() // fourth first second third

      expect(queue.size).toBe(4)
      expect([...queue]).toEqual(['fourth', 'first', 'second', 'third'])

      expect(queue.dequeue()).toBe('fourth')
      expect(queue.dequeue()).toBe('first')
      expect(queue.dequeue()).toBe('second')
      expect(queue.dequeue()).toBe('third')
    })

    it('should maintain chainability after drain', () => {
      const queue = new Queue<number>()

      queue.enqueue(1).enqueue(2)

      const drained = []
      for (const item of queue.drain()) {
        drained.push(item)
      }
      expect(drained).toEqual([1, 2])
      expect(queue.size).toBe(0)

      queue.enqueue(3).enqueue(4).enqueue(5)
      expect(queue.size).toBe(3)
      expect([...queue]).toEqual([3, 4, 5])
    })

    it('should support chaining with mixed operations', () => {
      const queue = new Queue<number>()

      queue
        .enqueue(1)
        .enqueue(2)
        .enqueue(3)
        .reverse() // [3, 2, 1]
        .enqueue(4) // [3, 2, 1, 4]
        .enqueue(5) // [3, 2, 1, 4, 5]
        .reverse() // [5, 4, 1, 2, 3]

      expect(queue.size).toBe(5)
      expect([...queue]).toEqual([5, 4, 1, 2, 3])

      // 验证出队顺序
      // Verify dequeue order
      expect(queue.dequeue()).toBe(5)
      expect(queue.dequeue()).toBe(4)
      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
    })

    it('should support chaining in performance-critical scenarios', () => {
      const queue = new Queue<number>()
      const iterations = 1000

      for (let i = 0; i < iterations; i++) {
        queue.enqueue(i)
      }

      queue.reverse()

      expect(queue.size).toBe(iterations)

      for (let i = iterations - 1; i >= 0; i--) {
        expect(queue.dequeue()).toBe(i)
      }

      expect(queue.size).toBe(0)
    })

    it('should support chaining with different data types', () => {
      const queue = new Queue<any>()

      queue.enqueue(1).enqueue('string').enqueue({ key: 'value' }).enqueue([1, 2, 3]).reverse()

      expect(queue.size).toBe(4)
      expect([...queue]).toEqual([[1, 2, 3], { key: 'value' }, 'string', 1])

      queue.clear().enqueue('new').enqueue('chain')
      expect(queue.size).toBe(2)
      expect([...queue]).toEqual(['new', 'chain'])
    })

    it('should support chaining after partial operations', () => {
      const queue = new Queue<number>()

      // 部分操作后继续链式调用
      // Continue chaining after partial operations
      queue.enqueue(1).enqueue(2)

      // 执行一些非链式操作
      // Perform some non-chaining operations
      const first = queue.dequeue()
      expect(first).toBe(1)
      expect(queue.size).toBe(1)

      // 继续链式调用
      // Continue chaining
      queue.enqueue(3).enqueue(4).reverse()

      expect(queue.size).toBe(3)
      expect([...queue]).toEqual([4, 3, 2])
    })

    it('should ensure all chainable methods return this', () => {
      const queue = new Queue<number>()

      // 验证所有可链式调用的方法都返回 this
      // Verify all chainable methods return this
      const enqueueResult = queue.enqueue(1)
      expect(enqueueResult).toBe(queue)

      const reverseResult = queue.reverse()
      expect(reverseResult).toBe(queue)

      const clearResult = queue.clear()
      expect(clearResult).toBe(queue)

      // 空队列的 reverse 也应返回 this
      // reverse on empty queue should also return this
      const emptyReverseResult = queue.reverse()
      expect(emptyReverseResult).toBe(queue)
    })
  })

  // 测试链式调用与迭代器的结合 — Test chaining with iterators
  describe('chaining with iterators', () => {
    it('should work with iterator after chaining', () => {
      const queue = new Queue<number>()

      queue.enqueue(1).enqueue(2).enqueue(3).reverse()

      // 使用迭代器验证链式调用的结果
      // Use iterator to verify chaining result
      const iterator = queue[Symbol.iterator]()
      expect(iterator.next().value).toBe(3)
      expect(iterator.next().value).toBe(2)
      expect(iterator.next().value).toBe(1)
      expect(iterator.next().done).toBe(true)
    })

    it('should work with spread operator after chaining', () => {
      const queue = new Queue<string>()

      queue.enqueue('a').enqueue('b').enqueue('c').reverse()

      // 使用扩展运算符验证链式调用的结果
      // Use spread operator to verify chaining result
      const array = [...queue]
      expect(array).toEqual(['c', 'b', 'a'])

      // 继续链式调用并验证
      // Continue chaining and verify
      queue.enqueue('d').reverse()
      expect([...queue]).toEqual(['d', 'a', 'b', 'c'])
    })

    it('should work with drain after chaining', () => {
      const queue = new Queue<number>()

      queue.enqueue(1).enqueue(2).reverse().enqueue(3)

      // 使用 drain 排空链式调用后的队列
      // Use drain to empty queue after chaining
      const drained = []
      for (const item of queue.drain()) {
        drained.push(item)
      }

      expect(drained).toEqual([2, 1, 3])
      expect(queue.size).toBe(0)

      // 排空后继续链式调用
      // Continue chaining after drain
      queue.enqueue(4).enqueue(5)
      expect([...queue]).toEqual([4, 5])
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
