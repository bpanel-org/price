// Entry point for your plugin
// This should expose your plugin's modules

/* START IMPORTS */
const https = require('https');
import React from 'react';
import { Header, Text } from '@bpanel/bpanel-ui';

/* END IMPORTS */

/* Component */

const Ticker = ( {Price} ) => (
  <div>
    <Header type="h3">Coinbase BTC-USD</Header>
    <Header type="h1">Price: ${moneyNumber(Price.USD)}</Header>
  </div>
);

/* Utility */

function getCoinbasePrice() {
  const options = {
    hostname: 'api.pro.coinbase.com',
    path: '/products/BTC-USD/ticker',
    headers: {'User-Agent': 'Request-Promise'}
  };

  // Need this to be async so the app doesn't think price is `undefined`
  return new Promise ((resolve, reject) => {
    https.get(options, (resp) => {
      // https.get API streams data
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // we're done now
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

function priceReducer(state = { USD: 0 }, action) {
  const newState = { ...state };
  switch (action.type) {
    case 'UPDATE_USD':
      newState.USD = action.payload;
      return newState;
    default:
      return state;
  }
};

const updateUSD = price => ({
    type: 'UPDATE_USD',
    payload: price
});

/* START EXPORTS */

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
  Price: priceReducer,
};

export const mapComponentDispatch = {
  Panel: (dispatch, map) =>
    Object.assign(map, {
        updateUSD: price => dispatch(updateUSD(price))
      })
}

export const mapComponentState = {
  Panel: (state, map) =>
    Object.assign(map, {
      Price: state.plugins.Price
    })
};

export const getRouteProps = {
  [metadata.name]: (parentProps, props) =>
    Object.assign(props, {
      Price: parentProps.Price,
    })
};

export const decoratePanel = (Panel, { React, PropTypes }) => {
  return class extends React.Component {
    static displayName() {
      return metadata.name;
    }

    async componentDidMount() {
      setInterval( async () => {
        const price = await getCoinbasePrice();
        this.props.updateUSD(price);
      }, 1000);
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
/* END EXPORTS */


updateUSD(9);