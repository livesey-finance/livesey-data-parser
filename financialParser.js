/* eslint-disable max-len */
import { Parser } from './parser.js';

export class FinancialParser extends Parser {
  constructor(title, maxRequestsPerHour = 4) {
    super(title, maxRequestsPerHour);
  }

  extractValue(regex) {
    const match = this.html.match(regex);
    return match ? match[1].trim() : 'N/A';
  }

  get stockFullName() {
    return JSON.stringify({ stockFullName: this.extractValue(/<h2[^>]*>\s*<a[^>]*>\s*(.*?)\s*<\/a>\s*<\/h2>/) });
  }

  get tickerSymbol() {
    return JSON.stringify({ tickerSymbol: this.extractValue(/<h1[^>]*>\s*(.*?)\s*<\/h1>/) });
  }

  get currentPrice() {
    return JSON.stringify({ currentPrice: this.extractValue(/<strong[^>]*>\s*(\d+\.\d+)\s*<\/strong>/) });
  }

  get marketCapitalization() {
    return JSON.stringify({ marketCapitalization: this.extractValue(/Market Cap.*?(?:<b>|<span.*?>)\s*(.*?)\s*(?:<\/b>|<\/span>)/) });
  }

  get income() {
    return JSON.stringify({ income: this.extractValue(/Income.*?(?:<b>|<span.*?>)\s*(.*?)\s*(?:<\/b>|<\/span>)/) });
  }

  get sales() {
    return JSON.stringify({ sales: this.extractValue(/Sales.*?(?:<b>|<span.*?>)\s*(.*?)\s*(?:<\/b>|<\/span>)/) });
  }

  get bookSh() {
    return JSON.stringify({ bookSh: this.extractValue(/Book\/sh<\/td><td[^>]*><b>(.*?)<\/b>/) });
  }

  get cashSh() {
    return JSON.stringify({ cashSh: this.extractValue(/Cash\/sh<\/td><td[^>]*><b>(.*?)<\/b>/) });
  }

  get dividendEstimation() {
    return JSON.stringify({ dividendEstimation: this.extractValue(/Dividend Estimate.*?(?:<b>|<span.*?>)\s*(.*?)\s*(?:<\/b>|<\/span>)/) });
  }

  get dividendTtm() {
    return JSON.stringify({ dividendTtm: this.extractValue(/Dividend TTM.*?(?:<b>|<span.*?>)\s*(.*?)\s*(?:<\/b>|<\/span>)/) });
  }

  get peRatio() {
    return JSON.stringify({ peRatio: this.extractValue(/P\/E.*?(?:<b>|<span.*?>)\s*(.*?)\s*(?:<\/b>|<\/span>)/) });
  }

  get forwardPeRatio() {
    return JSON.stringify({ forwardPeRatio: this.extractValue(/Forward P\/E<\/td><td[^>]*>(?:<b>\s*)?(?:<span[^>]*>)?\s*([\d.]+)\s*(?:<\/span>)?(?:\s*<\/b>)?/) });
  }

  get pegRatio() {
    return JSON.stringify({ pegRatio: this.extractValue(/PEG<\/td><td[^>]*>(?:<b>\s*)?(?:<span[^>]*>)?\s*([\d.]+)\s*(?:<\/span>)?(?:\s*<\/b>)?/) });
  }

  get psRatio() {
    return JSON.stringify({ psRatio: this.extractValue(/P\/S<\/td><td[^>]*>(?:<b>\s*)?(?:<span[^>]*>)?\s*([\d.]+)\s*(?:<\/span>)?(?:\s*<\/b>)?/) });
  }

  get pbRatio() {
    return JSON.stringify({ pbRatio: this.extractValue(/P\/B<\/td><td[^>]*>(?:<b>\s*)?(?:<span[^>]*>)?\s*([\d.]+)\s*(?:<\/span>)?(?:\s*<\/b>)?/) });
  }

  get pcRatio() {
    return JSON.stringify({ pcRatio: this.extractValue(/P\/C<\/td><td[^>]*>(?:<b>\s*)?(?:<span[^>]*>)?\s*([\d.]+)\s*(?:<\/span>)?(?:\s*<\/b>)?/) });
  }

  get pFcfRatio() {
    return JSON.stringify({ pFcfRatio: this.extractValue(/P\/FCF<\/td><td[^>]*>(?:<b>\s*)?(?:<span[^>]*>)?\s*([\d.]+)\s*(?:<\/span>)?(?:\s*<\/b>)?/) });
  }

  get quickRatio() {
    return JSON.stringify({ quickRatio: this.extractValue(/Quick Ratio.*?(?:<b>|<span.*?>)\s*([\d.]+)\s*(?:<\/b>|<\/span>)/) });
  }

  get currentRatio() {
    return JSON.stringify({ currentRatio: this.extractValue(/Current Ratio.*?(?:<b>|<span.*?>)\s*([\d.]+)\s*(?:<\/b>|<\/span>)/) });
  }

  get debtEq() {
    return JSON.stringify({ debtEq: this.extractValue(/Debt\/Eq<\/td><td[^>]*>(?:<b>\s*)?(?:<span[^>]*>)?\s*([\d.]+)\s*(?:<\/span>)?(?:\s*<\/b>)?/) });
  }

  get ltDebtEq() {
    return JSON.stringify({ ltDebtEq: this.extractValue(/LT Debt\/Eq<\/td><td[^>]*>(?:<b>\s*)?(?:<span[^>]*>)?\s*([\d.]+)\s*(?:<\/span>)?(?:\s*<\/b>)?/) });
  }

  get roa() {
    return JSON.stringify({ roa: this.extractValue(/ROA.*?<span class="color-text .*?">(.*?)<\/span>/) });
  }

  get roe() {
    return JSON.stringify({ roe: this.extractValue(/ROE.*?<span class="color-text .*?">(.*?)<\/span>/) });
  }

  get roi() {
    return JSON.stringify({ roi: this.extractValue(/ROI.*?<span class="color-text .*?">(.*?)<\/span>/) });
  }

  get volume() {
    return JSON.stringify({ volume: this.extractValue(/Volume.*?(?:<b>|<span.*?>)\s*(.*?)\s*(?:<\/b>|<\/span>)/) });
  }

  get beta() {
    return JSON.stringify({ beta: this.extractValue(/Beta.*?(?:<b>|<span.*?>)\s*(.*?)\s*(?:<\/b>|<\/span>)/) });
  }

  get change() {
    return JSON.stringify({ change: this.extractValue(/Change.*?<span class="color-text .*?">(.*?)<\/span>/) });
  }
}
