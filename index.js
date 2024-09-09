import { Parser } from './src/parser.js';

const parser = new Parser('https://finviz.com/quote.ashx?t=AAPL', 4, 2, 10000, 15000);

function testQueueFetch() {
  const urls = [
    'https://finviz.com/quote.ashx?t=AAPL',
    'https://finviz.com/quote.ashx?t=NKE',
    'https://finviz.com/quote.ashx?t=MSFT',
    'https://finviz.com/quote.ashx?t=GOOGL',
    'https://finviz.com/quote.ashx?t=NVDA',
    'https://finviz.com/quote.ashx?t=AMZN',
    'https://finviz.com/quote.ashx?t=TSLA',
    //'https://finviz.com/quote.ashx?t=ІВФвф',
  ];

  parser.queueFetch(urls);

  parser.queue.process(async (task, next) => {
    try {
      parser.url = task.url;  // Встановлюємо правильний URL
      await parser.fetchHTML();

      // Додатковий вивід для налагодження, щоб перевірити, що HTML був отриманий

      const ticker = parser.extractValue(/<h2[^>]*>\s*<a[^>]*>\s*(.*?)\s*<\/a>\s*<\/h2>/);  // Використовуємо правильний regex
      console.assert(['AAPL', 'NKE', 'MSFT'].includes(ticker), `Expected one of the tickers, Got: ${ticker}`);
      console.log(`Fetched and processed: ${ticker}`);
    } catch (error) {
      console.error('Queue fetch error:', error.message);
    }
    next();
  });
}

testQueueFetch();
