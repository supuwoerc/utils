/**
 * 深度比较两个值是否相等
 * Deeply compares two values for equality
 *
 * @param {any} target - 第一个要比较的值 / The first value to compare
 * @param {any} val - 第二个要比较的值 / The second value to compare
 * @returns {boolean} 如果两个值深度相等则返回true，否则返回false / Returns true if the two values are deeply equal, otherwise false
 *
 * @example
 * // 基本类型比较 / Primitive type comparison
 * isDeepEqual(1, 1); // true
 * isDeepEqual('a', 'a'); // true
 *
 * // 数组比较 / Array comparison
 * isDeepEqual([1, 2, 3], [1, 2, 3]); // true
 * isDeepEqual([1, [2, 3]], [1, [2, 3]]); // true
 *
 * // 对象比较 / Object comparison
 * isDeepEqual({ a: 1, b: 2 }, { a: 1, b: 2 }); // true
 * isDeepEqual({ a: { b: 1 } }, { a: { b: 1 } }); // true
 */
export function isDeepEqual(target: any, val: any): boolean {
  if (target === val) {
    return true
  }
  if (target == null || val == null) {
    return target === val
  }
  if (Array.isArray(target) && Array.isArray(val)) {
    if (target.length !== val.length) {
      return false
    }
    for (let i = 0; i < target.length; i++) {
      if (!isDeepEqual(target[i], val[i])) {
        return false
      }
    }
    return true
  }
  if (typeof target === 'object' && typeof val === 'object') {
    const targetKeys = Object.keys(target)
    const valKeys = Object.keys(val)
    if (targetKeys.length !== valKeys.length) {
      return false
    }
    for (const key of targetKeys) {
      if (!valKeys.includes(key)) {
        return false
      }
      if (!isDeepEqual(target[key], val[key])) {
        return false
      }
    }
    return true
  }
  return false
}

/**
 * 浅比较两个值是否相等（比较第一层的值）
 * Shallowly compares two values for equality (compares values at first level)
 *
 * @param {any} target - 第一个要比较的值 / The first value to compare
 * @param {any} val - 第二个要比较的值 / The second value to compare
 * @returns {boolean} 如果两个值浅相等则返回true，否则返回false / Returns true if the two values are shallowly equal, otherwise false
 *
 * @example
 * // 基本类型比较 / Primitive type comparison
 * isShallowEqual(1, 1); // true
 * isShallowEqual('a', 'a'); // true
 *
 * // 数组比较（比较第一层元素） / Array comparison (compares first level elements)
 * const arr1 = [1, 2, 3];
 * const arr2 = [1, 2, 3];
 * const arr3 = [1, 2, 4];
 * isShallowEqual(arr1, arr2); // true (元素值相同 / same element values)
 * isShallowEqual(arr1, arr3); // false (元素值不同 / different element values)
 *
 * // 对象比较（比较第一层属性值） / Object comparison (compares first level property values)
 * const obj1 = { a: 1, b: 2 };
 * const obj2 = { a: 1, b: 2 };
 * const obj3 = { a: 1, b: 3 };
 * isShallowEqual(obj1, obj2); // true (属性值相同 / same property values)
 * isShallowEqual(obj1, obj3); // false (属性值不同 / different property values)
 */
export function isShallowEqual(target: any, val: any): boolean {
  if (target === val) {
    return true
  }
  if (target == null || val == null) {
    return target === val
  }
  if (Array.isArray(target) && Array.isArray(val)) {
    if (target.length !== val.length) {
      return false
    }
    for (let i = 0; i < target.length; i++) {
      if (target[i] !== val[i]) {
        return false
      }
    }
    return true
  }
  if (typeof target === 'object' && typeof val === 'object') {
    const targetKeys = Object.keys(target)
    const valKeys = Object.keys(val)
    if (targetKeys.length !== valKeys.length) {
      return false
    }
    for (const key of targetKeys) {
      if (!valKeys.includes(key)) {
        return false
      }
      if (target[key] !== val[key]) {
        return false
      }
    }
    return true
  }
  return false
}
