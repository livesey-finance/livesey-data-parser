import https from 'node:https';
import { URL } from 'node:url';

import { Queue } from './queue.js';

export class Parser {
  constructor(url, maxRequestsPerHour = 4, concurrency = 1, wait = 5000, timeout = 10000, httpClient = null) {
    this.url = url;
    this.wait = wait;
    this.timeout = timeout;
    this.maxRequestsPerHour = maxRequestsPerHour;
    this.requestCounts = {};
    this.html = null;
    this.data = null;
    this.blackList = new Set();
    this.httpClient = httpClient || this.defaultHttpClient;
    this.queue = Queue.channels(concurrency)
      .wait(this.wait)
      .timeout(this.timeout)
      .process(this.job.bind(this))
      .drain(() => {});
  }

  static parser(url, maxRequestsPerHour = 4, concurrency = 3) {
    return new Parser(url, maxRequestsPerHour, concurrency);
  }

  getClientIp(req = { headers: {}, socket: { remoteAddress: '8.8.8.8' } }) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
    return ip;
  }

  checkRequestLimit(req) {
    const ip = this.getClientIp(req);
    const currentTime = Math.floor(Date.now() / 1000);

    // If IP not found, initialize it
    if (!this.requestCounts[ip]) {
      this.requestCounts[ip] = { count: 1, lastRequestTime: currentTime, blockTime: 0 };
      return true;
    }

    const requestInfo = this.requestCounts[ip];
    const blockDuration = 3600; // 1 hour
    const penaltyFactor = 2; // Exponential increase of block time

    // If IP is already blocked
    if (requestInfo.blockTime) {
      const unblockTime = requestInfo.blockTime + (blockDuration * penaltyFactor);
      if (currentTime < unblockTime) {
        return false;
      } else {
        // Unblock IP after block time expires
        this.blackList.delete(ip);
        requestInfo.blockTime = 0;
        requestInfo.count = 1; // Reset count after unblocking
        requestInfo.lastRequestTime = currentTime;
        return true;
      }
    }

    // If request limit exceeded
    if (requestInfo.count >= this.maxRequestsPerHour) {
      requestInfo.blockTime = currentTime; // Set block time
      this.blackList.add(ip);
      return false;
    }

    // Update request count
    requestInfo.count += 1;
    requestInfo.lastRequestTime = currentTime;
    return true;
  }

  setUrl(url) {
    this.url = url;
    return this;
  }

  defaultHttpClient(options) {
    return new Promise((resolve, reject) => {
      https.get(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => resolve(data));
      }).on('error', (err) => reject(err));
    });
  }

  async fetchHTML() {
    try {
      const urlObj = new URL(this.url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      };

      // Використовуємо кастомний або дефолтний клієнт для запиту
      const data = await this.httpClient(options);
      this.html = data;
      return this;
    } catch (err) {
      throw new Error('Error fetching HTML: ' + err.message);
    }
  }

  //   const urls = [
  //     'https://example.com',
  //     'https://example.org',
  //     // mor pages here
  //   ];

  async job(task, next) {
    try {
      await this.fetchHTML();
      next(null, task);
    } catch (err) {
      next(err);
    }
  }


  queueFetch(urls) {
    for (const url of urls) {
      this.queue.add({ url });  // Передаємо { url } як об'єкт у чергу
    }
  }


  extractValue(regex) {
    const match = this.html.match(regex);
    return match ? match[1].trim() : 'N/A';
  }

  parseData(object) {
    if (!this.html) {
      throw new Error('HTML is not loaded yet. Call fetchHTML() first.');
    }

    const result = {};

    for (const [key, regexp] of Object.entries(object)) {
      const match = this.html.match(new RegExp(regexp));
      result[key] = match ? match[1].trim() : 'N/A';
    }

    this.data = result;
    return this;
  }

  printData() {
    if (!this.data) {
      console.log('No data available. Make sure to call parseData() first.');
    } else {
      console.log('Parsed Data:', JSON.stringify(this.data, null, 2));
    }
    return this;
  }
}
