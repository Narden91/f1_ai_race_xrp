/**
 * API service for XRP backend communication
 */
import { API_CONFIG } from './constants'

class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.baseUrl
    this.timeout = API_CONFIG.timeout
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Wallet endpoints
  async createWallet(seed = '') {
    return this.post('/wallet/create', { seed })
  }

  async getBalance(address) {
    return this.get(`/wallet/${address}/balance`)
  }

  async getAccountInfo(address) {
    return this.get(`/wallet/${address}/info`)
  }

  // Payment endpoints
  async sendPayment(senderSeed, destination, amount) {
    return this.post('/payment', {
      sender_seed: senderSeed,
      destination,
      amount,
    })
  }

  async getTransactionHistory(address, limit = 10) {
    return this.get(`/payment/${address}/history?limit=${limit}`)
  }

  // Health check
  async healthCheck() {
    return this.get('/health')
  }

  // --- Racing Game Endpoints (frontend-only abstraction) ---
  // These assume backend secret logic; frontend must NEVER send or receive raw flags or formulas.
  
  // Garage management
  async createCar(walletAddress, walletSeed) {
    // Costs 1 XRP; creates car with 10 hidden flags
    // Payment processed on backend via blockchain transaction
    return this.post('/race/car/create', { 
      wallet_address: walletAddress,
      wallet_seed: walletSeed
    })
  }

  async getGarage(walletAddress) {
    // Get all cars for a wallet (no flags exposed)
    return this.get(`/race/garage/${walletAddress}`)
  }

  // Car operations
  async trainCar(carId, walletAddress, walletSeed, attributeIndices = null) {
    // Costs 1 XRP on-chain; backend validates payment & applies ±20 random deltas per secret flag set
    // attributeIndices: null or [] = train all, [0,1,2] = train specific attributes
    // Payment processed on backend via blockchain transaction
    return this.post('/race/train', { 
      car_id: carId, 
      wallet_address: walletAddress,
      wallet_seed: walletSeed,
      attribute_indices: attributeIndices 
    })
  }

  async testSpeed(carId, walletAddress) {
    // Free test - backend computes speed and returns only qualitative feedback (improved: true/false)
    // Does NOT reveal actual speed value or flags
    return this.post('/race/test', { car_id: carId, wallet_address: walletAddress })
  }

  async enterRace(carId, walletAddress, walletSeed) {
    // Costs 1 XRP; backend computes secret speed formula and returns abstract ranking info
    return this.post('/race/enter', { 
      car_id: carId, 
      wallet_address: walletAddress,
      wallet_seed: walletSeed 
    })
  }

  async sellCar(carId, walletAddress) {
    // Sell a car for 0.5 XRP refund
    return this.post('/race/car/sell', {
      car_id: carId,
      wallet_address: walletAddress
    })
  }

  async getLatestRace(address) {
    // Fetch latest race summary; backend must redact secret values
    const query = address ? `?address=${encodeURIComponent(address)}` : ''
    return this.get(`/race/latest${query}`)
  }
}

export const apiService = new ApiService()
export default apiService
