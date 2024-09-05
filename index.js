import https from 'node:https';
import { URL } from 'node:url';

class Parser {
    constructor(url, maxRequestsPerHour = 50) {
        this.url = url;
        this.maxRequestsPerHour = maxRequestsPerHour;
        this.requestCounts = {};
        this.html = null;
        this.data = null;
    }

    getClientIp(req) {
        const forwarded = req.headers['x-forwarded-for'];
        const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
        return ip;
    }

    checkRequestLimit(req) {
        const ip = this.getClientIp(req);
        if (!ip) {
            throw new Error('IP must not be null or undefined');
        }

        const currentTime = Math.floor(Date.now() / 1000);
        let requestInfo = this.requestCounts[ip];

        if (!requestInfo) {
            requestInfo = { count: 0, lastRequestTime: currentTime };
            this.requestCounts[ip] = requestInfo;
        }

        if (currentTime - requestInfo.lastRequestTime > 3600) { 
            requestInfo.count = 0;
            requestInfo.lastRequestTime = currentTime;
        }

        if (requestInfo.count >= this.maxRequestsPerHour) {
            return false;
        }

        requestInfo.count++;
        this.requestCounts[ip] = requestInfo;

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

parseData() {
    if (!this.html) {
        throw new Error('HTML is not loaded yet. Call fetchHTML() first.');
    }

    const stockNameMatch = this.html.match(/<b>(.*?)<\/b>/); // Знайдемо перший тег <b> (назва акції)
        const stockName = stockNameMatch ? stockNameMatch[1].trim() : 'N/A';

        const priceMatch = this.html.match(/<b>(\d+\.\d+)<\/b>/); // Знайдемо першу ціну (формат числа)
        const price = priceMatch ? priceMatch[1].trim() : 'N/A';

        const marketCapMatch = this.html.match(/Market Cap<\/td><td[^>]*><b>(.*?)<\/b>/); // Ринкова капіталізація
        const marketCap = marketCapMatch ? marketCapMatch[1].trim() : 'N/A';

        const P_E_Match = this.html.match(/P\/E<\/td><td[^>]*><b>(.*?)<\/b>/); // P/E (ціна/прибуток)
        const P_E = P_E_Match ? P_E_Match[1].trim() : 'N/A';

        this.data = { stockName, price, marketCap, P_E };
        return this;
}

printData() {
        if (!this.data) {
            console.log("No data available. Make sure to call parseData() first.");
        } else {
            console.log("Parsed Data:", JSON.stringify(this.data, null, 2));
        }
        return this; 
   }
}

// URL для парсингу
const url = 'https://finviz.com/quote.ashx?t=AAPL&p=d';
const parser = new Parser(url);

// Використовуємо async/await
(async () => {
    try {
        await parser.fetchHTML();   // Завантажуємо HTML
        parser.parseData();         // Парсимо дані
        parser.printData();         // Виводимо дані в консоль
    } catch (err) {
        console.error("Error:", err.message);
    }
})();
