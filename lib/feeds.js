const https = require('https');

function httpsGet(options) {
  return new Promise ((resolve, reject) => {
    https.get(options, (resp) => {
      // https.get API streams data
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        resolve(JSON.parse(data));
      });
    }).on('error', (err) => {
      reject('Error: ' + err.message);
    });
  });
}

export const feeds = {
  Coinbase: {
    getPrice: async ( {fiat, crypto} ) => {
      const path = '/products/' + crypto + '-' + fiat + '/ticker';
      const options = {
        hostname: 'api.pro.coinbase.com',
        path: path,
        headers: {'User-Agent': 'Request-Promise'}
      };
      const result = await httpsGet(options);
      return result.price;
    },

    getFiats: async() => {
      const options = {
        hostname: 'api.pro.coinbase.com',
        path: '/currencies',
        headers: {'User-Agent': 'Request-Promise'}
      };
      const result = await httpsGet(options);
      let fiats = [];
      for (const item of result) {
        if (item.details.type === 'fiat')
          fiats.append(item.id);
      }
      return fiats;
    }
  },

  Kraken: {

  }
}