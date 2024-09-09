import { Parser } from '../src/parser.js';

// Create a mock HTTP client for testing
async function mockHttpClient(options) {
  return new Promise((resolve) => {
    // You can simulate simple HTML pages for testing
    const fakeHtml = `
      <html>
        <head><title>Test Page</title></head>
        <body>
          <div id="content">Hello, world!</div>
          <span class="value">42</span>
        </body>
      </html>
    `;
    resolve(fakeHtml);
  });
}

// Testing the main methods of the Parser class
(async () => {
  console.log('Starting tests for Parser class...');

  // Test 1: Creating the parser and fetching a page
  const url = 'https://example.com'; // Fake URL for testing
  const parser = new Parser(url, 5, 2, 1000, 5000, mockHttpClient); // Using the mock HTTP client

  try {
    await parser.fetchHTML();
    console.log('fetchHTML() Test Passed ✔️');
  } catch (error) {
    console.error('fetchHTML() Test Failed ❌', error);
  }

  // Test 2: Verifying data parsing
  const dataToParse = {
    title: '<title>(.*?)</title>',
    content: '<div id="content">(.*?)</div>',
    value: '<span class="value">(.*?)</span>',
  };

  try {
    parser.parseData(dataToParse);
    console.log('Parsed Data:', parser.data);
    if (parser.data.title === 'Test Page' && parser.data.content === 'Hello, world!' && parser.data.value === '42') {
      console.log('parseData() Test Passed ✔️');
    } else {
      console.error('parseData() Test Failed ❌');
    }
  } catch (error) {
    console.error('parseData() Test Failed ❌', error);
  }

  // Test 3: Checking request limit enforcement
  const req1 = { headers: {}, socket: { remoteAddress: '1.1.1.1' } };
  const req2 = { headers: {}, socket: { remoteAddress: '1.1.1.1' } }; // Same IP

  try {
    const result1 = parser.checkRequestLimit(req1);
    const result2 = parser.checkRequestLimit(req2);

    if (result1 && result2) {
      console.log('checkRequestLimit() Test Passed ✔️');
    } else {
      console.error('checkRequestLimit() Test Failed ❌');
    }
  } catch (error) {
    console.error('checkRequestLimit() Test Failed ❌', error);
  }

  // Test 4: Verifying queueFetch
  const urls = ['https://example.com', 'https://example.org'];
  parser.queueFetch(urls);
  console.log('queueFetch() Test Passed ✔️');

  console.log('All tests completed.');
})();
