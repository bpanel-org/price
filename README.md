# Price

This plugin runs entirely in middleware and has no views.

It listens for the following actions:

```
UPDATE_PRICE
UPDATE_FIAT
UPDATE_CRYPTO
UPDATE_FEED
UPDATE_AVAIL_FIATS
REFRESH_PRICE
SET_CURRENT_CLIENT
```

...and maintains price data in the application state like this:

```
state.plugins.price = {
  price: "137.53000000"
  fiat: "GBP"
  fiatSymbol: "£"
  crypto: "BCH"
  feed: "Coinbase"
}
```

Additional APIs can be added in `lib/feeds.js`, template and details are in the comments.

Price data can be displayed and modified from other plugins, such as the simple footer widget [price-widget](https://github.com/bpanel-org/price-widget). On its own, this plugin will ONLY fetch the price on application load, and whenever `SET_CURRENT_CLIENT` is dispatched. Otherwise it requires an additional plugin (like the footer widget) to dispatch `REFRESH_PRICE`.