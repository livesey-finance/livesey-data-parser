import axios from 'axios';
import { Parser } from './parser.js';

const customHttpClient = async (options) => {
  const response = await axios.get(`https://${options.hostname}${options.path}`, {
    headers: options.headers,
  });
  return response.data;
};

const parser = new Parser('https://example.com', 4, 1, 5000, 10000, customHttpClient);
parser.fetchHTML().then(() => {
  console.log(parser.html);
});
