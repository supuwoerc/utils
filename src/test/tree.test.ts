import type { Tree, TreeNode } from '@/tree'
import { describe, expect, it } from 'vitest'
import { filterTree, getParents, getSubtreeByDepth, getTargetFromTree, tree2Array } from '@/tree'

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

describe('filterTree', () => {
  // 测试数据
  const tree: Tree<TreeNode>[] = [
    {
      id: 1,
      title: 'Parent',
      children: [
        {
          id: 2,
          title: 'Child 1',
          children: [
            { id: 3, title: 'Grandchild 1' },
            { id: 4, title: 'Grandchild 2' },
          ],
        },
        {
          id: 5,
          title: 'Child 2',
          children: [{ id: 6, title: 'Grandchild 3' }],
        },
      ],
    },
    {
      id: 7,
      title: 'Another Root',
      children: [],
    },
  ]

  it('should filter nodes matching predicate', () => {
    const result = filterTree(tree, (node) => node.title.includes('Child'))
    // 预期保留包含 'Child' 的节点及其父节点和子节点
    expect(result).toHaveLength(1) // 根节点 'Parent' 被保留，因为其子节点匹配
    expect(result[0].id).toBe(1)
    expect(result[0].children).toHaveLength(2) // 两个子节点都保留
    expect(result[0].children?.[0]?.id).toBe(2)
    expect(result[0].children?.[1]?.id).toBe(5)
  })

  it('should prune branches with no matches', () => {
    const result = filterTree(tree, (node) => node.title.includes('Grandchild'))
    // 只有包含 'Grandchild' 的节点及其祖先被保留
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
    expect(result[0].children).toHaveLength(2) // Child 1 和 Child 2 都有 Grandchild
    // 检查子节点是否被修剪（它们本身不匹配，但子节点匹配）
    expect(result[0].children?.[0]?.children).toHaveLength(2)
    expect(result[0].children?.[1]?.children).toHaveLength(1)
  })

  it('should return empty array if no matches', () => {
    const result = filterTree(tree, (node) => node.title.includes('Nonexistent'))
    expect(result).toEqual([])
  })

  it('should handle empty tree', () => {
    const result = filterTree([] as any, (node) => node.title.includes('anything'))
    expect(result).toEqual([])
  })

  it('should work with custom children key', () => {
    const customTree = [
      {
        id: 1,
        title: 'Parent',
        subs: [{ id: 2, title: 'Child' }],
      },
    ]
    const result = filterTree(customTree, (node) => node.title.includes('Child'), 'subs')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
    expect(result[0].subs).toHaveLength(1)
  })
})

describe('getSubtreeByDepth', () => {
  // Test data structure
  // 测试数据结构
  const mockTree = [
    {
      id: 1,
      name: 'Node 1',
      children: [
        {
          id: 2,
          name: 'Node 1-1',
          children: [
            { id: 3, name: 'Node 1-1-1', children: [] },
            { id: 4, name: 'Node 1-1-2', children: [] },
          ],
        },
        { id: 5, name: 'Node 1-2', children: [] },
      ],
    },
    {
      id: 6,
      name: 'Node 2',
      children: [{ id: 7, name: 'Node 2-1', children: [] }],
    },
  ]

  // Test case 1: Get subtree with depth 0 (only root nodes)
  // 测试用例1：获取深度为0的子树（仅根节点）
  it('should return only root nodes when maxDepth is 0', () => {
    const result = getSubtreeByDepth(mockTree, 0)

    expect(result).toEqual([
      {
        id: 1,
        name: 'Node 1',
        children: [], // Children should be empty array at depth 0
        // 深度为0时子节点应为空数组
      },
      {
        id: 6,
        name: 'Node 2',
        children: [],
      },
    ])
  })

  // Test case 2: Get subtree with depth 1 (root nodes and their direct children)
  // 测试用例2：获取深度为1的子树（根节点及其直接子节点）
  it('should return nodes up to depth 1', () => {
    const result = getSubtreeByDepth(mockTree, 1)

    expect(result).toEqual([
      {
        id: 1,
        name: 'Node 1',
        children: [
          {
            id: 2,
            name: 'Node 1-1',
            children: [], // Children should be empty at depth 1
            // 深度为1时子节点应为空
          },
          {
            id: 5,
            name: 'Node 1-2',
            children: [],
          },
        ],
      },
      {
        id: 6,
        name: 'Node 2',
        children: [
          {
            id: 7,
            name: 'Node 2-1',
            children: [],
          },
        ],
      },
    ])
  })

  // Test case 3: Get subtree with depth 2 (full tree in this case)
  // 测试用例3：获取深度为2的子树（本例中的完整树）
  it('should return full tree when maxDepth is 2', () => {
    const result = getSubtreeByDepth(mockTree, 2)

    expect(result).toEqual(mockTree)
  })

  // Test case 4: Get subtree with depth greater than tree depth
  // 测试用例4：获取深度大于树深度的子树
  it('should return full tree when maxDepth exceeds tree depth', () => {
    const result = getSubtreeByDepth(mockTree, 5)

    expect(result).toEqual(mockTree)
  })

  // Test case 5: Tree with custom children key
  // 测试用例5：使用自定义子节点键的树
  it('should work with custom children key', () => {
    const customTree = [
      {
        id: 1,
        name: 'Node 1',
        subNodes: [
          {
            id: 2,
            name: 'Node 1-1',
            subNodes: [],
          },
        ],
      },
    ]

    const result = getSubtreeByDepth(customTree, 1, 'subNodes')

    expect(result).toEqual([
      {
        id: 1,
        name: 'Node 1',
        subNodes: [
          {
            id: 2,
            name: 'Node 1-1',
            subNodes: [],
          },
        ],
      },
    ])
  })

  // Test case 6: Empty tree
  // 测试用例6：空树
  it('should return empty array for empty tree', () => {
    const result = getSubtreeByDepth([], 2)

    expect(result).toEqual([])
  })

  // Test case 7: Tree with null/undefined children
  // 测试用例7：包含null/undefined子节点的树
  it('should handle nodes with null or undefined children', () => {
    const treeWithNullChildren = [
      {
        id: 1,
        name: 'Node 1',
        children: null,
      },
      {
        id: 2,
        name: 'Node 2',
        children: undefined,
      },
      {
        id: 3,
        name: 'Node 3',
        // No children property
        // 没有children属性
      },
    ]

    const result = getSubtreeByDepth(treeWithNullChildren, 2)

    expect(result).toEqual(treeWithNullChildren)
  })

  // Test case 8: Verify original tree is not mutated
  // 测试用例8：验证原始树未被修改
  it('should not mutate the original tree', () => {
    const originalTree = JSON.parse(JSON.stringify(mockTree))
    getSubtreeByDepth(mockTree, 1)

    expect(mockTree).toEqual(originalTree)
  })

  // Test case 9: Tree with mixed node types
  // 测试用例9：包含混合节点类型的树
  it('should handle tree with additional properties', () => {
    const complexTree = [
      {
        id: 1,
        name: 'Node 1',
        value: 100,
        enabled: true,
        children: [
          {
            id: 2,
            name: 'Node 1-1',
            value: 50,
            enabled: false,
            children: [],
          },
        ],
      },
    ]

    const result = getSubtreeByDepth(complexTree, 1)

    expect(result).toEqual([
      {
        id: 1,
        name: 'Node 1',
        value: 100,
        enabled: true,
        children: [
          {
            id: 2,
            name: 'Node 1-1',
            value: 50,
            enabled: false,
            children: [],
          },
        ],
      },
    ])
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
