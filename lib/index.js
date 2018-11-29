/* Imports */
const https = require('https');
const {CURRENCY_UNITS} = require('@bpanel/bpanel-utils');

/* Utility */

function getCoinbasePrice( {price, fiat, crypto} ) {
  const path = '/products/' + crypto + '-' + fiat + '/ticker';
  const options = {
    hostname: 'api.pro.coinbase.com',
    path: path,
    headers: {'User-Agent': 'Request-Promise'}
  };
  return new Promise ((resolve, reject) => {
    https.get(options, (resp) => {
      // https.get API streams data
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        resolve(JSON.parse(data).price);
      });
    }).on('error', (err) => {
      reject('Error: ' + err.message);
    });
  });
}

function getTickerFromChain(chain){
  const unit = CURRENCY_UNITS[chain].unit;
  return unit.toUpperCase();
}

/* Actions and Reducers */

const initState = {
  price: 0,
  fiat: 'USD',
  crypto: 'BTC'
}

function priceReducer(state = initState, action) {
  const newState = { ...state };
  switch (action.type) {
    case 'UPDATE_PRICE':
      newState.price = action.payload;
      return newState;
    case 'UPDATE_FIAT':
      newState.fiat = action.payload;
      return newState;
    case 'UPDATE_CRYPTO':
      newState.crypto = action.payload;
      return newState;
    default:
      return state;
  }
};

const updatePrice = price => ({
    type: 'UPDATE_PRICE',
    payload: price
});

const updateFiat = fiat => ({
    type: 'UPDATE_FIAT',
    payload: fiat
});

const updateCrypto = crypto => ({
    type: 'UPDATE_CRYPTO',
    payload: crypto
});

/* Exports */

export const metadata = {
  name: 'price',
  pathName: 'Price',
  displayName: 'Price',
  author: 'Matthew Zipkin',
  description: 'Fetch BTC-fiat exchange rate and add to app store.',
  version: require('../package.json').version,
};

export const pluginReducers = {
  price: priceReducer,
};


export const middleware = store => next => async action => {
  const { dispatch, getState } = store;

  switch (action.type) {
    case 'SET_CURRENT_CLIENT':
    case 'REFRESH_PRICE':
      if (action.type === 'SET_CURRENT_CLIENT') {
        const chain = action.payload.chain;
        const ticker = getTickerFromChain(chain);
        dispatch(updateCrypto(ticker));
      }

      const priceState = getState().plugins.price;
      const price = await getCoinbasePrice(priceState);
      dispatch(updatePrice(price));
      break;
  }
  return next(action);
}
