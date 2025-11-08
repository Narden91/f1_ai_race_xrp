import { useState, useEffect, useCallback } from 'react'
import { isInstalled, getAddress, getNetwork } from '@gemwallet/api'
import api from '../config/api'

export const useGemWallet = () => {
  const [isGemInstalled, setIsGemInstalled] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState(null)
  const [balance, setBalance] = useState(null)
  const [network, setNetwork] = useState(null)
  const [publicKey, setPublicKey] = useState(null)
  const [error, setError] = useState(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let mounted = true

    const checkInstallation = async () => {
      try {
        const result = await isInstalled()
        
        if (mounted) {
          setIsGemInstalled(result)
          setIsChecking(false)
        }
      } catch {
        if (mounted) {
          setIsGemInstalled(false)
          setIsChecking(false)
        }
      }
    }

    checkInstallation()

    const timer1 = setTimeout(checkInstallation, 500)
    const timer2 = setTimeout(checkInstallation, 1000)
    const timer3 = setTimeout(checkInstallation, 2000)

    return () => {
      mounted = false
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  const fetchBalance = useCallback(async (walletAddress) => {
    try {
      // Use backend API instead of direct CORS request to XRP Ledger
      const data = await api.getBalance(walletAddress)
      
      if (data && data.balance_xrp !== undefined) {
        return data.balance_xrp.toString()
      }
      
      throw new Error('Failed to fetch balance')
    } catch (err) {
      console.error('Error fetching balance:', err)
      return null
    }
  }, [])

  const connect = useCallback(async () => {
    setError(null)

    if (!isGemInstalled) {
      const errorMsg = 'GemWallet is not installed. Please install it from gemwallet.app'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }

    try {
      const addressResponse = await getAddress()
      
      if (!addressResponse || !addressResponse.result || !addressResponse.result.address) {
        throw new Error('User rejected the request or no address returned')
      }

      const walletAddress = addressResponse.result.address
      const walletPublicKey = addressResponse.result.publicKey || null

      let networkInfo = 'testnet'
      try {
        const networkResponse = await getNetwork()
        
        if (networkResponse && networkResponse.result) {
          networkInfo = networkResponse.result.network || networkResponse.result.name || 'testnet'
        }
      } catch {
        // Could not fetch network, use default testnet
      }

      const networkLower = networkInfo.toLowerCase()
      if (networkLower !== 'testnet' && !networkLower.includes('test')) {
        throw new Error('Please switch to Testnet in GemWallet settings. Currently on: ' + networkInfo)
      }

      const walletBalance = await fetchBalance(walletAddress)

      setAddress(walletAddress)
      setPublicKey(walletPublicKey)
      setBalance(walletBalance)
      setNetwork(networkInfo)
      setIsConnected(true)

      return { 
        success: true, 
        address: walletAddress,
        balance: walletBalance,
        network: networkInfo,
        publicKey: walletPublicKey
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to connect to GemWallet'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [isGemInstalled, fetchBalance])

  const disconnect = useCallback(() => {
    setAddress(null)
    setBalance(null)
    setNetwork(null)
    setPublicKey(null)
    setIsConnected(false)
    setError(null)
  }, [])

  const getBalance = useCallback(async () => {
    if (!address) {
      return null
    }
    
    const balance = await fetchBalance(address)
    setBalance(balance)
    return balance
  }, [address, fetchBalance])

  const checkInstallation = useCallback(async () => {
    try {
      const result = await isInstalled()
      setIsGemInstalled(result)
      return result
    } catch {
      setIsGemInstalled(false)
      return false
    }
  }, [])

  return {
    isInstalled: isGemInstalled,
    isConnected,
    address,
    balance,
    network,
    publicKey,
    error,
    isChecking,
    connect,
    disconnect,
    getBalance,
    checkInstallation,
  }
}
