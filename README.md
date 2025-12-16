<p align="center">
  <a href="https://supuwoerc.github.io/toolkit/"><img src="./utils.png" width='360' style='border-radius:20px;'></a>
  <br/>
  <br/>
  <a href="./README.md"><img alt="README in English" src="https://img.shields.io/badge/English-d9d9d9"></a>
  <a href="./README.zh_CN.md"><img alt="简体中文文档" src="https://img.shields.io/badge/简体中文-d9d9d9"></a>
  <img src="https://github.com/supuwoerc/toolkit/actions/workflows/tests.yml/badge.svg">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg">
  <img src="https://img.shields.io/npm/v/@supuwoerc/toolkit">
  <img src="https://img.shields.io/badge/docs-github_pages-blue">
</p>

# @supuwoerc/toolkit

A collection of utility functions for JavaScript/TypeScript.

## Features

- **TypeScript support**: Fully typed with generics.
- **Tested**: Comprehensive test suite with Vitest.
- **Documented**: Auto-generated API documentation via TypeDoc.

## Installation

```bash
npm install @supuwoerc/toolkit
```

or using pnpm:

```bash
pnpm add @supuwoerc/toolkit
```

or using yarn:

```bash
yarn add @supuwoerc/toolkit
```

## Usage

### ES Modules / TypeScript

```ts
import { array2Tree, pick, shuffle, sleep, tree2Array, withTimeout } from '@supuwoerc/toolkit'

// Convert flat array to tree
const flat = [
  { id: 1, parentId: null },
  { id: 2, parentId: 1 },
  { id: 3, parentId: 1 },
]
const tree = array2Tree(flat, { idKey: 'id', parentKey: 'parentId' })
console.log(tree)

// Shuffle an array
const arr = [1, 2, 3, 4, 5]
const shuffled = shuffle(arr)
console.log(shuffled)

// Pick properties from an object
const obj = { a: 1, b: 2, c: 3 }
const picked = pick(obj, ['a', 'c']) // { a: 1, c: 3 }

// Sleep for 1 second
await sleep(1000)

// Timeout a promise
try {
  const result = await withTimeout(fetch('https://example.com'), 5000)
} catch (err) {
  console.log('Timeout or error', err)
}
```

### CommonJS

```js
const { shuffle } = require('@supuwoerc/toolkit')
```

## API Documentation

Full API documentation is available at [https://supuwoerc.github.io/toolkit/](https://supuwoerc.github.io/toolkit/).

You can also generate documentation locally:

```bash
pnpm run doc
```

Then open `docs/index.html` in your browser.

## Development

### Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm

### Setup

```bash
git clone https://github.com/supuwoerc/toolkit.git
pnpm install
```

### Build

```bash
pnpm run build
```

### Test

```bash
pnpm test           # run tests once
pnpm test:watch     # run tests in watch mode
pnpm test:ui        # open Vitest UI
pnpm test:coverage  # generate coverage report
```

### Lint

```bash
pnpm run lint
```

### Release

Releases are automated via [release-it](https://github.com/release-it/release-it). To create a new release:

```bash
pnpm run release
```

This will run tests, build, update changelog, tag, and publish to npm.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Add tests for your changes.
5. Ensure linting passes.
6. Submit a pull request.

## License

MIT © [Idris](https://github.com/supuwoerc). See [LICENSE](./LICENSE) for details.
