/* Imports */

const { CURRENCY_UNITS } = require('@bpanel/bpanel-utils');
import { feeds } from './feeds';

/* Constants */

const fiatSymbols = {
  USD: '$',
  AUD: '$',
  NZD: '$',
  BRL: 'R$',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  CNY: '¥',
  CAD: '$',
  INR: '₹',
  KRW: '₩',
  THB: '฿'
};

/* Utility */

function getTickerFromChain(chain) {
  const unit = CURRENCY_UNITS[chain].unit;
  return unit.toUpperCase();
}

function isFloat(x) {
  return !Number.isNaN(parseFloat(x));
}

/* Actions and Reducers */

const initState = {
  price: 0,
  fiat: 'USD',
  fiatSymbol: '$',
  crypto: 'BTC',
  feed: Object.keys(feeds)[0],
  availableFeeds: Object.keys(feeds),
  availableFiats: ['USD']
};

// TODO: check value before setting state in case of ignorant plugin
function priceReducer(state = initState, action) {
  const newState = { ...state };

  switch (action.type) {
    case 'UPDATE_PRICE':
      let newPrice = action.payload;
      if (!isFloat(newPrice)) {
        newPrice = 0;
        console.log('Price feed API error: not a valid price');
      }
      newState.price = newPrice;
      return newState;
    case 'UPDATE_FIAT':
      const newFiat = action.payload;
      if (!state.availableFiats.includes(newFiat))
        throw new Error('Selected fiat currency is not available');
      newState.fiat = newFiat;
      newState.fiatSymbol = fiatSymbols[action.payload] || '';
      return newState;
    case 'UPDATE_CRYPTO':
      newState.crypto = action.payload;
      return newState;
    case 'UPDATE_FEED':
      const newFeed = action.payload;
      if (!state.availableFeeds.includes(newFeed))
        throw new Error('Selected API feed is not available');
      newState.feed = newFeed;
      return newState;
    case 'UPDATE_AVAIL_FIATS':
      newState.availableFiats = action.payload;
      return newState;
    default:
      return state;
  }
}

const updatePrice = price => ({
  type: 'UPDATE_PRICE',
  payload: price
});

const updateCrypto = crypto => ({
  type: 'UPDATE_CRYPTO',
  payload: crypto
});

const updateAvailFiats = fiats => ({
  type: 'UPDATE_AVAIL_FIATS',
  payload: fiats
});

/* Exports */

export const metadata = {
  name: 'price',
  pathName: 'Price',
  displayName: 'Price',
  author: 'Matthew Zipkin',
  description: 'Fetch BTC-fiat exchange rate and add to app store.',
  version: require('../package.json').version
};

export const pluginReducers = {
  price: priceReducer
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
      const feed = feeds[priceState.feed];
      const price = await feed.getPrice(priceState);
      const availableFiats = await feed.getFiats();
      dispatch(updatePrice(price));
      dispatch(updateAvailFiats(availableFiats));
      break;
  }
  return next(action);
};
