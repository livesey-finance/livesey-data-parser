# livesey-data-parser

![version](https://img.shields.io/badge/version-1.0.1-blue)
![license](https://img.shields.io/badge/license-ISC-green)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-orange)

## Overview

`livesey-data-parser` is a powerful financial data parser designed for web scraping and data extraction from various financial websites. This module is optimized for large datasets, supports proxies (with rotating proxies), and manages request rates through task queues.

## Features

- 🌐 **Web scraping**: Scrape financial data from multiple sources.
- 📊 **Data extraction**: Extract key metrics from raw HTML using customizable regular expressions.
- 🚀 **High performance**: Optimized for multiple concurrent requests with rate limiting.
- 🔁 **Proxy support**: Rotate proxies for distributed and anonymous scraping.
- 🎯 **Queue management**: Manage scraping tasks with built-in task queue functionality.

## Installation

```bash
npm install livesey-data-parser
```

## Usage

### Basic Example

Here is how to use the `Parser` class to scrape a financial website and extract data:

```js
import { Parser } from 'livesey-data-parser';

const url = 'https://example.com';
const parser = Parser.parser(url, 10, 3); // 10 requests per hour, 3 concurrent tasks

const dataConfig = {
  title: '<title>(.*?)</title>',
  content: '<div id="content">(.*?)</div>',
};

(async () => {
  await parser.fetchHTML();  // Fetch the HTML content
  parser.parseData(dataConfig);  // Parse data based on provided regex
  parser.printData();  // Output parsed data
})();
```

### Proxy Rotation Example

If you're scraping large datasets, proxy rotation is essential to avoid getting blocked. Here's an example of using proxy rotation:

```js
import { ProxyRotation } from 'livesey-data-parser';

const proxies = ['http://proxy1:8080', 'http://proxy2:8080'];

const proxyManager = new ProxyRotation(proxies, { method: 'roundRobin', timeout: 5000 });

(async () => {
  const proxy = await proxyManager.rotate();  // Fetch the next proxy in round-robin
  console.log(`Using proxy: ${proxy}`);
})();
```

### Queue Management Example

For large-scale scraping operations, the task queue can manage concurrent requests:

```js
import { Parser } from 'livesey-data-parser';

const parser = Parser.parser('https://example.com', 5, 2);  // 5 requests per hour, 2 concurrent tasks

const urls = [
  'https://example.com/page1',
  'https://example.com/page2',
  'https://example.com/page3'
];

parser.queueFetch(urls);  // Queue and process URLs
```

## API Reference

### `Parser`

- **Constructor**: `new Parser(url, maxRequestsPerHour = 4, concurrency = 1, wait = 5000, timeout = 10000, httpClient = null)`
- **Methods**:
  - `fetchHTML()`: Fetch the HTML content of the target URL.
  - `parseData(object)`: Parse the HTML based on the provided regular expressions.
  - `queueFetch(urls)`: Add multiple URLs to the task queue for scraping.
  - `printData()`: Print the parsed data in a readable format.
  - `setUrl(url)`: Set or update the URL to be scraped.

### `ProxyRotation`

- **Constructor**: `new ProxyRotation(proxies = [], options = {})`
- **Methods**:
  - `rotate()`: Rotate proxies in round-robin fashion.
  - `randomRotate()`: Select a random proxy from the list.
  - `rotateWithExclusion()`: Rotate proxies, ensuring proxies are not reused before all have been rotated.
  - `addProxy(proxy)`: Add a new proxy to the list.
  - `removeProxy(proxy)`: Remove a proxy from the list.

### `Queue`

- **Constructor**: `new Queue(concurrency)`
- **Methods**:
  - `process(listener)`: Define the task processing logic.
  - `add(task)`: Add a task to the queue.
  - `drain(listener)`: Set the function to be called when all tasks are completed.

## Running Tests

To run the tests, use the following command:

```bash
npm run test
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/my-new-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/my-new-feature`).
5. Open a pull request.

## License

This project is licensed under the ISC License. See the [LICENSE](./LICENSE) file for details.
```

This `README.md` provides a concise and structured overview of your `livesey-data-parser` module with instructions for installation, usage examples, API reference, and contribution guidelines. Let me know if you'd like to adjust anything! 😊