import { Parser } from './parser.js';

const url = 'https://finviz.com/quote.ashx?t=AAPL&p=d';
const parser = new Parser(url);

let requestCount = 0; // Request counter

const fakeReq = {
  headers: {
    'x-forwarded-for': '192.168.1.1'
  },
  socket: {
    remoteAddress: '192.168.1.2'
  }
};

const ip = parser.getClientIp(fakeReq);


const intervalId = setInterval(async () => {
  requestCount++;
  console.log(`Request #${requestCount}`);

  // Simulate request using a fake `req` object
  const canRequest = parser.checkRequestLimit();

  if (canRequest) {
    try {
      await parser.fetchHTML();
      parser.parseData();
      parser.printData();
    } catch (err) {
      console.error('Request error:', err.message);
    }
  } else {
    console.log('Request limit exceeded, stopping...');
    clearInterval(intervalId);
  }
}, 1000);
