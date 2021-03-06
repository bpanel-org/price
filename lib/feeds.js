/* eslint-disable no-console */

import { Client } from 'bcurl';

// determine the port and ssl usage
const protocol = window.location.protocol;
const hostname = window.location.hostname;
let port = window.location.port;
let ssl = false;
// use https and http ports when the window doesn't render them
if (port === '') protocol === 'https:' ? (port = '443') : (port = '80');
if (protocol === 'https:') ssl = true;

const curlClient = new Client({
  port: parseInt(port, 10),
  path: '/curl/',
  host: hostname,
  ssl
});

async function curl(url) {
  try {
    return await curlClient.get(url.host + '?path=' + url.path);
  } catch (e) {
    console.log('Error fetching JSON API: ', e);
    return {};
  }
}

/*
 * Add any exchange API you want here
 * Name of feed is object key, value is object with 2 functions
 * getPrice takes 3-letter acronym strings {fiat, crypto} and retuns a float
 * getFiats takes no arguments and returns an array of 3-letter fiat currencies
 */

export const feeds = {
  Coinbase: {
    getPrice: async ({ fiat, crypto }) => {
      const path = 'products/' + crypto + '-' + fiat + '/ticker';
      const url = {
        host: 'api.pro.coinbase.com',
        path: path
      };
      const result = await curl(url);
      return result.price;
    },

    getFiats: async () => {
      const url = {
        host: 'api.pro.coinbase.com',
        path: 'currencies'
      };
      const result = await curl(url);
      let fiats = [];
      for (const item of result) {
        if (item.details.type === 'fiat') fiats.push(item.id);
      }
      return fiats;
    }
  },

  Blockchain_info: {
    getPrice: async ({ fiat, crypto }) => {
      if (crypto !== 'BTC') return 0;
      const path = 'ticker';
      const url = {
        host: 'blockchain.info',
        path: path
      };
      const result = await curl(url);
      const price = result[fiat].last;
      return price;
    },

    getFiats: async () => {
      const path = 'ticker';
      const url = {
        host: 'blockchain.info',
        path: path
      };
      const result = await curl(url);
      const fiats = Object.keys(result);
      return fiats;
    }
  },

  Bitfinex: {
    getPrice: async ({ fiat, crypto }) => {
      if (crypto !== 'BTC') return 0;
      const path = 'v1/pubticker/' + crypto + fiat;
      const url = {
        host: 'api.bitfinex.com',
        path: path
      };
      const result = await curl(url);
      return result.last_price;
    },

    getFiats: async () => {
      return Promise.resolve(['USD', 'EUR', 'GBP', 'JPY']);
    }
  },

  Bitstamp: {
    getPrice: async ({ fiat, crypto }) => {
      const path = 'api/v2/ticker/' + crypto + fiat;
      const url = {
        host: 'www.bitstamp.net',
        path: path
      };
      const result = await curl(url);
      return result.last;
    },

    getFiats: async () => {
      return Promise.resolve(['USD', 'EUR']);
    }
  },

  Kraken: {
    getPrice: async ({ fiat, crypto }) => {
      // seriously!? Ok...
      crypto = crypto === 'BTC' ? 'XBT' : crypto;

      const path = '0/public/Ticker?pair=' + crypto + fiat;
      const url = {
        host: 'api.kraken.com',
        path: path
      };
      const response = await curl(url);
      const result = response.result;
      // Ah geez REALLY?
      const randomUselessString = Object.keys(result)[0];
      const actualUsefulInfo = result[randomUselessString];
      return actualUsefulInfo.c[0];
    },

    getFiats: async () => {
      return Promise.resolve(['USD', 'EUR', 'CAD', 'JPY']);
    }
  },

  Cex_io: {
    getPrice: async ({ fiat, crypto }) => {
      const path = 'api/ticker/' + crypto + '/' + fiat;
      const url = {
        host: 'cex.io',
        path: path
      };
      const result = await curl(url);
      return result.last;
    },

    getFiats: async () => {
      return Promise.resolve(['USD', 'EUR', 'GBP', 'RUB']);
    }
  }
};
