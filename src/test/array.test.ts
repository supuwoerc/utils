import type { Tree, TreeNode } from '@/array'
import { describe, expect, it, vi } from 'vitest'
import {
  array2Tree,
  getParents,
  getTargetFromTree,
  sampleWithoutReplacement,
  sampleWithReplacement,
  shuffle,
  shuffleImmutable,
  tree2Array,
  uniqueBy,
} from '@/array'

describe('array2Tree', () => {
  // 基础测试用例
  it('should convert flat array to tree structure', () => {
    const flatArray = [
      { id: 1, pid: '', name: 'Node 1' },
      { id: 2, pid: 1, name: 'Node 1-1' },
      { id: 3, pid: 1, name: 'Node 1-2' },
      { id: 4, pid: '', name: 'Node 2' },
      { id: 5, pid: 4, name: 'Node 2-1' },
    ]

    const result = array2Tree(flatArray)

    expect(result).toHaveLength(2)
    expect(result[0]?.children).toHaveLength(2)
    expect(result[1]?.children).toHaveLength(1)
    expect(result[0]?.children?.[0]?.name).toBe('Node 1-1')
    expect(result[0]?.children?.[1]?.name).toBe('Node 1-2')
  })

  // 测试自定义键名
  it('should work with custom key names', () => {
    interface CustomNode {
      key: number
      parentKey: string | number
      label: string
      subNodes?: CustomNode[]
    }

    const flatArray: CustomNode[] = [
      { key: 1, parentKey: '', label: 'Node 1' },
      { key: 2, parentKey: 1, label: 'Node 1-1' },
      { key: 3, parentKey: 1, label: 'Node 1-2' },
    ]

    const result = array2Tree<CustomNode>(flatArray, 'subNodes', 'key', 'parentKey', '')

    expect(result).toHaveLength(1)
    expect(result[0]?.subNodes).toHaveLength(2)
    expect(result[0]?.subNodes?.[0]?.label).toBe('Node 1-1')
  })

  // 测试根节点父ID值
  it('should respect custom root parent id', () => {
    const flatArray = [
      { id: 1, pid: 'root', name: 'Node 1' },
      { id: 2, pid: 1, name: 'Node 1-1' },
      { id: 3, pid: 'root', name: 'Node 2' },
    ]

    const result = array2Tree(flatArray, 'children', 'id', 'pid', 'root')

    expect(result).toHaveLength(2)
    expect(result[0]?.name).toBe('Node 1')
    expect(result[1]?.name).toBe('Node 2')
  })

  // 测试多层嵌套
  it('should handle multi-level nesting', () => {
    const flatArray = [
      { id: 1, pid: '', name: 'Level 1' },
      { id: 2, pid: 1, name: 'Level 2' },
      { id: 3, pid: 2, name: 'Level 3' },
      { id: 4, pid: 3, name: 'Level 4' },
    ]

    const result = array2Tree(flatArray)

    expect(result).toHaveLength(1)
    expect(result[0]?.children?.[0]?.children?.[0]?.children?.[0]?.name).toBe('Level 4')
  })

  // 测试无序输入
  it('should handle unordered input', () => {
    const flatArray = [
      { id: 4, pid: 3, name: 'Node 3-1' },
      { id: 2, pid: 1, name: 'Node 1-1' },
      { id: 1, pid: '', name: 'Node 1' },
      { id: 3, pid: 1, name: 'Node 1-2' },
    ]

    const result = array2Tree(flatArray)

    expect(result).toHaveLength(1)
    expect(result[0]?.children).toHaveLength(2)
    expect(result[0]?.children?.[1]?.children).toHaveLength(1)
  })

  // 测试空数组
  it('should return empty array for empty input', () => {
    const result = array2Tree([])
    expect(result).toEqual([])
  })

  // 测试孤儿节点（没有父节点）
  it('should handle orphan nodes', () => {
    const flatArray = [
      { id: 1, pid: '', name: 'Root 1' },
      { id: 2, pid: 999, name: 'Orphan' }, // pid 999 不存在
      { id: 3, pid: 1, name: 'Child 1' },
    ]

    const result = array2Tree(flatArray)

    expect(result).toHaveLength(1) // 只有根节点
    expect(result[0]?.children).toHaveLength(1)
    // 孤儿节点应该被忽略
  })

  // 修复重复ID测试用例
  it('should handle duplicate IDs with child inheritance', () => {
    const flatArray = [
      { id: 1, pid: '', name: 'First' },
      { id: 2, pid: 1, name: 'Child of First' },
      { id: 1, pid: '', name: 'Second' }, // 重复ID
    ]

    const result = array2Tree(flatArray)

    expect(result).toHaveLength(2)

    // 第一个节点（First）
    expect(result[0]?.name).toBe('First')
    expect(result[0]?.children).toHaveLength(1)
    expect(result[0]?.children?.[0]?.name).toBe('Child of First')

    // 第二个节点（Second） - 覆盖了第一个节点，继承了其子节点
    expect(result[1]?.name).toBe('Second')
    expect(result[1]?.children).toHaveLength(1)
    expect(result[1]?.children?.[0]?.name).toBe('Child of First')

    expect(result[0]?.children?.[0]).toBe(result[1]?.children?.[0])
  })

  // 测试类型安全
  it('should maintain TypeScript type safety', () => {
    interface CustomNode {
      uid: number
      parentUid: number | string | null
      title: string
      data: number
      children?: CustomNode[]
    }

    const flatArray: CustomNode[] = [
      { uid: 1, parentUid: null, title: 'Node 1', data: 100 },
      { uid: 2, parentUid: 1, title: 'Node 1-1', data: 200 },
    ]

    const result = array2Tree<CustomNode>(flatArray, 'children', 'uid', 'parentUid', null)

    expect(result[0]?.title).toBe('Node 1')
    expect(result[0]?.children?.[0]?.data).toBe(200)
  })

  // 测试性能：大数据量
  it('should handle large datasets', () => {
    const largeArray = []
    const nodeCount = 1000

    // 创建1000个节点的扁平数组
    for (let i = 1; i <= nodeCount; i++) {
      largeArray.push({
        id: i,
        pid: i === 1 ? '' : Math.floor(i / 2),
        name: `Node ${i}`,
      })
    }

    const startTime = performance.now()
    const result = array2Tree(largeArray)
    const endTime = performance.now()

    expect(result).toHaveLength(1) // 应该有一个根节点
    expect(endTime - startTime).toBeLessThan(100) // 应该在100ms内完成
  })

  // 新增测试：测试 undefined 和 null 值处理
  it('should handle undefined and null values', () => {
    const flatArray = [
      { id: 1, pid: undefined, name: 'Node 1' },
      { id: 2, pid: null, name: 'Node 2' },
      { id: 3, pid: 1, name: 'Node 1-1' },
    ]

    const result = array2Tree(flatArray)

    expect(result).toHaveLength(2) // id为1和2的节点都应该成为根节点
    expect(result[0]?.children).toHaveLength(1)
  })

  // 新增测试：测试默认参数
  it('should work with default parameters', () => {
    const flatArray = [
      { id: 1, pid: '', name: 'Node 1' },
      { id: 2, pid: 1, name: 'Node 1-1' },
    ]

    // 使用所有默认参数
    const result = array2Tree(flatArray)

    expect(result).toHaveLength(1)
    expect(result[0]?.children).toHaveLength(1)
    expect(result[0]?.children?.[0]?.name).toBe('Node 1-1')
  })
})

describe('tree2Array', () => {
  // Test case 1: Basic tree structure
  // 测试用例 1: 基本树结构
  it('should flatten a simple tree structure to array', () => {
    const tree: Tree<TreeNode>[] = [
      {
        id: 1,
        name: 'Node 1',
        children: [
          { id: 2, name: 'Node 1.1', children: [] },
          { id: 3, name: 'Node 1.2' },
        ],
      },
      {
        id: 4,
        name: 'Node 2',
      },
    ]

    const result = tree2Array(tree)

    expect(result).toHaveLength(4)
    expect(result.map((node) => node.id)).toEqual([1, 2, 3, 4])
    expect(result.map((node) => node.name)).toEqual(['Node 1', 'Node 1.1', 'Node 1.2', 'Node 2'])
  })

  // Test case 2: Empty tree
  // 测试用例 2: 空树
  it('should return empty array for empty tree', () => {
    const tree: Tree<TreeNode>[] = []
    const result = tree2Array(tree)

    expect(result).toEqual([])
    expect(result).toHaveLength(0)
  })

  // Test case 3: Deep nested tree
  // 测试用例 3: 深度嵌套的树
  it('should handle deeply nested tree structures', () => {
    const tree: Tree<TreeNode>[] = [
      {
        id: 1,
        name: 'Root',
        children: [
          {
            id: 2,
            name: 'Child 1',
            children: [
              {
                id: 3,
                name: 'Grandchild 1',
                children: [{ id: 4, name: 'Great-grandchild 1' }],
              },
            ],
          },
        ],
      },
    ]

    const result = tree2Array(tree)

    expect(result).toHaveLength(4)
    expect(result.map((node) => node.id)).toEqual([1, 2, 3, 4])
  })

  // Test case 4: Tree with custom children key
  // 测试用例 4: 使用自定义 children 键的树
  it('should work with custom children key', () => {
    interface CustomNode {
      id: number
      label: string
      subNodes?: CustomNode[]
    }

    const tree: Tree<CustomNode>[] = [
      {
        id: 1,
        label: 'Parent',
        subNodes: [
          { id: 2, label: 'Child 1' },
          { id: 3, label: 'Child 2', subNodes: [{ id: 4, label: 'Grandchild' }] },
        ],
      },
    ]

    const result = tree2Array(tree, 'subNodes' as keyof CustomNode)

    expect(result).toHaveLength(4)
    expect(result.map((node) => node.id)).toEqual([1, 2, 3, 4])
    expect(result.map((node) => node.label)).toEqual(['Parent', 'Child 1', 'Child 2', 'Grandchild'])
  })

  // Test case 5: Tree with null/undefined children
  // 测试用例 5: 包含 null/undefined children 的树
  it('should handle nodes with null or undefined children', () => {
    const tree: Tree<TreeNode>[] = [
      {
        id: 1,
        name: 'Node 1',
        children: null as any, // Testing null children
      },
      {
        id: 2,
        name: 'Node 2',
        children: undefined, // Testing undefined children
      },
      {
        id: 3,
        name: 'Node 3',
        // No children property
      },
    ]

    const result = tree2Array(tree)

    expect(result).toHaveLength(3)
    expect(result.map((node) => node.id)).toEqual([1, 2, 3])
  })

  // Test case 6: Maintain original node structure
  // 测试用例 6: 保持原始节点结构
  it('should preserve original node properties', () => {
    const tree: Tree<TreeNode>[] = [
      {
        id: 1,
        name: 'Test Node',
        children: [{ id: 2, name: 'Child Node', customProp: 'extra' } as any],
      },
    ]

    const result = tree2Array(tree)

    expect(result[0]).toEqual({
      id: 1,
      name: 'Test Node',
      children: [{ id: 2, name: 'Child Node', customProp: 'extra' }],
    })

    expect(result[1]).toEqual({
      id: 2,
      name: 'Child Node',
      customProp: 'extra',
    })
  })

  // Test case 7: Single node tree
  // 测试用例 7: 单节点树
  it('should handle single node tree', () => {
    const tree: Tree<TreeNode>[] = [{ id: 1, name: 'Single Node' }]

    const result = tree2Array(tree)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ id: 1, name: 'Single Node' })
  })
})

// 测试数据 - Test data
const mockTree: TreeNode[] = [
  {
    id: 1,
    name: 'Root 1',
    children: [
      {
        id: 2,
        name: 'Child 1',
        children: [
          { id: 4, name: 'Grandchild 1' },
          { id: 5, name: 'Grandchild 2' },
        ],
      },
      { id: 3, name: 'Child 2' },
    ],
  },
  {
    id: 6,
    name: 'Root 2',
    children: [{ id: 7, name: 'Child 3' }],
  },
]

describe('getParents', () => {
  // 测试1: 查找存在的节点 - Test 1: Find existing node
  it('should return parent chain for existing node', () => {
    const result = getParents(mockTree, 4)
    expect(result).toHaveLength(3)
    expect(result.map((node) => node.id)).toEqual([1, 2, 4])
    expect(result[0].name).toBe('Root 1')
    expect(result[1].name).toBe('Child 1')
    expect(result[2].name).toBe('Grandchild 1')
  })

  // 测试2: 查找不存在的节点 - Test 2: Find non-existing node
  it('should return empty array for non-existing node', () => {
    const result = getParents(mockTree, 999)
    expect(result).toEqual([])
  })

  // 测试3: 查找根节点 - Test 3: Find root node
  it('should return single node for root node', () => {
    const result = getParents(mockTree, 6)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(6)
    expect(result[0].name).toBe('Root 2')
  })

  // 测试4: 自定义ID键名 - Test 4: Custom ID key
  it('should work with custom id key', () => {
    const customTree = [
      {
        key: 1,
        value: 'Root',
        subs: [{ key: 2, value: 'Child' }],
      },
    ]

    const result = getParents(
      customTree,
      2,
      'key' as keyof (typeof customTree)[0],
      'subs' as keyof (typeof customTree)[0],
    )

    expect(result).toHaveLength(2)
    expect(result[0].key).toBe(1)
    expect(result[1].key).toBe(2)
  })

  // 测试5: 自定义相等比较函数 - Test 5: Custom equality function
  it('should use custom equality function', () => {
    const customEqualFunc = (val: any, tarVal: any) => val.toString() === tarVal.toString()

    const result = getParents(mockTree, '4', 'id', 'children', customEqualFunc)
    expect(result.map((node) => node.id)).toEqual([1, 2, 4])
  })

  // 测试6: 空树的情况 - Test 6: Empty tree
  it('should return empty array for empty tree', () => {
    const result = getParents([], 1)
    expect(result).toEqual([])
  })

  // 测试7: 没有子节点的树 - Test 7: Tree without children
  it('should work with tree without children property', () => {
    const simpleTree = [
      { id: 1, name: 'Node 1' },
      { id: 2, name: 'Node 2' },
    ]

    const result = getParents(simpleTree, 2)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  // 测试8: 多个根节点的情况 - Test 8: Multiple root nodes
  it('should find correct node in multiple roots', () => {
    const result = getParents(mockTree, 7)
    expect(result.map((node) => node.id)).toEqual([6, 7])
  })

  // 测试9: 包含重复ID的树 - Test 9: Tree with duplicate IDs
  it('should return first found path for duplicate IDs', () => {
    const duplicateTree: TreeNode[] = [
      {
        id: 1,
        name: 'Root A',
        children: [{ id: 2, name: 'Duplicate' }],
      },
      {
        id: 3,
        name: 'Root B',
        children: [{ id: 2, name: 'Duplicate' }],
      },
    ]

    const result = getParents(duplicateTree, 2)
    expect(result[0].id).toBe(1) // 应该返回第一个找到的路径 - Should return first found path
  })
})

describe('getTargetFromTree', () => {
  // 测试数据 - 模拟树结构
  // Test data - mock tree structure
  const mockTree: TreeNode[] = [
    {
      id: 1,
      name: 'Node 1',
      children: [
        {
          id: 2,
          name: 'Node 1-1',
          children: [
            { id: 3, name: 'Node 1-1-1' },
            { id: 4, name: 'Node 1-1-2' },
          ],
        },
        { id: 5, name: 'Node 1-2' },
      ],
    },
    {
      id: 6,
      name: 'Node 2',
      children: [
        { id: 7, name: 'Node 2-1' },
        { id: 8, name: 'Node 2-2' },
      ],
    },
  ]

  // 测试用例 1: 查找根节点
  // Test case 1: Find root node
  it('should find root node', () => {
    const result = getTargetFromTree(mockTree, 1)
    expect(result).toEqual(mockTree[0])
  })

  // 测试用例 2: 查找深层嵌套节点
  // Test case 2: Find deeply nested node
  it('should find deeply nested node', () => {
    const result = getTargetFromTree(mockTree, 3)
    expect(result).toEqual({ id: 3, name: 'Node 1-1-1' })
  })

  // 测试用例 3: 查找不存在的节点
  // Test case 3: Find non-existent node
  it('should return null for non-existent node', () => {
    const result = getTargetFromTree(mockTree, 999)
    expect(result).toBeNull()
  })

  // 测试用例 4: 使用自定义相等函数
  // Test case 4: Use custom equal function
  it('should work with custom equal function', () => {
    const customEqualFunc = (a: number, b: string) => a === Number.parseInt(b)
    const result = getTargetFromTree(mockTree, '3', 'id', customEqualFunc)
    expect(result).toEqual({ id: 3, name: 'Node 1-1-1' })
  })

  // 测试用例 5: 使用自定义子节点键名
  // Test case 5: Use custom children key name
  const customTree = [
    {
      id: 1,
      name: 'Node 1',
      subNodes: [{ id: 2, name: 'Node 1-1' }],
    },
  ]

  it('should work with custom children key', () => {
    const result = getTargetFromTree(customTree, 2, 'id', (a, b) => a === b, 'subNodes')
    expect(result).toEqual({ id: 2, name: 'Node 1-1' })
  })

  // 测试用例 6: 处理空树
  // Test case 6: Handle empty tree
  it('should return null for empty tree', () => {
    const result = getTargetFromTree([], 1)
    expect(result).toBeNull()
  })

  // 测试用例 7: 处理非数组输入
  // Test case 7: Handle non-array input
  it('should return null for non-array input', () => {
    const result = getTargetFromTree(null as any, 1)
    expect(result).toBeNull()
  })

  // 测试用例 8: 查找中间层级节点
  // Test case 8: Find middle level node
  it('should find middle level node', () => {
    const result = getTargetFromTree(mockTree, 2)
    expect(result).toEqual({
      id: 2,
      name: 'Node 1-1',
      children: [
        { id: 3, name: 'Node 1-1-1' },
        { id: 4, name: 'Node 1-1-2' },
      ],
    })
  })

  // 测试用例 9: 使用字符串ID
  // Test case 9: Use string IDs
  const stringIdTree = [
    {
      id: 'node-1',
      name: 'Node 1',
      children: [{ id: 'node-1-1', name: 'Node 1-1' }],
    },
  ]

  it('should work with string IDs', () => {
    const result = getTargetFromTree(stringIdTree, 'node-1-1')
    expect(result).toEqual({ id: 'node-1-1', name: 'Node 1-1' })
  })

  // 测试用例 10: 查找最后一个节点
  // Test case 10: Find last node
  it('should find last node in tree', () => {
    const result = getTargetFromTree(mockTree, 8)
    expect(result).toEqual({ id: 8, name: 'Node 2-2' })
  })
})

describe('shuffle function', () => {
  // 测试 1: 验证洗牌后数组长度不变 (Test 1: Verify array length remains unchanged after shuffling)
  it('should return array with same length', () => {
    const originalArray = [1, 2, 3, 4, 5]
    const shuffledArray = shuffle([...originalArray])

    expect(shuffledArray).toHaveLength(originalArray.length)
  })

  // 测试 2: 验证洗牌后包含相同的元素 (Test 2: Verify shuffled array contains same elements)
  it('should contain same elements', () => {
    const originalArray = [1, 2, 3, 4, 5]
    const shuffledArray = shuffle([...originalArray])

    // 排序后比较元素 (Compare elements after sorting)
    expect([...shuffledArray].sort()).toEqual([...originalArray].sort())
  })

  // 测试 3: 验证洗牌会改变元素顺序（概率测试）(Test 3: Verify shuffling changes element order - probability test)
  it('should change element order (probabilistic test)', () => {
    const originalArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const numberOfTests = 100
    let differentOrderCount = 0

    for (let i = 0; i < numberOfTests; i++) {
      const shuffledArray = shuffle([...originalArray])

      // 检查是否与原数组顺序不同 (Check if order is different from original array)
      if (JSON.stringify(shuffledArray) !== JSON.stringify(originalArray)) {
        differentOrderCount++
      }
    }

    // 期望大多数情况下顺序会改变 (Expect order to change in most cases)
    expect(differentOrderCount).toBeGreaterThan(numberOfTests * 0.9)
  })

  // 测试 4: 验证空数组处理 (Test 4: Verify empty array handling)
  it('should handle empty array', () => {
    const emptyArray: number[] = []
    const shuffledArray = shuffle(emptyArray)

    expect(shuffledArray).toEqual([])
    expect(shuffledArray).toHaveLength(0)
  })

  // 测试 5: 验证单元素数组 (Test 5: Verify single element array)
  it('should handle single element array', () => {
    const singleArray = [42]
    const shuffledArray = shuffle([...singleArray])

    expect(shuffledArray).toEqual([42])
    expect(shuffledArray).toHaveLength(1)
  })

  // 测试 6: 验证洗牌算法是原地操作 (Test 6: Verify shuffle operates in-place)
  it('should modify array in-place', () => {
    const originalArray = [1, 2, 3, 4, 5]
    const arrayCopy = [...originalArray]
    const returnedArray = shuffle(arrayCopy)

    // 返回的数组应该是同一个引用 (Returned array should be the same reference)
    expect(returnedArray).toBe(arrayCopy)

    // 原始副本应该已被修改 (The original copy should have been modified)
    expect(arrayCopy).not.toEqual(originalArray)
  })

  // 测试 7: 验证随机性分布（简化测试）(Test 7: Verify randomness distribution - simplified test)
  it('should have fair distribution (simplified test)', () => {
    const positionCounts = {
      1: [0, 0, 0], // 元素1在每个位置出现的次数 (Element 1 count at each position)
      2: [0, 0, 0], // 元素2在每个位置出现的次数 (Element 2 count at each position)
      3: [0, 0, 0], // 元素3在每个位置出现的次数 (Element 3 count at each position)
    }
    const iterations = 3000

    for (let i = 0; i < iterations; i++) {
      const shuffled = shuffle([1, 2, 3])
      shuffled.forEach((element, index) => {
        positionCounts[element as keyof typeof positionCounts][index]++
      })
    }

    // 每个元素在每个位置应该出现大约1000次 (Each element should appear about 1000 times at each position)
    const expectedCount = iterations / 3 // 1000

    Object.values(positionCounts).forEach((counts) => {
      counts.forEach((count) => {
        // 允许10%的误差 (Allow 10% margin of error)
        expect(count).toBeGreaterThan(expectedCount * 0.9)
        expect(count).toBeLessThan(expectedCount * 1.1)
      })
    })
  })

  // 测试 8: 验证泛型类型支持 (Test 8: Verify generic type support)
  it('should work with different types', () => {
    const stringArray = ['a', 'b', 'c', 'd']
    const numberArray = [1, 2, 3, 4]
    const objectArray = [{ id: 1 }, { id: 2 }, { id: 3 }]

    const shuffledStrings = shuffle([...stringArray])
    const shuffledNumbers = shuffle([...numberArray])
    const shuffledObjects = shuffle([...objectArray])

    expect(shuffledStrings).toHaveLength(stringArray.length)
    expect(shuffledNumbers).toHaveLength(numberArray.length)
    expect(shuffledObjects).toHaveLength(objectArray.length)
  })
})

/**
 * 测试 shuffleImmutable 函数
 * Test the shuffleImmutable function
 */
describe('shuffleImmutable', () => {
  /**
   * 测试是否返回新数组（不修改原数组）
   * Test if returns a new array (does not modify original)
   */
  it('returns a new array (does not modify original)', () => {
    // 准备测试数据
    // Prepare test data
    const originalArray = [1, 2, 3, 4, 5]

    // 执行函数
    // Execute function
    const shuffledArray = shuffleImmutable(originalArray)

    // 验证结果
    // Verify results
    expect(shuffledArray).not.toBe(originalArray) // 应该是不同的引用 / Should be different reference
    expect(originalArray).toEqual([1, 2, 3, 4, 5]) // 原数组应保持不变 / Original array should remain unchanged
  })

  /**
   * 测试空数组的情况
   * Test with empty array
   */
  it('empty array', () => {
    const emptyArray: number[] = []
    const result = shuffleImmutable(emptyArray)

    expect(result).not.toBe(emptyArray) // 应该是新数组 / Should be new array
    expect(result).toEqual([]) // 内容应为空 / Content should be empty
  })

  /**
   * 测试只读数组的情况
   * Test with readonly array
   */
  it('readonly array', () => {
    const readonlyArray: readonly number[] = [1, 2, 3]
    const result = shuffleImmutable(readonlyArray)

    expect(result).not.toBe(readonlyArray) // 返回新数组 / Returns new array
    expect(readonlyArray).toEqual([1, 2, 3]) // 原数组不变 / Original unchanged
  })

  /**
   * 测试数组长度不变
   * Test that array length remains the same
   */
  it('array length remains the same', () => {
    const testArray = [1, 2, 3, 4, 5]
    const result = shuffleImmutable(testArray)

    expect(result).toHaveLength(testArray.length) // 长度相同 / Same length
  })

  /**
   * 测试数组元素相同（忽略顺序）
   * Test that arrays contain same elements (ignoring order)
   */
  it('arrays contain same elements (ignoring order)', () => {
    const testArray = [1, 2, 3, 4, 5]
    const result = shuffleImmutable(testArray)
    expect([...result].sort()).toEqual([...testArray].sort())
  })
})

describe('uniqueBy', () => {
  // Test 1: Basic functionality with primitive values
  // 测试1：基本功能 - 处理原始值
  it('should remove duplicates based on custom equality function', () => {
    const numbers = [1, 2, 2, 3, 4, 4, 5]
    const equalFn = (a: number, b: number) => a === b

    const result = uniqueBy(numbers, equalFn)

    expect(result).toEqual([1, 2, 3, 4, 5])
    expect(result).toHaveLength(5)
  })

  // Test 2: Handling objects with custom equality logic
  // 测试2：处理对象 - 使用自定义相等逻辑
  it('should remove duplicate objects based on custom comparison', () => {
    const users = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice' }, // Duplicate ID
      { id: 3, name: 'Charlie' },
    ]

    // Compare objects by id property
    // 根据id属性比较对象
    const equalFn = (a: any, b: any) => a.id === b.id

    const result = uniqueBy(users, equalFn)

    expect(result).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ])
    expect(result).toHaveLength(3)
  })

  // Test 3: Empty array should return empty array
  // 测试3：空数组应返回空数组
  it('should return empty array when input is empty', () => {
    const equalFn = (a: any, b: any) => a === b
    const result = uniqueBy([], equalFn)

    expect(result).toEqual([])
    expect(result).toHaveLength(0)
  })

  // Test 4: Array with all unique elements should remain unchanged
  // 测试4：所有元素都唯一的数组应保持不变
  it('should return same array when all elements are unique', () => {
    const letters = ['a', 'b', 'c', 'd']
    const equalFn = (a: string, b: string) => a === b

    const result = uniqueBy(letters, equalFn)

    expect(result).toEqual(['a', 'b', 'c', 'd'])
    expect(result).toHaveLength(4)
  })

  // Test 5: Complex equality function with nested properties
  // 测试5：使用嵌套属性的复杂相等函数
  it('should handle complex equality functions', () => {
    const products = [
      { id: 1, details: { name: 'Laptop', price: 1000 } },
      { id: 2, details: { name: 'Phone', price: 500 } },
      { id: 1, details: { name: 'Laptop', price: 1000 } }, // Duplicate
      { id: 3, details: { name: 'Tablet', price: 300 } },
    ]

    // Compare by id and details.name
    // 根据id和details.name进行比较
    const equalFn = (a: any, b: any) => a.id === b.id && a.details.name === b.details.name

    const result = uniqueBy(products, equalFn)

    expect(result).toHaveLength(3)
    expect(result[0].id).toBe(1)
    expect(result[1].id).toBe(2)
    expect(result[2].id).toBe(3)
  })

  // Test 6: Preserve first occurrence of duplicates
  // 测试6：保留重复元素的首次出现
  it('should preserve the first occurrence of duplicate elements', () => {
    const items = [
      { id: 1, value: 'first' },
      { id: 2, value: 'second' },
      { id: 1, value: 'third' }, // Same id, different value
      { id: 3, value: 'fourth' },
    ]

    const equalFn = (a: any, b: any) => a.id === b.id
    const result = uniqueBy(items, equalFn)

    // Should keep the first occurrence (value: 'first')
    // 应保留首次出现（value: 'first'）
    expect(result).toEqual([
      { id: 1, value: 'first' },
      { id: 2, value: 'second' },
      { id: 3, value: 'fourth' },
    ])
  })

  // Test 7: Type safety with generic types
  // 测试7：泛型类型的类型安全
  it('should maintain type safety with TypeScript generics', () => {
    interface Person {
      age: number
      name: string
    }

    const people: Person[] = [
      { age: 25, name: 'John' },
      { age: 30, name: 'Jane' },
      { age: 25, name: 'John' }, // Duplicate
    ]

    const equalFn = (a: Person, b: Person) => a.age === b.age && a.name === b.name

    const result = uniqueBy(people, equalFn)

    expect(result[0].name).toBe('John')
    expect(result[0].age).toBe(25)
    expect(result[1].name).toBe('Jane')
    expect(result).toHaveLength(2)
  })

  // Test 8: Performance with large arrays
  // 测试8：大数组的性能测试
  it('should handle large arrays efficiently', () => {
    const largeArray = Array.from(
      { length: 1000 },
      (_, i) => Math.floor(i / 2), // Creates duplicates: 0,0,1,1,2,2,...
    )
    const equalFn = (a: number, b: number) => a === b
    const startTime = performance.now()
    const result = uniqueBy(largeArray, equalFn)
    const endTime = performance.now()
    expect(result).toHaveLength(500) // Half should be removed
    expect(endTime - startTime).toBeLessThan(100) // Should complete in <100ms
  })
})

describe('sampleWithReplacement', () => {
  // 测试基础功能 - Test basic functionality
  it('should return correct number of samples', () => {
    const array = [1, 2, 3, 4, 5]
    const quantity = 3
    const result = sampleWithReplacement(array, quantity)

    // 验证返回数组长度是否正确 - Verify the returned array length is correct
    expect(result).toHaveLength(quantity)
  })

  // 测试空数组情况 - Test empty array case
  it('should handle empty array', () => {
    const array: number[] = []
    const quantity = 3
    const result = sampleWithReplacement(array, quantity)

    // 空数组应返回指定数量的undefined - Empty array should return specified number of undefined
    expect(result).toEqual([undefined, undefined, undefined])
  })

  // 测试数量为0的情况 - Test quantity = 0 case
  it('should return empty array when quantity is 0', () => {
    const array = [1, 2, 3]
    const quantity = 0
    const result = sampleWithReplacement(array, quantity)

    // 数量为0时应返回空数组 - Should return empty array when quantity is 0
    expect(result).toEqual([])
  })

  // 测试数量为负数的情况 - Test negative quantity case
  it('should handle negative quantity', () => {
    const array = [1, 2, 3]
    const quantity = -2
    const result = sampleWithReplacement(array, quantity)

    // 负数数量应返回空数组 - Negative quantity should return empty array
    expect(result).toEqual([])
  })

  // 测试有放回抽样的随机性 - Test randomness of sampling with replacement
  it('should allow duplicate samples (with replacement)', () => {
    const array = [1, 2]
    const quantity = 10
    const result = sampleWithReplacement(array, quantity)

    // 验证所有元素都来自原数组 - Verify all elements come from original array
    result.forEach((item) => {
      expect(array).toContain(item)
    })

    // 由于是有放回抽样，可能包含重复元素 - May contain duplicates due to sampling with replacement
    // 注意：这是一个概率性测试，极端情况下可能失败 - Note: This is a probabilistic test, may fail in extreme cases
    const hasDuplicates = new Set(result).size < result.length
    expect(hasDuplicates).toBe(true)
  })

  // 测试类型安全性 - Test type safety
  it('should maintain type safety', () => {
    const array = ['a', 'b', 'c']
    const quantity = 2
    const result = sampleWithReplacement(array, quantity)

    // 验证返回类型正确 - Verify return type is correct
    expect(typeof result[0]).toBe('string')
    expect(typeof result[1]).toBe('string')
  })

  // 测试边界情况：数量大于数组长度 - Test edge case: quantity > array length
  it('should work when quantity exceeds array length', () => {
    const array = [1, 2]
    const quantity = 5
    const result = sampleWithReplacement(array, quantity)

    // 即使数量超过数组长度，也应返回指定数量的样本 - Should return specified quantity even when exceeding array length
    expect(result).toHaveLength(quantity)

    // 所有元素应来自原数组 - All elements should come from original array
    result.forEach((item) => {
      expect(array).toContain(item)
    })
  })

  // 测试随机数种子（可选） - Test random seed (optional)
  // 注意：在实际测试中，可能需要模拟Math.random - Note: May need to mock Math.random in actual tests
  it('should use Math.random for sampling', () => {
    const array = [1, 2, 3, 4, 5]
    const quantity = 3

    // 保存原始Math.random - Save original Math.random
    const originalRandom = Math.random
    let randomCallCount = 0

    // 模拟Math.random - Mock Math.random
    Math.random = vi.fn(() => {
      randomCallCount++
      return 0.5 // 固定返回值 - Fixed return value
    })

    try {
      const result = sampleWithReplacement(array, quantity)
      // 验证Math.random被调用了指定次数 - Verify Math.random was called specified times
      expect(randomCallCount).toBe(quantity)
      // 使用固定随机数时，结果应可预测 - Results should be predictable with fixed random value
      expect(result).toEqual([array[2], array[2], array[2]]) // 0.5 * 5 = 2.5, floor = 2
    } finally {
      // 恢复原始Math.random - Restore original Math.random
      Math.random = originalRandom
    }
  })
})

describe('sampleWithoutReplacement', () => {
  // 测试基础功能 - 正确抽样数量
  // Test basic functionality - correct sampling quantity
  it('should return correct number of samples', () => {
    const array = [1, 2, 3, 4, 5]
    const quantity = 3
    const result = sampleWithoutReplacement(array, quantity)

    expect(result).toHaveLength(quantity)
  })

  // 测试抽样元素来自原数组
  // Test that sampled elements come from original array
  it('should return elements from original array', () => {
    const array = [1, 2, 3, 4, 5]
    const quantity = 3
    const result = sampleWithoutReplacement(array, quantity)

    result.forEach((element) => {
      expect(array).toContain(element)
    })
  })

  // 测试无重复抽样
  // Test sampling without replacement
  it('should not return duplicate elements', () => {
    const array = [1, 2, 3, 4, 5]
    const quantity = 3
    const result = sampleWithoutReplacement(array, quantity)

    // 检查结果中是否有重复元素
    // Check for duplicate elements in result
    const uniqueElements = new Set(result)
    expect(uniqueElements.size).toBe(result.length)
  })

  // 测试边界情况：请求数量等于数组长度
  // Test edge case: requested quantity equals array length
  it('should return shuffled array when quantity equals array length', () => {
    const array = [1, 2, 3, 4, 5]
    const result = sampleWithoutReplacement(array, array.length)

    expect(result).toHaveLength(array.length)
    // 检查是否包含所有原始元素（顺序可能不同）
    // Check if contains all original elements (order may differ)
    expect(result.sort()).toEqual(array.sort())
  })

  // 测试错误处理：请求数量超过数组长度
  // Test error handling: requested quantity exceeds array length
  it('should throw error when quantity exceeds array length', () => {
    const array = [1, 2, 3]
    const quantity = 5

    expect(() => {
      sampleWithoutReplacement(array, quantity)
    }).toThrow(`Requested quantity (${quantity}) exceeds array length (${array.length})`)
  })

  // 测试边界情况：空数组
  // Test edge case: empty array
  it('should handle empty array with quantity 0', () => {
    const array: number[] = []
    const quantity = 0
    const result = sampleWithoutReplacement(array, quantity)

    expect(result).toHaveLength(0)
  })

  // 测试边界情况：请求数量为0
  // Test edge case: requested quantity is 0
  it('should return empty array when quantity is 0', () => {
    const array = [1, 2, 3, 4, 5]
    const quantity = 0
    const result = sampleWithoutReplacement(array, quantity)

    expect(result).toHaveLength(0)
  })

  // 测试随机性：多次抽样结果不同
  // Test randomness: multiple sampling yields different results
  it('should produce different results on multiple calls', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const quantity = 3
    const results = new Set<string>()
    const iterations = 100

    for (let i = 0; i < iterations; i++) {
      const result = sampleWithoutReplacement(array, quantity)
      results.add(JSON.stringify(result.sort()))
    }

    // 多次抽样应该产生不同的组合（高概率）
    // Multiple sampling should produce different combinations (with high probability)
    expect(results.size).toBeGreaterThan(1)
  })

  // 测试不修改原数组
  // Test that original array is not modified
  it('should not modify original array', () => {
    const originalArray = [1, 2, 3, 4, 5]
    const arrayCopy = [...originalArray]
    const quantity = 3

    sampleWithoutReplacement(originalArray, quantity)

    expect(originalArray).toEqual(arrayCopy)
  })

  // 测试不同类型数组
  // Test with different array types
  it('should work with string arrays', () => {
    const array = ['a', 'b', 'c', 'd', 'e']
    const quantity = 2
    const result = sampleWithoutReplacement(array, quantity)

    expect(result).toHaveLength(quantity)
    result.forEach((element) => {
      expect(array).toContain(element)
    })
  })

  it('should work with object arrays', () => {
    const array = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const quantity = 2
    const result = sampleWithoutReplacement(array, quantity)

    expect(result).toHaveLength(quantity)
    result.forEach((element) => {
      expect(array).toContain(element)
    })
  })
})
