import { beforeEach, describe, expect, it } from 'vitest'
import { LinkedList } from '@/linked-list'

describe('linked-list', () => {
  let list: LinkedList<number>

  beforeEach(() => {
    list = new LinkedList<number>()
  })

  describe('constructor and basic properties', () => {
    it('created list should be empty', () => {
      expect(list.size).toBe(0)
      expect(list.isEmpty).toBe(true)
    })
  })

  describe('push and pop methods', () => {
    it('push should add elements to the end', () => {
      list.push(1).push(2).push(3)
      expect(list.size).toBe(3)
      expect(list.front()).toBe(1)
      expect(list.back()).toBe(3)
    })

    it('pop should remove elements from the end', () => {
      list.push(1).push(2).push(3)

      expect(list.pop()).toBe(3)
      expect(list.size).toBe(2)
      expect(list.back()).toBe(2)

      expect(list.pop()).toBe(2)
      expect(list.pop()).toBe(1)
      expect(list.pop()).toBeUndefined() // empty list should return undefined
      expect(list.isEmpty).toBe(true)
    })

    it('push and pop should handle single element correctly', () => {
      list.push(1)
      expect(list.pop()).toBe(1)
      expect(list.isEmpty).toBe(true)
      expect(list.front()).toBeUndefined()
      expect(list.back()).toBeUndefined()
    })
  })

  describe('unshift and shift methods', () => {
    it('unshift should add elements to the beginning', () => {
      list.unshift(3).unshift(2).unshift(1)
      expect(list.size).toBe(3)
      expect(list.front()).toBe(1)
      expect(list.back()).toBe(3)
    })

    it('shift should remove elements from the beginning', () => {
      list.push(1).push(2).push(3)

      expect(list.shift()).toBe(1)
      expect(list.size).toBe(2)
      expect(list.front()).toBe(2)

      expect(list.shift()).toBe(2)
      expect(list.shift()).toBe(3)
      expect(list.shift()).toBeUndefined() // empty list should return undefined
      expect(list.isEmpty).toBe(true)
    })

    it('unshift and shift should handle single element correctly', () => {
      list.unshift(1)
      expect(list.shift()).toBe(1)
      expect(list.isEmpty).toBe(true)
    })
  })

  describe('get and set methods', () => {
    beforeEach(() => {
      list.push(1).push(2).push(3)
    })

    it('get should return element at specified index', () => {
      expect(list.get(0)).toBe(1)
      expect(list.get(1)).toBe(2)
      expect(list.get(2)).toBe(3)
      expect(list.get(3)).toBeUndefined() // out of bounds index should return undefined
      expect(list.get(-1)).toBeUndefined() // negative index should return undefined
    })

    it('set should modify element at specified index', () => {
      expect(list.set(1, 20)).toBe(true)
      expect(list.get(1)).toBe(20)
      expect(list.set(3, 4)).toBe(false) // out of bounds index should return false
      expect(list.set(-1, 0)).toBe(false) // negative index should return false
    })
  })

  describe('insert method', () => {
    it('insert should insert element at specified position', () => {
      expect(list.insert(0, 1)).toBe(true)
      expect(list.size).toBe(1)
      expect(list.get(0)).toBe(1)

      expect(list.insert(0, 0)).toBe(true)
      expect(list.size).toBe(2)
      expect(list.get(0)).toBe(0)

      expect(list.insert(1, 0.5)).toBe(true)
      expect(list.size).toBe(3)
      expect(list.get(1)).toBe(0.5)

      expect(list.insert(3, 2)).toBe(true)
      expect(list.size).toBe(4)
      expect(list.get(3)).toBe(2)

      expect(list.insert(-1, 0)).toBe(false)
      expect(list.insert(10, 0)).toBe(false)
    })
  })

  describe('remove method', () => {
    beforeEach(() => {
      list.push(1).push(2).push(3).push(4)
    })

    it('remove should remove element at specified position', () => {
      expect(list.remove(1)).toBe(true)
      expect(list.size).toBe(3)
      expect(list.get(1)).toBe(3)

      expect(list.remove(0)).toBe(true)
      expect(list.size).toBe(2)
      expect(list.front()).toBe(3)

      expect(list.remove(1)).toBe(true)
      expect(list.size).toBe(1)
      expect(list.back()).toBe(3)

      expect(list.remove(-1)).toBe(false)
      expect(list.remove(10)).toBe(false)
    })
  })

  describe('clear method', () => {
    it('clear should empty the list', () => {
      list.push(1).push(2).push(3)
      expect(list.size).toBe(3)

      list.clear()
      expect(list.size).toBe(0)
      expect(list.isEmpty).toBe(true)
      expect(list.front()).toBeUndefined()
      expect(list.back()).toBeUndefined()
    })
  })

  describe('reverse method', () => {
    it('reverse should reverse the list', () => {
      list.push(1).push(2).push(3)

      list.reverse()
      expect(list.front()).toBe(3)
      expect(list.get(1)).toBe(2)
      expect(list.back()).toBe(1)

      list.reverse()
      expect(list.front()).toBe(1)
      expect(list.get(1)).toBe(2)
      expect(list.back()).toBe(3)

      list.clear()
      list.reverse()
      expect(list.isEmpty).toBe(true)

      list.push(1)
      list.reverse()
      expect(list.front()).toBe(1)
      expect(list.back()).toBe(1)
    })
  })

  describe('iterator', () => {
    it('should support for...of loop', () => {
      list.push(1).push(2).push(3)

      const values: number[] = []
      for (const value of list) {
        values.push(value)
      }

      expect(values).toEqual([1, 2, 3])
    })

    it('should support spread operator', () => {
      list.push(1).push(2).push(3)

      const values = [...list]
      expect(values).toEqual([1, 2, 3])
    })
  })

  describe('drain method', () => {
    it('drain should empty the list and yield all values', () => {
      list.push(1).push(2).push(3)

      const drainedValues: number[] = []
      for (const value of list.drain()) {
        drainedValues.push(value!)
      }

      expect(drainedValues).toEqual([1, 2, 3])
      expect(list.isEmpty).toBe(true)
      expect(list.size).toBe(0)
    })

    it('drain should not yield any values on empty list', () => {
      const drainedValues: number[] = []
      for (const value of list.drain()) {
        drainedValues.push(value!)
      }

      expect(drainedValues).toEqual([])
      expect(list.isEmpty).toBe(true)
    })
  })

  describe('edge cases and error handling', () => {
    it('method chaining should work correctly', () => {
      list.push(1).unshift(0).push(2)
      expect(list.size).toBe(3)
      expect([...list]).toEqual([0, 1, 2])
    })

    it('mixed operations should work correctly', () => {
      list.push(1)
      list.unshift(0)
      list.push(2)
      list.insert(2, 1.5)

      expect(list.size).toBe(4)
      expect([...list]).toEqual([0, 1, 1.5, 2])

      list.remove(2)
      expect([...list]).toEqual([0, 1, 2])

      list.reverse()
      expect([...list]).toEqual([2, 1, 0])
    })

    it('string linked list should work correctly', () => {
      const stringList = new LinkedList<string>()
      stringList.push('hello').push('world')

      expect(stringList.size).toBe(2)
      expect(stringList.front()).toBe('hello')
      expect(stringList.back()).toBe('world')
    })

    it('object linked list should work correctly', () => {
      const objList = new LinkedList<{ id: number, name: string }>()
      const obj1 = { id: 1, name: 'Alice' }
      const obj2 = { id: 2, name: 'Bob' }

      objList.push(obj1).push(obj2)

      expect(objList.size).toBe(2)
      expect(objList.get(0)).toBe(obj1)
      expect(objList.get(1)).toBe(obj2)
    })
  })
})
