import { Parser } from './parser.js';

export class FinancialParser extends Parser {
  constructor(url, maxRequestsPerHour = 4) {
    super(url, maxRequestsPerHour);
  }

  extractValue(regex) {
    const match = this.html.match(regex);
    return match ? match[1].trim() : 'N/A';
  }

  get stockFullName() {
    return this.extractValue(/<h2[^>]*>\s*<a[^>]*>\s*(.*?)\s*<\/a>\s*<\/h2>/);
  }

  get tickerSymbol() {
    return this.extractValue(/<h1[^>]*>\s*(.*?)\s*<\/h1>/);
  }

  get currentPrice() {
    return this.extractValue(/<strong[^>]*>\s*(\d+\.\d+)\s*<\/strong>/);
  }

  get price() {
    return this.extractValue(/Price.*?<b>(\d+\.\d+)<\/b>/);
  }

  get marketCapitalization() {
    return this.extractValue(/Market Cap.*?<b>(.*?)<\/b>/);
  }

  get income() {
    return this.extractValue(/Income.*?<b>(.*?)<\/b>/);
  }

  get sales() {
    return this.extractValue(/Sales.*?<b>(.*?)<\/b>/);
  }

  get bookSh() {
    return this.extractValue(/Book\/sh<\/td><td[^>]*><b>(.*?)<\/b>/);
  }

  get cashSh() {
    return this.extractValue(/Cash\/sh<\/td><td[^>]*><b>(.*?)<\/b>/);
  }

  get dividendEstimation() {
    return this.extractValue(/Dividend Estimate.*?<b>(.*?)<\/b>/);
  }

  get dividendTtm() {
    return this.extractValue(/Dividend TTM.*?<b>(.*?)<\/b>/);
  }

  get peRatio() {
    return this.extractValue(/P\/E<\/td><td[^>]*><b>(.*?)<\/b>/);
  }

  get forwardPeRatio() {
    return this.extractValue(/Forward P\/E<\/td><td[^>]*><b>(.*?)<\/b>/);
  }

  get pegRatio() {
    return this.extractValue(/PEG<\/td><td[^>]*><b><span[^>]*>(\d+(\.\d+)?)<\/span><\/b>/);
  }

  get psRatio() {
    return this.extractValue(/P\/S<\/td><td[^>]*><b>(.*?)<\/b>/);
  }

  get pbRatio() {
    return this.extractValue(/P\/B<\/td><td[^>]*><b><span[^>]*>(\d+(\.\d+)?)<\/span><\/b>/);
  }

  get pcRatio() {
    return this.extractValue(/P\/C<\/td><td[^>]*><b><span[^>]*>(\d+(\.\d+)?)<\/span><\/b>/);
  }

  get pFcfRatio() {
    return this.extractValue(/P\/FCF<\/td><td[^>]*><b>(.*?)<\/b>/);
  }

  get quickRatio() {
    return this.extractValue(/Quick Ratio.*?<b>(.*?)<\/b>/);
  }

  get currentRatio() {
    return this.extractValue(/Current Ratio.*?<span class="color-text .*?">(.*?)<\/span>/);
  }

  get debtEq() {
    return this.extractValue(/Debt\/Eq<\/td><td[^>]*><b><span[^>]*>(\d+(\.\d+)?)<\/span><\/b>/);
  }

  get ltDebtEq() {
    return this.extractValue(/LT Debt\/Eq<\/td><td[^>]*><b><span[^>]*>(\d+(\.\d+)?)<\/span><\/b>/);
  }

  // get epsTtm() {
  //   return this.extractValue(/EPS (ttm)<\/td><td[^>]*><b>(.*?)<\/b>/);
  // }

  get roa() {
    return this.extractValue(/ROA.*?<span class="color-text .*?">(.*?)<\/span>/);
  }

  get roe() {
    return this.extractValue(/ROE.*?<span class="color-text .*?">(.*?)<\/span>/);
  }

  get roi() {
    return this.extractValue(/ROI.*?<span class="color-text .*?">(.*?)<\/span>/);
  }

  get volume() {
    return this.extractValue(/Volume.*?<b>(.*?)<\/b>/);
  }

  get beta() {
    return this.extractValue(/Beta.*?<b>(.*?)<\/b>/);
  }

  get change() {
    return this.extractValue(/Change.*?<span class="color-text .*?">(.*?)<\/span>/);
  }
}
