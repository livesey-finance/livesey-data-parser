import { FinancialParser } from './financialParser.js';

const url = 'https://finviz.com/quote.ashx?t=AAPL&p=d';
const parser = new FinancialParser(url);

let requestCount = 0;

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

      // Extract and print data from the parsed HTML using the financialParser methods
      console.log('Ticker Symbol:', parser.tickerSymbol);
      console.log('Current Price:', parser.currentPrice);
      console.log('Stock Full Name:', parser.stockFullName);
      console.log('Price:', parser.price);
      console.log('Market Cap:', parser.marketCapitalization);
      console.log('P/E Ratio:', parser.peRatio);
      console.log('Income:', parser.income);
      console.log('Sales:', parser.sales);
      console.log('Book/Share:', parser.bookSh);
      console.log('Cash/Share:', parser.cashSh);
      console.log('Dividend Estimate:', parser.dividendEstimation);
      console.log('Dividend TTM:', parser.dividendTtm);
      console.log('Forward P/E Ratio:', parser.forwardPeRatio);
      console.log('PEG Ratio:', parser.pegRatio);
      console.log('PS Ratio:', parser.psRatio);
      console.log('PB Ratio:', parser.pbRatio);
      console.log('PC Ratio:', parser.pcRatio);
      console.log('P/FCF Ratio:', parser.pFcfRatio);
      console.log('Quick Ratio:', parser.quickRatio);
      console.log('Current Ratio:', parser.currentRatio);
      console.log('Debt/Equity:', parser.debtEq);
      console.log('Long Term Debt/Equity:', parser.ltDebtEq);
      //console.log('EPS TTM:', parser.epsTtm);
      console.log('ROA:', parser.roa);
      console.log('ROE:', parser.roe);
      console.log('ROI:', parser.roi);
      console.log('Volume:', parser.volume);
      console.log('Beta:', parser.beta);
      console.log('Change:', parser.change);

    } catch (err) {
      console.error('Request error:', err.message);
    }
  } else {
    console.log('Request limit exceeded, stopping...');
    clearInterval(intervalId);
  }
}, 1000);
