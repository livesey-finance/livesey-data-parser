const stockNameMatch = this.html.match(/<b>(.*?)<\/b>/);
const stockName = stockNameMatch ? stockNameMatch[1].trim() : 'N/A';

const priceMatch = this.html.match(/<b>(\d+\.\d+)<\/b>/);
const price = priceMatch ? priceMatch[1].trim() : 'N/A';

const marketCapMatch = this.html.match(/Market Cap<\/td><td[^>]*><b>(.*?)<\/b>/);
const marketCap = marketCapMatch ? marketCapMatch[1].trim() : 'N/A';

const PEMatch = this.html.match(/P\/E<\/td><td[^>]*><b>(.*?)<\/b>/);
const P_E = PEMatch ? PEMatch[1].trim() : 'N/A';
