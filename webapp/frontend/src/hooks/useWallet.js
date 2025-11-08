import { useState, useEffect, useCallback } from 'react'
import * as xrpl from 'xrpl'

export const useWallet = () => {
  const [wallet, setWallet] = useState(null)
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [txResult, setTxResult] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [connectionType, setConnectionType] = useState(null)
  
  const signAndSubmit = useCallback(async (tx) => {
    if (!wallet) throw new Error('No wallet available')
    
    if (connectionType === 'gemwallet') {
      try {
        if (!window.gemWallet) {
          throw new Error('GemWallet not available')
        }
        
        const response = await window.gemWallet.signTransaction({ 
          transaction: {
            Account: wallet.address,
            ...tx,
          }
        })
        
        if (response.result) {
          return response.result
        } else {
          throw new Error('Transaction signing failed')
        }
      } catch (err) {
        console.error('GemWallet signing error:', err)
        throw new Error(err.message || 'Failed to sign transaction with GemWallet')
      }
    }
    
    // Local wallet signing (original logic)
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
    await client.connect()
    try {
      const senderWallet = xrpl.Wallet.fromSeed(wallet.seed)
      const prepared = await client.autofill({
        Account: wallet.address,
        ...tx,
      })
      const signed = senderWallet.sign(prepared)
      const result = await client.submitAndWait(signed.tx_blob)
      return result
    } finally {
      await client.disconnect()
    }
  }, [wallet, connectionType])

  const createWallet = useCallback(async (options = {}) => {
    const { seed = '', type = 'created', gemWalletAddress = null, balance: initialBalance = null } = options
    
    setLoading(true)
    try {
      // Handle GemWallet connection
      if (type === 'gemwallet' && gemWalletAddress) {
        // Set up wallet using GemWallet address
        setWallet({
          address: gemWalletAddress,
          seed: null, // GemWallet doesn't expose seed
          type: 'gemwallet'
        })
        setBalance(initialBalance)
        setConnectionType('gemwallet')
        setLoading(false)
        return
      }
      
      // Handle local wallet creation/import (existing logic)
      const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
      await client.connect()

      let newWallet
      if (seed) {
        // Import wallet from seed
        newWallet = xrpl.Wallet.fromSeed(seed)
        
        // Check existing balance
        try {
          const response = await client.request({
            command: 'account_info',
            account: newWallet.address,
            ledger_index: 'validated'
          })
          setBalance(xrpl.dropsToXrp(response.result.account_data.Balance))
        } catch {
          // Account doesn't exist, fund it with 10 XRP
          await client.fundWallet(newWallet, { amount: '10' })
          setBalance('10')
        }
      } else {
        // Generate new wallet and fund with 10 XRP
        newWallet = xrpl.Wallet.generate()
        
        try {
          // Fund wallet with exactly 10 XRP
          const fundResult = await client.fundWallet(newWallet, { amount: '10' })
          console.log('Wallet funded:', fundResult)
          setBalance('10')
        } catch (fundError) {
          console.error('Funding error:', fundError)
          // Fallback: use default faucet funding
          await client.fundWallet(newWallet)
          const response = await client.request({
            command: 'account_info',
            account: newWallet.address,
            ledger_index: 'validated'
          })
          setBalance(xrpl.dropsToXrp(response.result.account_data.Balance))
        }
      }

      setWallet({
        address: newWallet.address,
        seed: newWallet.seed
      })
      setConnectionType('created')

      await client.disconnect()
    } catch (error) {
      console.error('Error:', error)
      alert('Error: ' + error.message)
    }
    setLoading(false)
  }, [])

  const sendPayment = useCallback(async (destination, amount) => {
    if (!wallet) return

    setLoading(true)
    setTxResult(null)
    try {
      const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
      await client.connect()

      const senderWallet = xrpl.Wallet.fromSeed(wallet.seed)

      const payment = {
        TransactionType: 'Payment',
        Account: wallet.address,
        Destination: destination,
        Amount: xrpl.xrpToDrops(amount.toString())
      }

      const prepared = await client.autofill(payment)
      const signed = senderWallet.sign(prepared)
      const result = await client.submitAndWait(signed.tx_blob)

      const txStatus = result.result.meta.TransactionResult
      setTxResult(txStatus)

      const newTx = {
        id: Date.now(),
        type: 'payment',
        amount: amount.toString(),
        destination: destination,
        status: txStatus,
        timestamp: new Date().toLocaleString()
      }
      setTransactions(prev => [newTx, ...prev])

      // Refresh balance
      const response = await client.request({
        command: 'account_info',
        account: wallet.address,
        ledger_index: 'validated'
      })
      setBalance(xrpl.dropsToXrp(response.result.account_data.Balance))

      await client.disconnect()
    } catch (error) {
      console.error('Error:', error)
      setTxResult('FAILED')
      alert('Error: ' + error.message)
    }
    setLoading(false)
  }, [wallet])

  const refreshBalance = useCallback(async () => {
    if (!wallet) return

    try {
      const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
      await client.connect()

      const response = await client.request({
        command: 'account_info',
        account: wallet.address,
        ledger_index: 'validated'
      })

      setBalance(xrpl.dropsToXrp(response.result.account_data.Balance))
      await client.disconnect()
    } catch (error) {
      console.error('Error refreshing balance:', error)
    }
  }, [wallet])

  const resetWallet = useCallback(() => {
    setWallet(null)
    setBalance(null)
    setTxResult(null)
    setTransactions([])
    setConnectionType(null)
  }, [])

  useEffect(() => {
    // HACKATHON DEMO: Disable auto-refresh to prevent balance from resetting
    // The auto-refresh queries the blockchain which still shows 10 XRP
    // since we're mocking payments for demo purposes
    
    // Original code (commented out for demo):
    // if (wallet) {
    //   const interval = setInterval(refreshBalance, 30000)
    //   return () => clearInterval(interval)
    // }
  }, [wallet, refreshBalance])

  return {
    wallet,
    balance,
    loading,
    txResult,
    transactions,
    connectionType,
    createWallet,
    sendPayment,
    refreshBalance,
    resetWallet,
    signAndSubmit,
    setBalance,
  }
}