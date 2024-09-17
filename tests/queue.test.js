import { AsyncQueue } from 'livesey-utilities';
import { Parser } from '../src/parser.js';

async function mockHttpClient(options) {
  const { path } = options;

  if (path.includes('AAPL')) {
    return `
      <html>
        <body>
          <h2><a href="#">AAPL</a></h2>
        </body>
      </html>
    `;
  } else if (path.includes('NKE')) {
    return `
      <html>
        <body>
          <h2><a href="#">NKE</a></h2>
        </body>
      </html>
    `;
  } else if (path.includes('MSFT')) {
    return `
      <html>
        <body>
          <h2><a href="#">MSFT</a></h2>
        </body>
      </html>
    `;
  } else if (path.includes('GOOGL')) {
    return `
      <html>
        <body>
          <h2><a href="#">GOOGL</a></h2>
        </body>
      </html>
    `;
  }

  return `
    <html>
      <body>
        <h2><a href="#">OTHER</a></h2>
      </body>
    </html>
  `;
}

function testQueue() {
  console.log('Testing Queue class...');

  const queue = AsyncQueue.channels(2)
    .wait(5000)
    .timeout(10000);

  let processedTasks = 0;

  const taskProcessor = (task) => new Promise((resolve) => {
    console.log(`Processing task: ${task.name}`);
    setTimeout(() => {
      console.log(`Finished task: ${task.name}`);
      processedTasks++;
      resolve(task);
    }, 1000);
  });

  queue.add(() => taskProcessor({ name: 'Task 1' }));
  queue.add(() => taskProcessor({ name: 'Task 2' }));
  queue.add(() => taskProcessor({ name: 'Task 3' }));

  queue.drain(() => {
    if (processedTasks === 3) {
      console.log('Queue test passed ✔️');
    } else {
      console.error('Queue test failed ❌');
    }
  });
}

function testParserQueueFetch() {
  console.log('Testing Parser with Queue fetch...');

  const parser = new Parser('https://finviz.com/quote.ashx?t=AAPL', 4, 2, 1000, 5000, mockHttpClient);

  const urls = [
    'https://finviz.com/quote.ashx?t=AAPL',
    'https://finviz.com/quote.ashx?t=NKE',
    'https://finviz.com/quote.ashx?t=MSFT',
    'https://finviz.com/quote.ashx?t=GOOGL'
  ];

  let processedUrls = 0;

  const taskProcessor = async (task) => {
    try {
      parser.url = task.url;
      await parser.fetchHTML();
      const ticker = parser.extractValue(/<h2[^>]*>\s*<a[^>]*>\s*(.*?)\s*<\/a>\s*<\/h2>/);

      console.assert(['AAPL', 'NKE', 'MSFT', 'GOOGL'].includes(ticker), `Expected one of the tickers, Got: ${ticker}`);
      console.log(`Fetched and processed: ${ticker}`);
      processedUrls++;
    } catch (error) {
      console.error('Queue fetch error:', error.message);
    }
  };
  // Add tasks to the queue and process them
  urls.forEach((url) => {
    parser.queue.add(() => taskProcessor({ url }));
  });

  parser.queue.drain(() => {
    console.log('All URLs processed');
    if (processedUrls === urls.length) {
      console.log('Parser queueFetch test passed ✔️');
    } else {
      console.error('Parser queueFetch test failed ❌');
    }
  });
}

testQueue();
testParserQueueFetch();
