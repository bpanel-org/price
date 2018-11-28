/* Imports */
const https = require('https');
import React from 'react';
import { Header, Text } from '@bpanel/bpanel-ui';

/* Component */

const Ticker = ({price}) => (
  <div>
    <Header type="h3">Coinbase {price.crypto + '-' + price.fiat}</Header>
    <Header type="h1">Price: ${moneyNumber(price.price)}</Header>
  </div>
);

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

function moneyNumber(number) {
  number = parseFloat(number);
  return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
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
  nav: true,
  sidebar: true,
  icon: 'exchange'
};

export const pluginReducers = {
  price: priceReducer,
};

export const mapComponentDispatch = {
  Panel: (dispatch, map) =>
    Object.assign(map, {
        updatePrice: price => dispatch(updatePrice(price)),
        updateFiat: fiat => dispatch(updateFiat(fiat)),
        updateCrypto: crypto => dispatch(updateCrypto(crypto))
      })
}

export const mapComponentState = {
  Panel: (state, map) =>
    Object.assign(map, {
      price: state.plugins.price,
      clients: state.clients
    })
};

export const getRouteProps = {
  [metadata.name]: (parentProps, props) =>
    Object.assign(props, {
      price: parentProps.price,
    })
};

const mapStateToProps = state => {
  return {
    price: state.plugins.price,
    clients: state.clients,
  };
};

export const middleware = store => next => async action => {
  const { dispatch, getState } = store;

  switch (action.type) {
    case 'APP_LOADED':
    case 'SET_CURRENT_CLIENT':
      const chain = action.payload.chain;
      switch (chain) {
        case 'bitcoin':
          dispatch(updateCrypto('BTC'));
          break;
        case 'bitcoincash':
          dispatch(updateCrypto('BCH'));
          break;
      }
      const priceState = getState().plugins.price;
      const price = await getCoinbasePrice(priceState);
      dispatch(updatePrice(price));
  }
  return next(action);
}

export const decoratePanel = (Panel, { React, PropTypes }) => {
  return class extends React.Component {
    static displayName() {
      return metadata.name;
    }

    async componentDidMount() {
      setInterval( async () => {
        const price = await getCoinbasePrice(this.props.price);
        this.props.updatePrice(price);
      }, 5000);
    }

    render() {
      const { customChildren = [] } = this.props;
      const routeData = {
        metadata,
        Component: Ticker
      };
      return (
        <Panel
          {...this.props}
          customChildren={customChildren.concat(routeData)}
        />
      );
    }
  };
};