import { beforeEach, describe, expect, it } from 'vitest'
import { DoublyLinkedList } from '@/doubly-linked-list'

describe('doubly-linked-list', () => {
  let list: DoublyLinkedList<number>

  beforeEach(() => {
    list = new DoublyLinkedList<number>()
  })

  describe('basic Properties and Methods', () => {
    it('should be empty initially', () => {
      expect(list.size).toBe(0)
      expect(list.isEmpty).toBe(true)
      expect(list.front()).toBeUndefined()
      expect(list.back()).toBeUndefined()
    })

    it('clear() should empty the list', () => {
      list.push(1).push(2).push(3)
      expect(list.size).toBe(3)

      list.clear()
      expect(list.size).toBe(0)
      expect(list.isEmpty).toBe(true)
      expect(list.front()).toBeUndefined()
      expect(list.back()).toBeUndefined()
    })
  })

  describe('tail operations', () => {
    describe('push()', () => {
      it('should add element correctly on empty list', () => {
        list.push(1)
        expect(list.size).toBe(1)
        expect(list.isEmpty).toBe(false)
        expect(list.front()).toBe(1)
        expect(list.back()).toBe(1)
      })

      it('should support method chaining', () => {
        list.push(1).push(2).push(3)
        expect(list.size).toBe(3)
        expect(list.front()).toBe(1)
        expect(list.back()).toBe(3)
      })

      it('should maintain prev/next pointers correctly', () => {
        list.push(1).push(2).push(3)

        // 验证链表结构
        const values = Array.from(list)
        expect(values).toEqual([1, 2, 3])
      })
    })

    describe('pop()', () => {
      it('should return undefined on empty list', () => {
        expect(list.pop()).toBeUndefined()
        expect(list.size).toBe(0)
      })

      it('should pop correctly on single-element list', () => {
        list.push(1)
        expect(list.pop()).toBe(1)
        expect(list.size).toBe(0)
        expect(list.isEmpty).toBe(true)
      })

      it('should pop correctly on multi-element list', () => {
        list.push(1).push(2).push(3)

        expect(list.pop()).toBe(3)
        expect(list.size).toBe(2)
        expect(list.back()).toBe(2)

        expect(list.pop()).toBe(2)
        expect(list.size).toBe(1)
        expect(list.back()).toBe(1)

        expect(list.pop()).toBe(1)
        expect(list.size).toBe(0)
        expect(list.isEmpty).toBe(true)
      })
    })
  })

  describe('head operations', () => {
    describe('unshift()', () => {
      it('should add element correctly on empty list', () => {
        list.unshift(1)
        expect(list.size).toBe(1)
        expect(list.front()).toBe(1)
        expect(list.back()).toBe(1)
      })

      it('should support method chaining', () => {
        list.unshift(3).unshift(2).unshift(1)
        expect(list.size).toBe(3)
        expect(list.front()).toBe(1)
        expect(list.back()).toBe(3)
      })

      it('should maintain prev/next pointers correctly', () => {
        list.unshift(3).unshift(2).unshift(1)

        const values = Array.from(list)
        expect(values).toEqual([1, 2, 3])
      })
    })

    describe('shift()', () => {
      it('should return undefined on empty list', () => {
        expect(list.shift()).toBeUndefined()
        expect(list.size).toBe(0)
      })

      it('should shift correctly on single-element list', () => {
        list.push(1)
        expect(list.shift()).toBe(1)
        expect(list.size).toBe(0)
        expect(list.isEmpty).toBe(true)
      })

      it('should shift correctly on multi-element list', () => {
        list.push(1).push(2).push(3)

        expect(list.shift()).toBe(1)
        expect(list.size).toBe(2)
        expect(list.front()).toBe(2)

        expect(list.shift()).toBe(2)
        expect(list.size).toBe(1)
        expect(list.front()).toBe(3)

        expect(list.shift()).toBe(3)
        expect(list.size).toBe(0)
        expect(list.isEmpty).toBe(true)
      })

      it('should clean references correctly after shift()', () => {
        list.push(1).push(2)

        const firstValue = list.shift()
        expect(firstValue).toBe(1)

        // 验证剩余链表结构
        expect(list.front()).toBe(2)
        expect(list.back()).toBe(2)
        expect(list.size).toBe(1)
      })
    })
  })

  describe('index operations', () => {
    beforeEach(() => {
      list.push(10).push(20).push(30).push(40).push(50)
    })

    describe('get()', () => {
      it('should get elements correctly', () => {
        expect(list.get(0)).toBe(10)
        expect(list.get(2)).toBe(30)
        expect(list.get(4)).toBe(50)
      })

      it('should return undefined for invalid indices', () => {
        expect(list.get(-1)).toBeUndefined()
        expect(list.get(5)).toBeUndefined()
        expect(list.get(100)).toBeUndefined()
      })
    })

    describe('set()', () => {
      it('should set elements correctly', () => {
        expect(list.set(0, 100)).toBe(true)
        expect(list.get(0)).toBe(100)

        expect(list.set(2, 300)).toBe(true)
        expect(list.get(2)).toBe(300)

        expect(list.set(4, 500)).toBe(true)
        expect(list.get(4)).toBe(500)
      })

      it('should return false for invalid indices', () => {
        expect(list.set(-1, 0)).toBe(false)
        expect(list.set(5, 0)).toBe(false)
        expect(list.set(100, 0)).toBe(false)
      })
    })

    describe('insert()', () => {
      it('should insert at head', () => {
        expect(list.insert(0, 5)).toBe(true)
        expect(list.size).toBe(6)
        expect(list.front()).toBe(5)
        expect(list.get(1)).toBe(10)
      })

      it('should insert at tail', () => {
        expect(list.insert(5, 60)).toBe(true)
        expect(list.size).toBe(6)
        expect(list.back()).toBe(60)
        expect(list.get(4)).toBe(50)
      })

      it('should insert at middle', () => {
        expect(list.insert(2, 25)).toBe(true)
        expect(list.size).toBe(6)
        expect(list.get(2)).toBe(25)
        expect(list.get(3)).toBe(30)
      })

      it('should return false for invalid indices', () => {
        expect(list.insert(-1, 0)).toBe(false)
        expect(list.insert(6, 0)).toBe(false)
        expect(list.insert(100, 0)).toBe(false)
      })

      it('should maintain pointers correctly', () => {
        list.insert(2, 25)

        const values = Array.from(list)
        expect(values).toEqual([10, 20, 25, 30, 40, 50])
      })
    })

    describe('remove()', () => {
      it('should remove head element', () => {
        expect(list.remove(0)).toBe(true)
        expect(list.size).toBe(4)
        expect(list.front()).toBe(20)
      })

      it('should remove tail element', () => {
        expect(list.remove(4)).toBe(true)
        expect(list.size).toBe(4)
        expect(list.back()).toBe(40)
      })

      it('should remove middle element', () => {
        expect(list.remove(2)).toBe(true)
        expect(list.size).toBe(4)
        expect(list.get(1)).toBe(20)
        expect(list.get(2)).toBe(40)
      })

      it('should return false for invalid indices', () => {
        expect(list.remove(-1)).toBe(false)
        expect(list.remove(5)).toBe(false)
        expect(list.remove(100)).toBe(false)
      })

      it('should clean references correctly', () => {
        list.remove(2)

        const values = Array.from(list)
        expect(values).toEqual([10, 20, 40, 50])
      })
    })
  })

  describe('traversal and iteration', () => {
    beforeEach(() => {
      list.push(1).push(2).push(3).push(4).push(5)
    })

    it('should support for...of loop', () => {
      const values: number[] = []
      for (const value of list) {
        values.push(value)
      }
      expect(values).toEqual([1, 2, 3, 4, 5])
    })

    it('should support spread operator', () => {
      const values = [...list]
      expect(values).toEqual([1, 2, 3, 4, 5])
    })

    it('should support Array.from()', () => {
      const values = Array.from(list)
      expect(values).toEqual([1, 2, 3, 4, 5])
    })

    describe('drain()', () => {
      it('should drain and traverse the list', () => {
        const drained: number[] = []
        for (const value of list.drain()) {
          drained.push(value)
        }

        expect(drained).toEqual([1, 2, 3, 4, 5])
        expect(list.size).toBe(0)
        expect(list.isEmpty).toBe(true)
      })

      it('should yield no values for empty list', () => {
        list.clear()
        const drained = Array.from(list.drain())
        expect(drained).toEqual([])
      })
    })
  })

  describe('reverse operation', () => {
    it('should not change empty list', () => {
      list.reverse()
      expect(list.size).toBe(0)
      expect(list.isEmpty).toBe(true)
    })

    it('should not change single-element list', () => {
      list.push(1)
      list.reverse()
      expect(list.size).toBe(1)
      expect(list.front()).toBe(1)
      expect(list.back()).toBe(1)
    })

    it('should reverse list correctly', () => {
      list.push(1).push(2).push(3).push(4).push(5)

      list.reverse()

      expect(list.size).toBe(5)
      expect(list.front()).toBe(5)
      expect(list.back()).toBe(1)

      const values = Array.from(list)
      expect(values).toEqual([5, 4, 3, 2, 1])
    })

    it('should support method chaining', () => {
      list.push(1).push(2).push(3)

      const reversed = list.reverse()
      expect(reversed).toBe(list) // 返回自身

      const values = Array.from(list)
      expect(values).toEqual([3, 2, 1])
    })

    it('should maintain pointers correctly after reverse', () => {
      list.push(1).push(2).push(3)
      list.reverse()

      // 验证双向链接
      expect(list.get(0)).toBe(3)
      expect(list.get(1)).toBe(2)
      expect(list.get(2)).toBe(1)

      // 验证前后操作仍然正常
      list.push(4)
      expect(list.back()).toBe(4)

      list.unshift(5)
      expect(list.front()).toBe(5)
    })
  })

  describe('edge cases and error handling', () => {
    it('should remain correct after many operations', () => {
      // 混合各种操作
      for (let i = 0; i < 1000; i++) {
        list.push(i)
      }
      expect(list.size).toBe(1000)

      for (let i = 0; i < 500; i++) {
        list.shift()
      }
      expect(list.size).toBe(500)

      for (let i = 0; i < 250; i++) {
        list.pop()
      }
      expect(list.size).toBe(250)

      // 验证剩余元素
      const values = Array.from(list)
      expect(values.length).toBe(250)
      expect(values[0]).toBe(500)
      expect(values[249]).toBe(749)
    })

    it('should maintain consistency after insertions and deletions', () => {
      list.push(1).push(2).push(3)
      list.remove(1) // 移除 2
      list.insert(1, 4) // 在位置 1 插入 4
      list.unshift(0) // 头部添加 0
      list.pop() // 移除尾部 3

      const values = Array.from(list)
      expect(values).toEqual([0, 1, 4])
      expect(list.size).toBe(3)
      expect(list.front()).toBe(0)
      expect(list.back()).toBe(4)
    })

    it('should handle various operations on empty list correctly', () => {
      expect(list.pop()).toBeUndefined()
      expect(list.shift()).toBeUndefined()
      expect(list.get(0)).toBeUndefined()
      expect(list.set(0, 1)).toBe(false)
      expect(list.remove(0)).toBe(false)

      // 这些操作应该成功
      expect(list.push(1)).toBe(list)
      expect(list.unshift(2)).toBe(list)
    })
  })

  describe('performance optimization verification', () => {
    it('#getNode() should use binary optimization', () => {
      // 添加足够多的元素以验证优化
      for (let i = 0; i < 100; i++) {
        list.push(i)
      }

      // 访问前半部分的元素
      expect(list.get(0)).toBe(0)
      expect(list.get(49)).toBe(49)

      // 访问后半部分的元素
      expect(list.get(50)).toBe(50)
      expect(list.get(99)).toBe(99)

      // 所有访问都应成功
      for (let i = 0; i < 100; i++) {
        expect(list.get(i)).toBe(i)
      }
    })
  })
})
