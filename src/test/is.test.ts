import { describe, expect, it } from 'vitest'
import { isInteger } from '@/is'

describe('isInteger', () => {
  /**
   * 测试整数输入
   * Test integer inputs
   */
  describe('integer inputs', () => {
    it('should return true for positive integers', () => {
      expect(isInteger(42)).toBe(true)
      expect(isInteger(1000)).toBe(true)
    })

    it('should return true for negative integers', () => {
      expect(isInteger(-42)).toBe(true)
      expect(isInteger(-1000)).toBe(true)
    })

    it('should return true for zero', () => {
      expect(isInteger(0)).toBe(true)
      expect(isInteger(-0)).toBe(true)
    })
  })

  /**
   * 测试非整数数字输入
   * Test non-integer number inputs
   */
  describe('non-integer number inputs', () => {
    it('should return false for floating point numbers', () => {
      expect(isInteger(3.14)).toBe(false)
      expect(isInteger(-2.5)).toBe(false)
      expect(isInteger(0.1)).toBe(false)
    })

    it('should return false for Infinity', () => {
      expect(isInteger(Infinity)).toBe(false)
      expect(isInteger(-Infinity)).toBe(false)
    })

    it('should return false for NaNN', () => {
      expect(isInteger(Number.NaN)).toBe(false)
    })
  })

  /**
   * 测试非数字输入
   * Test non-number inputs
   */
  describe('non-number inputs', () => {
    it('should return false for strings', () => {
      expect(isInteger('42')).toBe(false)
      expect(isInteger('abc')).toBe(false)
      expect(isInteger('')).toBe(false)
    })

    it('should return false for booleans', () => {
      expect(isInteger(true)).toBe(false)
      expect(isInteger(false)).toBe(false)
    })

    it('should return false for objects', () => {
      expect(isInteger({})).toBe(false)
      expect(isInteger({ value: 42 })).toBe(false)
    })

    it('should return false for arrays', () => {
      expect(isInteger([])).toBe(false)
      expect(isInteger([1, 2, 3])).toBe(false)
    })

    it('should return false for null and undefined', () => {
      expect(isInteger(null)).toBe(false)
      expect(isInteger(undefined)).toBe(false)
    })

    it('should return false for functions', () => {
      expect(isInteger(() => {})).toBe(false)
      // eslint-disable-next-line prefer-arrow-callback
      expect(isInteger(function () {})).toBe(false)
    })
  })

  /**
   * 测试边界情况
   * Test edge cases
   */
  describe('edge cases', () => {
    it('should correctly handle Number.MAX_SAFE_INTEGERR', () => {
      expect(isInteger(Number.MAX_SAFE_INTEGER)).toBe(true)
    })

    it('should correctly handle Number.MIN_SAFE_INTEGER', () => {
      expect(isInteger(Number.MIN_SAFE_INTEGER)).toBe(true)
    })

    it('should return false for scientific notation integers', () => {
      expect(isInteger(1e3)).toBe(true) // 1000 是整数
      expect(isInteger(1.5e3)).toBe(true) // 1500 是整数
    })

    it('should return false for scientific notation non-integers', () => {
      expect(isInteger(1.5e-3)).toBe(false) // 0.0015 不是整数
    })
  })
})
