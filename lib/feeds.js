import { bcurlClient } from '@bpanel/bpanel-utils';

const curlClient = new bcurlClient();

async function curl(url) {
  const uriPath = encodeURIComponent(url.path);
  return curlClient.get('/' + url.host + '/' + uriPath);
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
  }
};
