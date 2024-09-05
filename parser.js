import https from 'node:https';
import { URL } from 'node:url';

export class Parser {
  constructor(url, maxRequestsPerHour = 4) {
    this.url = url;
    this.maxRequestsPerHour = maxRequestsPerHour;
    this.requestCounts = {};
    this.html = null;
    this.data = null;
    this.blackList = new Set();
  }

  getClientIp(req = { headers: {}, socket: { remoteAddress: '127.0.0.1' } }) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
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
        console.log(`IP blocked for: ${unblockTime - currentTime} seconds`);
        return false;
      } else {
        // Unblock IP after block time expires
        console.log('IP unblocked.');
        this.blackList.delete(ip);
        console.log(`${ip} removed from blacklist`);
        requestInfo.blockTime = 0;
        requestInfo.count = 1; // Reset count after unblocking
        requestInfo.lastRequestTime = currentTime;
        return true;
      }
    }

    // If request limit exceeded
    if (requestInfo.count >= this.maxRequestsPerHour) {
      requestInfo.blockTime = currentTime; // Set block time
      console.log(`Request limit exceeded for IP: ${ip}. Blocking for ${blockDuration * penaltyFactor} seconds.`);
      console.log(`${ip} added to blacklist`);
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

  fetchHTML() {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(this.url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      };

      https.get(options, (res) => {
        const { statusCode, headers } = res;

        if (statusCode >= 300 && statusCode < 400 && headers.location) {
          console.log('Redirecting to:', headers.location);
          resolve(null);
          return;
        }

        if (statusCode !== 200) {
          reject(new Error(`Request Failed. Status Code: ${statusCode}`));
          return;
        }

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          this.html = data;
          resolve(this);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
    * const data = new Set([
    * [regexp1, value1],
    * [regexp2, value2],
    * [regexp3, value3]
    * ]);
   */

  parseData(object) {
    if (!this.html) {
      throw new Error('HTML is not loaded yet. Call fetchHTML() first.');
    }

    const result = {};

    for (const [regexp, value] of Object.entries(object)) {
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
