import { describe, expect, it } from 'vitest'
import { bfs } from '@/bfs'

// 定义测试用的树节点类型
interface TestNode {
  id: number
  name: string
  children?: TestNode[]
}

describe('bfs', () => {
  // Test Case 1: 基本功能测试 - Basic functionality test
  it('should traverse tree in BFS order', () => {
    // 创建测试树结构 - Create test tree structure
    const tree: TestNode = {
      id: 1,
      name: 'Root',
      children: [
        {
          id: 2,
          name: 'Child 1',
          children: [
            { id: 4, name: 'Grandchild 1' },
            { id: 5, name: 'Grandchild 2' },
          ],
        },
        {
          id: 3,
          name: 'Child 2',
          children: [{ id: 6, name: 'Grandchild 3' }],
        },
      ],
    }

    const visitedIds: number[] = []
    const visitedNames: string[] = []

    bfs<TestNode>(tree, (node) => {
      visitedIds.push(node.id)
      visitedNames.push(node.name)
    })

    // 验证遍历顺序 - Verify traversal order
    expect(visitedIds).toEqual([1, 2, 3, 4, 5, 6])
    expect(visitedNames).toEqual([
      'Root',
      'Child 1',
      'Child 2',
      'Grandchild 1',
      'Grandchild 2',
      'Grandchild 3',
    ])
  })

  // Test Case 2: 提前终止遍历 - Early termination
  it('should stop traversal when callback returns false', () => {
    const tree: TestNode = {
      id: 1,
      name: 'Root',
      children: [
        { id: 2, name: 'Child 1' },
        { id: 3, name: 'Child 2' },
        { id: 4, name: 'Child 3' },
      ],
    }

    const visitedIds: number[] = []

    bfs<TestNode>(tree, (node) => {
      visitedIds.push(node.id)
      // 当遇到id为3时停止遍历 - Stop traversal when id is 3
      return node.id !== 3
    })

    // 验证只遍历了前两个节点 - Verify only first two nodes were visited
    expect(visitedIds).toEqual([1, 2, 3])
  })

  // Test Case 3: 自定义children键名 - Custom children key
  it('should work with custom children key', () => {
    interface CustomNode {
      id: number
      name: string
      nodes?: CustomNode[] // 使用nodes而不是children - Use nodes instead of children
    }

    const tree: CustomNode = {
      id: 1,
      name: 'Root',
      nodes: [
        { id: 2, name: 'Child 1' },
        { id: 3, name: 'Child 2' },
      ],
    }

    const visitedIds: number[] = []

    bfs<CustomNode, 'nodes'>(
      tree,
      (node) => {
        visitedIds.push(node.id)
      },
      'nodes', // 指定自定义的children键名 - Specify custom children key
    )

    expect(visitedIds).toEqual([1, 2, 3])
  })

  // Test Case 4: 空树处理 - Empty tree handling
  it('should handle empty tree gracefully', () => {
    const visitedIds: number[] = []

    // 传入null - Pass null
    bfs<TestNode>(null as any, (node) => {
      visitedIds.push(node.id)
    })

    // 传入undefined - Pass undefined
    bfs<TestNode>(undefined as any, (node) => {
      visitedIds.push(node.id)
    })

    expect(visitedIds).toEqual([])
  })

  // Test Case 5: 循环引用检测 - Circular reference detection
  it('should handle circular references', () => {
    const node1: TestNode = { id: 1, name: 'Node 1' }
    const node2: TestNode = { id: 2, name: 'Node 2' }

    // 创建循环引用 - Create circular reference
    node1.children = [node2]
    node2.children = [node1]

    const visitedIds: number[] = []

    bfs<TestNode>(node1, (node) => {
      visitedIds.push(node.id)
    })

    // 应该只访问每个节点一次 - Should visit each node only once
    expect(visitedIds).toEqual([1, 2])
  })

  // Test Case 6: 叶子节点测试 - Leaf node test
  it('should handle leaf nodes (no children)', () => {
    const tree: TestNode = {
      id: 1,
      name: 'Leaf Node',
      // 没有children属性 - No children property
    }

    const visitedIds: number[] = []

    bfs<TestNode>(tree, (node) => {
      visitedIds.push(node.id)
    })

    expect(visitedIds).toEqual([1])
  })

  // Test Case 7: 回调函数返回值测试 - Callback return value test
  it('should handle different callback return values', () => {
    const tree: TestNode = {
      id: 1,
      name: 'Root',
      children: [{ id: 2, name: 'Child' }],
    }

    const visitedIds: number[] = []

    // 测试返回undefined - Test returning undefined
    bfs<TestNode>(tree, (node) => {
      visitedIds.push(node.id)
      // 不返回任何值 - Don't return anything (implicitly returns undefined)
    })

    expect(visitedIds).toEqual([1, 2])

    // 重置并测试返回true - Reset and test returning true
    visitedIds.length = 0
    bfs<TestNode>(tree, (node) => {
      visitedIds.push(node.id)
      return true // 继续遍历 - Continue traversal
    })

    expect(visitedIds).toEqual([1, 2])
  })

  // Test Case 8: 复杂树结构测试 - Complex tree structure test
  it('should handle complex tree structures', () => {
    const tree: TestNode = {
      id: 1,
      name: 'Level 1',
      children: [
        {
          id: 2,
          name: 'Level 2 - 1',
          children: [
            { id: 4, name: 'Level 3 - 1' },
            {
              id: 5,
              name: 'Level 3 - 2',
              children: [{ id: 8, name: 'Level 4 - 1' }],
            },
          ],
        },
        {
          id: 3,
          name: 'Level 2 - 2',
          children: [
            { id: 6, name: 'Level 3 - 3' },
            { id: 7, name: 'Level 3 - 4' },
          ],
        },
      ],
    }

    const visitedIds: number[] = []

    bfs<TestNode>(tree, (node) => {
      visitedIds.push(node.id)
    })

    // 验证广度优先顺序 - Verify breadth-first order
    expect(visitedIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })
})
