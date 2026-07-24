export const TRADE_SIDES = Object.freeze({
  BUY: 'buy',
  SELL: 'sell',
});

export const ORDER_TYPES = Object.freeze({
  MARKET: 'market',
  LIMIT: 'limit',
  STOP_LIMIT: 'stop_limit',
});

export const TIME_IN_FORCE = Object.freeze({
  GTC: 'gtc',
  IOC: 'ioc',
  FOK: 'fok',
});

export const TRADE_SIDE_VALUES = Object.freeze(Object.values(TRADE_SIDES));
export const ORDER_TYPE_VALUES = Object.freeze(Object.values(ORDER_TYPES));
export const TIME_IN_FORCE_VALUES = Object.freeze(Object.values(TIME_IN_FORCE));