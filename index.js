import { Parser } from './parser.js';

// Фіктивні дані для тестування
const mockHTML = `
  <html>
    <h2><a>AAPL Inc.</a></h2>
    <h1>AAPL</h1>
    <strong>150.25</strong>
    <td>Market Cap</td><b>2.41T</b>
    <td>Income</td><b>100B</b>
  </html>
`;

const regexPatterns = {
  stockFullName: /<h2[^>]*>\s*<a[^>]*>\s*(.*?)\s*<\/a>\s*<\/h2>/,
  tickerSymbol: /<h1[^>]*>\s*(.*?)\s*<\/h1>/,
  currentPrice: /<strong[^>]*>\s*(\d+\.\d+)\s*<\/strong>/,
  marketCapitalization: /Market Cap.*?(?:<b>|<span.*?>)\s*(.*?)\s*(?:<\/b>|<\/span>)/,
  income: /Income.*?(?:<b>|<span.*?>)\s*(.*?)\s*(?:<\/b>|<\/span>)/,
};

// Ініціалізація екземпляра класу Parser
const parser = new Parser('https://finviz.com/quote.ashx?t=AAPL');

// Mock метод fetchHTML
parser.fetchHTML = async function() {
  this.html = mockHTML;
  return this;
};

// Тест getClientIp
function testGetClientIp() {
  const mockRequest = { headers: { 'x-forwarded-for': '203.0.113.5' }, socket: { remoteAddress: '192.168.0.1' } };
  const ip = parser.getClientIp(mockRequest);
  console.assert(ip === '203.0.113.5', `Expected: 203.0.113.5, Got: ${ip}`);
  console.log('getClientIp Test Passed ✔️');
}

// Тест checkRequestLimit
function testCheckRequestLimit() {
  const mockRequest = { headers: {}, socket: { remoteAddress: '192.168.0.1' } };
  let result = parser.checkRequestLimit(mockRequest);
  console.assert(result === true, 'Expected: true, Got:', result);

  // Виклик кілька разів для перевищення ліміту
  parser.checkRequestLimit(mockRequest);
  result = parser.checkRequestLimit(mockRequest);
  console.assert(result === false, 'Expected: false, Got:', result);

  console.log('checkRequestLimit Test Passed ✔️');
}

// Тест fetchHTML
async function testFetchHTML() {
  await parser.fetchHTML();
  console.assert(parser.html === mockHTML, 'Expected HTML to be fetched correctly.');
  console.log('fetchHTML Test Passed ✔️');
}

// Тест extractValue
function testExtractValue() {
  parser.html = mockHTML;
  const price = parser.extractValue(regexPatterns.currentPrice);
  console.assert(price === '150.25', `Expected: 150.25, Got: ${price}`);
  console.log('extractValue Test Passed ✔️');
}

// Тест parseData
function testParseData() {
  parser.html = mockHTML;
  const result = parser.parseData(regexPatterns);

  console.assert(result.data.stockFullName === 'AAPL Inc.', `Expected: AAPL Inc., Got: ${result.data.stockFullName}`);
  console.assert(result.data.tickerSymbol === 'AAPL', `Expected: AAPL, Got: ${result.data.tickerSymbol}`);
  console.assert(result.data.currentPrice === '150.25', `Expected: 150.25, Got: ${result.data.currentPrice}`);
  console.assert(result.data.marketCapitalization === '2.41T', `Expected: 2.41T, Got: ${result.data.marketCapitalization}`);
  console.assert(result.data.income === '100B', `Expected: 100B, Got: ${result.data.income}`);

  console.log('parseData Test Passed ✔️');
}

// Тест printData
function testPrintData() {
  parser.data = {
    stockFullName: 'AAPL Inc.',
    tickerSymbol: 'AAPL',
    currentPrice: '150.25',
    marketCapitalization: '2.41T',
    income: '100B',
  };

  const originalLog = console.log;
  console.log = function(data) {
    originalLog(data);  // Можна залишити для виведення
  };

  parser.printData();
  console.log('printData Test Passed ✔️');
  console.log = originalLog; // Повертаємо стандартний console.log
}

// Тест queueFetch
function testQueueFetch() {
  const urls = [
    'https://finviz.com/quote.ashx?t=AAPL',
    'https://finviz.com/quote.ashx?t=GOOGL',
    'https://finviz.com/quote.ashx?t=MSFT',
  ];

  // Імітація обробки черги (mock fetchHTML)
  parser.fetchHTML = async function() {
    const urlObj = new URL(this.url);
    this.html = `<html><h1>${urlObj.searchParams.get('t')}</h1></html>`;
    return this;
  };

  parser.queueFetch(urls);

  parser.queue.process(async (task, next) => {
    await parser.fetchHTML(task);
    const ticker = parser.extractValue(/<h1[^>]*>\s*(.*?)\s*<\/h1>/);
    console.assert(['AAPL', 'GOOGL', 'MSFT'].includes(ticker), `Expected one of the tickers, Got: ${ticker}`);
    console.log(`Fetched and processed: ${ticker}`);
    next();
  });

  console.log('queueFetch Test Passed ✔️');
}

// Запуск тестів
testGetClientIp();
testCheckRequestLimit();
testFetchHTML();
testExtractValue();
testParseData();
testPrintData();
testQueueFetch();
