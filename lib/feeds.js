import { bcurlClient } from '@bpanel/bpanel-utils';

const curlClient = new bcurlClient();

async function curl(url) {
  const uriPath = encodeURIComponent(url.path);
  try {
    return await curlClient.get('/' + url.host + '/' + uriPath);
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
      if (crypto !== 'BTC')
        return 0;
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
      if (crypto !== 'BTC')
        return 0;
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
  }
};
