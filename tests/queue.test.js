import { Queue } from '../src/queue.js';  // Імпорт вашого класу Queue
import { Parser } from '../src/parser.js';  // Імпорт класу Parser

// Мок (фіктивний) клієнт для тестування, який повертає HTML сторінку з відповідними тегами
async function mockHttpClient(options) {
  const { path } = options;

  // Повертаємо різний HTML залежно від URL
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

  // За замовчуванням повертаємо HTML з іншими значеннями
  return `
    <html>
      <body>
        <h2><a href="#">OTHER</a></h2>
      </body>
    </html>
  `;
}

// Тест класу Queue
function testQueue() {
  console.log('Testing Queue class...');

  const queue = Queue.channels(2)  // Обмеження 2 одночасних завдань
    .wait(5000)  // Тайм-аут очікування 5 секунд
    .timeout(10000);  // Тайм-аут обробки завдання 10 секунд

  let processedTasks = 0;

  // Обробка завдань
  queue.process((task, next) => {
    console.log(`Processing task: ${task.name}`);
    setTimeout(() => {
      console.log(`Finished task: ${task.name}`);
      processedTasks++;
      next();  // Викликаємо наступне завдання
    }, 1000);  // Кожне завдання обробляється 1 секунду
  });

  queue.drain(() => {
    console.log('All tasks processed');
    if (processedTasks === 3) {
      console.log('Queue test passed ✔️');
    } else {
      console.error('Queue test failed ❌');
    }
  });

  // Додавання завдань у чергу
  queue.add({ name: 'Task 1' });
  queue.add({ name: 'Task 2' });
  queue.add({ name: 'Task 3' });
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

  parser.queue.process(async (task, next) => {
    try {
      parser.url = task.url;  // Set the URL correctly
      const html = await parser.fetchHTML();  // Fetch HTML from mock client
      const ticker = parser.extractValue(/<h2[^>]*>\s*<a[^>]*>\s*(.*?)\s*<\/a>\s*<\/h2>/);  // Parse the ticker

      // Expect each ticker to match one of the known values
      console.assert(['AAPL', 'NKE', 'MSFT', 'GOOGL'].includes(ticker), `Expected one of the tickers, Got: ${ticker}`);
      console.log(`Fetched and processed: ${ticker}`);
      processedUrls++;
    } catch (error) {
      console.error('Queue fetch error:', error.message);
    }
    next();
  });

  parser.queue.drain(() => {
    console.log('All URLs processed');
    if (processedUrls === urls.length) {
      console.log('Parser queueFetch test passed ✔️');
    } else {
      console.error('Parser queueFetch test failed ❌');
    }
  });

  // Adding URLs to the queue
  urls.forEach(url => parser.queue.add({ url }));
}



// Запуск тестів
testQueue();
testParserQueueFetch();
