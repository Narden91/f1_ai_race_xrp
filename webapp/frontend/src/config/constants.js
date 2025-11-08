export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'F1 AI Racing',
  version: '1.0.0',
  network: import.meta.env.VITE_NETWORK || 'testnet',
}

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds
}

export const XRP_CONFIG = {
  testnetWSS: 'wss://s.altnet.rippletest.net:51233',
  testnetRPC: 'https://s.altnet.rippletest.net:51234/',
  faucetAddress: 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY',
}

export const UI_CONFIG = {
  autoRefreshInterval: 30000, // 30 seconds
  animationDuration: 300, // milliseconds
  toastDuration: 5000, // 5 seconds
}

export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  transactions: '/transactions',
  docs: '/docs',
}
