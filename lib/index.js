/* Imports */

const {CURRENCY_UNITS} = require('@bpanel/bpanel-utils');
import {feeds} from './feeds';

/* Constants */

const fiatSymbols = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  YEN: '¥',
  CAD: '$'
}

/* Utility */

function getTickerFromChain(chain){
  const unit = CURRENCY_UNITS[chain].unit;
  return unit.toUpperCase();
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
}

// TODO: check value before setting state in case of ignorant plugin
function priceReducer(state = initState, action) {
  const newState = { ...state };
  switch (action.type) {
    case 'UPDATE_PRICE':
      newState.price = action.payload;
      return newState;
    case 'UPDATE_FIAT':
      newState.fiat = action.payload;
      newState.fiatSymbol = fiatSymbols[action.payload];
      return newState;
    case 'UPDATE_CRYPTO':
      newState.crypto = action.payload;
      return newState;
    case 'UPDATE_FEED':
      newState.feed = action.payload;
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

const updateFeed = feed => ({
    type: 'UPDATE_FEED',
    payload: feed
});

const updateAvailFiats = () => ({
    type: 'UPDATE_AVAIL_FIATS'
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
      const feed = feeds[priceState.feed];
      const price = await feed.getPrice(priceState);
      dispatch(updatePrice(price));
      break;
  }
  return next(action);
}
